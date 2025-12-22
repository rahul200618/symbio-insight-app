const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Resolve SQLite file path with env override; default to temp to avoid OneDrive sync issues
function resolveDbPath() {
  const envPath = process.env.SQLITE_PATH || process.env.DB_PATH;
  if (envPath) {
    const absolute = path.isAbsolute(envPath) ? envPath : path.resolve(envPath);
    const dir = path.dirname(absolute);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return absolute;
  }

  const tempDir = path.join(os.tmpdir(), 'symbio-nlm');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return path.join(tempDir, 'database.sqlite');
}

const dbPath = resolveDbPath();

// Create SQLite database with simple config
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected');
    console.log('   Path:', dbPath);

    // Simple sync
    await sequelize.sync();
    console.log('   Tables synced');
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('Database connection closed');
  process.exit(0);
});

module.exports = { sequelize, connectDB };
