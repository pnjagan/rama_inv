const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
// const { Customer, Address } = require('../models/customer');

const invoiceLine = new Schema({
  lineNumber     : { type: Number, required: true },
  itemCode       : { type: String, required: true },
  itemDesc       : { type: String, required: true },
  itemId         : { type: ObjectId, ref: 'Item' },
  invoicedQty    : { type: Number, required: true },
  price          : { type: Number, required: true },
  packingDetails : { type: String, required: false },
  unitOfMeasure  : { type: String, required: true, default: 'NOS' },
  lineAmount     : { type: Number, required: true },
  lineType       : { type: String, required: true, default: 'ITEM' },
  taxRate        : { type: Number, required: true },
  taxAmount      : { type: Number, required: true },
  frieghtAmount  : { type: Number, required: false },
  otherCharges   : { type: Number, required: false },
  additionalNotes: { type: String, required: false },
  cancelledFlag  : { type: String, required: true, default: 'N' },
});

// book schema definition
const invoice = new Schema(
  {
    invoiceNumber        : { type: String, required: true, unique: true },
    invoiceDate          : { type: Date, required: true },
    customerId           : { type: ObjectId, ref: 'Customer' },
    invoiceIssueDate     : { type: Date, required: false, default: Date.now  },
    goodsShippedDate     : { type: Date, required: true, default: Date.now },
    shipMode             : { type: String, required: true, default: 'CUSTOMER_MANAGED' },
    shipper              : { type: String, required: false },
    shipperReference     : { type: String, required: false },
    lineTotal            : { type: Number, required: true },
    taxTotal             : { type: Number, required: true },
    frieghtTotal         : { type: Number, required: true },
    otherCharges         : { type: Number, required: true },
    invoiceAmount        : { type: Number, required: true },
    invoiceStatus        : { type: String, required: true, default: 'NEW' },
    custPONum            : { type: String, required: false },
    custPODate           : {  type: String, required: false },
    custTaxRef           : { type: String, required: false },
    custBillingAddressId : { type: ObjectId, ref: 'Address' },
    custShippingAddressId: { type: ObjectId, ref: 'Address' },
    createdAt            : { type: Date, default: Date.now },
    invoiceLines         : [{ type: ObjectId, ref: 'InvoiceLine' }],
    cancelledFlag        : { type: String, required: true, default: 'N' },
  },
);

// Sets the createdAt parameter equal to the current time
invoice.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

/* eslint prefer-arrow-callback: 0 */
invoice.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('invoiceNumber')) {
    this.invalidate('invoiceNumber', 'invoice.invoiceNumber should not be updated', this.invoiceNumber);
  }
  next();
});

invoiceLine.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('lineNumber')) {
    this.invalidate('lineNumber', 'invoiceLine.lineNumber should not be updated', this.lineNumber);
  }
  next();
});


module.exports = {
  Invoice    : mongoose.model('Invoice', invoice),
  InvoiceLine: mongoose.model('InvoiceLine', invoiceLine),
};
