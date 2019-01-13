process.env.NODE_ENV = 'test';
// const mongoose = require("mongoose");

/* eslint max-len: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const serverMod = require('../../src/server');
const User = require('../../src/models/user');
const { log, errLog } = require('../../src/common/utils');

const { app } = serverMod;
const { assert } = chai;

// const request = chai.request(app);

chai.use(chaiHttp);

describe('User testing', () => {
  // BEFORE deletes
  before((done) => {
    // Before each test we empty the database
    User.deleteMany({}, (err) => {
      if (err) {
        throw Error('unable to delete existing user for starting the test');
      } else {
        done();
      }
    });
  });

  /*
  * Test the /GET route
  */
  it('GET /user : get all items', (done) => {
    chai.request(app)
      .get('/user')
      .end((err, res) => {
        log('GET /user testing');
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.lengthOf(res.body, 0);
        done();
      });
  });


  // Test the /GET route

  const user = {
    userLogin     : 'SRIRAM',
    userPassword  : 'welcome123',
    userName      : 'Sriramachandra dasarathy',
    enabledFlag   : 'Y',
    responsibility: '',
  };

  it('POST /user/add', (done) => {
    // add 1st item
    const prom1 = chai.request(app)
      .post('/user/add')
      .send(user)
      .then(
        (res) => {
          log('Add a new user');
          assert.equal(res.status, 200);
          assert.property(res.body.result, '_id');
          assert.equal(res.body.result.userLogin, 'SRIRAM');
          assert.equal(res.body.result.userName, 'Sriramachandra dasarathy');
          // done();
        },
      );

    const prom2 = prom1.then(
      () => {
        log('adding a 2nd user');
        user.userLogin = 'KRISHNA';
        user.userName = 'SriKrishna Vasudevar';
        return chai.request(app)
          .post('/user/add')
          .send(user)
          .then((res) => {
            assert.equal(res.status, 200);
            assert.property(res.body.result, '_id');
            assert.equal(res.body.result.userLogin, 'KRISHNA');
            assert.equal(res.body.result.userName, 'SriKrishna Vasudevar');
            // done();
          });
      },
    );

    // fetching the 2 users
    const prom3 = prom2.then(
      () => {
        log('fetching the 2 added users');
        return chai.request(app)
          .get('/user')
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
            log(`first user - ${getRes.body[0]._id}`);
            return { userId: getRes.body[0]._id };
          });
      },
    );

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


  it('POST /user/add : update user', (done) => {
    user.userLogin     = 'NARASIMHAR';
    user.userName     = 'Sri Lakshmi Narasimhar';
    user.responsibility  = 'SuperUser';

    // add 2nd item
    const prom1 = chai.request(app)
      .post('/user/add')
      .send(user)
      .then(
        (res) => {
          log('Update item testing - add step');
          assert.equal(res.status, 200);
          assert.property(res.body.result, '_id');
          assert.equal(res.body.result.userLogin, 'NARASIMHAR');
          assert.equal(res.body.result.userName, 'Sri Lakshmi Narasimhar');
          assert.equal(res.body.result.responsibility, 'SuperUser');
        },
      );

    const prom2 = prom1.then(
      () => {
        let userId = null;

        // mongoose query is thenable but is not full fledged promise
        // , for a full fledged promise use execute
        return User.find({ userLogin: 'NARASIMHAR' }).exec().then(
          (res) => {
            if (res.length !== 1) {
              throw Error('Unable to get user NARASIMHAR');
            } else {
              userId = res[0]._id;
              // console.log('ITEM ID passed to promise !');
              // console.log({ itemId });
              return { userId };
            }
          },
        );
      },
    );


    const prom3 = prom2.then(
      (res) => {
        const cprom = chai.request(app)
          .put('/user/update')
          .send({
            _id           : res.userId,
            userName      : 'Sri Lakshmi Narasimha parabramhan',
            responsibility: 'SuperSuperUser',
          })
          .then((updRes) => {
            assert.equal(updRes.status, 200);
            assert.property(updRes.body, 'saveUser');
            assert.equal(updRes.body.saveUser._id, res.userId);
            assert.equal(updRes.body.saveUser.userName, 'Sri Lakshmi Narasimha parabramhan');
            assert.equal(updRes.body.saveUser.responsibility, 'SuperSuperUser');
            return { userId: updRes.body.saveUser._id };
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
          .get(`/user/get/${res.userId}`)
          .then((getRes) => {
            log('prom3 res');
            log(getRes.body.result);
            assert.property(getRes.body.result, '_id');
            assert.property(getRes.body.result, 'userLogin');
            assert.property(getRes.body.result, 'userName');
            assert.property(getRes.body.result, 'responsibility');
            return { userId: getRes.body.result._id };
            // done();
          });
      },
    );

    user.userLogin     = 'LAKSHMI-NARASIMHAR';
    user.userName      = 'Sri Sundara Narasimha parabramhan';

    prom4.then(
      (res) => {
        log('prom4 handler');
        log(res);

        user._id = res.userId;
        chai.request(app)
          .put('/user/update')
          .send(user)
          .end((err, updRes) => {
            if (err) {
              done(new Error(`Failed in sending update request ${err}`));
            }
            log('prom4 res');
            log(updRes.body.result);

            assert.equal(updRes.status, 200);
            assert.property(updRes.body, 'error');
            assert.equal(updRes.body.error,
              'unable to save updated user =>ValidationError: userlogin: user.userLogin should not be updated');
            done();
          });
      },
      (rej) => {
        errLog(rej.stack);
        log('inside Error handling');
        log(rej);
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
