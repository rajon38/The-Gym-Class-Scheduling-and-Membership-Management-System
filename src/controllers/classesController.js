const Class = require('../models/ClassesSchema');
const ClassSchedule = require('../models/ClassSchedulesSchema');
const Booking = require('../models/BookingsSchema')
const User = require('../models/UsersSchema');

//createClass
exports.createClass = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if a class with the same name already exists
        const existingClass = await Class.findOne({ name });
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: 'Validation error occurred.',
                errorDetails: {
                    field: 'name',
                    message: 'Class name already exists.',
                },
            });
        }

        const newClass = new Class({ name, description });
        await newClass.save();

        res.status(201).json({
            success: true,
            message: 'Class created successfully.',
            data: newClass,
        });
    } catch (error) {
        console.error('Error in createClass:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};


//getClasses
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find();

        res.status(200).json({
            success: true,
            message: 'Classes retrieved successfully.',
            data: classes,
        });
    } catch (error) {
        console.error('Error in getClasses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};


//createClassSchedule
exports.createClassSchedule = async (req, res) => {
    try {
        const { classId, trainerId, date, startTime } = req.body;

        // Parse the start time and calculate the end time
        const start = new Date(`${date}T${startTime}:00`);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

        // Validate classId
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(400).json({
                success: false,
                message: 'Invalid classId. Class does not exist.',
            });
        }

        // Validate trainerId
        const trainer = await User.findById(trainerId);
        if (!trainer || trainer.role !== 'Trainer') {
            return res.status(400).json({
                success: false,
                message: 'Invalid trainerId. Trainer does not exist or is not authorized.',
            });
        }

        // Validate the date for existing schedules
        const existingSchedules = await ClassSchedule.find({ date });

        // Check if the maximum number of schedules for the day has been reached
        if (existingSchedules.length >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum number of schedules for the day has been reached.',
            });
        }

        // Check for time overlap
        const hasOverlap = existingSchedules.some((schedule) => {
            try {
                // Parse existing schedule times
                const scheduleDate = new Date(schedule.date); // Parse schedule.date
                const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
                const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

                // Construct scheduleStart and scheduleEnd using schedule.date
                const scheduleStart = new Date(scheduleDate);
                scheduleStart.setHours(startHour, startMinute, 0, 0);

                const scheduleEnd = new Date(scheduleDate);
                scheduleEnd.setHours(endHour, endMinute, 0, 0);


                // Compare input times with schedule times
                return start < scheduleEnd && end > scheduleStart;
            } catch (error) {
                return false; // Skip invalid schedules
            }
        });

        if (hasOverlap) {
            return res.status(400).json({
                success: false,
                message: 'Time overlap with an existing schedule.',
            });
        }

        // Format times in local time zone (HH:MM)
        const formatTime = (date) => 
            date.getHours().toString().padStart(2, '0') + ':' + 
            date.getMinutes().toString().padStart(2, '0');

        const newSchedule = new ClassSchedule({
            class: classId,
            trainer: trainerId,
            date,
            startTime: formatTime(start), // Local HH:MM
            endTime: formatTime(end),   // Local HH:MM
        });

        await newSchedule.save();

        res.status(201).json({
            success: true,
            message: 'Class schedule created successfully.',
            data: newSchedule,
        });
    } catch (error) {
        console.error('Error in createClassSchedule:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};


//getAssignedSchedules
exports.getAssignedSchedules = async (req, res) => {
    try {
        const { id: trainerId } = req.headers;

        // Ensure the user's role is 'Trainer'
        const role = req.headers.role;
        if (role !== 'Trainer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only trainers can view assigned schedules.',
            });
        }

        const schedules = await ClassSchedule.find({ trainer: trainerId })
            .populate('class', 'name description')
            .select('-trainer');
        

        res.status(200).json({
            success: true,
            message: 'Assigned schedules retrieved successfully.',
            data: schedules,
        });
    } catch (error) {
        console.error('Error in getAssignedSchedules:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};


//getAvailableSchedules
exports.getAvailableSchedules = async (req, res) => {
    try {
        const { date } = req.query;

        // Fetch schedules for the specified date and check capacity
        const availableSchedules = await ClassSchedule.find({
            date,
            $expr: { $lt: [{ $size: "$trainees" }, 10] },
        })
            .populate('class', 'name description')
            .populate('trainer', 'fullName email');

        res.status(200).json({
            success: true,
            message: 'Available schedules retrieved successfully.',
            data: availableSchedules,
        });
    } catch (error) {
        console.error('Error in getAvailableSchedules:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};



//bookClass
exports.bookClass = async (req, res) => {
    try {
        const { classScheduleId } = req.body;
        const { id: traineeId } = req.headers;

        // Fetch the class schedule
        const schedule = await ClassSchedule.findById(classScheduleId);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Class schedule not found.',
            });
        }

        // Check if the class is fully booked
        if (schedule.trainees.length >= 10) {
            return res.status(400).json({
                success: false,
                message: 'Class is fully booked.',
            });
        }

        // Check if the trainee is already booked
        const existingBooking = await Booking.findOne({ schedule: classScheduleId, trainee: traineeId });
        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Trainee is already booked for this class.',
            });
        }

        // Create a new booking entry
        const newBooking = new Booking({ schedule: classScheduleId, trainee: traineeId });
        await newBooking.save();

        // Add the trainee to the schedule for quick reference
        schedule.trainees.push(traineeId);
        await schedule.save();

        res.status(201).json({
            success: true,
            message: 'Class booked successfully.',
            data: {
                booking: newBooking,
                schedule,
            },
        });
    } catch (error) {
        console.error('Error in bookClass:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};



//getTraineeBookings
exports.getTraineeBookings = async (req, res) => {
    try {
        const { id: traineeId } = req.headers;

        const bookings = await ClassSchedule.find({ trainees: traineeId })
            .populate('class', 'name description')
            .populate('trainer', 'fullName email')
            .select('-trainees');

        res.status(200).json({
            success: true,
            message: 'Trainee bookings retrieved successfully.',
            data: bookings,
        });
    } catch (error) {
        console.error('Error in getTraineeBookings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};


//cancelBooking
exports.cancelBooking = async (req, res) => {
    try {
        const { classScheduleId, traineeId: bodyTraineeId } = req.body;
        const { id: headerTraineeId, role } = req.headers;

        let traineeId = bodyTraineeId || headerTraineeId;

        // If the request is made by Admin, ensure a traineeId is provided in the request body
        if (role === 'Admin' && !traineeId) {
            return res.status(400).json({
                success: false,
                message: 'Trainee ID is required for Admin to cancel a booking.',
            });
        }

        // Find the class schedule
        const schedule = await ClassSchedule.findById(classScheduleId);
        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Class schedule not found.',
            });
        }

        // Check if the trainee is booked
        const traineeIndex = schedule.trainees.indexOf(traineeId);
        if (traineeIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'Trainee is not booked for this class.',
            });
        }

        // Remove the trainee from the schedule
        schedule.trainees.splice(traineeIndex, 1);
        await schedule.save();

        res.status(200).json({
            success: true,
            message: `Booking cancelled successfully${role === 'Admin' ? ' by Admin' : ''}.`
        });
    } catch (error) {
        console.error('Error in cancelBooking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.',
            errorDetails: error.message,
        });
    }
};
