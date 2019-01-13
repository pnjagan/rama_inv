const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

// book schema definition
const customer = new Schema(
  {
    customerNumber      : { type: String, required: true, unique: true },
    customerName        : { type: String, required: true },
    customerCategory    : { type: String, required: true },
    taxRegNumber        : { type: String, required: true },
    addresses           : [{ type: ObjectId, ref: 'Address' }],
    primaryBillToAddress: { type: ObjectId, ref: 'Address' },
    primaryShipToAddress: { type: ObjectId, ref: 'Address' },
    enabledFlag         : { type: String, required: true, default: 'Y' },
    createdAt           : { type: Date, default: Date.now },
  },
);

const address = new Schema({
  addressType : { type: String, required: true },
  contactName : { type: String, required: true },
  contactPhone: { type: String, required: false },
  contactEmail: { type: String, required: false },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String, required: false },
  addressLine3: { type: String, required: false },
  placeName   : { type: String, required: false },
  state       : { type: String, required: true },
  country     : { type: String, required: true },
  zipCode     : { type: String, required: true },
  enabledFlag : { type: String, required: true, default: 'Y' },
});

// Sets the createdAt parameter equal to the current time
customer.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

/* eslint prefer-arrow-callback: 0 */
customer.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('customerNumber')) {
    this.invalidate('customerNumber', 'customer.customer_number should not be updated', this.customerNumber);
  }

  next();
});


// Exports the BookSchema for use elsewhere.
module.exports = {
  Customer: mongoose.model('Customer', customer),
  Address : mongoose.model('Address', address),
};
