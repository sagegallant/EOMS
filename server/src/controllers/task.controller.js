import {
  Task,
  Checklist,
  TaskProgress,
  OnboardingPlan,
  Employee,
  SystemUser,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listTasks(req, res, next) {
  try {
    const { checklistId, employeeId, category, priority, status } = req.query;

    const where = {};
    if (checklistId) where.checklistId = checklistId;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    const progressInclude = {
      model: TaskProgress,
      include: [{ model: SystemUser, as: 'CompletedByUser', attributes: ['username'] }],
    };
    if (employeeId) {
      progressInclude.where = { employeeId };
      progressInclude.required = false;
    }
    if (status && employeeId) {
      progressInclude.where.status = status;
      progressInclude.required = true;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: Checklist, attributes: ['checklistId', 'planId', 'phaseName', 'phaseOrder'] },
        progressInclude,
      ],
      order: [
        [{ model: Checklist }, 'phaseOrder', 'ASC'],
        ['sortOrder', 'ASC'],
      ],
    });

    res.json({ data: tasks });
  } catch (e) {
    next(e);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Checklist },
        { model: TaskProgress, include: [{ model: Employee, attributes: ['firstName', 'lastName'] }] },
      ],
    });

    if (!task) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found.' });
    }

    res.json({ data: task });
  } catch (e) {
    next(e);
  }
}

export async function createTask(req, res, next) {
  try {
    const {
      checklistId,
      title,
      description,
      category = 'administrative',
      assignedRole = 'EMPLOYEE',
      estimatedMinutes = 30,
      priority = 'medium',
      isMandatory = true,
      sortOrder = 0,
    } = req.body;

    if (!checklistId || !title) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'checklistId and title are required.' });
    }

    const task = await Task.create({
      checklistId,
      title,
      description,
      category,
      assignedRole,
      estimatedMinutes,
      priority,
      isMandatory,
      sortOrder,
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE_TASK',
      targetTable: 'tasks',
      targetId: task.taskId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { checklistId, title, category },
    });

    res.status(201).json({ message: 'Task created.', data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found.' });
    }

    const { title, description, category, assignedRole, estimatedMinutes, priority, isMandatory, sortOrder } = req.body;
    await task.update({
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(assignedRole && { assignedRole }),
      ...(estimatedMinutes !== undefined && { estimatedMinutes }),
      ...(priority && { priority }),
      ...(isMandatory !== undefined && { isMandatory }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    res.json({ message: 'Task updated.', data: task });
  } catch (e) {
    next(e);
  }
}

export async function updateTaskProgress(req, res, next) {
  try {
    const { taskId } = req.params;
    const { employeeId, status, notes } = req.body;

    if (!employeeId || !status) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'employeeId and status are required.' });
    }

    let progress = await TaskProgress.findOne({
      where: { taskId, employeeId },
    });

    const isCompleted = status === 'completed';
    const completedAt = isCompleted ? new Date() : null;
    const completedBy = isCompleted ? req.user?.userId : null;

    if (progress) {
      await progress.update({
        status,
        notes: notes !== undefined ? notes : progress.notes,
        completedAt,
        completedBy,
      });
    } else {
      progress = await TaskProgress.create({
        taskId,
        employeeId,
        status,
        notes: notes || null,
        completedAt,
        completedBy,
      });
    }

    // Auto-recalculate onboarding plan progress percent for this employee
    const plan = await OnboardingPlan.findOne({
      where: { employeeId },
      include: [
        {
          model: Checklist,
          include: [{ model: Task }],
        },
      ],
    });

    if (plan) {
      const allTasks = [];
      plan.Checklists?.forEach(c => {
        if (c.Tasks) allTasks.push(...c.Tasks);
      });

      if (allTasks.length > 0) {
        const taskIds = allTasks.map(t => t.taskId);
        const completedCount = await TaskProgress.count({
          where: {
            employeeId,
            taskId: taskIds,
            status: 'completed',
          },
        });

        const percent = Math.round((completedCount / allTasks.length) * 100);
        const newStatus = percent === 100 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started';
        await plan.update({
          progressPercent: percent,
          status: newStatus,
          ...(percent === 100 && { actualCompletionDate: new Date().toISOString().split('T')[0] }),
        });
      }
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE_TASK_PROGRESS',
      targetTable: 'task_progress',
      targetId: progress.progressId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { taskId, employeeId, status },
    });

    res.json({ message: 'Task progress updated.', data: progress });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Task not found.' });
    }

    await TaskProgress.destroy({ where: { taskId: task.taskId } });
    await task.destroy();

    res.json({ message: 'Task removed successfully.' });
  } catch (e) {
    next(e);
  }
}
