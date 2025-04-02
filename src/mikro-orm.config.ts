// src/mikro-orm.config.ts
import 'dotenv/config'; // This loads variables from your .env file
import {
  defineConfig,
  MySqlDriver,
  UnderscoreNamingStrategy,
} from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  driver: MySqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dbName: process.env.DB_NAME || 'easy_crypto_wallet',
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
  extensions: [Migrator, EntityGenerator, SeedManager],
  debug: true,
  ensureDatabase: false,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  migrations: {
    tableName: 'tbl_migrations',
    path: 'src/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    emit: 'ts',
  },
  namingStrategy: UnderscoreNamingStrategy,
});
