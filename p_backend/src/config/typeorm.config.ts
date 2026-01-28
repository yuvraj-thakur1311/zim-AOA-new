import { DataSource, DataSourceOptions } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Address } from '../addresses/entities/address.entity';
import { User } from '../users/entities/user.entity';
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'yuvi13',
  database: process.env.DB_NAME || 'aoapro',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  // IMPORTANT: keep schema controlled by migrations so both p_backend and
  // admin_backend can safely share the same "users" table without TypeORM
  // trying to change columns (e.g. enforcing NOT NULL when old rows have NULLs).
  // This prevents "column ... contains null values" errors on startup.
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
};
export const dataSource = new DataSource(typeOrmConfig);
