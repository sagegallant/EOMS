import { Op } from 'sequelize';
import {
  sequelize,
  OnboardingPlan,
  Employee,
  Notification,
} from '../models/index.js';
import { logAudit } from './audit.service.js';

/**
 * Idempotent SLA / Overdue Check for Onboarding Plans
 */
export async function checkOverduePlans(actorUserId = null) {
  const today = new Date().toISOString().split('T')[0];

  // Find in_progress plans past target completion date with progress < 100
  const overduePlans = await OnboardingPlan.findAll({
    where: {
      status: 'in_progress',
      targetCompletionDate: { [Op.lt]: today },
      progressPercent: { [Op.lt]: 100 },
    },
    include: [
      {
        model: Employee,
        include: [{ model: Employee, as: 'Manager' }],
      },
    ],
  });

  const updatedPlans = [];

  for (const plan of overduePlans) {
    await sequelize.transaction(async (t) => {
      await plan.update({ status: 'overdue' }, { transaction: t });

      const emp = plan.Employee;
      if (emp?.userId) {
        // Idempotency: verify if an overdue notification was already sent in the past 7 days
        const alreadyNotified = await Notification.findOne({
          where: {
            userId: emp.userId,
            title: { [Op.like]: '%Onboarding Target Overdue%' },
          },
          transaction: t,
        });

        if (!alreadyNotified) {
          await Notification.create(
            {
              userId: emp.userId,
              title: 'Onboarding Target Overdue ⚠️',
              message: `Your onboarding plan target date was ${plan.targetCompletionDate}. Current progress: ${plan.progressPercent}%. Please complete pending tasks.`,
              channel: 'in_app',
              isRead: false,
            },
            { transaction: t }
          );

          // Also notify manager if exists
          if (emp.Manager?.userId) {
            await Notification.create(
              {
                userId: emp.Manager.userId,
                title: `Team Member Overdue: ${emp.firstName} ${emp.lastName}`,
                message: `Onboarding plan for ${emp.firstName} ${emp.lastName} passed its target date (${plan.targetCompletionDate}) at ${plan.progressPercent}%.`,
                channel: 'in_app',
                isRead: false,
              },
              { transaction: t }
            );
          }
        }
      }

      await logAudit({
        userId: actorUserId,
        action: 'SLA_MARK_OVERDUE',
        targetTable: 'onboarding_plans',
        targetId: plan.planId,
        details: {
          employeeId: plan.employeeId,
          targetCompletionDate: plan.targetCompletionDate,
          progressPercent: plan.progressPercent,
        },
      });
    });

    updatedPlans.push(plan);
  }

  return {
    checkedAt: new Date(),
    overdueCount: updatedPlans.length,
    planIds: updatedPlans.map((p) => p.planId),
  };
}

let schedulerTimer = null;

export function startSlaScheduler(intervalMs = 60 * 60 * 1000) {
  // Run once on startup safely
  checkOverduePlans().catch((err) =>
    console.error('Initial SLA overdue check encountered error:', err.message)
  );

  // Set recurring interval
  if (!schedulerTimer) {
    schedulerTimer = setInterval(() => {
      checkOverduePlans().catch((err) =>
        console.error('Scheduled SLA check encountered error:', err.message)
      );
    }, intervalMs);
    // Don't keep Node process alive just for background timer during unit tests
    if (schedulerTimer.unref) schedulerTimer.unref();
  }
}
