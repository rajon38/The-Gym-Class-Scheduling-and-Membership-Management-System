const express = require('express');

const { register, login, getUsers, createTrainer, getUserById, deleteUser, updateTrainer, getProfile, updateProfile} = require ('../controllers/authController.js');
const { createClass, getClasses, createClassSchedule, getAssignedSchedules, getAvailableSchedules, bookClass, getTraineeBookings, cancelBooking } = require('../controllers/classesController.js');
const {authVarify, restrict} = require ('../middlewares/authVarification.js')
const router = express.Router()

//authRoutes
router.post('/register', register);//register
router.post('/login', login);//login
router.get('/allUsers', getUsers);//get All Users with params - role 'Trainer' or 'Trainee'
router.get('/user/:id', authVarify, getUserById);//get a User
router.get('/profile', authVarify, restrict(['Admin', 'Trainee', 'Trainer']), getProfile);//get Profile
router.put('/profile', authVarify, restrict(['Admin', 'Trainee']), updateProfile)//update Profile
router.post('/trainers', authVarify, restrict(['Admin']), createTrainer);//create a Trainer
router.put('/trainers/:id', authVarify, restrict(['Admin']), updateTrainer);//update Trainer
router.delete('/user/:id', authVarify, restrict(['Admin']), deleteUser);//delete a User

//classRoutes
router.post('/class', authVarify, restrict(['Admin']), createClass); // Create a new class
router.get('/class', getClasses); // Get all classes
router.post('/schedule', authVarify, restrict(['Admin']), createClassSchedule); // Create a class schedule
router.get('/schedule/assigned', authVarify, restrict(['Trainer']), getAssignedSchedules); // Get schedules assigned to a trainer
router.get('/schedule/available', authVarify, restrict(['Trainee']), getAvailableSchedules); // Get available schedules for trainees

//bookingRoutes
router.post('/schedule/book', authVarify, restrict(['Trainee']), bookClass); //book a class
router.get('/schedule/bookings', authVarify, restrict(['Trainee']), getTraineeBookings);//get all bookings
router.delete('/schedule/cancel', authVarify, restrict(['Trainee', 'Admin']), cancelBooking);//cancel a booking


module.exports = router;