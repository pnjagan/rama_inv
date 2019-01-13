const express = require('express');
const { docPropUpdater } = require('../common/utils');
// const { log } = require('../common/utils');

const { Address } = require('../models/customer');

const addressRouter = express.Router();


addressRouter.get('/', (req, res) => {
  Address.find({}, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get all addresses' });
    } else {
      res.send(result);
    }
  });
});

addressRouter.get('/get/:addressId', (req, res) => {
  Address.findById(req.params.addressId, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get Address by ID' });
    } else {
      res.send({ result });
    }
  });
});

addressRouter.post('/add', (req, res) => {
  const address = new Address(req.body);

  address.save((err, result) => {
    if (err) {
      res.send({ error: err });
    } else { // If no errors, send it back to the client
      // res.json can convert non objects also to json like null and undefined
      // , before sending on wire
      res.json({ message: 'Address successfully added!', result });
    }
  });
});

addressRouter.put('/update', (req, res) => {
  Address.findById(req.body._id, (findErr, address) => {
    if (findErr) {
      res.send({ error: `unable to find address to update =>${findErr}` });
    } else {
      docPropUpdater(req.body, address);
      address.save((saveErr, retDoc) => {
        if (saveErr) {
          res.send({ error: `unable to save updated address =>${saveErr}` });
        } else {
          res.json({ message: 'address successfully updated!', retDoc });
        }
      });
    }
  });
});
/*
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
*/

module.exports = addressRouter;
