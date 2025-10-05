const mongoose = require('mongoose');

(async () => {
  try {
    // connect to your MongoDB Atlas
    await mongoose.connect('mongodb+srv://vasantigoli3107_db_user:UjFlaF9vySOvY6Id@cluster0.w0tutyn.mongodb.net/tts_db?retryWrites=true&w=majority&appName=Cluster0');

    console.log('✅ Connected to MongoDB');

    const result = await mongoose.connection.db.collection('users').dropIndex('id_1');
    console.log('🗑️  Dropped index:', result);

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
