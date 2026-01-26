require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  const uri = process.env.MONGODB_ATLAS_URI;
  if (!uri) { console.error('Missing MONGODB_ATLAS_URI'); process.exit(1); }
  await mongoose.connect(uri);
  const coll = mongoose.connection.db.collection('sequences');
  const total = await coll.countDocuments();
  const byType = await coll.aggregate([{ $group: { _id: '$storageType', count: { $sum: 1 } } }]).toArray();
  const sample = await coll.find({}).project({ name:1, storageType:1 }).limit(5).toArray();
  console.log({ total, byType, sample });
  await mongoose.disconnect();
})();
