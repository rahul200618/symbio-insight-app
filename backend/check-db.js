const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    const uri = 'mongodb+srv://rahula_db_user:7GriQMhzQhv2f5aY@cluster0.hqbn9ok.mongodb.net/symbio?retryWrites=true&w=majority';
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📚 Collections in database:');
    collections.forEach(coll => console.log(`  - ${coll.name}`));
    
    // Check users collection
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Users: ${userCount} documents`);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).project({ password: 0 }).limit(10).toArray();
      console.log('\nUser documents:');
      users.forEach((user, idx) => {
        console.log(`\n  ${idx + 1}. ID: ${user._id}`);
        console.log(`     Name: ${user.name || 'NO NAME'}`);
        console.log(`     Email: ${user.email || '❌ NO EMAIL FIELD'}`);
        console.log(`     Institution: ${user.institution || 'N/A'}`);
        console.log(`     Created: ${user.createdAt || 'N/A'}`);
      });
    }
    
    // Check sequences collection  
    const sequencesCollection = mongoose.connection.db.collection('sequences');
    const seqCount = await sequencesCollection.countDocuments();
    console.log(`\n\n🧬 Sequences: ${seqCount} documents`);
    
    if (seqCount > 0) {
      const sequences = await sequencesCollection.find({}).limit(3).toArray();
      console.log('\nSequence documents (sample):');
      sequences.forEach((seq, idx) => {
        console.log(`\n  ${idx + 1}. Name: ${seq.name}, Length: ${seq.length}`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkDatabase();
