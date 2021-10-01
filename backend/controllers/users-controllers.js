// const {v4 : uuidv4} = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

// Get all users
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed!', 500);
      return next(error);
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))});
};

// Get all employees
const getAllEmployees = async (req, res, next) => {
    // Find manager by ID
    let manager_id = req.headers.manager_id;
    // console.log(manager_id)
    let manager;
    if (manager_id && manager_id !== '') {
        try {
            manager = await User.findOne({ _id: manager_id, role: 'manager' });
        } catch (err) {
            const error = new HttpError('Could not find manager!', 500);
            return next(error);
        }

        let employees;
        if (manager) {
            try {
                employees = await User.find({ role: 'employee'}, '-password');
            } catch (err) {
                const error = new HttpError('Fetching users failed!', 500);
                return next(error);
            }
            res.json({ users: employees.map(user => user.toObject({ getters: true })) });
        } else {
            res.json({ users: [] })
        }
    } else {
        res.json({ users: [] })
    }
    
};

// Get user by ID
const getUserByID = async (req, res, next) => {
    let user_id = req.params.id;

    let user;
    try {
        user = await User.findById(user_id, '-password');
    } catch (err) {
        console.log(err);
        const error = new HttpError('Fetching user failed!', 500);
        return next(error);
    }

    if (!user) {
        console.log('No user found!');
        throw new HttpError('User not found!', 404);
    }

    res.json({user_data: user.toObject({ getters: true })});
};

// Update user by ID
const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
        );
    }
    const user_id = req.params.id;
    const { firstName, lastName, email, password, role, dateOfBirth, gender, phone, streetHouseNr, city, postalCode, state, country, salary, entryDate, daysOffCount } = req.body;
    console.log(req.body);

    // Find user by ID
    let edited_user;
    try {
        edited_user = await User.findById(user_id);
    } catch (err) {
        const error = new HttpError('Could not update user!', 500);
      return next(error);
    }

    // Check if email is unique
    if (email && email !== '' && email !== edited_user.email) {
        let existingUserByEmail;
        try {
            existingUserByEmail = await User.findOne({ email: email })
        } catch (err) {
            const error = new HttpError('Could not find email!', 500);
            return next(error);
        }
        
        if (existingUserByEmail) {
            const error = new HttpError('Email already exists!', 422);
            return next(error);
        }

        edited_user.email = email;
    }

    // Convert to hashed password
    if (password && password !== '') {
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 12);
        } catch (err) {
            const error = new HttpError('Could not update password!', 500);
            return next(error);
        }
        edited_user.password = hashedPassword;
    }

    edited_user.firstName = firstName;
    edited_user.lastName = lastName;
    edited_user.role = role ? role : edited_user.role;
    edited_user.dateOfBirth = dateOfBirth;
    edited_user.gender = gender;
    edited_user.phone = phone;
    edited_user.streetHouseNr = streetHouseNr;
    edited_user.city = city;
    edited_user.postalCode = postalCode;
    edited_user.state = state;
    edited_user.country = country;
    edited_user.salary = salary;
    edited_user.entryDate = entryDate;
    edited_user.daysOffCount = daysOffCount || 0;

    try {
        await edited_user.save();
    } catch (err) {
        const error = new HttpError('Could not update user!', 500);
        return next(error);
    }

    res.status(200).json({ edited_user: edited_user.toObject({ getters: true }) });
};

// Create a user
const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
        );
    }

    const { firstName, lastName, email, password, role, dateOfBirth, gender, phone, streetHouseNr, postalCode, city, state, country, salary, entryDate, daysOffCount} = req.body;

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError('Signing up failed!', 500);
      return next(error);
    }
    
    if (existingUser) {
        const error = new HttpError('User already exists, please login!', 422);
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError('Could not create user!', 500);
        return next(error);
    }

    const createdUser = new User({
        firstName, 
        lastName, 
        email,
        role, 
        dateOfBirth, 
        gender, 
        phone, 
        streetHouseNr, postalCode, city, state, country, 
        salary, 
        entryDate,
        image: 'https://image.flaticon.com/icons/png/512/860/860784.png',
        password: hashedPassword,
        shifts: [],
        daysOffCount
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError('Signing up failed!', 500);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            'supersecret_dont_share',
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError('Signing up failed!', 500);
        return next(error);
    }

    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

// User login
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError( 'Login failed!', 500);
        return next(error);
    }
  
    if (!existingUser) {
        const error = new HttpError('Username/Email not found, login failed!', 401);
        return next(error);
    }
    
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError('Cannot verify password, login failed!', 500);
        return next(error);
    }
    
    if (!isValidPassword) {
        const error = new HttpError('Password is wrong, login failed!', 403);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
        { userId: existingUser.id, email: existingUser.email },
        'supersecret_dont_share',
        { expiresIn: '90d' }
    );
    } catch (err) {
        const error = new HttpError('Logging in failed!', 500);
        return next(error);
    }
    
    res.json({   
        message: 'Logged in!',
        token: token,
        userData: existingUser
    });
};

// Create days-off by user ID
const createDaysOffByUserID = async (req, res, next) => {
    function get_number_of_daysoff_by_year(daysoff, year) {
        let count = 0;
        for (const day of daysoff) {
            if (day.getFullYear() === year) count++;
        }
        return count;
    }

    function get_difference_in_days(from_date, to_date) {
        let difference_in_milliseconds = to_date.getTime() - from_date.getTime();
        return difference_in_milliseconds / (1000 * 60 * 60 * 24);
    }

    function get_dates_from_range(from_date_str, to_date_str) {
        let difference_in_days = get_difference_in_days(new Date(from_date_str), new Date(to_date_str));
        let splited_date = from_date_str.split("-");
        let base_year = parseInt(splited_date[0]);
        let base_month = parseInt(splited_date[1]);
        let base_date = parseInt(splited_date[2]);

        let from_date = new Date(base_year, base_month === 0 ? base_month : base_month - 1, base_date);
        // console.log("===> from_date:" + from_date);

        let output = [];
        for (let index = 0; index <= difference_in_days; index++) {
            // let new_month = base_month < 10 ? `0${base_month}` : base_month;
            // let new_date = base_date + index < 10 ? `0${base_date + index}` : base_date + index;
            // let date_from_user = `${base_year}-${new_month}-${new_date}`;

            let next_date = new Date(from_date.getFullYear(), from_date.getMonth(), from_date.getDate() + index, 0, 0, 0, 0);
            // console.log("===> next_date:" + next_date);

            output.push(next_date);
        }
        return output;
    }

    function check_existing_date(daysoff, input_date) {
        // console.log("===> input_date: " + input_date.getFullYear() + "-" + input_date.getMonth() + "-" + input_date.getDate());
        for (const day of daysoff) {
            // console.log("===> daysoff: " + day.getFullYear() + "-" + day.getMonth() + "-" + day.getDate());
            if (day.getFullYear() === input_date.getFullYear() && day.getMonth() === input_date.getMonth() && day.getDate() === input_date.getDate()) {
                return true;
            }
        }
        return false;
    }

    // function simple_compare_date(from_date, to_date) {
    //     let difference_in_milliseconds = to_date.valueOf() - from_date.valueOf();
    //     return difference_in_milliseconds > 0 ? true : false;
    // }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
        );
    }
    const user_id = req.params.id;
    const from_date = new Date(req.body.from_date);
    const to_date = req.body.to_date ? new Date(req.body.to_date) : null;

    // Find user by ID
    let edited_user;
    try {
        edited_user = await User.findById(user_id);
    } catch (err) {
        const error = new HttpError('Could not update user!', 500);
      return next(error);
    }

    // Check if there is only one date or multiple dates
    let from_year = from_date.getFullYear();
    let from_year_count = get_number_of_daysoff_by_year(edited_user.daysOff, from_year)
    if (to_date) {
        // console.log("===> Has to_date");
        if (from_date < to_date) {
            let to_year = parseInt(req.body.to_date.split("-")[2]);
            if (from_year === to_date.getFullYear()) {
                let input_days = get_dates_from_range(req.body.from_date, req.body.to_date);
                
                if (from_year_count + input_days.length <= edited_user.daysOffCount) {
                    for (const input_day of input_days) {
                        if (!check_existing_date(edited_user.daysOff, input_day)) {
                            edited_user.daysOff.push(input_day)
                        }
                    }
                } else {
                    const error = new HttpError(`You have selected more than ${edited_user.daysOffCount} days-off in the year ${from_year}!`, 500);
                    return next(error);
                }
            } else {
                const error = new HttpError('The selected dates are not in the same year!', 500);
                return next(error);
            }
        } else {
            const error = new HttpError('The "To date" must be greater than the "From date"!', 500);
            return next(error);
        }
    } else {
        // console.log("===> Has only from_date");
        if (from_year_count < edited_user.daysOffCount) {
            if (!check_existing_date(edited_user.daysOff, from_date)) {
                edited_user.daysOff.push(from_date)
            } else {
                const error = new HttpError('This date existed already!', 500);
                return next(error);
            }
        } else {
            const error = new HttpError(`You have selected more than ${edited_user.daysOffCount} days-off in the year ${from_year}!`, 500);
            return next(error);
        }
    }

    try {
        await edited_user.save();
    } catch (err) {
        const error = new HttpError('Could not add days-off! Please try again later.', 500);
        return next(error);
    }

    res.status(200).json({ edited_user: edited_user.toObject({ getters: true }) });
};

// Delete days-off by user ID
const deleteDaysOffByUserID = async (req, res, next) => {
    function check_existing_date(converted_dates, existed_date) {
        // console.log(existed_date);
        // console.log("=> existed_date: " + existed_date.getFullYear() + "-" + existed_date.getMonth() + "-" + existed_date.getDate());

        for (const day of converted_dates) {
            // console.log(day)
            // console.log("=> converted_dates: " + day.getFullYear() + "-" + day.getMonth() + "-" + day.getDate());
            if (day.getFullYear() === existed_date.getFullYear() && 
                day.getMonth() === existed_date.getMonth() && 
                day.getDate() === existed_date.getDate()) {
                return true;
            }
        }
        return false;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
        );
    }
    const user_id = req.params.id;
    const dates = req.body.dates;
    const converted_dates = [];
    if (dates.length > 0) {
        for (let date of dates) {
            let new_date = new Date(date);
            // console.log(new_date.getFullYear() + "-" + new_date.getMonth() + "-" + new_date.getDate());
            converted_dates.push(new_date);
        }
    }
    // console.log(converted_dates);

    // Find user by ID
    let edited_user;
    try {
        edited_user = await User.findById(user_id);
    } catch (err) {
        const error = new HttpError('You are not authorized!', 500);
      return next(error);
    }

    let new_dates = [];
    for (const existed_date of edited_user.daysOff) {
        if (!check_existing_date(converted_dates, existed_date)) {
            // console.log("yes");
            new_dates.push(existed_date);
        } else {
            // console.log("no");
        }
    }
    edited_user.daysOff = new_dates;
    // edited_user.daysOff = [];

    // console.log(new_dates);

    try {
        await edited_user.save();
    } catch (err) {
        const error = new HttpError('Could not delete days-off! Please try again later.', 500);
        return next(error);
    }

    res.status(200).json({ edited_user: edited_user.toObject({ getters: true }) });
};

exports.getAllUsers = getAllUsers;
exports.getAllEmployees = getAllEmployees;
exports.getUserByID = getUserByID;
exports.updateUser = updateUser;
exports.signup = signup;
exports.login = login;
exports.createDaysOffByUserID = createDaysOffByUserID
exports.deleteDaysOffByUserID = deleteDaysOffByUserID;