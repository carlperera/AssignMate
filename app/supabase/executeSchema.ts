import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const executeSchema = async () => {
  const connectionString = process.env.SUPABASE_URL as string;
  const ssl = { rejectUnauthorized: false };

  const client = new Client({
    connectionString,
    ssl
  });

  try {
    // Connect to the database
    await client.connect();

    // Read the schema file
    const schemaFilePath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaFilePath, 'utf-8');

    // Execute the schema SQL
    await client.query(schemaSQL);
    console.log('Schema applied successfully');
  } catch (error) {
    console.error('Error applying schema:', error);
  } finally {
    // Disconnect from the database
    await client.end();
  }
};

executeSchema();
