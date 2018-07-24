import ChainClientWallet from './chain-client-wallet.js';
import ChainClientWeb3 from './chain-client-web3.js';

// TODO: Add Encryption module to encrypt/decrypt a message or data using public/private keys provided in the wallet.
export default class ChainClient {
  constructor({
    rpcUrl,
    mnemonic,
    nodeDrivePath
  } = {}) {
    this.wallet = new ChainClientWallet({
      mnemonic: mnemonic,
      nodeDrivePath: nodeDrivePath
    });
    this.web3 = new ChainClientWeb3(this.wallet, {
      rpcUrl: rpcUrl
    });
  }
}