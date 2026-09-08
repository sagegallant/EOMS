import {
  Document,
  DocumentType,
  DocumentVerification,
  Employee,
  SystemUser,
  Notification,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listDocumentTypes(req, res, next) {
  try {
    const types = await DocumentType.findAll({
      order: [['isMandatory', 'DESC'], ['typeName', 'ASC']],
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
    if (employeeId) where.employeeId = employeeId;
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
        { model: Employee, attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
        {
          model: DocumentVerification,
          include: [{ model: SystemUser, as: 'Reviewer', attributes: ['userId', 'username', 'email'] }],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Document not found.' });
    }

    res.json({ data: document });
  } catch (e) {
    next(e);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    const {
      employeeId,
      typeId,
      fileName,
      filePath = '/uploads/documents/sample_statutory.pdf',
      fileSizeBytes = 524288,
      mimeType = 'application/pdf',
    } = req.body;

    if (!employeeId || !typeId || !fileName) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'employeeId, typeId, and fileName are required.',
      });
    }

    const document = await Document.create({
      employeeId,
      typeId,
      fileName,
      filePath,
      fileSizeBytes,
      mimeType,
      uploadedAt: new Date(),
    });

    // Create pending verification record
    const reviewerUserId = req.user?.userId;
    const verification = await DocumentVerification.create({
      documentId: document.documentId,
      reviewerUserId,
      status: 'pending',
      comments: 'Document submitted by employee and queued for compliance officer audit.',
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'UPLOAD_DOCUMENT',
      targetTable: 'documents',
      targetId: document.documentId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { employeeId, typeId, fileName },
    });

    res.status(201).json({
      message: 'Document uploaded and queued for verification.',
      data: { document, verification },
    });
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

    let verification = await DocumentVerification.findOne({
      where: { documentId: id },
      order: [['verificationId', 'DESC']],
    });

    if (verification) {
      await verification.update({
        status,
        comments: comments || verification.comments,
        reviewerUserId: req.user.userId,
        verifiedAt: new Date(),
      });
    } else {
      verification = await DocumentVerification.create({
        documentId: id,
        reviewerUserId: req.user.userId,
        status,
        comments: comments || null,
        verifiedAt: new Date(),
      });
    }

    // Notify employee of document status change
    if (document.Employee?.userId) {
      const docTitle = document.DocumentType?.typeName || document.fileName;
      await Notification.create({
        userId: document.Employee.userId,
        title: `Document ${status.toUpperCase()}: ${docTitle}`,
        message: `Your submitted ${docTitle} has been marked as ${status} by Compliance. ${comments ? `Notes: ${comments}` : ''}`,
        channel: 'in_app',
        isRead: false,
      });
    }

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
