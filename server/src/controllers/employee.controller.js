import { Employee, Position, Department, OnboardingPlan, SystemUser } from '../models/index.js';

export async function listEmployees(req, res, next) {
  try {
    const employees = await Employee.findAll({
      include: [
        { model: Position, include: [{ model: Department }] },
        { model: OnboardingPlan, attributes: ['progressPercent', 'status', 'targetCompletionDate'] },
        { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName'] },
      ],
      order: [['hireDate', 'DESC']],
    });
    res.json({ data: employees });
  } catch (e) { next(e); }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Position, include: [{ model: Department }] },
        { model: OnboardingPlan },
        { model: Employee, as: 'Manager' },
      ],
    });
    if (!employee) return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    res.json({ data: employee });
  } catch (e) { next(e); }
}
