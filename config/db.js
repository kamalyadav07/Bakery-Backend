const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Mongoose 6 doesn't need the extra options like useNewUrlParser
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully.');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Exit process with failure if we can't connect to the DB
        process.exit(1);
    }
};

module.exports = connectDB;