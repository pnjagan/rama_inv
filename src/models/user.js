const mongoose = require('mongoose');

const { Schema } = mongoose;

// book schema definition
const user = new Schema(
  {
    userLogin     : { type: String, required: true, unique: true },
    userPassword  : { type: String, required: true },
    userName      : { type: String, required: true },
    enabledFlag   : { type: String, required: true, default: 'Y' },
    responsibility: { type: String, required: false },
    createdAt     : { type: Date, default: Date.now },
  },
);

// Sets the createdAt parameter equal to the current time
user.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

/* eslint prefer-arrow-callback: 0 */
user.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('userLogin')) {
    this.invalidate('userlogin', 'user.userLogin should not be updated', this.userLogin);
  }

  next();
});

// Exports the BookSchema for use elsewhere.
module.exports = mongoose.model('User', user);
