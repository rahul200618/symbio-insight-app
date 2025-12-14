const mongoose = require('mongoose');

let isConnected = false;
let connectionType = 'none'; // 'none' or 'atlas'

/**
 * Connect to MongoDB Atlas (Cloud Storage)
 * SQLite is used for local storage, MongoDB Atlas for cloud
 * @returns {Promise<boolean>} - Connection success status
 */
const connectMongoDB = async (type = 'atlas') => {
  // Only 'atlas' type is supported for MongoDB
  // Local storage uses SQLite instead
  if (type === 'local') {
    console.log('Local storage uses SQLite. Use "atlas" for MongoDB cloud storage.');
    return false;
  }
  
  if (isConnected && connectionType === 'atlas') {
    console.log('MongoDB Atlas already connected');
    return true;
  }

  // Disconnect if already connected
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectionType = 'none';
  }

  try {
    const uri = process.env.MONGODB_ATLAS_URI;
    if (!uri) {
      throw new Error('MONGODB_ATLAS_URI not configured in .env file');
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, options);
    
    isConnected = true;
    connectionType = 'atlas';
    
    console.log('✅ MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    isConnected = false;
    connectionType = 'none';
    return false;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectMongoDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectionType = 'none';
    console.log('MongoDB disconnected');
  }
};

/**
 * Get current connection status
 */
const getConnectionStatus = () => ({
  isConnected,
  connectionType,
  readyState: mongoose.connection.readyState
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  getConnectionStatus,
  mongoose
};
