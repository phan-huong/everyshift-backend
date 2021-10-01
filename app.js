const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const localhost = require('./config/localhost');
const shiftsRoutes = require('./routes/shifts-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

// PORT
const port = process.env.PORT || 9000;

// DB Config
const db = require('./config/keys').mongoURI;

const app = express();
app.use(cors());

app.use(bodyParser.json());

// Routes for places
app.use('/shifts', shiftsRoutes);
app.use('/users', usersRoutes);

// Error Handling for unsupported routes
app.use((req, res, next) => {
    const error = new HttpError('Route not found!', 404);
    throw error;
});

// Error Handling Middleware
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
});

// Connect Database
mongoose
    .connect(db, {
        useNewUrlParser: true, 
        useCreateIndex: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false
    })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Listening to port
app.listen(port);
console.log(`Listening On http://${localhost.get_ip(localhost.device_type)}:${port}`);