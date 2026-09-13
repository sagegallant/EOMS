import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  Employee,
  OnboardingPlan,
  Checklist,
  Task,
  Document,
  Asset,
  TrainingCourse,
  SystemUser,
} from '../../src/models/index.js';

describe('Unit Tests: Sequelize Models & Schema Integrity', () => {
  test('Employee model attributes and table configuration', () => {
    assert.equal(Employee.tableName, 'employees');
    const attrs = Employee.rawAttributes;
    assert.ok(attrs.employeeId, 'employeeId attribute must exist');
    assert.ok(attrs.userId, 'userId attribute must exist');
    assert.ok(attrs.positionId, 'positionId attribute must exist');
    assert.ok(attrs.firstName, 'firstName attribute must exist');
    assert.ok(attrs.lastName, 'lastName attribute must exist');
    assert.ok(attrs.hireDate, 'hireDate attribute must exist');
    assert.ok(attrs.workLocation, 'workLocation attribute must exist');
  });

  test('OnboardingPlan model schema & status enums', () => {
    assert.equal(OnboardingPlan.tableName, 'onboarding_plans');
    const attrs = OnboardingPlan.rawAttributes;
    assert.ok(attrs.progressPercent, 'progressPercent must exist');
    assert.deepEqual(
      attrs.status.values,
      ['not_started', 'in_progress', 'completed', 'overdue'],
      'Status enum should match schema definition',
    );
  });

  test('Task model attributes and priorities', () => {
    assert.equal(Task.tableName, 'tasks');
    const attrs = Task.rawAttributes;
    assert.ok(attrs.title, 'title attribute must exist');
    assert.deepEqual(
      attrs.priority.values,
      ['low', 'medium', 'high', 'critical'],
      'Task priority values must be properly enumerated',
    );
  });

  test('Document and Asset schema definitions', () => {
    assert.equal(Document.tableName, 'documents');
    assert.equal(Asset.tableName, 'assets');
    const assetAttrs = Asset.rawAttributes;
    assert.deepEqual(
      assetAttrs.status.values,
      ['in_stock', 'allocated', 'in_repair', 'retired'],
      'Asset status enum must be accurate',
    );
  });
});
