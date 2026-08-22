import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? 'eoms',
  process.env.DB_USER ?? 'root',
  process.env.DB_PASSWORD ?? '',
  {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: +(process.env.DB_PORT ?? 3306),
    dialect: 'mysql',
    logging: false,
    define: { underscored: true, createdAt: 'created_at', updatedAt: 'updated_at' },
    pool: { max: 10, min: 0, acquire: 30_000, idle: 10_000 },
  },
);
