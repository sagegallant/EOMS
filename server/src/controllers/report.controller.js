import {
  Employee,
  OnboardingPlan,
  Document,
  DocumentVerification,
  Asset,
  AssetAllocation,
  TrainingRecord,
  Department,
  Position,
  sequelize,
} from '../models/index.js';

export async function getDashboardSummary(req, res, next) {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'active' } });
    const onboardingEmployees = await Employee.count({ where: { status: 'onboarding' } });

    const totalPlans = await OnboardingPlan.count();
    const completedPlans = await OnboardingPlan.count({ where: { status: 'completed' } });
    const inProgressPlans = await OnboardingPlan.count({ where: { status: 'in_progress' } });

    const avgProgressResult = await OnboardingPlan.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('progress_percent')), 'avgProgress']],
      raw: true,
    });
    const avgProgress = avgProgressResult?.avgProgress ? parseFloat(avgProgressResult.avgProgress).toFixed(1) : '0.0';

    const totalDocuments = await Document.count();
    const pendingVerifications = await DocumentVerification.count({ where: { status: 'pending' } });
    const approvedVerifications = await DocumentVerification.count({ where: { status: 'approved' } });

    const totalAssets = await Asset.count();
    const allocatedAssets = await Asset.count({ where: { status: 'allocated' } });
    const inStockAssets = await Asset.count({ where: { status: 'in_stock' } });

    const totalTrainingRecords = await TrainingRecord.count();
    const completedTrainingRecords = await TrainingRecord.count({ where: { status: 'completed' } });

    res.json({
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          onboarding: onboardingEmployees,
        },
        onboarding: {
          totalPlans,
          completedPlans,
          inProgressPlans,
          averageProgressPercent: Number(avgProgress),
          completionRatePercent: totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0,
        },
        compliance: {
          totalDocuments,
          pendingVerifications,
          approvedVerifications,
          complianceRatePercent: totalDocuments > 0 ? Math.round((approvedVerifications / totalDocuments) * 100) : 0,
        },
        assets: {
          totalAssets,
          allocatedAssets,
          inStockAssets,
          utilizationPercent: totalAssets > 0 ? Math.round((allocatedAssets / totalAssets) * 100) : 0,
        },
        training: {
          totalRecords: totalTrainingRecords,
          completedRecords: completedTrainingRecords,
          completionPercent: totalTrainingRecords > 0 ? Math.round((completedTrainingRecords / totalTrainingRecords) * 100) : 0,
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function getDepartmentStats(req, res, next) {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: Position,
          include: [
            {
              model: Employee,
              include: [{ model: OnboardingPlan, attributes: ['progressPercent', 'status'] }],
            },
          ],
        },
      ],
    });

    const stats = departments.map(d => {
      let totalHeadcount = 0;
      let onboardingCount = 0;
      let totalProgress = 0;

      d.Positions?.forEach(p => {
        p.Employees?.forEach(e => {
          totalHeadcount++;
          if (e.status === 'onboarding') onboardingCount++;
          if (e.OnboardingPlan) {
            totalProgress += parseFloat(e.OnboardingPlan.progressPercent || 0);
          }
        });
      });

      return {
        departmentId: d.deptId,
        departmentName: d.deptName,
        totalHeadcount,
        onboardingCount,
        averageOnboardingProgress: totalHeadcount > 0 ? Math.round(totalProgress / totalHeadcount) : 0,
      };
    });

    res.json({ data: stats });
  } catch (e) {
    next(e);
  }
}
