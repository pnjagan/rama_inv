const express = require('express');
const { docPropUpdater } = require('../common/utils');
const { log } = require('../common/utils');

const { Customer, Address } = require('../models/customer');

const customerRouter = express.Router();


customerRouter.get('/', (req, res) => {
  Customer.find({})
    .populate('addresses')
    .exec((err, result) => {
      if (err) {
        res.status(500).send({ error: 'unable to get all customers' });
      } else {
        res.send(result);
      }
    });
});

customerRouter.get('/get/:custId', (req, res) => {
  Customer.findById(req.params.custId)
    .populate('addresses')
    .exec((err, result) => {
      if (err) {
        res.status(500).send({ error: 'unable to get customer by ID' });
      } else {
        res.send({ result });
      }
    });
});

// creates a new customer
customerRouter.post('/add', async (req, res) => {
  // const copyOfReqData = {};
  // docPropUpdater(req.body, copyOfReqData);
  const cloneOfReq = JSON.parse(JSON.stringify(req.body));

  // console.log(cloneOfReq);

  const { addresses } = cloneOfReq;
  let addressDoc = null;
  const addressRefMap = new Map();
  const linesToSave = [];
  let unsavedRef = null;


  for (let i = 0; i < addresses.length; i++) {
    // console.log(addresses[i]);
    unsavedRef = addresses[i]._id; // save old value
    delete addresses[i]._id;

    addressDoc = new Address(addresses[i]);

    addressRefMap.set(unsavedRef, addressDoc._id);

    linesToSave.push(addressDoc.save());
  }
  log('----------printing lines to save-------------');

  const savedLines =  await Promise.all(linesToSave); // eslint-disable-line no-unused-vars

  // ************************Address sub-docs are now saved *************************

  // console.log(req.body);

  const custDoc = {
    customerNumber      : cloneOfReq.customerNumber,
    customerName        : cloneOfReq.customerName,
    customerCategory    : cloneOfReq.customerCategory,
    taxRegNumber        : cloneOfReq.taxRegNumber,
    enabledFlag         : cloneOfReq.enabledFlag,
    addresses           : [],
    primaryBillToAddress: addressRefMap.get(cloneOfReq.primaryBillToAddress),
    primaryShipToAddress: addressRefMap.get(cloneOfReq.primaryShipToAddress),
  };

  req.body.addresses.forEach(
    (address) => {
      custDoc.addresses.push(addressRefMap.get(address._id));
    },
  );

  const customer = new Customer(custDoc);

  customer.save((err, result) => {
    if (err) {
      res.send({ error: err });
    } else { // If no errors, send it back to the client
      // res.json can convert non objects also to json like null and undefined
      // , before sending on wire
      res.json({ message: 'Customer is successfully added!', result });
    }
  });
  // Save customer completed
});

/*
  update parts in customer
  2.addition of new addresses
  3.disable/changes to existing address
  ------------------------
  1.update of normal fields
  4.change primary billto/shipto to previously saved address
  5.change primary billto/shipto to unsaved address
*/
customerRouter.put('/update',  async (req, res) => {
  // console.log('inside update body');
  // console.log(JSON.stringify(req.body));

  const dbCustomer = await Customer.findById(req.body._id)
    .populate('addresses')
    .exec();


  const cloneOfReq = JSON.parse(JSON.stringify(req.body));
  const reqAddresses = cloneOfReq.addresses;
  const dbAddresses = dbCustomer.addresses;
  let addressDoc = null;
  const addressRefMap = new Map();
  const linesToSave = [];
  let unsavedRef = null;
  const errorMessage = ''; // no-eslint-disable-line prefer-const

  // const updateExistingAddress = function updateExistingAddress(
  //   findAddPromise, addressReqValue,
  // ) {
  //   findAddPromise.then(
  //     (addressDocFound) => {
  //       docPropUpdater(addressReqValue, addressDocFound);
  //       log('-----addressDocFound------');
  //       // console.log(addressDocFound);
  //       linesToSave.push(addressDocFound.save());
  //     },
  //     (AddDocFindErr) => {
  //       errorMessage = `unable to find address to update =>${AddDocFindErr}`;
  //     },
  //   );
  // };


  // loop to update existing address fields in dbCustomer
  for (let i = 0; i < dbAddresses.length && errorMessage === ''; i++) {
    const matchAddress = reqAddresses.filter(a => a._id === dbAddresses[i]._id);

    log('matchAddress');
    log(matchAddress);

    log('dbAddresses[i]');
    log(dbAddresses[i]);

    if (matchAddress.length === 1) {
      docPropUpdater(matchAddress, dbAddresses[i]);

      addressDoc = new Address(dbAddresses[i]);
      log('pushing updated value');
      log(addressDoc);
      linesToSave.push(addressDoc.save());
    } else {
      addressDoc = new Address(dbAddresses[i]);
      log('pushing as is value');
      log(addressDoc);
      linesToSave.push(addressDoc.save());
    }
    // console.log(addresses[i]);
  }
  // loop to update existing address fields in dbCustomer


  // loop to include new address fields in dbCustomer
  for (let i = 0; i < reqAddresses.length && errorMessage === ''; i++) {
    // console.log(addresses[i]);
    if (reqAddresses[i]._id.search('UNSAVED') !== -1) {
      // new value to be saved
      unsavedRef = reqAddresses[i]._id; // save old value
      delete reqAddresses[i]._id;

      addressDoc = new Address(reqAddresses[i]);
      addressRefMap.set(unsavedRef, addressDoc._id);
      log('-----addressDoc------');
      // console.log(addressDoc);
      linesToSave.push(addressDoc.save());
    }
  }
  // loop to include new address fields in dbCustomer

  log('----------printing lines to save-------------');
  let savedLines = null;

  if (errorMessage !== '') {
    res.send({ error: `unable to find address to update =>${errorMessage}` });
  } else {
    savedLines =  await Promise.all(linesToSave);
  }

  // cloneOfReq.addresses = [];
  if (cloneOfReq.primaryBillToAddress.search('UNSAVED') !== -1) {
    cloneOfReq.primaryBillToAddress = addressRefMap.get(cloneOfReq.primaryBillToAddress);
  }
  if (cloneOfReq.primaryShipToAddress.search('UNSAVED') !== -1) {
    cloneOfReq.primaryShipToAddress = addressRefMap.get(cloneOfReq.primaryShipToAddress);
  }

  /*
  for (let i = 0; i < req.body.addresses.length; i++) {
    if (req.body.addresses[i]._id.search('UNSAVED') !== -1) {
      cloneOfReq.addresses.push(addressRefMap.get(req.body.addresses[i]._id));
    } else {
      cloneOfReq.addresses.push(req.body.addresses[i]._id);
    }
  }
  */
  dbAddresses.splice(0, dbAddresses.length); // clear the array without changing it
  savedLines.forEach(da => dbAddresses.push(da._id));

  delete cloneOfReq.addresses; // do not want to copy that from req object
  // delete cloneOfReq.primaryShipToAddress;
  // delete cloneOfReq.primaryBillToAddress; // checked and saved that field seperately
  // updated cloneOfReq.primaryShipToAddress & primaryBillToAddress field seperately but not copied

  docPropUpdater(cloneOfReq, dbCustomer);

  dbCustomer.save((saveErr, retDoc) => {
    if (saveErr) {
      res.send({ error: `unable to save updated customer =>${saveErr}` });
    } else {
      res.json({ message: 'customer successfully updated!', retDoc });
    }
  });
});

module.exports = customerRouter;
