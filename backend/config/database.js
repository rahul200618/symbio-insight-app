const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database in backend directory
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully');

    // Sync all models (use force: false for production, alter: true for development)
    await sequelize.sync({ alter: true });
    console.log('   Database synced');
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
