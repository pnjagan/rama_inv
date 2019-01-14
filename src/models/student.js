// built purely for observing the update behaviour of mongoose
/*
const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

// book schema definition
const student = new Schema(
  {
    studentNum : { type: Number, required: true, unique: true },
    studentName: { type: String, required: true },
    enrolments : [{ type: ObjectId, ref: 'Enrolment' }],
  },
);

const enrolment = new Schema(
  {
    enrolmentNum: { type: Number, required: true, unique: true },
    courseName  : { type: String, required: true },
  },
);

// eslint prefer-arrow-callback: 0
student.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('studentNum')) {
    this.invalidate('studentNum', 'student.studentNum should not be updated', this.studentNum);
  }
  next();
});

enrolment.pre('validate', function validateHandler(next) {
  if (!this.isNew && this.isModified('enrolmentNum')) {
    this.invalidate('enrolmentNum', 'enrolment.enrolmentNum should not be updated'
    , this.enrolmentNum);
  }
  next();
});

module.exports = {
  Student  : mongoose.model('Student', student),
  Enrolment: mongoose.model('Enrolment', enrolment),
};

*/
