import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppConfig } from '@/config/configuration';
import { ALL_MODELS } from './models';

const sqlLogger = new Logger('Sequelize');

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.getOrThrow<AppConfig['database']>('database');
        return {
          dialect: 'postgres' as const,
          host: db.host,
          port: db.port,
          database: db.name,
          username: db.user,
          password: db.password,
          /* Managed Postgres (Railway, Neon, …) is TLS-only. Their proxy
             presents a certificate we have no CA for, so verify is off — the
             connection is still encrypted. */
          dialectOptions: db.ssl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : undefined,
          models: ALL_MODELS,
          /* Migrations own the schema. Auto-sync has silently dropped columns
             on this developer's other project — never turn this on. */
          synchronize: false,
          autoLoadModels: false,
          logging: db.logging ? (sql: string) => sqlLogger.debug(sql) : false,
          define: { underscored: true, timestamps: true },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
