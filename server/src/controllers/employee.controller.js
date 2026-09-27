import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import {
  sequelize,
  Employee,
  Position,
  Department,
  OnboardingPlan,
  Checklist,
  Task,
  SystemUser,
  EmergencyContact,
  Document,
  DocumentType,
  DocumentVerification,
  AssetAllocation,
  Asset,
  AssetModel,
  Role,
  UserRole,
} from '../models/index.js';
import { logAudit } from '../services/audit.service.js';

export async function listEmployees(req, res, next) {
  try {
    const { search, status, departmentId, workLocation } = req.query;

    const where = {};
    if (status) where.status = status;
    if (workLocation) where.workLocation = { [Op.like]: `%${workLocation}%` };

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { workEmail: { [Op.like]: `%${search}%` } },
      ];
    }

    const positionInclude = {
      model: Position,
      include: [{ model: Department }],
    };

    if (departmentId) {
      positionInclude.where = { deptId: departmentId };
    }

    const employees = await Employee.findAll({
      where,
      include: [
        positionInclude,
        { model: OnboardingPlan, attributes: ['planId', 'progressPercent', 'status', 'targetCompletionDate'] },
        { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
        { model: SystemUser, attributes: ['userId', 'username', 'email'] },
      ],
      order: [['hireDate', 'DESC']],
    });

    res.json({ data: employees });
  } catch (e) {
    next(e);
  }
}

export async function getEmployeeById(req, res, next) {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Position, include: [{ model: Department }] },
        { model: OnboardingPlan },
        { model: Employee, as: 'Manager', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
        { model: EmergencyContact },
        {
          model: Document,
          include: [
            { model: DocumentType },
            { model: DocumentVerification, include: [{ model: SystemUser, as: 'Reviewer', attributes: ['username'] }] },
          ],
        },
        {
          model: AssetAllocation,
          include: [{ model: Asset, include: [{ model: AssetModel }] }],
        },
        { model: SystemUser, attributes: ['userId', 'username', 'email', 'lastLogin'] },
      ],
    });

    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    res.json({ data: employee });
  } catch (e) {
    next(e);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      workEmail,
      positionId,
      managerId,
      hireDate,
      workLocation = 'Bengaluru (Hybrid)',
      status = 'onboarding',
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !workEmail || !positionId || !hireDate) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'First name, last name, email, position, and hire date are required.',
      });
    }

    const result = await sequelize.transaction(async (t) => {
      // Check if an employee with this email already exists
      const existingEmp = await Employee.findOne({ where: { workEmail }, transaction: t });
      if (existingEmp) {
        const err = new Error(`An employee with email ${workEmail} is already registered.`);
        err.statusCode = 409;
        err.code = 'CONFLICT';
        throw err;
      }

      // Check if user account already exists or create one
      let systemUser = await SystemUser.findOne({ where: { email: workEmail }, transaction: t });
      if (!systemUser) {
        const baseUser = workEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 40);
        let username = baseUser;
        let counter = 1;
        while (await SystemUser.findOne({ where: { username }, transaction: t })) {
          username = `${baseUser}${counter++}`;
        }

        const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
        systemUser = await SystemUser.create(
          {
            username,
            email: workEmail,
            passwordHash: defaultPasswordHash,
            isActive: true,
          },
          { transaction: t }
        );

        // Assign EMPLOYEE role by default
        const empRole = await Role.findOne({ where: { roleName: 'EMPLOYEE' }, transaction: t });
        if (empRole) {
          await UserRole.create(
            {
              userId: systemUser.userId,
              roleId: empRole.roleId,
              isPrimary: true,
            },
            { transaction: t }
          );
        }
      }

      const employee = await Employee.create(
        {
          userId: systemUser.userId,
          positionId,
          managerId: managerId || null,
          firstName,
          lastName,
          workEmail,
          hireDate,
          workLocation,
          status,
        },
        { transaction: t }
      );

      // Create Emergency Contact if provided
      if (emergencyContact?.name && emergencyContact?.phone) {
        await EmergencyContact.create(
          {
            employeeId: employee.employeeId,
            name: emergencyContact.name,
            relationship: emergencyContact.relationship || 'Spouse',
            phone: emergencyContact.phone,
            email: emergencyContact.email || null,
            isPrimary: true,
          },
          { transaction: t }
        );
      }

      // Automatically initialize Onboarding Plan (30-day target by default)
      const targetDate = new Date(hireDate);
      targetDate.setDate(targetDate.getDate() + 30);
      const plan = await OnboardingPlan.create(
        {
          employeeId: employee.employeeId,
          startDate: hireDate,
          targetCompletionDate: targetDate.toISOString().split('T')[0],
          progressPercent: 0,
          status: 'in_progress',
        },
        { transaction: t }
      );

      // Initialize structured onboarding phases and tasks
      const phases = [
        {
          phaseName: 'Pre-Boarding & Statutory Verification',
          phaseOrder: 1,
          dueOffsetDays: 0,
          tasks: [
            { title: 'Upload Government Identification (PAN & Aadhaar)', category: 'compliance', priority: 'high', minutes: 20 },
            { title: 'Sign EOMS Statutory Code of Conduct', category: 'administrative', priority: 'medium', minutes: 15 },
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
          phaseName: 'Week One: Culture & Regulatory Compliance',
          phaseOrder: 3,
          dueOffsetDays: 7,
          tasks: [
            { title: 'Complete POSH Act 2013 Awareness Assessment', category: 'training', priority: 'critical', minutes: 45 },
            { title: 'Complete Information Security & DPDP Training', category: 'training', priority: 'high', minutes: 30 },
          ],
        },
        {
          phaseName: 'Month One: Goals, Reviews & Team Alignment',
          phaseOrder: 4,
          dueOffsetDays: 30,
          tasks: [
            { title: 'First 30-Day Check-in with Reporting Manager', category: 'manager_meeting', priority: 'medium', minutes: 45 },
          ],
        },
      ];

      for (const p of phases) {
        const checklist = await Checklist.create(
          {
            planId: plan.planId,
            phaseName: p.phaseName,
            phaseOrder: p.phaseOrder,
            dueOffsetDays: p.dueOffsetDays,
          },
          { transaction: t }
        );

        for (let order = 0; order < p.tasks.length; order++) {
          const tDef = p.tasks[order];
          await Task.create(
            {
              checklistId: checklist.checklistId,
              title: tDef.title,
              category: tDef.category,
              priority: tDef.priority,
              estimatedMinutes: tDef.minutes,
              sortOrder: order + 1,
              isMandatory: true,
            },
            { transaction: t }
          );
        }
      }

      return { employee, plan };
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE_EMPLOYEE',
      targetTable: 'employees',
      targetId: result.employee.employeeId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { firstName, lastName, workEmail, planId: result.plan.planId },
    });

    res.status(201).json({
      message: 'Employee registered successfully with initialized onboarding plan and tasks.',
      data: result.employee,
    });
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json({ code: e.code || 'ERROR', message: e.message });
    }
    next(e);
  }
}


export async function updateEmployee(req, res, next) {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    const { status, workLocation, managerId, positionId, workEmail, endDate } = req.body;
    await employee.update({
      ...(status && { status }),
      ...(workLocation && { workLocation }),
      ...(managerId !== undefined && { managerId }),
      ...(positionId && { positionId }),
      ...(workEmail && { workEmail }),
      ...(endDate !== undefined && { endDate }),
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'UPDATE_EMPLOYEE',
      targetTable: 'employees',
      targetId: employee.employeeId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: req.body,
    });

    res.json({ message: 'Employee updated successfully.', data: employee });
  } catch (e) {
    next(e);
  }
}

export async function getDepartments(req, res, next) {
  try {
    const departments = await Department.findAll({
      include: [
        {
          model: Position,
          include: [{ model: Employee, attributes: ['employeeId'] }],
        },
      ],
      order: [['deptName', 'ASC']],
    });
    res.json({ data: departments });
  } catch (e) {
    next(e);
  }
}

export async function getPositions(req, res, next) {
  try {
    const positions = await Position.findAll({
      include: [{ model: Department }],
      order: [['jobTitle', 'ASC']],
    });
    res.json({ data: positions });
  } catch (e) {
    next(e);
  }
}
