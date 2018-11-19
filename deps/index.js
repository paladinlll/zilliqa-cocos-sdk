const { Zilliqa } = require('@zilliqa-js/zilliqa')
const BN = require('bn.js')
export { 
  Zilliqa,
  BN
};

if (typeof window !== 'undefined' && typeof window.Zilliqa === 'undefined') {
  window.Zilliqa = Zilliqa;
}

/*

const { Transaction } = require('@zilliqa-js/account')
const { Zilliqa } = require('@zilliqa-js/zilliqa')
const BN = require('bn.js')

const zilliqa = new Zilliqa('https://my-zil-testnet.com');

// Populate the wallet with an account
address = zilliqa.wallet.addByPrivateKey('79A965ED6F516933838C4EC94D3B9512EB888DC02DC84115C40D274B7B76C99D');

console.log('address', address);*/
