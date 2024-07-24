// Step 1: Initialize Google Cloud Storage
const {Storage} = require('@google-cloud/storage');
const multer = require('multer');
const express = require('express');
const app = express();
const port = 3000;

// Initialize Google Cloud Storage client
const storage = new Storage({
  keyFilename: '../myKey.json',
  projectId: 'your-project-id',
});
const bucket = storage.bucket('your-bucket-name');

// Step 2: Configure Multer for File Uploads
const multerMiddleware = multer({storage: multer.memoryStorage()});

// Step 3: Upload Files to Google Cloud Storage
app.post('/upload', multerMiddleware.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => {
    res.status(500).send(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    res.status(200).send({url: publicUrl});
  });

  blobStream.end(req.file.buffer);
});

// Step 4: Verify and Test
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});