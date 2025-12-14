const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create SQLite database in backend directory
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Set to console.log to see SQL queries
  // SQLite-specific settings to prevent locking issues
  pool: {
    max: 1, // SQLite can only handle one connection at a time
    min: 0,
    acquire: 60000, // Increase acquire timeout
    idle: 10000
  },
  retry: {
    max: 5 // Retry failed queries up to 5 times
  },
  // Enable WAL mode for better concurrency
  dialectOptions: {
    mode: require('sqlite3').OPEN_READWRITE | require('sqlite3').OPEN_CREATE | require('sqlite3').OPEN_FULLMUTEX
  }
});

// Configure SQLite for better concurrency
const configureSQLite = async () => {
  try {
    // Enable WAL mode for better concurrency
    await sequelize.query('PRAGMA journal_mode = WAL;');
    // Increase busy timeout to 30 seconds
    await sequelize.query('PRAGMA busy_timeout = 30000;');
    // Enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON;');
    console.log('   SQLite configured with WAL mode and busy timeout');
  } catch (error) {
    console.log('   SQLite configuration warning:', error.message);
  }
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully');
    
    // Configure SQLite pragmas
    await configureSQLite();

    // Clean up any leftover backup tables from failed migrations
    try {
      await sequelize.query('DROP TABLE IF EXISTS `sequences_backup`;');
      await sequelize.query('DROP TABLE IF EXISTS `users_backup`;');
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    // Try simple sync first (create tables if not exist)
    try {
      await sequelize.sync();
      console.log('   Database synced');
    } catch (syncError) {
      console.log('   Sync failed, attempting to recreate tables...');
      try {
        // Force recreate all tables
        await sequelize.sync({ force: true });
        console.log('   Database tables recreated');
      } catch (forceError) {
        console.error('   Force sync also failed:', forceError.message);
        // Last resort: delete the database file and recreate
        console.log('   Attempting to reset database file...');
        await sequelize.close();
        
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log('   Database file deleted');
        }
        
        // Reconnect and create fresh tables
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('   Fresh database created');
      }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('Database connection closed due to app termination');
  process.exit(0);
});

module.exports = { sequelize, connectDB };
