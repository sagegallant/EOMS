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
        { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
        { model: Employee, as: 'Buddy', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
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
            { model: Employee, as: 'Buddy', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
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
            { model: Employee, as: 'Buddy', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
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
    const {
      employeeId,
      templateId,
      startDate,
      targetCompletionDate,
      taskTitle,
      priority = 'high',
      category = 'administrative',
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'employeeId is required.',
      });
    }

    const existing = await OnboardingPlan.findOne({
      where: { employeeId },
      include: [{ model: Checklist, include: [{ model: Task }] }],
    });

    if (existing) {
      // Conflict-free: append as additional task with priority to existing plan
      let targetChecklist = existing.Checklists?.[existing.Checklists.length - 1];
      if (!targetChecklist) {
        targetChecklist = await Checklist.create({
          planId: existing.planId,
          phaseName: 'Additional Tasks & Priority Objectives',
          phaseOrder: 1,
          dueOffsetDays: 30,
        });
      }

      const template = templateId ? await OnboardingTemplate.findByPk(templateId) : null;
      const titleToCreate = taskTitle
        || (template ? `Roadmap Objective: ${template.templateName}` : 'Additional Priority Milestone');

      const newTask = await Task.create({
        checklistId: targetChecklist.checklistId,
        title: titleToCreate,
        category,
        priority: ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'high',
        estimatedMinutes: 45,
        isMandatory: true,
        sortOrder: (targetChecklist.Tasks?.length || 0) + 1,
      });

      await TaskProgress.create({
        employeeId,
        taskId: newTask.taskId,
        status: 'not_started',
      });

      // Recalculate progress percent
      const allTasks = await Task.findAll({
        include: [{
          model: Checklist,
          where: { planId: existing.planId },
          required: true,
        }],
      });

      const completedCount = await TaskProgress.count({
        where: {
          employeeId,
          taskId: allTasks.map(t => t.taskId),
          status: 'completed',
        },
      });

      const recalculatedPercent = allTasks.length > 0
        ? Math.round((completedCount / allTasks.length) * 100)
        : 0;

      await existing.update({
        progressPercent: recalculatedPercent,
        status: recalculatedPercent === 100 ? 'completed' : 'in_progress',
        ...(targetCompletionDate && { targetCompletionDate }),
        ...(templateId && { templateId }),
      });

      await logAudit({
        userId: req.user?.userId,
        action: 'EXTEND_ONBOARDING_PLAN',
        targetTable: 'onboarding_plans',
        targetId: existing.planId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { employeeId, templateId, newTask: { taskId: newTask.taskId, priority: newTask.priority } },
      });

      return res.status(200).json({
        message: 'Additional task with priority added to existing onboarding plan.',
        data: { plan: existing, task: newTask },
      });
    }

    if (!startDate || !targetCompletionDate) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'startDate and targetCompletionDate are required for initializing a plan.',
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

    // Create default phases / checklists with starter tasks
    const defaultPhases = [
      {
        phaseName: 'Pre-Boarding & Statutory Verification',
        phaseOrder: 1,
        dueOffsetDays: 0,
        tasks: [
          { title: 'Upload Government Identification (PAN & Aadhaar)', category: 'compliance', priority: 'critical', minutes: 20 },
          { title: 'Sign EOMS Statutory Code of Conduct', category: 'administrative', priority: 'high', minutes: 15 },
        ],
      },
      {
        phaseName: 'Day One: Digital Workspace & IT Setup',
        phaseOrder: 2,
        dueOffsetDays: 1,
        tasks: [
          { title: 'Acknowledge Hardware Receipt & IT Provisioning', category: 'it_setup', priority: 'critical', minutes: 30 },
          { title: 'Setup Company Email & VPN Credentials', category: 'it_setup', priority: 'high', minutes: 25 },
        ],
      },
      {
        phaseName: 'Week One: Culture, Team & Regulatory Training',
        phaseOrder: 3,
        dueOffsetDays: 7,
        tasks: [
          { title: 'Complete POSH Act 2013 Awareness Assessment', category: 'training', priority: 'critical', minutes: 45 },
          { title: 'Connect with Reporting Manager (1:1 Welcome)', category: 'manager_meeting', priority: 'high', minutes: 45 },
        ],
      },
      {
        phaseName: 'Month One: Goals, Reviews & Independent Delivery',
        phaseOrder: 4,
        dueOffsetDays: 30,
        tasks: [
          { title: 'First 30-Day Check-in with Reporting Manager', category: 'manager_meeting', priority: 'high', minutes: 45 },
        ],
      },
    ];

    for (const phase of defaultPhases) {
      const checklist = await Checklist.create({
        planId: plan.planId,
        phaseName: phase.phaseName,
        phaseOrder: phase.phaseOrder,
        dueOffsetDays: phase.dueOffsetDays,
      });

      for (let i = 0; i < phase.tasks.length; i++) {
        const t = phase.tasks[i];
        const createdTask = await Task.create({
          checklistId: checklist.checklistId,
          title: t.title,
          category: t.category,
          priority: t.priority,
          estimatedMinutes: t.minutes,
          sortOrder: i + 1,
          isMandatory: true,
        });

        await TaskProgress.create({
          employeeId,
          taskId: createdTask.taskId,
          status: 'not_started',
        });
      }
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

    res.status(201).json({ message: 'Onboarding plan created with checklists and priority tasks.', data: plan });
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

export async function checkSlaEndpoint(req, res, next) {
  try {
    const { checkOverduePlans } = await import('../services/sla.service.js');
    const result = await checkOverduePlans(req.user?.userId);
    res.json({ message: 'SLA evaluation executed successfully.', data: result });
  } catch (e) {
    next(e);
  }
}

