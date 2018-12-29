const winston = require('../../config/winston');

const log = winston.debug;
const errLog = winston.error;


function docPropUpdater(prop, doc) {
  const keys = Object.keys(prop);

  for (let i = 0; i < keys.length; i++) {
    if (keys[i] in doc) {
      /* eslint no-param-reassign: ["error", { "props": false }] */
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
