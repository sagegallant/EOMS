import {
  sequelize,
  TrainingCourse,
  TrainingModule,
  TrainingRecord,
  TrainingQuizAttempt,
  Employee,
  Notification,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

// Predefined quiz question banks mapped by course ID or subject keyword
export const QUIZ_QUESTIONS = {
  // Course 1 or POSH Compliance
  posh: [
    {
      id: 1,
      question: 'Under the POSH Act 2013, what does the statutory "IC" stand for in an organization?',
      options: [
        'Internal Committee',
        'Independent Compliance Council',
        'Internal Corporate Committee',
        'Inter-company Coordination',
      ],
      correctIndex: 0,
    },
    {
      id: 2,
      question: 'Within how many months of an incident must a complaint of sexual harassment usually be filed under the Act?',
      options: [
        'Within 1 month',
        'Within 3 months',
        'Within 6 months',
        'Within 1 year',
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      question: 'Which of the following actions constitutes sexual harassment under Indian workplace regulations?',
      options: [
        'Demanding or requesting sexual favors directly or implicitly',
        'Making sexually colored remarks or unwelcome jokes',
        'Showing pornography or unwelcome physical conduct',
        'All of the above',
      ],
      correctIndex: 3,
    },
    {
      id: 4,
      question: 'Does the POSH policy protect employees working in remote / work-from-home environments?',
      options: [
        'No, only physical office premises are covered',
        'Yes, extended workplace includes remote home setups, company video calls, and work travel',
        'Only during daytime working hours (9am to 6pm)',
        'Only if approved in writing by HR',
      ],
      correctIndex: 1,
    },
    {
      id: 5,
      question: 'What is the required role of the External Member in the Internal Committee (IC)?',
      options: [
        'To chair all executive board meetings',
        'To ensure impartial inquiry, being from an NGO or legal background familiar with sexual harassment issues',
        'To decide company annual budget allocations',
        'To serve as company spokesperson to media',
      ],
      correctIndex: 1,
    },
  ],
  // General / Information Security / Default Onboarding Quiz
  default: [
    {
      id: 1,
      question: 'What is the recommended practice when receiving an unexpected email asking for your password or OTP?',
      options: [
        'Reply immediately with the requested details',
        'Never share credentials; immediately report to the Security/IT department',
        'Forward the email to all colleagues',
        'Click all links to verify authenticity',
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question: 'How should sensitive customer or statutory employee data (e.g. Aadhaar, PAN) be stored and shared?',
      options: [
        'Over unencrypted public messaging channels',
        'Uploaded to personal Google Drive accounts',
        'Within authorized, access-controlled enterprise systems with audit trails',
        'Printed and left on unattended desks',
      ],
      correctIndex: 2,
    },
    {
      id: 3,
      question: 'What is the minimum required password standard for internal enterprise accounts at EOMS?',
      options: [
        'Any 4-digit PIN',
        'At least 12 characters with mixed case, numbers, and symbols plus MFA',
        'Your birthdate followed by company name',
        'Standard default password provided on day 1',
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: 'When should a security incident or lost hardware asset (e.g. company laptop) be reported?',
      options: [
        'Within 1 hour to IT Security',
        'At the end of the fiscal quarter',
        'Only if personal files were stored on it',
        'Only after trying to locate it for one week',
      ],
      correctIndex: 0,
    },
    {
      id: 5,
      question: 'What is the purpose of clean desk and screen lock policies?',
      options: [
        'To save monitor power consumption',
        'To prevent unauthorized viewing of confidential business and employee information',
        'To make office cleaning faster',
        'It is merely an aesthetic guideline',
      ],
      correctIndex: 1,
    },
  ],
};

function getQuestionsForCourse(course) {
  const title = (course?.title || '').toLowerCase();
  if (title.includes('posh') || title.includes('harassment') || title.includes('prevention')) {
    return QUIZ_QUESTIONS.posh;
  }
  return QUIZ_QUESTIONS.default;
}

function isHRorCompliance(user) {
  const roles = user?.roles || [];
  return roles.some((r) => ['HR_ADMIN', 'HR_SPECIALIST', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'].includes(r));
}

export async function listCourses(req, res, next) {
  try {
    const courses = await TrainingCourse.findAll({
      include: [
        {
          model: TrainingModule,
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

    // Object-level authorization
    if (!isHRorCompliance(req.user) && Number(req.user?.employeeId) !== Number(employeeId)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'You are not authorized to view training records for this employee.' });
    }

    const records = await TrainingRecord.findAll({
      where: { employeeId },
      include: [
        {
          model: TrainingCourse,
          include: [{ model: TrainingModule }],
        },
        {
          model: TrainingQuizAttempt,
          required: false,
        },
      ],
      order: [['startedAt', 'DESC']],
    });

    res.json({ data: records });
  } catch (e) {
    next(e);
  }
}

export async function getCourseQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const course = await TrainingCourse.findByPk(id);

    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found.' });
    }

    const fullQuestions = getQuestionsForCourse(course);
    // Never send correctIndex to the client!
    const clientQuestions = fullQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    res.json({
      data: {
        courseId: course.courseId,
        title: course.title,
        passingScore: course.passingScore || 80,
        totalQuestions: clientQuestions.length,
        questions: clientQuestions,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function submitQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const { employeeId, answers } = req.body;

    const targetEmpId = employeeId || req.user?.employeeId;

    if (!targetEmpId || !answers || typeof answers !== 'object') {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'employeeId and an answers map { questionId: selectedIndex } are required.',
      });
    }

    // Object-level authorization
    if (!isHRorCompliance(req.user) && Number(req.user?.employeeId) !== Number(targetEmpId)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to submit quiz answers for this employee.',
      });
    }

    const course = await TrainingCourse.findByPk(id);
    if (!course) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Course not found.' });
    }

    const questions = getQuestionsForCourse(course);
    let correctCount = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      const selected = answers[q.id] !== undefined ? Number(answers[q.id]) : -1;
      if (selected === q.correctIndex) {
        correctCount += 1;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    const passingThreshold = course.passingScore || 80;
    const passed = calculatedScore >= passingThreshold;

    const result = await sequelize.transaction(async (t) => {
      let record = await TrainingRecord.findOne({
        where: { employeeId: targetEmpId, courseId: course.courseId },
        transaction: t,
      });

      if (!record) {
        record = await TrainingRecord.create(
          {
            employeeId: targetEmpId,
            courseId: course.courseId,
            status: passed ? 'completed' : 'in_progress',
            score: calculatedScore,
            progressPercent: passed ? 100 : 50,
            startedAt: new Date(),
            completedAt: passed ? new Date() : null,
          },
          { transaction: t }
        );
      } else {
        const bestScore = Math.max(record.score || 0, calculatedScore);
        const nowCompleted = record.status === 'completed' || passed;
        await record.update(
          {
            score: bestScore,
            status: nowCompleted ? 'completed' : 'in_progress',
            progressPercent: nowCompleted ? 100 : Math.max(record.progressPercent || 0, 50),
            completedAt: nowCompleted ? (record.completedAt || new Date()) : null,
          },
          { transaction: t }
        );
      }

      // Record Quiz Attempt
      const previousAttempts = await TrainingQuizAttempt.count({
        where: { recordId: record.recordId },
        transaction: t,
      });

      const attempt = await TrainingQuizAttempt.create(
        {
          recordId: record.recordId,
          attemptNumber: previousAttempts + 1,
          scoreAchieved: calculatedScore,
          passed,
          attemptedAt: new Date(),
        },
        { transaction: t }
      );

      // Notify employee of result
      const emp = await Employee.findByPk(targetEmpId, { transaction: t });
      if (emp?.userId) {
        await Notification.create(
          {
            userId: emp.userId,
            title: `Quiz Result: ${course.title}`,
            message: `You scored ${calculatedScore}% (${passed ? 'PASSED' : 'DID NOT PASS'}). Passing score is ${passingThreshold}%.`,
            channel: 'in_app',
            isRead: false,
          },
          { transaction: t }
        );
      }

      return { record, attempt };
    });

    await logAudit({
      userId: req.user?.userId,
      action: passed ? 'TRAINING_QUIZ_PASSED' : 'TRAINING_QUIZ_FAILED',
      targetTable: 'training_quiz_attempts',
      targetId: result.attempt.attemptId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        employeeId: targetEmpId,
        courseId: course.courseId,
        score: calculatedScore,
        passed,
        attemptNumber: result.attempt.attemptNumber,
      },
    });

    res.json({
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Passing score required to certify.',
      data: {
        score: calculatedScore,
        passed,
        passingThreshold,
        correctCount,
        totalQuestions,
        attemptNumber: result.attempt.attemptNumber,
        recordStatus: result.record.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getQuizAttempts(req, res, next) {
  try {
    const { id } = req.params;
    const employeeId = req.query.employeeId || req.user?.employeeId;

    if (!employeeId) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'employeeId is required.' });
    }

    if (!isHRorCompliance(req.user) && Number(req.user?.employeeId) !== Number(employeeId)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied to quiz attempts.' });
    }

    const record = await TrainingRecord.findOne({
      where: { employeeId, courseId: id },
      include: [{ model: TrainingQuizAttempt }],
    });

    res.json({ data: record?.TrainingQuizAttempts || [] });
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

    // Object-level authorization
    if (!isHRorCompliance(req.user) && Number(req.user?.employeeId) !== Number(employeeId)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied.' });
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

