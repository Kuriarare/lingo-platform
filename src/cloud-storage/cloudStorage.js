const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: {
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL
  }
});

const bucket = storage.bucket('lingo-academy-avatar');

module.exports = { bucket };