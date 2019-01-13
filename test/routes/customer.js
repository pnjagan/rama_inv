process.env.NODE_ENV = 'test';
// const mongoose = require("mongoose");

/* eslint max-len: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const serverMod = require('../../src/server');
const { Customer, Address } = require('../../src/models/customer');
const { log, errLog } = require('../../src/common/utils');

const { app } = serverMod;
const { assert } = chai;

// const request = chai.request(app);

chai.use(chaiHttp);

describe('Customer testing', () => {
  // BEFORE deletes
  before((done) => {
    // Before each test we empty the database
    Customer.deleteMany({}, (custErr) => {
      if (custErr) {
        throw Error('unable to delete existing customers for starting the test');
      } else {
        Address.deleteMany({}, (addErr) => {
          if (addErr) {
            throw Error('unable to delete existing address for starting the test');
          } else {
            done();
          }
        });
      }
    });
  });

  /*
  * Test the /GET route
  */
  it('GET /customer : get all customers', (done) => {
    chai.request(app)
      .get('/customer')
      .end((err, res) => {
        log('GET /customer testing');
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.lengthOf(res.body, 0);
        done();
      });
  });

  const customer1 = {
    enabledFlag         : 'Y',
    customerNumber      : '0010',
    customerName        : 'Test: Customer 0010',
    customerCategory    : 'SMALL RETAIL CUSTOMER',
    taxRegNumber        : 'TAX010',
    primaryBillToAddress: 'UNSAVED-REF-1',
    primaryShipToAddress: 'UNSAVED-REF-2',
    addresses           : [
      {
        enabledFlag : 'Y',
        _id         : 'UNSAVED-REF-1',
        addressType : 'BILL_TO',
        contactName : 'Manager1',
        contactPhone: '',
        contactEmail: 'govindan@vishnupuja.com',
        addressLine1: 'NO 8, sundararajan street',
        addressLine2: 'krishna nagar',
        addressLine3: '',
        placeName   : 'padmanabapuram',
        state       : 'tamil nadu',
        country     : 'india',
        zipCode     : '600766',
      },
      {
        enabledFlag : 'Y',
        _id         : 'UNSAVED-REF-2',
        addressType : 'SHIP_TO',
        contactName : 'Manager2',
        contactPhone: '',
        contactEmail: 'madhavan@vishnupuja.com',
        addressLine1: 'NO 14, pahlada varadan street',
        addressLine2: 'ram nagar',
        addressLine3: '',
        placeName   : 'narasinga puram',
        state       : 'tamil nadu',
        country     : 'india',
        zipCode     : '6006545',
      },
    ],
  };

  const customer2 = {
    enabledFlag         : 'Y',
    customerNumber      : '0020',
    customerName        : 'Test: Customer 0020',
    customerCategory    : 'PHARMA CUSTOMER',
    taxRegNumber        : 'TAX020',
    primaryBillToAddress: 'UNSAVED-REF-1',
    primaryShipToAddress: 'UNSAVED-REF-3',
    addresses           : [
      {
        enabledFlag : 'Y',
        _id         : 'UNSAVED-REF-1',
        addressType : 'BILL_TO',
        contactName : 'Manager',
        contactPhone: '',
        contactEmail: 'giridharan@goloka.com',
        addressLine1: 'NO 7, oppiliappan street',
        addressLine2: 'srinivasa nagar',
        addressLine3: '',
        placeName   : 'narayanagiri',
        state       : 'tamil nadu',
        country     : 'india',
        zipCode     : '600876',
      },
      {
        enabledFlag : 'Y',
        _id         : 'UNSAVED-REF-2',
        addressType : 'SHIP_TO',
        contactName : 'Manager',
        contactPhone: '',
        contactEmail: 'parthasarathy@dwaraka.com',
        addressLine1: 'NO 76, kondanda ramar street',
        addressLine2: 'madhavam complex',
        addressLine3: '',
        placeName   : 'lakshminarayana nagar',
        state       : 'tamil nadu',
        country     : 'india',
        zipCode     : '6006995',
      },
      {
        enabledFlag : 'Y',
        _id         : 'UNSAVED-REF-3',
        addressType : 'SHIP_TO',
        contactName : 'Manager',
        contactPhone: '',
        contactEmail: 'nandakishore@paramapadam.com',
        addressLine1: 'NO 123, lakshmipathi street',
        addressLine2: 'dasarathi nagar',
        addressLine3: '',
        placeName   : 'veeraraghava puram',
        state       : 'tamil nadu',
        country     : 'india',
        zipCode     : '6076555',
      },
    ],
  };


  it('POST /customer/add', async () => {
    let result = null;
    // add 1st item
    try {
      result = await chai.request(app)
        .post('/customer/add')
        .send(customer1);

      assert.equal(result.status, 200);
      assert.property(result.body.result, '_id');
      assert.equal(result.body.result.customerName, 'Test: Customer 0010');
      assert.equal(result.body.result.customerNumber, '0010');
      // done();


      result = await chai.request(app)
        .post('/customer/add')
        .send(customer2);

      assert.equal(result.status, 200);
      assert.property(result.body.result, '_id');
      assert.equal(result.body.result.customerName, 'Test: Customer 0020');
      assert.equal(result.body.result.customerNumber, '0020');


      // fetching the 2 customers
      result = await chai.request(app)
        .get('/customer');
      assert.equal(result.status, 200);
      assert.isArray(result.body);
      assert.lengthOf(result.body, 2);

      // update IDs - this is required for update and then validation
      for (let i = 0; i < result.body.length; i++) {
        if (result.body[i].customerNumber === '0010') {
          customer1._id = result.body[i]._id;

          for (let j = 0; j < result.body[i].addresses.length; j++) {
            if (result.body[i].addresses[j].contactName === 'Manager1') {
              customer1.addresses[0]._id = result.body[i].addresses[j]._id;
            }
            if (result.body[i].addresses[j].contactName === 'Manager2') {
              customer1.addresses[1]._id = result.body[i].addresses[j]._id;
            }
          }
        }
      }

      // done();
      // since passing async method to it-method , its returning a promise
      // i cannot call done and return a Promise , i can do only 1
      // so not calling done();
    } catch (error) {
      log(error.stack);
      errLog(error.stack);
      // not calling done(error), see reason above
      throw new Error('failed in creating 2 new customers');
    }
  });

  /*
    prom3.then(
      (res) => {
        log(`Deleting the 1st of 2 user - ${res}`);
        chai.request(app)
          .delete('/user/delete')
          .send({ _id: res.userId })
          .end((err, getRes) => {
            if (err) {
              done(new Error(`deleting user ID ${res.userId} failed : ${err}`));
            }
            assert.equal(getRes.status, 200);
            assert.equal(getRes.body.message, 'User successfully deleted!');
            done();
          });
      },
      (rej) => {
        done(new Error(rej));
      },
    );
  });
*/

  // it('POST /user/add : update customer', async (done) => {
  it('POST /customer/update : update customer', async () => {
    let result = null;
    // console.log(`customer1._id : ${customer1._id}`);

    try {
      customer1.customerName     =  'Test: Customer 0010 - v2';
      customer1.customerCategory =  'SMALL RETAIL CUSTOMER - v2';

      // replacing bill to with ship to and adding new address for ship to
      customer1.primaryBillToAddress = 'UNSAVED-REF-1';
      customer1.primaryShipToAddress = customer1.addresses[0]._id;

      // modifying 1st address
      // modifying existing bill to value

      customer1.addresses[0].contactEmail  = 'govindan@vishnupuja.com';
      customer1.addresses[0].addressLine1  = 'NO 8, sundararajan street -v2';
      customer1.addresses[0].addressLine2  = 'krishna nagar v2';
      customer1.addresses[0].addressLine3  = '';
      customer1.addresses[0].placeName     = 'padmanabapuram II';

      // replacing the 2nd address
      customer1.addresses[1].enabledFlag   = 'Y';
      customer1.addresses[1]._id           = 'UNSAVED-REF-1';
      customer1.addresses[1].addressType   = 'BILL_TO';
      customer1.addresses[1].contactName   = 'Manager3';
      // customer1.addreses[0].contactPhone": "",
      customer1.addresses[1].contactEmail  = 'nandagopal@vrajapriya.com';
      customer1.addresses[1].addressLine1  = 'NO 98, aranganayagan street';
      customer1.addresses[1].addressLine2  = 'pallikondan nagar';
      // customer1.addreses[0].addressLine3":
      customer1.addresses[1].placeName     = 'thirukannapuram';
      customer1.addresses[1].state         = 'tamil nadu';
      customer1.addresses[1].country       = 'india';
      customer1.addresses[1].zipCode       = '608676';

      log('-----update customer-----');
      log(customer1);
      result = await chai.request(app)
        .put('/customer/update')
        .send(customer1);
      log('-----result customer-----');
      log(result.body);

      assert.equal(result.status, 200);

      // console.log('--update result--');
      // console.log(result);
      errLog(result);

      assert.equal(result.body.message, 'customer successfully updated!');

      assert.equal(result.body.retDoc.customerName, 'Test: Customer 0010 - v2');
      assert.equal(result.body.retDoc.customerCategory, 'SMALL RETAIL CUSTOMER - v2');

      // validating the update

      result = await chai.request(app)
        .get(`/customer/get/${customer1._id}`);

      assert.equal(result.status, 200);

      // console.log(result);

      assert.equal(result.body.result.customerName, 'Test: Customer 0010 - v2');
      assert.equal(result.body.result.customerCategory, 'SMALL RETAIL CUSTOMER - v2');
      assert.lengthOf(result.body.result.addresses, 3);

      assert.equal(result.body.result.primaryShipToAddress, customer1.addresses[0]._id);

      assert.equal(result.body.result.primaryBillToAddress,
        result.body.result.addresses.filter(a => a.contactName === 'Manager3')[0]._id);

      assert.equal(
        result.body.result.addresses.filter(a => a.contactName === 'Manager3')[0].contactEmail,
        'nandagopal@vrajapriya.com',
      );

      assert.equal(
        result.body.result.addresses.filter(a => a.contactName === 'Manager2')[0].contactEmail,
        'madhavan@vishnupuja.com',
      );

      assert.equal(
        result.body.result.addresses.filter(a => a.contactName === 'Manager1')[0].contactEmail,
        'govindan@vishnupuja.com',
      );

      // done();
      // async method returns a promise, so no done()
    } catch (error) {
      log(error.stack);
      errLog(error.stack);
      throw new Error('failed in updating customer');
    }
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
