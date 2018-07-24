import * as ProviderEngine from 'web3-provider-engine';
import * as DefaultFixture from 'web3-provider-engine/subproviders/default-fixture.js';
import * as NonceTrackerSubprovider from 'web3-provider-engine/subproviders/nonce-tracker.js';
import * as CacheSubprovider from 'web3-provider-engine/subproviders/cache.js';
import * as FilterSubprovider from 'web3-provider-engine/subproviders/filters.js';
import * as SubscriptionSubprovider from 'web3-provider-engine/subproviders/subscriptions';
import * as InflightCacheSubprovider from 'web3-provider-engine/subproviders/inflight-cache';
import WalletSubprovider from './chain-client-wallet-sub-provider.js';
import * as SanitizingSubprovider from 'web3-provider-engine/subproviders/sanitizer.js';
import * as FetchSubprovider from 'web3-provider-engine/subproviders/fetch.js';
import * as WebSocketSubprovider from 'web3-provider-engine/subproviders/websocket.js';

import {
  DEFAULT_RPC_URL
} from './utils/constants';

export default class ChainClientProviderEngine extends ProviderEngine {
  constructor(wallet, {
    rpcUrl = DEFAULT_RPC_URL,
    stopped = false,
    provideCache = false,
    provideStatic = true,
    provideNonceTracker = true,
    provideSanitizer = true,
    provideInflightCache = true,
    provideFilter = true,
    provideFilterAndSubscription = true
  } = {}) {
    if (!wallet) throw new Error('new ChainClientProviderEngine() - Missing wallet parameter');

    // Init parent ProviderEngine class.
    super();

    const connectionType = this.getConnectionType(rpcUrl);

    // static
    if (provideStatic) {
      const staticSubprovider = new DefaultFixture();
      this.addProvider(staticSubprovider);
    }

    // nonce tracker
    if (provideNonceTracker) {
      this.addProvider(new NonceTrackerSubprovider());
    }

    // sanitization
    if (provideSanitizer) {
      const sanitizer = new SanitizingSubprovider();
      this.addProvider(sanitizer);
    }

    // cache layer
    if (provideCache) {
      const cacheSubprovider = new CacheSubprovider();
      this.addProvider(cacheSubprovider);
    }

    // filters + subscriptions
    // for websockets, only polyfill filters
    if (connectionType === 'ws') {
      if (provideFilter) {
        const filterSubprovider = new FilterSubprovider();
        this.addProvider(filterSubprovider);
      }
      // otherwise, polyfill both subscriptions and filters
    } else {
      if (provideFilterAndSubscription) {
        const filterAndSubsSubprovider = new SubscriptionSubprovider();
        // forward subscription events through provider
        filterAndSubsSubprovider.on('data', (err, notification) => {
          this.emit('data', err, notification);
        });
        this.addProvider(filterAndSubsSubprovider);
      }
    }

    // inflight cache
    if (provideInflightCache) {
      const inflightCache = new InflightCacheSubprovider();
      this.addProvider(inflightCache);
    }

    // id mgmt
    const idmgmtSubprovider = new WalletSubprovider(wallet);
    this.addProvider(idmgmtSubprovider);

    // data source
    const dataSubprovider = this.createDataSubprovider(connectionType, rpcUrl);
    // for websockets, forward subscription events through provider
    if (connectionType === 'ws') {
      dataSubprovider.on('data', (err, notification) => {
        this.emit('data', err, notification);
      });
    }
    this.addProvider(dataSubprovider);

    // start polling
    if (!stopped) {
      this.start();
    }
  }

  createDataSubprovider(connectionType, rpcUrl) {
    if (connectionType === 'http') {
      return new FetchSubprovider({
        rpcUrl
      });
    }
    if (connectionType === 'ws') {
      return new WebSocketSubprovider({
        rpcUrl
      });
    }

    throw new Error(`ChainClientProviderEngine.createDataSubprovider() - unrecognized connectionType "${connectionType}"`);
  }

  getConnectionType(rpcUrl) {
    const protocol = rpcUrl.split(':')[0];
    switch (protocol) {
      case 'http':
      case 'https':
        return 'http';
      case 'ws':
      case 'wss':
        return 'ws';
      default:
        throw new Error(`ChainClientProviderEngine.getConnectionType() - unrecognized protocol in "${rpcUrl}"`);
    }
  }
}