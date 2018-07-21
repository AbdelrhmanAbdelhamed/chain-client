import ChainClientProviderEngine from './chain-client-provider-engine.js';
import ChainWallet from './chain-wallet.js';
import * as Web3 from 'web3';

import {
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_PRICE
} from './utils/constants';

// TODO: Add Encryption module to encrypt/decrypt messages for data using public/private keys provided in the wallet.
export default class ChainClient {
  constructor({
    rpcUrl,
    mnemonic,
    nodeDrivePath
  } = {}) {
    this.wallet = new ChainWallet({
      mnemonic: mnemonic,
      nodeDrivePath: nodeDrivePath
    });
    this.engine = new ChainClientProviderEngine(this.wallet, {
      rpcUrl: rpcUrl
    });
    this.web3 = new Web3(this.engine);
  }

  getAccount() {
    return this.wallet.getAddress();
  }

  async getBalance() {
    const balanceInWei = await this.web3.eth.getBalance(this.wallet.getAddress());
    const balanceInEther = this.web3.utils.fromWei(balanceInWei);
    return parseFloat(balanceInEther);
  }

  /**
   * Sign and broadcast a transaction.
   * @param {Object} transaction - The transaction to send.
   * @param {String|BN|BigNumber} [transaction.value] - The value transferred for the transaction in ether. <string or BigNumber object to avoid precision errors>.
   * @param {String} transaction.to - The destination address of the message, left undefined for a contract-creation transaction. <optional if !value>.
   */
  async sendTransaction({
    to,
    gasLimit = DEFAULT_GAS_LIMIT, // TODO: Use Gas Estimation.
    gasPrice = DEFAULT_GAS_PRICE, // TODO: Use Gas Price Estimation.
    value,
    data,
    nonce
  }) {
    if (value && !to) throw new Error('ChainClient.sendTransaction()', 'Must provide <to> as the account to receive the <value> in ether');
    const receipt = await this.web3.eth.sendTransaction({
      from: this.getAccount(),
      to: to,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      value: this.web3.utils.toWei(value),
      data: data,
      nonce: nonce
    });
    return receipt;
  }
}