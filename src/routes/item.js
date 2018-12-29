const express = require('express');
const { docPropUpdater } = require('../common/utils');
// const { log } = require('../common/utils');

const Item = require('../models/item');

const itemRouter = express.Router();


itemRouter.get('/', (req, res) => {
  Item.find({}, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get items' });
    } else {
      res.send(result);
    }
  });
});

itemRouter.get('/get/:itemId', (req, res) => {
  Item.findById(req.params.itemId, (err, result) => {
    if (err) {
      res.status(500).send({ error: 'unable to get item by ID' });
    } else {
      res.send({ result });
    }
  });
});

itemRouter.post('/add', (req, res) => {
  const item = new Item(req.body);

  item.save((err, result) => {
    if (err) {
      res.send({ error: err });
    } else { // If no errors, send it back to the client
      // res.json can convert non objects also to json like null and undefined
      // , before sending on wire
      res.json({ message: 'Item successfully added!', result });
    }
  });
});

itemRouter.put('/update', (req, res) => {
  Item.findById(req.body._id, (findErr, item) => {
    if (findErr) {
      res.send({ error: `unable to find item to update =>${findErr}` });
    } else {
      docPropUpdater(req.body, item);
      item.save((saveErr, saveItem) => {
        if (saveErr) {
          res.send({ error: `unable to save updated item =>${saveErr}` });
        } else {
          res.json({ message: 'Item successfully updated!', saveItem });
        }
      });
    }
  });
});

itemRouter.delete('/delete', (req, res) => {
  Item.deleteOne({ _id: req.body._id }, (err) => {
    if (err) {
      res.send({ error: `unable to delete item item => ${err}` });
    } else {
      res.json({ message: 'Item successfully deleted!' });
    }
    // deleted at most one tank document
  });
});

module.exports = itemRouter;
