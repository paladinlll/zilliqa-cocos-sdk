const {BN, Long} = require('@zilliqa-js/util');
const {Zilliqa} = require('@zilliqa-js/zilliqa');
const ScillaDataParser = require('scilla-data-parser').ScillaDataParser
export { 
  Zilliqa,
  BN,
  Long,
  ScillaDataParser
};

if (typeof window !== 'undefined' && typeof window.Zilliqa === 'undefined') {
  window.Zilliqa = Zilliqa;
}