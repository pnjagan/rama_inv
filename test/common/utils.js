const { assert } = require('chai');

const { docPropUpdater } = require('../../src/common/utils');

describe('docPropUpdater(prop,doc) updates attributes to doc from props', () => {
  it('basic copy check', () => {
    const props = {
      name  : 'sriramachandra maharaj',
      father: 'dasarath maharaj',
      enemy : '',
    };

    const doc = {
      name    : 'srirama',
      type    : 'avatar',
      father  : 'dasarath',
      place   : 'ayodhya',
      weakness: '',
    };

    docPropUpdater(props, doc);

    assert.equal(doc.name, 'sriramachandra maharaj');
    assert.equal(doc.father, 'dasarath maharaj');
    assert.equal(doc.place, 'ayodhya');
    assert.equal(doc.weakness, '');
    assert.isUndefined(doc.enemy, 'enemy not defined');// doc should have props not in doc
  });
});
