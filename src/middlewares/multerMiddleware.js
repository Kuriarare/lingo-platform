const multer = require('multer');

// Configure Multer to use memory storage
const multerMiddleware = multer({ storage: multer.memoryStorage() });

module.exports = { multerMiddleware };