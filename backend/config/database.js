const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Use temp directory to avoid OneDrive sync issues
const tempDir = path.join(os.tmpdir(), 'symbio-nlm');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
const dbPath = path.join(tempDir, 'database.sqlite');

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
