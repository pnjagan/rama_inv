const winston = require('../../config/winston');

const log = winston.debug;
const errLog = winston.error;

/*
this is not a regular deep copy program

main characters...
1.by default if doc does not contain a property in prop , those properties are NOT created in doc
  can be overridden by copyAllFields FLAG
2.if prop does not contain a propert in doc , those properties are LEFT AS IS created in doc
3.can exclude unwanted fields - via a ignoreFields
4.this procedure modifies the passed argument. Also as a convinience, it returns the fields as well
5.will not update (or touch) a value if it is same as an existing value
*/
function docPropUpdater(prop, doc, ignoreFields, copyAllFields) {
  const keys = Object.keys(prop);
  let ignoreFieldArray = null;
  let copyAllFieldsFlag = false;

  if (ignoreFields && !Array.isArray(ignoreFields)) {
    throw new Error('3rd argument to docPropUpdater should be an array of field names or can be omitted - but nothing else!!!');
  }

  if (!Array.isArray(ignoreFields)) {
    ignoreFieldArray = [];
  } else {
    ignoreFieldArray = ignoreFields;
  }

  if (copyAllFields) {
    copyAllFieldsFlag = true;
  }

  // *****************ACTUAL ASSIGNMENT************************************* //
  for (let i = 0; i < keys.length; i++) {
    if (copyAllFieldsFlag || (keys[i] in doc)) {
      if (!ignoreFieldArray.includes(keys[i])) {
      // we want to change the doc passed to the function, so diable no-param-reassign

        // Do not do any assignment if values are same
        if (doc[keys[i]] !== prop[keys[i]]) {
        // eslint-disable-next-line no-param-reassign
          doc[keys[i]] = prop[keys[i]];
        }
      }
    }
  }
  // ***********************ACTUAL ASSIGNMENT******************************* //

  return doc;
}

/* eslint no-console: 0 */

// const { log } = console; // logger , we can replace this with ()=>{} in PROD if required

//  const log = () => {}; // no logging
//
// const errLog = console.error;

module.exports = { docPropUpdater, log, errLog  };
