process.env.NODE_ENV = 'test';
// const mongoose = require("mongoose");

/* eslint max-len: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const serverMod = require('../../src/server');
const Item = require('../../src/models/item');
const { log, errLog } = require('../../src/common/utils');

const { app } = serverMod;
const { assert } = chai;

// const request = chai.request(app);

chai.use(chaiHttp);

describe('Item testing', () => {
  // BEFORE deletes
  before((done) => {
    // Before each test we empty the database
    Item.deleteMany({}, (err) => {
      if (err) {
        throw Error('unable to delete existing items for starting the test');
      } else {
        done();
      }
    });
  });

  /*
  * Test the /GET route
  */
  it('GET /item : get all items', (done) => {
    chai.request(app)
      .get('/item')
      .end((err, res) => {
        log('GET /item testing');
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.lengthOf(res.body, 0);
        done();
      });
  });

  /*
  * Test the /GET route
  */

  const item = {
    itemCode  : 'P001',
    itemDesc  : 'RAMA Item 001',
    price     : 2,
    amortPer  : 1,
    attribute2: '',
    attribute3: '',
    attribute4: '',
    attribute5: '',
  };

  it('POST /item/add', (done) => {
    // add 1st item
    const prom1 = chai.request(app)
      .post('/item/add')
      .send(item)
      .then(
        (res) => {
          log('Add a new Item');
          assert.equal(res.status, 200);
          assert.property(res.body.result, '_id');
          assert.equal(res.body.result.itemCode, 'P001');
          assert.equal(res.body.result.itemDesc, 'RAMA Item 001');
          // done();
        },
      );

    const prom2 = prom1.then(
      () => {
        log('adding a 2nd item');
        item.itemCode = 'P002';
        item.itemDesc = 'RAMA Item 002';
        return chai.request(app)
          .post('/item/add')
          .send(item)
          .then((res) => {
            assert.equal(res.status, 200);
            assert.property(res.body.result, '_id');
            assert.equal(res.body.result.itemCode, 'P002');
            assert.equal(res.body.result.itemDesc, 'RAMA Item 002');
            // done();
          });
      },
    );

    // add 2nd item
    const prom3 = prom2.then(
      () => {
        log('fetching the 2 added items');
        return chai.request(app)
          .get('/item')
          .then((getRes) => {
            // if (err) {
            //   throw Error(`getting 2 added items failed ${err}`);
            // }
            assert.equal(getRes.status, 200);
            assert.isArray(getRes.body);
            // console.log('checking result...');
            // console.log(res.body);
            assert.lengthOf(getRes.body, 2);
            // done();
            log(`first Item - ${getRes.body[0]._id}`);
            return { itemId: getRes.body[0]._id };
          });
      },
    );

    prom3.then(
      (res) => {
        log(`Deleting the 1st of 2 items - ${res}`);
        chai.request(app)
          .delete('/item/delete')
          .send({ _id: res.itemId })
          .end((err, getRes) => {
            if (err) {
              done(new Error(`deleting item ID ${res.itemId} failed : ${err}`));
            }
            assert.equal(getRes.status, 200);
            assert.equal(getRes.body.message, 'Item successfully deleted!');
            done();
          });
      },
      (rej) => {
        done(new Error(rej));
      },
    );
  });


  it('POST /item/add : update item', (done) => {
    item.itemCode     = 'P003';
    item.itemDesc     = 'RAMA Item 003';
    item.price        = 5;
    item.amortPer     = 0.5;
    item.attribute1   = 'Test 1';
    item.attribute2   = '';
    item.attribute3   = '';
    item.attribute4   = '';
    item.attribute5   = '';

    // add 2nd item
    const prom1 = chai.request(app)
      .post('/item/add')
      .send(item)
      .then(
        (res) => {
          log('Update item testing - add step');
          assert.equal(res.status, 200);
          assert.property(res.body.result, '_id');
          assert.equal(res.body.result.itemCode, 'P003');
          assert.equal(res.body.result.itemDesc, 'RAMA Item 003');
          assert.equal(res.body.result.price, 5);
          assert.equal(res.body.result.amortPer, 0.5);
        },
      );

    const prom2 = prom1.then(
      () => {
        let itemId = null;

        // mongoose query is thenable but is not full fledged promise
        // , for a full fledged promise use execute
        return Item.find({ itemCode: 'P003' }).exec().then(
          (res) => {
            if (res.length !== 1) {
              throw Error('Unable to get item P003');
            } else {
              itemId = res[0]._id;
              // console.log('ITEM ID passed to promise !');
              // console.log({ itemId });
              return { itemId };
            }
          },
        );
      },
    );


    const prom3 = prom2.then(
      (res) => {
        const cprom = chai.request(app)
          .put('/item/update')
          .send({
            _id     : res.itemId,
            price   : 7,
            amortPer: 2,
            itemDesc: 'RAMA Item 003 - upd',
          })
          .then((updRes) => {
            assert.equal(updRes.status, 200);
            assert.property(updRes.body, 'saveItem');
            assert.equal(updRes.body.saveItem._id, res.itemId);
            assert.equal(updRes.body.saveItem.price, 7);
            assert.equal(updRes.body.saveItem.amortPer, 2);
            return { itemId: updRes.body.saveItem._id };
            //
          });
        return cprom;
      },
    );

    const prom4 = prom3.then(
      (res) => {
        log('prom3 handler');
        log(res);
        return chai.request(app)
          .get(`/item/get/${res.itemId}`)
          .then((getRes) => {
            log('prom3 res');
            log(getRes.body.result);
            assert.property(getRes.body.result, '_id');
            assert.property(getRes.body.result, 'itemCode');
            assert.property(getRes.body.result, 'itemDesc');
            assert.property(getRes.body.result, 'price');
            assert.property(getRes.body.result, 'amortPer');
            return { itemId: getRes.body.result._id };
            // done();
          });
      },
    );

    item.itemCode     = 'P003.1';
    item.itemDesc     = 'RAMA Item 003';

    prom4.then(
      (res) => {
        log('prom4 handler');
        log(res);

        item._id = res.itemId;
        chai.request(app)
          .put('/item/update')
          .send(item)
          .end((err, updRes) => {
            if (err) {
              done(new Error(`Failed in sending update request ${err}`));
            }
            log('prom4 res');
            log(updRes.body.result);

            assert.equal(updRes.status, 200);
            assert.property(updRes.body, 'error');
            assert.equal(updRes.body.error,
              'unable to save updated item =>ValidationError: itemCode: item.itemCode should not be updated');
            done();
          });
      },
      (rej) => {
        errLog(rej.stack);
        done(new Error(rej));
      },
    );
  });


  // after(() => server_mod.stop());
  after((done) => {
    // console.log(' Exec after code')
    // server_mod.stop()
    chai.request(app).close();
    done();
  });
});
// end of items describe
