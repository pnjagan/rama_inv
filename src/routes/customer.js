const express = require('express');
const { docPropUpdater } = require('../common/utils');
const { log, errLog } = require('../common/utils');

const { Customer, Address } = require('../models/customer');

const customerRouter = express.Router();

customerRouter.get('/', async (req, res) => {
  try {
    const result = await Customer.find({})
      .populate('addresses')
      .exec();

    res.send(result);
  } catch (error) {
    log(error.stack);
    res.status(500).send({ error: 'unable to get all customers' });
  }
});

customerRouter.get('/get/:custId', async (req, res) => {
  try {
    const result = await Customer.findById(req.params.custId)
      .populate('addresses')
      .exec();
    res.send({ result });
  } catch (error) {
    log(error.stack);
    res.status(500).send({ error: 'unable to get customer' });
  }
});

// creates a new customer
customerRouter.post('/add', async (req, res) => {
  try {
    const cloneOfReq = JSON.parse(JSON.stringify(req.body));

    const reqAddresses = cloneOfReq.addresses;
    let addressDoc = null;
    const addressRefMap = new Map();
    const linesToSave = [];
    let unsavedRef = null;


    for (let i = 0; i < reqAddresses.length; i++) {
      unsavedRef = reqAddresses[i]._id; // save old value
      // delete addresses[i]._id;

      // console.log('reqAddresses[i]');
      // console.log(reqAddresses[i]);
      //
      // console.log('---------derived value-----------');
      // console.log(docPropUpdater(reqAddresses[i], {}, ['_id'], true));

      addressDoc = new Address(docPropUpdater(reqAddresses[i], {}, ['_id'], true));

      // console.log('addressDoc');
      // console.log(addressDoc);

      addressRefMap.set(unsavedRef, addressDoc._id);
      linesToSave.push(addressDoc.save());
    }
    log('----------printing lines to save-------------');
    const savedLines =  await Promise.all(linesToSave); // no-eslint-disable-line no-unused-vars

    // ************************Address sub-docs are now saved *************************

    // console.log(req.body);

    const custDoc = docPropUpdater(cloneOfReq, {}, ['addresses'], true);
    custDoc.primaryBillToAddress = addressRefMap.get(cloneOfReq.primaryBillToAddress);
    custDoc.primaryShipToAddress = addressRefMap.get(cloneOfReq.primaryShipToAddress);
    custDoc.addresses = [];

    // req.body.addresses.forEach(
    //   (address) => {
    //     custDoc.addresses.push(addressRefMap.get(address._id));
    //   },
    // );
    savedLines.forEach(
      (address) => {
        custDoc.addresses.push(address._id);
      },
    );

    const customer = new Customer(custDoc);
    const result = await customer.save();
    res.json({ message: 'Customer is successfully added!', result });
  } catch (error) {
    log(error.stack);
    errLog(error.stack);
    res.status(500).send({ error: 'unable to create a new customer' });
  }
});

/*
  update parts in customer
  1.addition of new addresses
  2.disable/changes to existing address
  ------------------------
  3.update of normal fields
  4.change primary billto/shipto to previously saved address
  5.change primary billto/shipto to unsaved address
*/
customerRouter.put('/update',  async (req, res) => {
  try {
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

    // loop to update existing address fields in dbCustomer
    for (let i = 0; i < dbAddresses.length; i++) {
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
    for (let i = 0; i < reqAddresses.length; i++) {
      // console.log(addresses[i]);
      if (reqAddresses[i]._id.search('UNSAVED') !== -1) {
        // new value to be saved
        unsavedRef = reqAddresses[i]._id; // save old value
        // delete reqAddresses[i]._id;
        // addressDoc = new Address(reqAddresses[i]);

        addressDoc = new Address(docPropUpdater(reqAddresses[i], {}, ['_id'], true));
        addressRefMap.set(unsavedRef, addressDoc._id);
        log('-----addressDoc------');
        // console.log(addressDoc);
        linesToSave.push(addressDoc.save());
      }
    }
    // loop to include new address fields in dbCustomer

    log('----------printing lines to save-------------');
    let savedLines = null;

    savedLines =  await Promise.all(linesToSave);

    // cloneOfReq.addresses = [];
    if (cloneOfReq.primaryBillToAddress.search('UNSAVED') !== -1) {
      cloneOfReq.primaryBillToAddress = addressRefMap.get(cloneOfReq.primaryBillToAddress);
    }
    if (cloneOfReq.primaryShipToAddress.search('UNSAVED') !== -1) {
      cloneOfReq.primaryShipToAddress = addressRefMap.get(cloneOfReq.primaryShipToAddress);
    }

    dbAddresses.splice(0, dbAddresses.length); // clear the array without changing it
    savedLines.forEach(da => dbAddresses.push(da._id));

    // delete cloneOfReq.addresses; // do not want to copy that from req object

    // delete cloneOfReq.primaryShipToAddress;
    // delete cloneOfReq.primaryBillToAddress; // checked and saved that field seperately
    // updated cloneOfReq.primaryShipToAddress
    // & primaryBillToAddress field seperately but not copied

    docPropUpdater(cloneOfReq, dbCustomer, ['addresses']);

    const retDoc = await dbCustomer.save();
    res.json({ message: 'customer successfully updated!', retDoc });
  } catch (error) {
    log(error);
    errLog(error);
    res.status(500).send({ error: 'unable to save updated customer - contact support' });
  }
});

module.exports = customerRouter;
