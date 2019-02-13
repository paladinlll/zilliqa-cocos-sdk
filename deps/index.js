
const { BN, Long, bytes, units } = require('@zilliqa-js/util');
const {Zilliqa} = require('@zilliqa-js/zilliqa');
import * as zcrypto from '@zilliqa-js/crypto';
const ScillaDataParser = require('scilla-data-parser').ScillaDataParser
export { 
  Zilliqa,
  zcrypto,
  BN,
  Long,
  bytes,
  units,
  ScillaDataParser
};

if (typeof window !== 'undefined' && typeof window.Zilliqa === 'undefined') {
  window.Zilliqa = Zilliqa;
}