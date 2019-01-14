const mongoose = require('mongoose');

const { Schema } = mongoose;

// book schema definition
const configuration = new Schema(
  {
    invoiceNumSeq   : { type: String, required: true, unique: true },
    invoiceNumPrefix: { type: String, required: true, unique: true },
    custNumSeq      : { type: String, required: true },
    custNumPrefix   : { type: String, required: false },
    uom             : [{ type: String, required: true }],
    packing         : { type: String, required: false },
    createdAt       : { type: Date, default: Date.now },
  },
);

// Sets the createdAt parameter equal to the current time
configuration.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

/* eslint prefer-arrow-callback: 0 */
/*
user.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('userLogin')) {
    this.invalidate('userlogin', 'user.userLogin should not be updated', this.userLogin);
  }

  next();
});
*/
// Exports the BookSchema for use elsewhere.
module.exports = mongoose.model('Configuration', configuration);
