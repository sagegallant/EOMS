import {
  OnboardingPlan,
  OnboardingTemplate,
  Checklist,
  Task,
  TaskProgress,
  Employee,
  Position,
  Department,
  SystemUser,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listPlans(req, res, next) {
  try {
    const { status, departmentId } = req.query;
    const where = {};
    if (status) where.status = status;

    const empInclude = {
      model: Employee,
      include: [
        {
          model: Position,
          include: [{ model: Department }],
          ...(departmentId && { where: { deptId: departmentId } }),
        },
        { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName'] },
      ],
    };

    const plans = await OnboardingPlan.findAll({
      where,
      include: [
        empInclude,
        { model: OnboardingTemplate, attributes: ['templateId', 'templateName'] },
        {
          model: Checklist,
          include: [
            {
              model: Task,
              include: [{ model: TaskProgress }],
            },
          ],
        },
      ],
      order: [['startDate', 'DESC']],
    });

    res.json({ data: plans });
  } catch (e) {
    next(e);
  }
}

export async function getPlanById(req, res, next) {
  try {
    const plan = await OnboardingPlan.findByPk(req.params.id, {
      include: [
        {
          model: Employee,
          include: [
            { model: Position, include: [{ model: Department }] },
            { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
          ],
        },
        { model: OnboardingTemplate },
        {
          model: Checklist,
          include: [
            {
              model: Task,
              include: [{ model: TaskProgress }],
            },
          ],
          order: [['phaseOrder', 'ASC']],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Onboarding plan not found.' });
    }

    res.json({ data: plan });
  } catch (e) {
    next(e);
  }
}

export async function getPlanByEmployeeId(req, res, next) {
  try {
    const plan = await OnboardingPlan.findOne({
      where: { employeeId: req.params.employeeId },
      include: [
        {
          model: Employee,
          include: [
            { model: Position, include: [{ model: Department }] },
            { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
          ],
        },
        { model: OnboardingTemplate },
        {
          model: Checklist,
          include: [
            {
              model: Task,
              include: [
                {
                  model: TaskProgress,
                  where: { employeeId: req.params.employeeId },
                  required: false,
                },
              ],
            },
          ],
          order: [['phaseOrder', 'ASC']],
        },
      ],
    });

    if (!plan) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'No active onboarding plan found for this employee.' });
    }

    res.json({ data: plan });
  } catch (e) {
    next(e);
  }
}

export async function createPlan(req, res, next) {
  try {
    const { employeeId, templateId, startDate, targetCompletionDate } = req.body;

    if (!employeeId || !startDate || !targetCompletionDate) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'employeeId, startDate, and targetCompletionDate are required.',
      });
    }

    const existing = await OnboardingPlan.findOne({ where: { employeeId } });
    if (existing) {
      return res.status(409).json({
        code: 'CONFLICT',
        message: 'An onboarding plan already exists for this employee.',
      });
    }

    const plan = await OnboardingPlan.create({
      employeeId,
      templateId: templateId || null,
      startDate,
      targetCompletionDate,
      progressPercent: 0,
      status: 'in_progress',
    });

    // Create default phases / checklists
    const defaultPhases = [
      { phaseName: 'Pre-Boarding & Statutory Verification', phaseOrder: 1, dueOffsetDays: 0 },
      { phaseName: 'Day One: Digital Workspace & IT Setup', phaseOrder: 2, dueOffsetDays: 1 },
      { phaseName: 'Week One: Culture, Team & Regulatory Training', phaseOrder: 3, dueOffsetDays: 7 },
      { phaseName: 'Month One: Goals, Reviews & Independent Delivery', phaseOrder: 4, dueOffsetDays: 30 },
    ];

    for (const phase of defaultPhases) {
      await Checklist.create({
        planId: plan.planId,
        phaseName: phase.phaseName,
        phaseOrder: phase.phaseOrder,
        dueOffsetDays: phase.dueOffsetDays,
      });
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE_ONBOARDING_PLAN',
      targetTable: 'onboarding_plans',
      targetId: plan.planId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { employeeId, templateId, targetCompletionDate },
    });

    res.status(201).json({ message: 'Onboarding plan created with checklists.', data: plan });
  } catch (e) {
    next(e);
  }
}

export async function updatePlan(req, res, next) {
  try {
    const plan = await OnboardingPlan.findByPk(req.params.id);
    if (!plan) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Onboarding plan not found.' });
    }

    const { status, targetCompletionDate, actualCompletionDate, progressPercent } = req.body;
    await plan.update({
      ...(status && { status }),
      ...(targetCompletionDate && { targetCompletionDate }),
      ...(actualCompletionDate !== undefined && { actualCompletionDate }),
      ...(progressPercent !== undefined && { progressPercent }),
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE_ONBOARDING_PLAN',
      targetTable: 'onboarding_plans',
      targetId: plan.planId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: req.body,
    });

    res.json({ message: 'Onboarding plan updated.', data: plan });
  } catch (e) {
    next(e);
  }
}

export async function listTemplates(req, res, next) {
  try {
    const templates = await OnboardingTemplate.findAll({
      where: { isActive: true },
      order: [['templateName', 'ASC']],
    });
    res.json({ data: templates });
  } catch (e) {
    next(e);
  }
}

export async function getTemplateById(req, res, next) {
  try {
    const template = await OnboardingTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Template not found.' });
    }
    res.json({ data: template });
  } catch (e) {
    next(e);
  }
}
