import HookedWalletEthTxSubprovider from 'web3-provider-engine/subproviders/hooked-wallet-ethtx';

// TODO: Ask for the password on every transaction. i.e. ==> wallet.prototype.passwordProvider().
export default class ChainClientWalletSubprovider extends HookedWalletEthTxSubprovider {
  constructor(wallet, options = {}) {
    options.getAccounts = callback => {
      callback(null, [wallet.getAddress()]);
    };

    options.getPrivateKey = (address, callback) => {
      if (address !== wallet.getAddress()) {
        return callback('ChainWalletSubprovider Account not found');
      }

      callback(null, wallet.getPrivateKey({
        buffer: true
      }));
    };

    // Init parent HookedWalletEthTxSubprovider class.
    super(options);
  }
}