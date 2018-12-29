const mongoose = require('mongoose');

const { Schema } = mongoose;

// book schema definition
const item = new Schema(
  {
    itemCode    : { type: String, required: true, unique: true },
    itemDesc    : { type: String, required: true },
    price       : { type: Number, required: true, min: 0 },
    amortPer    : { type: Number, required: true, min: 0 },
    attribute1  : { type: String, required: false },
    attribute2  : { type: String, required: false },
    attribute3  : { type: String, required: false },
    attribute4  : { type: String, required: false },
    attribute5  : { type: String, required: false },
    enabled_flag: { type: String, default: 'Y' },
    createdAt   : { type: Date, default: Date.now },
  },
);

// Sets the createdAt parameter equal to the current time
item.pre('save', function saveHandler(next) {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

/* eslint prefer-arrow-callback: 0 */
item.pre('validate', function validateHandler(next) {
  // console.log(' -- this-----');
  // console.log(this);

  // console.log(!this.isNew);

  if (!this.isNew && this.isModified('itemCode')) {
    this.invalidate('itemCode', 'item.itemCode should not be updated', this.itemCode);
    // next('item.itemCode should not be updated');
  }


  next();
});

// Exports the BookSchema for use elsewhere.
module.exports = mongoose.model('Item', item);
