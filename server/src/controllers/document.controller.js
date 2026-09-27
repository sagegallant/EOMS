import fs from 'fs';
import path from 'path';
import {
  sequelize,
  Document,
  DocumentType,
  DocumentVerification,
  Employee,
  SystemUser,
  Notification,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';
import { getSafeFilePath, UPLOAD_DIR } from '../services/storage.service.js';

function isComplianceOrHR(user) {
  const roles = user?.roles || [];
  return roles.some((r) =>
    ['HR_ADMIN', 'HR_SPECIALIST', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'].includes(r)
  );
}

export async function listDocumentTypes(req, res, next) {
  try {
    const types = await DocumentType.findAll({
      order: [
        ['typeId', 'ASC'],
      ],
    });
    res.json({ data: types });
  } catch (e) {
    next(e);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const { employeeId, typeId, status } = req.query;
    const where = {};

    // Object-level authorization: regular employees can only see their own documents
    if (!isComplianceOrHR(req.user)) {
      if (req.user?.employeeId) {
        where.employeeId = req.user.employeeId;
      } else {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied to documents.' });
      }
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    if (typeId) where.typeId = typeId;

    const verificationInclude = {
      model: DocumentVerification,
      include: [{ model: SystemUser, as: 'Reviewer', attributes: ['userId', 'username', 'email'] }],
    };

    if (status) {
      verificationInclude.where = { status };
      verificationInclude.required = true;
    }

    const documents = await Document.findAll({
      where,
      include: [
        { model: DocumentType },
        { model: Employee, attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
        verificationInclude,
      ],
      order: [['uploadedAt', 'DESC']],
    });

    res.json({ data: documents });
  } catch (e) {
    next(e);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { model: DocumentType },
        { model: Employee, attributes: ['employeeId', 'userId', 'firstName', 'lastName', 'workEmail'] },
        {
          model: DocumentVerification,
          include: [{ model: SystemUser, as: 'Reviewer', attributes: ['userId', 'username', 'email'] }],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found.' });
    }

    // Object-level authorization
    if (!isComplianceOrHR(req.user) && document.employeeId !== req.user?.employeeId) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'You are not authorized to view this document.' });
    }

    res.json({ data: document });
  } catch (e) {
    next(e);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const isStaff = isComplianceOrHR(req.user);
    let targetEmployeeId = req.body.employeeId || req.user?.employeeId;

    // Enforce object-level authorization: employees cannot upload documents for other employees
    if (!isStaff) {
      if (!req.user?.employeeId || Number(targetEmployeeId) !== Number(req.user.employeeId)) {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: 'You are only authorized to upload documents for your own employee record.',
        });
      }
    }

    const typeId = req.body.typeId;
    let fileName = req.body.fileName;
    let filePath = req.body.filePath || 'sample_statutory.pdf';
    let fileSizeBytes = Number(req.body.fileSizeBytes) || 524288;
    let mimeType = req.body.mimeType || 'application/pdf';

    // If a physical file was uploaded via Multer multipart
    if (req.file) {
      fileName = req.file.originalname;
      filePath = req.file.filename;
      fileSizeBytes = req.file.size;
      mimeType = req.file.mimetype;
    }

    if (!targetEmployeeId || !typeId || !fileName) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'employeeId, typeId, and fileName (or file) are required.',
      });
    }

    const result = await sequelize.transaction(async (t) => {
      const doc = await Document.create(
        {
          employeeId: targetEmployeeId,
          typeId,
          fileName,
          filePath,
          fileSizeBytes,
          mimeType,
          uploadedAt: new Date(),
        },
        { transaction: t }
      );

      const verification = await DocumentVerification.create(
        {
          documentId: doc.documentId,
          reviewerUserId: req.user?.userId || 1,
          status: 'pending',
          comments: 'Document submitted and awaiting compliance verification.',
        },
        { transaction: t }
      );

      return { doc, verification };
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'UPLOAD_DOCUMENT',
      targetTable: 'documents',
      targetId: result.doc.documentId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { employeeId: targetEmployeeId, typeId, fileName, mimeType, fileSizeBytes },
    });

    res.status(201).json({
      message: 'Document uploaded and queued for verification.',
      data: { document: result.doc, verification: result.verification },
    });
  } catch (e) {
    next(e);
  }
}

export async function downloadDocument(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ model: Employee }],
    });

    if (!document) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found.' });
    }

    // Object-level authorization check
    if (!isComplianceOrHR(req.user) && document.employeeId !== req.user?.employeeId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to download this document.',
      });
    }

    let absoluteFilePath = getSafeFilePath(document.filePath);

    // If physical file does not exist on disk (e.g. seeded sample), generate or stream fallback content
    if (!fs.existsSync(absoluteFilePath)) {
      const sampleContent = Buffer.from(
        `%PDF-1.4\n% EOMS Demonstration Document\nDocument ID: ${document.documentId}\nFile Name: ${document.fileName}\nUploaded for Employee: ${document.employeeId}\nMIME: ${document.mimeType}\nGenerated for verification demo.\n%%EOF`
      );
      res.setHeader('Content-Type', document.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(document.fileName)}"`);
      return res.send(sampleContent);
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'DOWNLOAD_DOCUMENT',
      targetTable: 'documents',
      targetId: document.documentId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { fileName: document.fileName, employeeId: document.employeeId },
    });

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(document.fileName)}"`);
    const fileStream = fs.createReadStream(absoluteFilePath);
    fileStream.pipe(res);
  } catch (e) {
    next(e);
  }
}

export async function verifyDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!status || !['approved', 'rejected', 'requires_resubmission'].includes(status)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'status must be approved, rejected, or requires_resubmission.',
      });
    }

    const document = await Document.findByPk(id, {
      include: [{ model: Employee }, { model: DocumentType }],
    });

    if (!document) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found.' });
    }

    const verification = await sequelize.transaction(async (t) => {
      let ver = await DocumentVerification.findOne({
        where: { documentId: id },
        order: [['verificationId', 'DESC']],
        transaction: t,
      });

      if (ver) {
        await ver.update(
          {
            status,
            comments: comments || ver.comments,
            reviewerUserId: req.user.userId,
            verifiedAt: new Date(),
          },
          { transaction: t }
        );
      } else {
        ver = await DocumentVerification.create(
          {
            documentId: id,
            reviewerUserId: req.user.userId,
            status,
            comments: comments || null,
            verifiedAt: new Date(),
          },
          { transaction: t }
        );
      }

      // Notify employee of document status change
      if (document.Employee?.userId) {
        const docTitle = document.DocumentType?.typeName || document.fileName;
        await Notification.create(
          {
            userId: document.Employee.userId,
            title: `Document ${status.toUpperCase()}: ${docTitle}`,
            message: `Your submitted document "${docTitle}" has been marked as ${status} by Compliance. ${
              comments ? `Notes: ${comments}` : ''
            }`,
            channel: 'in_app',
            isRead: false,
          },
          { transaction: t }
        );
      }

      return ver;
    });

    await logAudit({
      userId: req.user?.userId,
      action: `VERIFY_DOCUMENT_${status.toUpperCase()}`,
      targetTable: 'document_verifications',
      targetId: verification.verificationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { documentId: id, status, comments },
    });

    res.json({
      message: `Document verification updated to ${status}.`,
      data: verification,
    });
  } catch (e) {
    next(e);
  }
}
