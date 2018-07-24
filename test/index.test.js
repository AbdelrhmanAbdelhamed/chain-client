const assert = require('assert');
const Buffer = require('safe-buffer').Buffer;
const ChainClient = require('../dist/chain-client.cjs.js');

const fixtureChainClient = new ChainClient({
  rpcUrl: 'http://localhost:7545', // Ganache
  mnemonic: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat', // Dev mnemonic
  nodeDrivePath: "m/44'/60'/0'/0/0" // Default node path for key generation from seed (first node/account)
});

describe('new ChainClientWallet()', function () {
  it('should work', function () {
    assert.strictEqual(fixtureChainClient.wallet.getPublicKey(), '0xaf80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59');
    assert.strictEqual(fixtureChainClient.wallet.getPrivateKey(), '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
    assert.deepStrictEqual(fixtureChainClient.wallet.getPrivateKey({
      buffer: true
    }), Buffer.from('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', 'hex'));
  });
});

describe('.getBalance()', function () {
  it('should work', async function () {
    const balance = await fixtureChainClient.web3.getBalance();
    assert.notStrictEqual(balance, '0');
  });
});

describe('.getAccount()', function () {
  it('should work', async function () {
    assert.strictEqual((await fixtureChainClient.web3.getAccount()), '0x627306090abab3a6e1400e9345bc60c78a8bef57');
    assert.strictEqual((await fixtureChainClient.web3.getAccount({
      toLowerCase: false
    })), '0x627306090abaB3A6e1400e9345bC60c78a8BEf57');
  });
});

describe('.sendTransaction()', function () {
  it('should signing and broadcasting a transaction of 1 ether from the first account to the second', async function () {
    const oldBalance = await fixtureChainClient.web3.getBalance();
    const receipt = await fixtureChainClient.web3.sendTransaction({
      to: '0xf17f52151EbEF6C7334FAD080c5704D77216b732', // second address/account
      value: '1' // 1 ether
    });
    const newBalance = await fixtureChainClient.web3.getBalance();
    assert.ok(receipt);
    assert.strictEqual((oldBalance - newBalance) < 1.1, true);
  });
});