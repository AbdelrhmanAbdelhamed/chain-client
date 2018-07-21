import * as Wallet from 'ethereumjs-wallet';
import * as hdkey from 'ethereumjs-wallet/hdkey';
import * as bip39 from 'bip39';

import {
  DEFAULT_NODE_DERIVE_PATH
} from './utils/constants';

export default class ChainClientWallet {
  constructor({
    mnemonic = bip39.generateMnemonic(),
    nodeDrivePath = DEFAULT_NODE_DERIVE_PATH
  } = {}) {
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic();
    } else if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('new ChainWallet()', 'Invalid mnemonic');
    }
    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = hdkey.fromMasterSeed(seed);
    const addrNode = root.derivePath(nodeDrivePath);
    this._walletInstance = addrNode.getWallet();
  }

  getPublicKey({
    buffer = false
  } = {}) {
    return buffer ? this._walletInstance.getPublicKey() : this._walletInstance.getPublicKeyString();
  }

  getPrivateKey({
    buffer = false
  } = {}) {
    return buffer ? this._walletInstance.getPrivateKey() : this._walletInstance.getPrivateKeyString();
  }

  getAddress({
    buffer = false,
    checksumAddress = false
  } = {}) {
    return buffer ? this._walletInstance.getAddress() : checksumAddress ? this._walletInstance.getChecksumAddressString() : this._walletInstance.getAddressString();
  }

  toJson(password) {
    return this._walletInstance.toV3(password);
  }

  static fromJson(input, password) {
    return Wallet.fromV3(input, password);
  }
}