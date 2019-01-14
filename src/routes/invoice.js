const express = require('express');
const { docPropUpdater } = require('../common/utils');
const { log } = require('../common/utils');

const invoiceRouter = express.Router();
const { Invoice, InvoiceLine } = require('../models/invoice');

invoiceRouter.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate('invoiceLines')
      .populate('custBillingAddressId')
      .populate('custShippingAddressId')
      .exec();
    res.send({ result: invoices });
  } catch (error) {
    res.status(500).send({ error: 'unable to get all invoices' });
    log(error.stack);
  }
});

invoiceRouter.get('/get/:invoiceId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate('invoiceLines')
      .populate('custBillingAddressId')
      .populate('custShippingAddressId')
      .exec();
    res.send({ result: invoice });
  } catch (error) {
    res.status(500).send({ error: `unable to get invoice for ID ${req.params.invoiceId}` });
    log(error.stack);
  }
});

// creates a new Invoice
invoiceRouter.post('/add', async (req, res) => {
  try {
    const cloneOfReq = JSON.parse(JSON.stringify(req.body));

    const { invoiceLines } = cloneOfReq;
    let invoiceLineDoc = null;
    // const addressRefMap = new Map();
    // Map is not required as LineNumber acts as a unique reference within an invoice
    const linesToSave = [];
    // let unsavedRef = null;

    for (let i = 0; i < invoiceLines.length; i++) {
      invoiceLineDoc = new InvoiceLine(invoiceLines[i]);
      linesToSave.push(invoiceLineDoc.save());
    }
    log('----------printing lines to save-------------');

    const savedLines =  await Promise.all(linesToSave);
    // ************************InvoiceLine sub-docs are now saved *************************

    const invoiceDoc = {};
    docPropUpdater(cloneOfReq, invoiceDoc, ['invoiceLines'], true);
    invoiceDoc.invoiceLines = [];

    savedLines.forEach(
      (invoiceLine) => {
        invoiceDoc.invoiceLines.push(invoiceLine._id);
      },
    );

    const invoice = new Invoice(invoiceDoc);
    const result = await invoice.save();
    res.json({ message: 'Invoice is successfully created!', result });
    // Save customer completed
  } catch (error) {
    log(error.stack);
    res.status(500).send({ error });
  }
});

/*
  update parts in invoice
  1.addition of new lines
  2.disable/changes to existing lines
  ------------------------
  3.update of normal fields

*/
invoiceRouter.put('/update',  async (req, res) => {
  // console.log('inside update body');
  // console.log(JSON.stringify(req.body));
  try {
    const dbInvoice = await Invoice.findById(req.body._id)
      // .populate('invoiceLines')
      .exec();

    const cloneOfReq = JSON.parse(JSON.stringify(req.body));
    const reqInvLines = cloneOfReq.invoiceLines;
    const dbInvLineIds = dbInvoice.invoiceLines;
    const dbInvLinePromises = dbInvLineIds.map(id =>  InvoiceLine.findById(id).exec());

    const dbInvLineDatas = await Promise.all(dbInvLinePromises);

    let invLineDoc = null;
    const linesToSave = [];


    // loop to update existing line fields
    for (let i = 0; i < dbInvLineDatas.length; i++) {
      const matchLine = reqInvLines.filter(
        l => (l._id === dbInvLineDatas[i]._id.toString()),
      );

      if (matchLine.length === 1) {
        // console.log('matchLine');
        // console.log(matchLine);
        // console.log(' dbInvLineDatas[i]');
        // console.log(dbInvLineDatas[i]);

        docPropUpdater(matchLine, dbInvLineDatas[i], []);

        log(' dbInvLineDatas[i] - modified');
        log(dbInvLineDatas[i]);

        // invLineDoc = new InvoiceLine(dbInvLines[i]);
        // log('pushing updated value');
        // log(invLineDoc);
        linesToSave.push(dbInvLineDatas[i].save());
      } else {
        // invLineDoc = new InvoiceLine(dbInvLines[i]);
        // log('pushing as is value');
        // log(invLineDoc);
        log(' dbInvLineDatas[i] - unmodified');
        log(dbInvLineDatas[i]);
        linesToSave.push(dbInvLineDatas[i].save());
      }
    }
    // loop to update existing address fields in db


    // loop to include new address fields in dbCustomer
    for (let i = 0; i < reqInvLines.length; i++) {
      // console.log(addresses[i]);
      if (reqInvLines[i]._id.search('UNSAVED') !== -1) {
        invLineDoc = new InvoiceLine(docPropUpdater(reqInvLines[i], {}, ['_id'], true));
        log(' invLineDoc - new');
        log(invLineDoc);

        linesToSave.push(invLineDoc.save());
      }
    }
    // loop to include new address fields in dbCustomer
    log(linesToSave);
    log('----------printing lines to save-------------');
    let savedLines = null;
    savedLines =  await Promise.all(linesToSave);

    dbInvoice.invoiceLines.splice(
      0, dbInvoice.invoiceLines.length,
    ); // clear the array without changing it
    savedLines.forEach(il => dbInvLineIds.push(il._id));

    docPropUpdater(cloneOfReq, dbInvoice, ['invoiceLines']);

    const retDoc = await dbInvoice.save();
    res.json({ message: 'invoice successfully updated!', retDoc });
  } catch (error) {
    log(error.stack);
    res.status(500).send({ error: 'unable to update invoice, contact support!' });
  }
});

module.exports = invoiceRouter;
