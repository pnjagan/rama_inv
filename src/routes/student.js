/*
const express = require('express');
const { docPropUpdater } = require('../common/utils');
// const { log } = require('../common/utils');

const { Student, Enrolment } = require('../models/student');

const studentRouter = express.Router();


studentRouter.get('/', async (req, res) => {
  const result = await Student.find({})
    .populate('enrolments')
    .exec();
  res.send(result);
});

studentRouter.post('/add', (req, res) => {

  const user = new User(req.body);

  user.save((err, result) => {
    if (err) {
      res.send({ error: err });
    } else { // If no errors, send it back to the client
      // res.json can convert non objects also to json like null and undefined
      // , before sending on wire
      res.json({ message: 'User successfully added!', result });
    }
  });
});

userRouter.put('/update', (req, res) => {
  User.findById(req.body._id, (findErr, user) => {
    if (findErr) {
      res.send({ error: `unable to find user to update =>${findErr}` });
    } else {
      docPropUpdater(req.body, user);
      user.save((saveErr, saveUser) => {
        if (saveErr) {
          res.send({ error: `unable to save updated user =>${saveErr}` });
        } else {
          res.json({ message: 'User successfully updated!', saveUser });
        }
      });
    }
  });
});

module.exports = studentRouter;
*/
