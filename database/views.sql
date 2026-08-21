-- =====================================================================
-- EOMS: Reporting & Operational Views
-- =====================================================================

USE `eoms`;

-- ---------------------------------------------------------------------
-- 1. vw_document_status: Resolves latest verification status for documents
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_document_status`;
CREATE VIEW `vw_document_status` AS
SELECT 
  d.document_id,
  d.employee_id,
  d.type_id,
  dt.type_name,
  dt.is_required,
  d.file_name,
  d.file_path,
  d.file_size_bytes,
  d.mime_type,
  d.uploaded_at,
  COALESCE(latest_v.status, 'pending') AS derived_status,
  latest_v.verification_id,
  latest_v.reviewer_user_id,
  latest_v.comments AS reviewer_comments,
  latest_v.verified_at
FROM documents d
JOIN document_types dt ON dt.type_id = d.type_id
LEFT JOIN (
  SELECT dv1.*
  FROM document_verifications dv1
  INNER JOIN (
    SELECT document_id, MAX(verification_id) AS max_ver_id
    FROM document_verifications
    GROUP BY document_id
  ) dv_latest ON dv1.verification_id = dv_latest.max_ver_id
) latest_v ON latest_v.document_id = d.document_id;

-- ---------------------------------------------------------------------
-- 2. vw_employee_onboarding_progress: Overview of progress, dates, and metrics
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_employee_onboarding_progress`;
CREATE VIEW `vw_employee_onboarding_progress` AS
SELECT 
  e.employee_id,
  e.first_name,
  e.last_name,
  CONCAT(e.first_name, ' ', e.last_name) AS full_name,
  e.hire_date,
  e.status AS employee_status,
  e.work_email,
  e.work_location,
  p.job_title,
  d.dept_name,
  m.employee_id AS manager_id,
  CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
  op.plan_id,
  op.progress_percent,
  op.status AS plan_status,
  op.target_completion_date
FROM employees e
JOIN positions p ON p.position_id = e.position_id
JOIN departments d ON d.dept_id = p.dept_id
LEFT JOIN employees m ON m.employee_id = e.manager_id
LEFT JOIN onboarding_plans op ON op.employee_id = e.employee_id;

-- ---------------------------------------------------------------------
-- 3. vw_task_status_summary: Aggregated completion counts by employee
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_task_status_summary`;
CREATE VIEW `vw_task_status_summary` AS
SELECT 
  tp.employee_id,
  COUNT(tp.task_id) AS total_assigned_tasks,
  SUM(CASE WHEN tp.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN tp.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN tp.status = 'not_started' THEN 1 ELSE 0 END) AS not_started_tasks,
  SUM(CASE WHEN tp.status = 'blocked' THEN 1 ELSE 0 END) AS blocked_tasks
FROM task_progress tp
GROUP BY tp.employee_id;

-- ---------------------------------------------------------------------
-- 4. vw_training_completion_rates: Mandatory compliance tracking
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_training_completion_rates`;
CREATE VIEW `vw_training_completion_rates` AS
SELECT 
  tc.course_id,
  tc.title AS course_title,
  tc.is_mandatory,
  COUNT(tr.record_id) AS enrolled_count,
  SUM(CASE WHEN tr.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
  ROUND((SUM(CASE WHEN tr.status = 'completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(tr.record_id), 0)) * 100, 1) AS completion_rate_percent
FROM training_courses tc
LEFT JOIN training_records tr ON tr.course_id = tc.course_id
GROUP BY tc.course_id, tc.title, tc.is_mandatory;

-- ---------------------------------------------------------------------
-- 5. vw_asset_allocation_status: Hardware and IT provisioning summary
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS `vw_asset_allocation_status`;
CREATE VIEW `vw_asset_allocation_status` AS
SELECT 
  a.asset_id,
  a.asset_tag,
  a.serial_number,
  a.status AS asset_status,
  am.model_name,
  am.manufacturer,
  ac.category_name,
  aa.allocation_id,
  aa.employee_id,
  CONCAT(e.first_name, ' ', e.last_name) AS allocated_to,
  aa.allocated_at,
  aa.acknowledgement_status
FROM assets a
JOIN asset_models am ON am.model_id = a.model_id
JOIN asset_categories ac ON ac.category_id = am.category_id
LEFT JOIN asset_allocations aa ON aa.asset_id = a.asset_id AND aa.returned_at IS NULL
LEFT JOIN employees e ON e.employee_id = aa.employee_id;
