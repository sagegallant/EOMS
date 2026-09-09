import {
  Asset,
  AssetModel,
  AssetCategory,
  AssetAllocation,
  Employee,
  SystemUser,
  Notification,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listAssets(req, res, next) {
  try {
    const { status, categoryId, modelId, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (modelId) where.modelId = modelId;

    const modelInclude = {
      model: AssetModel,
      include: [
        {
          model: AssetCategory,
          ...(categoryId && { where: { categoryId } }),
        },
      ],
    };

    const assets = await Asset.findAll({
      where,
      include: [
        modelInclude,
        {
          model: AssetAllocation,
          required: false,
          where: { returnedAt: null },
          include: [{ model: Employee, attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] }],
        },
      ],
      order: [['assetTag', 'ASC']],
    });

    res.json({ data: assets });
  } catch (e) {
    next(e);
  }
}

export async function getAssetById(req, res, next) {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        {
          model: AssetModel,
          include: [{ model: AssetCategory }],
        },
        {
          model: AssetAllocation,
          include: [
            { model: Employee, attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
            { model: SystemUser, as: 'AllocatedByUser', attributes: ['userId', 'username'] },
          ],
        },
      ],
    });

    if (!asset) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Asset not found.' });
    }

    res.json({ data: asset });
  } catch (e) {
    next(e);
  }
}

export async function createAsset(req, res, next) {
  try {
    const { modelId, serialNumber, assetTag, purchasedAt, warrantyExpiry } = req.body;

    if (!modelId || !serialNumber || !assetTag) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'modelId, serialNumber, and assetTag are required.',
      });
    }

    const asset = await Asset.create({
      modelId,
      serialNumber,
      assetTag,
      status: 'in_stock',
      purchasedAt: purchasedAt || new Date().toISOString().split('T')[0],
      warrantyExpiry: warrantyExpiry || null,
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE_ASSET',
      targetTable: 'assets',
      targetId: asset.assetId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { modelId, serialNumber, assetTag },
    });

    res.status(201).json({ message: 'Hardware asset registered.', data: asset });
  } catch (e) {
    next(e);
  }
}

export async function listAllocations(req, res, next) {
  try {
    const { employeeId, acknowledgementStatus, activeOnly } = req.query;
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (acknowledgementStatus) where.acknowledgementStatus = acknowledgementStatus;
    if (activeOnly === 'true') where.returnedAt = null;

    const allocations = await AssetAllocation.findAll({
      where,
      include: [
        {
          model: Asset,
          include: [{ model: AssetModel, include: [{ model: AssetCategory }] }],
        },
        { model: Employee, attributes: ['employeeId', 'firstName', 'lastName', 'workEmail', 'workLocation'] },
        { model: SystemUser, as: 'AllocatedByUser', attributes: ['userId', 'username'] },
      ],
      order: [['allocatedAt', 'DESC']],
    });

    res.json({ data: allocations });
  } catch (e) {
    next(e);
  }
}

export async function allocateAsset(req, res, next) {
  try {
    const { assetId, employeeId, notes } = req.body;

    if (!assetId || !employeeId) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'assetId and employeeId are required.' });
    }

    const asset = await Asset.findByPk(assetId, {
      include: [{ model: AssetModel }],
    });
    if (!asset) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Asset not found.' });
    }

    if (asset.status === 'allocated') {
      return res.status(400).json({ code: 'CONFLICT', message: 'Asset is already allocated to another employee.' });
    }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    const allocation = await AssetAllocation.create({
      assetId,
      employeeId,
      allocatedBy: req.user?.userId,
      allocatedAt: new Date(),
      acknowledgementStatus: 'pending',
      notes: notes || 'Provisioned by IT Admin for employee onboarding setup.',
    });

    await asset.update({ status: 'allocated' });

    // Notify employee
    if (employee.userId) {
      const modelName = asset.AssetModel?.modelName || asset.assetTag;
      await Notification.create({
        userId: employee.userId,
        title: `Hardware Allocated: ${modelName}`,
        message: `A new ${modelName} (${asset.assetTag}) has been provisioned for you. Please inspect and acknowledge receipt.`,
        channel: 'in_app',
        isRead: false,
      });
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'ALLOCATE_ASSET',
      targetTable: 'asset_allocations',
      targetId: allocation.allocationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { assetId, employeeId, assetTag: asset.assetTag },
    });

    res.status(201).json({ message: 'Asset allocated successfully.', data: allocation });
  } catch (e) {
    next(e);
  }
}

export async function acknowledgeAllocation(req, res, next) {
  try {
    const { id } = req.params;
    const { acknowledgementStatus, notes } = req.body;

    if (!acknowledgementStatus || !['acknowledged', 'disputed'].includes(acknowledgementStatus)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'acknowledgementStatus must be either acknowledged or disputed.',
      });
    }

    const allocation = await AssetAllocation.findByPk(id, {
      include: [{ model: Asset }, { model: Employee }],
    });

    if (!allocation) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Asset allocation not found.' });
    }

    await allocation.update({
      acknowledgementStatus,
      notes: notes ? `${allocation.notes ? allocation.notes + ' | ' : ''}${notes}` : allocation.notes,
    });

    await logAudit({
      userId: req.user?.userId,
      action: `ASSET_${acknowledgementStatus.toUpperCase()}`,
      targetTable: 'asset_allocations',
      targetId: allocation.allocationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { allocationId: id, acknowledgementStatus, notes },
    });

    res.json({ message: `Asset handover marked as ${acknowledgementStatus}.`, data: allocation });
  } catch (e) {
    next(e);
  }
}

export async function returnAsset(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const allocation = await AssetAllocation.findByPk(id, {
      include: [{ model: Asset }],
    });

    if (!allocation) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Asset allocation not found.' });
    }

    await allocation.update({
      returnedAt: new Date(),
      notes: notes ? `${allocation.notes ? allocation.notes + ' | ' : ''}Returned: ${notes}` : allocation.notes,
    });

    if (allocation.Asset) {
      await allocation.Asset.update({ status: 'in_stock' });
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'RETURN_ASSET',
      targetTable: 'asset_allocations',
      targetId: allocation.allocationId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { allocationId: id, assetId: allocation.assetId },
    });

    res.json({ message: 'Asset marked as returned and status returned to in_stock.', data: allocation });
  } catch (e) {
    next(e);
  }
}
