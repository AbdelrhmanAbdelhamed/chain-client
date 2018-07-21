# Chain Client
An Ethereum Client Wrapper With HD-Wallet, Web3 Provider, Web3 Services and Encryption

## Installation

```bash
npm install @abdelrahman-abdelhamed/chain-client
```

## Usage

> CommonJS

```js
const ChainClient = require('@abdelrahman-abdelhamed/chain-client');
```

> ES6 Module

```js
import ChainClient from "@abdelrahman-abdelhamed/chain-client";
```

```js
var client = new ChainClient({
  rpcUrl: 'http://localhost:7545', // Ganache
  mnemonic: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat', // Dev mnemonic
  nodeDrivePath: "m/44'/60'/0'/0/0" // Default node path for key generation from seed (first node/account)
});
console.log(client.getAccount()); // 0x627306090abab3a6e1400e9345bc60c78a8bef57
```
