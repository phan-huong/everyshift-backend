const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const shiftsControllers = require('../controllers/shifts-controllers');
const checkAuth = require('../middleware/check-auth');

router.use(checkAuth);

router.get('/', shiftsControllers.getAllShifts);
router.get('/shift/:sid', shiftsControllers.getShiftById);
router.get('/:uid', shiftsControllers.getShiftsByUserId);

router.post('/',
    [
        check('date')
            .not()
            .isEmpty(),
        check('start_time')
            .not()
            .isEmpty(),
        check('end_time')
            .not()
            .isEmpty(),
        check('status')
            .not()
            .isEmpty(),
        check('worker')
            .not()
            .isEmpty()
    ],
    shiftsControllers.createShift
);

router.patch('/:sid',
    [
        check('date')
            .not()
            .isEmpty(),
        // check('job').isLength({min: 5}),
        check('start_time')
            .not()
            .isEmpty(),
        check('end_time')
            .not()
            .isEmpty(),
        check('status')
            .not()
            .isEmpty()
    ],
    shiftsControllers.updateShiftById
);

router.delete('/delete/:sid', shiftsControllers.deleteShiftById);

module.exports = router;