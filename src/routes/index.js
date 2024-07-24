const {Router} = require('express');
const {Storage} = require('@google-cloud/storage');
const multer = require('multer');

const {registerController, loginController, userDataController, avatarController, updateUserController, deleteUserController} = require('../controllers/usersController');
const router = Router();



// Step 2: Configure Multer for File Uploads
const multerMiddleware = multer({storage: multer.memoryStorage()});

router.post('/login', loginController);
router.post('/register', registerController);
router.get('/userdata', userDataController);
router.post('/uploadavatar', multerMiddleware.single('file'), avatarController);
router.post('/updateuser', updateUserController)
router.delete('/deleteuser', deleteUserController);


module.exports = router;