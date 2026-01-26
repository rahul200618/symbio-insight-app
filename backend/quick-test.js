node quick-test.js// Quick test script for authentication
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_ATLAS_URI;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function quickTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas\n');

    // List all users
    const users = await User.find({}).select('name email role createdAt');
    console.log('Users in database:');
    console.log('==================');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.role}) - ${user.name}`);
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    }

    console.log('\n✓ Test complete');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

quickTest();
