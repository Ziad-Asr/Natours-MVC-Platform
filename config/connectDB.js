const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose
    .connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to the remote DB.');
    })
    .catch((err) => {
      console.log("Can't connect to the remote DB: ", err);
    });
};

module.exports = connectDB;
