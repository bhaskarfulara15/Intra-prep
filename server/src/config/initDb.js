import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'ai_interview_prep';

  console.log(`\n⏳ Connecting to MySQL on ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without selecting database first to ensure it can be created
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL server.');

    // Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`📄 Executing schema definitions from ${schemaPath}...`);

    await connection.query(schemaSql);
    console.log(`🎉 Database "${dbName}" and all tables initialized successfully!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to initialize database: ${error.message}`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Allow direct execution: node src/config/initDb.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
