const mongoose = require('mongoose');
const validator = require('validator'); // 3rd party library that has alot of validation (email, IBAN, ...)
const bcrypt = require('bcryptjs'); // 3rd party library for encripting passwords.
const crypto = require('crypto'); // 3rd party library for encripting reset tokens.

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false, // do not return it in any response
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
    // This only works on (CREATE and SAVE) on User query in the controller!!!
    // We don't use arrow function, because we use (this) operator.
  },
  passwordChangedAt: Date,
  //---------------------------------------
  // Auth senerio 1 (Forget password & Reset password)
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Auth senerio 2 (ALL)
  OTPReset: String,
  OTPTimeExpires: Date,
  //---------------------------------------

  active: {
    type: Boolean,
    default: true,
    select: false, // do not return it in any response
  },
});

// Password increption
userSchema.pre('save', async function (next) {
  // 1) Only run this function if password was actually modified
  //    becuase may user change only the name in the futur and password is not modified, so I should not run this function then.
  if (!this.isModified('password')) return next();
  // 2) Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // 3) Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
}); // I did this step here not in the controller, because it's related directly to the data not to express logic.

// Track if password is modifies, and put the time it changed at in the DB.
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // 1) Case 1: when updating a document (patch - forget pass - ...)
  // this.isNew => Document has just created

  this.passwordChangedAt = Date.now() - 1000;
  // Case 2: when creating a new document
  // (-1 Sec) because saving to DB in slower than creating a JWT. (So we made this wor around)

  next();
});

// // Returning (active users) only.
// We used (^find) not (find), because here that runs before any query starts with find (find, findById, findByIdAndUpdate)
// userSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

// Check (password === passwordConfirm) => return boolean
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
}; // *** Used in controllers

// Check if password changed after token issued => return boolean
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Senerio 1
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // 1) Reset token (save to DB)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  // 2) Reset token time expire in (save to DB)
  this.passwordResetExpires = Date.now() + 3 * 1000 * 60; // 3 Minutes
  // 3) Return the reset token to send it in the email. (not encripted)
  return resetToken;
};
// Here we made a function that used when user forget password (senerio 1)
// This generates a reset token using crypto module, and the save this tokn and it's expiration time in the database. (for comparison)
// So on calling the endpoint (forget password {senerio 1}), this token is sent to the user's email.
// then he call the (reset password endpoint {senerio 1}), and then see if this token is correct and it's not expired.
// And if all of that is okay, let the user change the passord.
// *******************
// *** Note:- the token sent to the user is not encripted, but the stored reset token in DB is encripted ***
// *******************

const User = mongoose.model('User', userSchema);

module.exports = User;
