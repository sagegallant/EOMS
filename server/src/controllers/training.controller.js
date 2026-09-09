import {
  TrainingCourse,
  TrainingModule,
  TrainingRecord,
  Employee,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listCourses(req, res, next) {
  try {
    const courses = await TrainingCourse.findAll({
      include: [
        {
          model: TrainingModule,
          order: [['moduleOrder', 'ASC']],
        },
      ],
      order: [['isMandatory', 'DESC'], ['title', 'ASC']],
    });
    res.json({ data: courses });
  } catch (e) {
    next(e);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const course = await TrainingCourse.findByPk(req.params.id, {
      include: [
        {
          model: TrainingModule,
          order: [['moduleOrder', 'ASC']],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found.' });
    }

    res.json({ data: course });
  } catch (e) {
    next(e);
  }
}

export async function getEmployeeTraining(req, res, next) {
  try {
    const { employeeId } = req.params;

    const records = await TrainingRecord.findAll({
      where: { employeeId },
      include: [
        {
          model: TrainingCourse,
          include: [{ model: TrainingModule }],
        },
      ],
      order: [['startedAt', 'DESC']],
    });

    res.json({ data: records });
  } catch (e) {
    next(e);
  }
}

export async function updateProgress(req, res, next) {
  try {
    const { employeeId, courseId, progressPercent, score, status } = req.body;

    if (!employeeId || !courseId) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'employeeId and courseId are required.' });
    }

    let record = await TrainingRecord.findOne({
      where: { employeeId, courseId },
    });

    const isCompleted = status === 'completed' || (progressPercent !== undefined && Number(progressPercent) === 100);
    const calculatedStatus = isCompleted ? 'completed' : (status || 'in_progress');
    const completedAt = isCompleted ? new Date() : null;

    if (record) {
      await record.update({
        ...(progressPercent !== undefined && { progressPercent }),
        ...(score !== undefined && { score }),
        status: calculatedStatus,
        ...(isCompleted && { completedAt }),
      });
    } else {
      record = await TrainingRecord.create({
        employeeId,
        courseId,
        progressPercent: progressPercent || 0,
        score: score || null,
        status: calculatedStatus,
        startedAt: new Date(),
        completedAt,
      });
    }

    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE_TRAINING_PROGRESS',
      targetTable: 'training_records',
      targetId: record.recordId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { employeeId, courseId, progressPercent, status: calculatedStatus },
    });

    res.json({ message: 'Training record updated.', data: record });
  } catch (e) {
    next(e);
  }
}

export async function createCourse(req, res, next) {
  try {
    const { title, description, isMandatory = true, passingScore = 80, estimatedMinutes = 45 } = req.body;

    if (!title) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'title is required.' });
    }

    const course = await TrainingCourse.create({
      title,
      description,
      isMandatory,
      passingScore,
      estimatedMinutes,
    });

    res.status(201).json({ message: 'Course created.', data: course });
  } catch (e) {
    next(e);
  }
}
