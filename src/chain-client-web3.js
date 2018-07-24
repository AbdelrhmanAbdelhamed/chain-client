import * as Web3 from 'web3';
import ChainClientProviderEngine from './chain-client-provider-engine.js';

import {
    DEFAULT_GAS_LIMIT,
    DEFAULT_GAS_PRICE,
} from './utils/constants';

export default class ChainClientWeb3 extends Web3 {
    constructor(
        wallet, {
            rpcUrl
        } = {}) {
        if (typeof web3 !== 'undefined') {
            super(web3.currentProvider); // eslint-disable-line
        } else {
            const provider = new ChainClientProviderEngine(wallet, {
                rpcUrl: rpcUrl
            })
            super(provider);
        }
    }

    async getAccount({
        toLowerCase = true
    } = {}) {
        const accounts = await this.eth.getAccounts();
        if (accounts && accounts.length > 0) {
            return toLowerCase ? accounts[0].toLowerCase() : accounts[0];
        } else {
            throw new Error('ChainClientWeb3.getAccount() - No Account found! Please Login To MetaMask Or Check The Web3 Provider."');
        }
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
        if (value && !to) throw new Error(`ChainClientWeb3.sendTransaction() - Must provide <to> parameter as the account to receive the ${value} ETH`);
        try {
            const receipt = await this.eth.sendTransaction({
                from: (await this.getAccount()),
                to: to,
                gasLimit: gasLimit,
                gasPrice: gasPrice,
                value: this.utils.toWei(value),
                data: data,
                nonce: nonce
            });
            return receipt;
        } catch (err) {
            throw err;
        }
    }

    async getBalance() {
        try {
            const balanceInWei = await this.eth.getBalance((await this.getAccount()));
            const balanceInEther = this.utils.fromWei(balanceInWei);
            return parseFloat(balanceInEther);
        } catch (err) {
            throw err;
        }
    }

}