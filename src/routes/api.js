const express = require('express');

const { register, login, getUsers, createTrainer, getUserById, deleteUser, updateTrainer, getProfile, updateProfile} = require ('../controllers/authController.js');
const {authVarify, restrict} = require ('../middlewares/authVarification.js')
const router = express.Router()

//we will create routes here
router.post('/register', register);
router.post('/login', login);
router.get('/allUsers', getUsers);
router.get('/user/:id', authVarify, getUserById);
router.get('/profile', authVarify, restrict(['Admin', 'Trainee']), getProfile);
router.put('/profile', authVarify, restrict(['Admin', 'Trainee']), updateProfile)

//admin routes
router.post('/trainers', authVarify, restrict(['Admin']), createTrainer);
router.put('/trainers/:id', authVarify, restrict(['Admin']), updateTrainer);
router.delete('/:id', authVarify, restrict(['Admin']), deleteUser);





module.exports = router;