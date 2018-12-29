const express = require('express');
const { docPropUpdater } = require('../common/utils');
// const { log } = require('../common/utils');

const User = require('../models/user');

const userRouter = express.Router();


userRouter.get('/', (req, res) => {
  User.find({}, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get users' });
    } else {
      res.send(result);
    }
  });
});

userRouter.get('/get/:userId', (req, res) => {
  User.findById(req.params.userId, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get user by ID' });
    } else {
      res.send({ result });
    }
  });
});

userRouter.post('/add', (req, res) => {
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

userRouter.delete('/delete', (req, res) => {
  User.deleteOne({ _id: req.body._id }, (err) => {
    if (err) {
      res.send({ error: `unable to delete user => ${err}` });
    } else {
      res.json({ message: 'User successfully deleted!' });
    }
    // deleted at most one tank document
  });
});

module.exports = userRouter;
