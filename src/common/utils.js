const winston = require('../../config/winston');

const log = winston.debug;
const errLog = winston.error;

/*
this is not a regular deep copy program

it has 2 main characters...
1.if doc does not contain a propert in prop , those properties are NOT created in doc
2.if prop does not contain a propert in doc , those properties are LEFT AS IS created in doc
*/
function docPropUpdater(prop, doc) {
  const keys = Object.keys(prop);

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] in doc) {
      // we want to change the doc passed to the function, so diable no-param-reassign
      // eslint-disable-next-line no-param-reassign
      doc[keys[i]] = prop[keys[i]];
    }
  }
  //
  // for (let k in from ){
  //   if(k in to) {
  //     to[k] = from[k]
  //   }
  // }
}

/* eslint no-console: 0 */

// const { log } = console; // logger , we can replace this with ()=>{} in PROD if required

//  const log = () => {}; // no logging
//
// const errLog = console.error;

module.exports = { docPropUpdater, log, errLog  };
