const {Router} = require('express');
const multer = require('multer');
const {registerController, loginController, userDataController, avatarController, updateUserController, deleteUserController, assignStudentController, getUsersController} = require('../controllers/usersController');
const {chatsController} = require('../controllers/chatsController');
const router = Router();



// Step 2: Configure Multer for File Uploads
const multerMiddleware = multer({storage: multer.memoryStorage()});
router.get('/', (req, res) => {
    res.send('Hello World');
});
router.post('/login', loginController);
router.post('/register', registerController);
router.get('/userdata', userDataController);
router.post('/uploadavatar', multerMiddleware.single('file'), avatarController);
router.post('/updateuser', updateUserController)
router.post('/assignstudent', assignStudentController);
router.delete('/deleteuser', deleteUserController);
router.get('/allusers', getUsersController);
router.get('/messages/:room', chatsController);


module.exports = router;