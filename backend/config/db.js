const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found in environment. Starting MongoMemoryServer with local persistence...');
      const dbPath = path.join(__dirname, '..', '.mongodb_data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
        },
      });
      mongoUri = mongoServer.getUri();
      console.log(`MongoMemoryServer started at: ${mongoUri} (persisted in ${dbPath})`);
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: false });
    }
    console.log('MongoDB disconnected.');
  } catch (err) {
    console.error(`Error disconnecting MongoDB: ${err.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
