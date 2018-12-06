const {BN, Long} = require('@zilliqa-js/util');
const {Zilliqa} = require('@zilliqa-js/zilliqa');

export { 
  Zilliqa,
  BN,
  Long
};

if (typeof window !== 'undefined' && typeof window.Zilliqa === 'undefined') {
  window.Zilliqa = Zilliqa;
}