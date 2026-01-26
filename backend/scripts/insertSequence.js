// Insert a test sequence directly to MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');
const SequenceMongo = require('../models/SequenceMongo');

async function insertSequence() {
  try {
    const uri = process.env.MONGODB_ATLAS_URI;
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    const testSeq = {
      name: 'Direct Insert Test',
      header: '>DirectInsertTest',
      filename: 'test_direct.fasta',
      sequence: 'ATGCGTACGATCGATCG',
      length: 17,
      gcContent: 52.94,
      orfDetected: true,
      orfCount: 1,
      nucleotideCounts: { A: 4, T: 5, G: 5, C: 3 },
      storageType: 'atlas',
      description: 'Inserted via direct script'
    };

    const inserted = await SequenceMongo.create(testSeq);
    console.log('\n✅ Inserted sequence:');
    console.log('   ID:', inserted._id);
    console.log('   Name:', inserted.name);
    console.log('   StorageType:', inserted.storageType);
    console.log('   Length:', inserted.length);

    // Count total
    const total = await SequenceMongo.countDocuments();
    console.log('\n📊 Total sequences in Atlas:', total);

    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertSequence();
