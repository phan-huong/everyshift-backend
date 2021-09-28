// const {v4 : uuidv4} = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Shift = require('../models/shift');
const User = require('../models/user');

const getAllShifts = async (req, res, next) => {
    let shifts;
    try {
        shifts = await Shift.find({});
        if (shifts) {
            for (const shift of shifts) {
                let shift_owner;
                try {
                    shift_owner = await User.findById(shift.worker).select('firstName lastName role color_bkgr color_text');
                } catch (err) {
                    const error = new HttpError('Fetching shift owner failed!', 500);
                    return next(error);
                }

                if (shift_owner) shift.worker = shift_owner
            }
        }
    } catch (err) {
        const error = new HttpError('Fetching shifts failed!', 500);
      return next(error);
    }
    res.json({shifts: shifts.map(shift => shift.toObject({ getters: true }))});
};

const getShiftById = async (req, res, next) => {
    const shiftId = req.params.sid;

    let shift;
    try {
        shift = await Shift.findById(shiftId);
    } catch (err) {
        const error = new HttpError('Shift not found, fetching failed!', 500);
      return next(error);
    }

    if (!shift) {
        throw new HttpError('Shift not found!', 404);
    }
    res.json({ shift: shift.toObject({ getters: true }) }); // => { shift } => { shift: shift }
};

const getShiftsByUserId = async (req, res, next) => {
    const user_id = req.params.uid;

    let userWithShifts;
    try {
        userWithShifts = await User.findById(user_id).populate('shifts');
    } catch (err) {
        const error = new HttpError('Shift(s) not found, fetching failed!', 500);
      return next(error);
    }

    if (!userWithShifts || userWithShifts.shifts.length === 0) {
        return next(new HttpError('Shift(s) not found!', 404));
    }
    res.json({
        shifts: userWithShifts.shifts.map(shift =>
          shift.toObject({ getters: true })
        )
    });
};

const createShift = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
      );
    }

    const { date, job, start_time, end_time, status, worker } = req.body;

    const newShift = new Shift({
        // id: uuidv4(),
        date,
        job,
        start_time,
        end_time,
        status,
        worker
    });

    let user;
    try {
        user = await User.findById(worker);
    } catch (err) {
        const error = new HttpError('Creating shift failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await newShift.save({ session: sess });
        user.shifts.push(newShift);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError('Creating shift failed!', 500);
        return next(error);
    }

    res.status(201).json({shift: newShift});
};

const updateShiftById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, please check again!', 422)
        );
    }
    const shiftId = req.params.sid;
    const { date, job, start_time, end_time, status, worker } = req.body;

    let shift;
    try {
        shift = await Shift.findById(shiftId);
    } catch (err) {
        const error = new HttpError('Could not update shift!', 500);
      return next(error);
    }

    shift.date = date;
    shift.job = job;
    shift.start_time = start_time;
    shift.end_time = end_time;
    shift.status = status;
    shift.worker = worker;

    try {
        await shift.save();
    } catch (err) {
        const error = new HttpError('Could not update shift!', 500);
        return next(error);
    }

    res.status(200).json({ shift: shift.toObject({ getters: true }) });
};

const deleteShiftById = async (req, res, next) => {
    const shiftId = req.params.sid;

    let shift;
    try {
        shift = await Shift.findById(shiftId).populate('worker');
    } catch (err) {
        const error = new HttpError('Could not delete shift!', 500);
      return next(error);
    }
  
    if (!shift) {
        const error = new HttpError('Shift not found!', 404);
        return next(error);
    }
    
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await shift.remove({ session: sess });
        shift.worker.shifts.pull(shift);
        await shift.worker.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Could not delete shift!', 500);
        return next(error);
    }

    res.status(200).json({message: 'Shift deleted!'});
};

exports.getAllShifts = getAllShifts;
exports.getShiftById = getShiftById;
exports.getShiftsByUserId = getShiftsByUserId;
exports.createShift = createShift;
exports.updateShiftById = updateShiftById;
exports.deleteShiftById = deleteShiftById;
