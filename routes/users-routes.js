const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');

const usersController = require('../controllers/users-controllers');

// User login
router.post('/login', usersController.login);

// Check authorization
router.use(checkAuth);

// Get all users
router.get('/', usersController.getAllUsers);

// Get all employees
router.get('/employees', usersController.getAllEmployees);

// Get user by ID
router.get('/:id', usersController.getUserByID);

// Update user by ID
router.patch('/:id', 
  [
    check('email')
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail()
    // check('password').isLength({ min: 6 }),
  ],
  usersController.updateUser
);

// Create days-off by user ID
router.patch('/:id/daysoff/create', 
  [
    check('from_date').not().isEmpty()
  ],
  usersController.createDaysOffByUserID
);

// Delete days-off by user ID
router.patch('/:id/daysoff/delete', 
  [
    check('dates').not().isEmpty()
  ],
  usersController.deleteDaysOffByUserID
);

// Create a user
router.post('/signup',
  [
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('email')
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 }),
    check('role').not().isEmpty(),
    check('dateOfBirth').not().isEmpty(),
    check('gender').not().isEmpty(),
    check('phone').not().isEmpty(),
    check('streetHouseNr').not().isEmpty(),
    check('postalCode').not().isEmpty(),
    check('city').not().isEmpty(),
    check('state').not().isEmpty(),
    check('country').not().isEmpty(),
    check('salary').not().isEmpty(),
    check('entryDate').not().isEmpty()
  ],
  usersController.signup
);


module.exports = router;