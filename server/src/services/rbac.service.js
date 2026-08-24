import { sequelize } from '../config/db.js';

export async function getRolesForUser(userId) {
  try {
    const [rows] = await sequelize.query(
      `SELECT r.role_name
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.role_id
        WHERE ur.user_id = :userId
        ORDER BY ur.is_primary DESC, r.hierarchy_level ASC`,
      { replacements: { userId } }
    );
    return rows.map(r => r.role_name);
  } catch (error) {
    console.error('Error fetching roles for user:', error);
    return [];
  }
}
