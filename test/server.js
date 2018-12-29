process.env.NODE_ENV = 'test';
// const mongoose = require("mongoose");

/* eslint max-len: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const serverMod = require('../src/server');
// const Item = require('../src/models/item');
const { log, errLog } = require('../src/common/utils');

const { app } = serverMod;
const { assert } = chai;

// const request = chai.request(app);

chai.use(chaiHttp);


describe('Basic test', () => {
  it('GET / : welcome message', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        if (err) {
          errLog(err.stack);
          done(new Error(err));
        }
        log('GET / testing');
        assert.equal(res.status, 200);
        assert.equal(res.body.message, 'Welcome to Rama Invoice App (RIA)!');
        done();
      });
  });
});
