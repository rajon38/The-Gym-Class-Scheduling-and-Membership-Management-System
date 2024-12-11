const User = require('../models/UsersSchema')
const {hashPass, comparePass} = require('../utils/bcryptPassward')
const CreateToken = require('../utils/createToken')
const mongoose = require('mongoose');

const createUser = async (userDetails, res) => {
    try {
      const { fullName, email, password, role } = userDetails;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Validation error occurred.',
          errorDetails: {
            field: 'email',
            message: 'Email already registered.',
          },
        });
      }
  
      // Hash the password
      const hashedPassword = await hashPass(password);
  
      // Create a new user
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        role,
      });
  
      // Save the user to the database
      await newUser.save();
  
      return res.status(201).json({
        success: true,
        message: `${role} created successfully.`,
        data: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error(`Error in create${role}:`, error);
      res.status(500).json({
        success: false,
        message: 'Server error occurred.',
        errorDetails: error.message,
      });
    }
  };

// Controller for creating a trainer
exports.createTrainer = (req, res) => {
  const { fullName, email, password } = req.body;
  createUser({ fullName, email, password, role: 'Trainer' }, res);
};

// Controller for registering a trainee
exports.register = (req, res) => {
  const { fullName, email, password } = req.body;
  createUser({ fullName, email, password, role: 'Trainee' }, res);
};
// exports.register =async(req, res)=>{
//     const { fullName, email, password } = req.body;

//     try {
//         const existingUser = await User.findOne({email})

//         if(existingUser){
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation error occurred.',
//                 errorDetails: {
//                   field: 'email',
//                   message: 'Email already registered.'}
//                 })
//         }

//         // Hash the password
//         const hashedPassword = await hashPass(password);

//         //create a new trainee
//         const newTrainee = new User({
//             fullName,
//             email,
//             password: hashedPassword,
//             role: 'Trainee'
//         });

//         // Save the trainee to the database
//         await newTrainee.save();

//         res.status(201).json({
//             success: true,
//             message: 'Trainee registered successfully.',
//             data: {
//                 id: newTrainee._id,
//                 fullName: newTrainee.fullName,
//                 email: newTrainee.email,
//                 role: newTrainee.role
//             }
//         });

//     } catch (error) {
//         console.error('Error in registerTrainee:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error occurred.',
//             errorDetails: error.message,
//         });
//     }
// }

exports.login = async(req, res) =>{
    const { email, password } = req.body;

    try {
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({
                success: false,
                message: 'Error occurred.',
                errorDetails: {
                  field: 'email',
                  message: 'User not found.'}
                })
        }


        // Check if the password matches
        const isMatch = await comparePass(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false, 
                message: 'Invalid credentials',
                errorDetails: {
                    field: 'email',
                    message: 'Password does not match'
                  }
            });
        }

        // Generate a token for the user
        const token = await CreateToken({_id: user._id, role: user.role});

        // Exclude sensitive or unnecessary data
        const { password: _, ...userDetails } = user._doc;


        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: userDetails,
            token
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            errorDetails: error.message,
        });
    }
}

exports.getUsers = async (req, res) => {
    try {
      const { role } = req.query;
  
      // Fetch users with optional role filter
      const filter = role ? { role } : {};
      const users = await User.find(filter).select('-password');
  
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully.',
        data: users,
      });
    } catch (error) {
      console.error('Error in getUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Server error occurred.',
        errorDetails: error.message,
      });
    }
  };


exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the user by ID
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }


    // Respond with the user details
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred',
      errorDetails: error.message,
    });
  }
}
  

exports.deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.query;

      
      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format.',
        });
      }
  
      // Validate role input
      if (!['Trainer', 'Trainee'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Role must be Trainer or Trainee.',
        });
      }
  
      // Find the user by ID
    const user = await User.findById(id);
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if the role matches
    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `The user exists but does not have the role of ${role}.`,
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: `${role} deleted successfully.`,
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({
        success: false,
        message: 'Server error occurred.',
        errorDetails: error.message,
      });
    }
};
 
exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName } = req.body;

    const trainer = await User.findById(id);

    if (!trainer || trainer.role !== 'Trainer') {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found.',
      });
    }

    // Update trainer details
    if (fullName) trainer.fullName = fullName

    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully.',
      data: {
        id: trainer._id,
        fullName: trainer.fullName
      },
    });
  } catch (error) {
    console.error('Error in updateTrainer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.',
      errorDetails: error.message,
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const { id } = req.headers; 

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.',
      errorDetails: error.message,
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.headers;
    const { fullName,  } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update user details
    if (fullName) user.fullName = fullName

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: user._id,
        fullName: user.fullName
      },
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred.',
      errorDetails: error.message,
    });
  }
};
