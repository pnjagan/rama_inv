module.exports = {
    "extends": "airbnb-base",
     "rules": {
       "no-underscore-dangle": 0,
       "no-plusplus": ["error", { "allowForLoopAfterthoughts":true } ],
       "key-spacing": ["error", { "align": "colon" } ],
       "no-multi-spaces": 0,
     },
     "env": {
        "node": true,
        "mocha":true
    }
};
