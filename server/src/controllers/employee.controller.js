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
    const systemUserInclude = {
      model: SystemUser,
      attributes: ['userId', 'username', 'email', 'isActive'],
      include: [{ model: Role, attributes: ['roleId', 'roleName'], through: { attributes: [] } }],
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        where.status = { [Op.ne]: 'terminated' };
        systemUserInclude.where = { isActive: true };
      } else if (status === 'inactive' || status === 'terminated') {
        systemUserInclude.where = { isActive: false };
      } else {
        where.status = status;
      }
    }
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
        { model: Employee, as: 'Buddy', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'], required: false },
        systemUserInclude,
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
        { model: Employee, as: 'Buddy', attributes: ['employeeId', 'firstName', 'lastName', 'workEmail'] },
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
        { model: SystemUser, attributes: ['userId', 'username', 'email', 'isActive', 'lastLogin'] },
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
      password,
      positionId,
      managerId,
      buddyId,
      hireDate,
      workLocation = 'Bengaluru (Hybrid)',
      status = 'onboarding',
      emergencyContact,
    } = req.body;

    if (!firstName || !lastName || !workEmail || !password || !positionId || !hireDate) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'First name, last name, email, password, position, and hire date are required.',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters long.',
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

        const passwordHash = await bcrypt.hash(password, 10);
        systemUser = await SystemUser.create(
          {
            username,
            email: workEmail,
            passwordHash,
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
          managerId: managerId ? Number(managerId) : null,
          buddyId: buddyId ? Number(buddyId) : null,
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

      return { employee };
    });

    await logAudit({
      userId: req.user?.userId,
      action: 'CREATE_EMPLOYEE',
      targetTable: 'employees',
      targetId: result.employee.employeeId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: { firstName, lastName, workEmail },
    });

    res.status(201).json({
      message: 'Employee registered successfully.',
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
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: SystemUser }],
    });
    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    const { status, workLocation, managerId, buddyId, positionId, workEmail, endDate, isActive, is_active } = req.body;
    const targetActive = isActive !== undefined ? Boolean(isActive) : (is_active !== undefined ? Boolean(is_active) : (status === 'terminated' ? false : (status === 'active' ? true : undefined)));

    // Admin self-protection guard on deactivation through update
    const callerEmployeeId = req.user?.employeeId;
    const callerUserId = req.user?.userId;
    if (
      (targetActive === false || status === 'terminated') &&
      (callerEmployeeId === employee.employeeId || callerUserId === employee.userId || (req.user?.username && employee.SystemUser?.username === req.user.username))
    ) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Security Guard: Administrators cannot deactivate their own active account.',
      });
    }

    await sequelize.transaction(async (t) => {
      await employee.update({
        ...(status && { status }),
        ...(workLocation && { workLocation }),
        ...(managerId !== undefined && { managerId: managerId ? Number(managerId) : null }),
        ...(buddyId !== undefined && { buddyId: buddyId ? Number(buddyId) : null }),
        ...(positionId && { positionId }),
        ...(workEmail && { workEmail }),
        ...(endDate !== undefined && { endDate }),
      }, { transaction: t });

      if (targetActive !== undefined && employee.SystemUser) {
        await employee.SystemUser.update({ isActive: targetActive }, { transaction: t });
      }
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

export async function deactivateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const targetEmployeeId = Number(id);

    const callerUserId = req.user?.userId;
    const callerEmployeeId = req.user?.employeeId;

    if (callerEmployeeId && callerEmployeeId === targetEmployeeId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Security Guard: Administrators cannot deactivate their own active account.',
      });
    }

    const employee = await Employee.findByPk(targetEmployeeId, {
      include: [{ model: SystemUser }],
    });

    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    if (
      employee.userId === callerUserId ||
      (req.user?.username && employee.SystemUser?.username === req.user.username)
    ) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Security Guard: Administrators cannot deactivate their own active account.',
      });
    }

    if (employee.status === 'terminated' || (employee.SystemUser && !employee.SystemUser.isActive)) {
      return res.status(400).json({
        code: 'ALREADY_INACTIVE',
        message: 'Employee is already deactivated/inactive.',
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    await sequelize.transaction(async (t) => {
      await employee.update(
        { status: 'terminated', endDate: today },
        { transaction: t }
      );

      if (employee.SystemUser) {
        await employee.SystemUser.update(
          { isActive: false },
          { transaction: t }
        );
      }

      await logAudit({
        userId: req.user?.userId,
        action: 'DEACTIVATE_EMPLOYEE',
        targetTable: 'employees',
        targetId: employee.employeeId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { employeeId: employee.employeeId, userId: employee.userId, status: 'terminated', endDate: today },
      }, { transaction: t });
    });

    res.json({
      message: 'Employee deactivated successfully.',
      data: {
        employeeId: employee.employeeId,
        status: 'terminated',
        endDate: today,
        isActive: false,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function reactivateEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const targetEmployeeId = Number(id);

    const employee = await Employee.findByPk(targetEmployeeId, {
      include: [{ model: SystemUser }],
    });

    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    await sequelize.transaction(async (t) => {
      await employee.update(
        { status: 'active', endDate: null },
        { transaction: t }
      );

      if (employee.SystemUser) {
        await employee.SystemUser.update(
          { isActive: true },
          { transaction: t }
        );
      }

      await logAudit({
        userId: req.user?.userId,
        action: 'REACTIVATE_EMPLOYEE',
        targetTable: 'employees',
        targetId: employee.employeeId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { employeeId: employee.employeeId, userId: employee.userId, status: 'active' },
      }, { transaction: t });
    });

    res.json({
      message: 'Employee reactivated successfully.',
      data: {
        employeeId: employee.employeeId,
        status: 'active',
        endDate: null,
        isActive: true,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;
    const targetEmployeeId = Number(id);

    const callerUserId = req.user?.userId;
    const callerEmployeeId = req.user?.employeeId;

    if (callerEmployeeId && callerEmployeeId === targetEmployeeId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Security Guard: Administrators cannot delete their own active account.',
      });
    }

    const employee = await Employee.findByPk(targetEmployeeId, {
      include: [{ model: SystemUser }],
    });

    if (!employee) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Employee not found.' });
    }

    if (
      employee.userId === callerUserId ||
      (req.user?.username && employee.SystemUser?.username === req.user.username)
    ) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Security Guard: Administrators cannot delete their own active account.',
      });
    }

    const empId = employee.employeeId;
    const uId = employee.userId;

    await sequelize.transaction(async (t) => {
      // Clear manager and buddy assignments pointing to this employee
      await Employee.update({ managerId: null }, { where: { managerId: empId }, transaction: t });
      await Employee.update({ buddyId: null }, { where: { buddyId: empId }, transaction: t });

      // Destroy Employee record (cascading cleanup to onboarding plans, tasks, documents, etc.)
      await employee.destroy({ transaction: t });

      // Expunge SystemUser credentials
      if (uId) {
        await SystemUser.destroy({ where: { userId: uId }, transaction: t });
      }

      await logAudit({
        userId: req.user?.userId,
        action: 'DELETE_EMPLOYEE',
        targetTable: 'employees',
        targetId: empId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        details: { employeeId: empId, userId: uId },
      }, { transaction: t });
    });

    res.json({
      message: 'Employee and associated credentials permanently expunged.',
      data: { employeeId: empId },
    });
  } catch (e) {
    next(e);
  }
}
