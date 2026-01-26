const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGODB_ATLAS_URI;
  if (!uri) {
    console.error('Missing MONGODB_ATLAS_URI in environment');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('sequences');

  const before = await collection.aggregate([
    { $group: { _id: '$storageType', count: { $sum: 1 } } }
  ]).toArray();

  const res = await collection.updateMany({}, { $set: { storageType: 'atlas' } });

  const after = await collection.aggregate([
    { $group: { _id: '$storageType', count: { $sum: 1 } } }
  ]).toArray();

  const modified = res.modifiedCount ?? res.result?.nModified ?? 0;
  console.log('Before:', before);
  console.log('After :', after);
  console.log(`Updated storageType to atlas on ${modified} documents.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Update failed:', err.message);
  process.exit(1);
});
