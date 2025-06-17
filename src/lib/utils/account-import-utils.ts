interface PlebbitOptions {
  ipfsGatewayUrls?: string[];
  pubsubKuboRpcClientsOptions?: string[];
  plebbitRpcClientsOptions?: string[];
  httpRoutersOptions?: string[];
  chainProviders?: {
    [key: string]: {
      urls: string[];
      chainId: number;
    };
  };
  resolveAuthorAddresses?: boolean;
  validatePages?: boolean;
}

interface ImportedAccount {
  account?: {
    plebbitOptions?: PlebbitOptions;
    [key: string]: any;
  };
  [key: string]: any;
}

// Default configuration for web/mobile platforms
export const getDefaultWebConfig = (): PlebbitOptions => ({
  ipfsGatewayUrls: ['https://ipfsgateway.xyz', 'https://gateway.plebpubsub.xyz', 'https://gateway.forumindex.com'],
  pubsubKuboRpcClientsOptions: ['https://pubsubprovider.xyz/api/v0', 'https://plebpubsub.xyz/api/v0', 'https://rannithepleb.com/api/v0'],
  httpRoutersOptions: ['https://routing.lol', 'https://peers.pleb.bot', 'https://peers.plebpubsub.xyz', 'https://peers.forumindex.com'],
  chainProviders: {
    eth: {
      urls: ['ethers.js', 'https://ethrpc.xyz', 'viem'],
      chainId: 1,
    },
    avax: {
      urls: ['https://api.avax.network/ext/bc/C/rpc'],
      chainId: 43114,
    },
    matic: {
      urls: ['https://polygon-rpc.com'],
      chainId: 137,
    },
    sol: {
      urls: ['https://solrpc.xyz'],
      chainId: 1,
    },
  },
  resolveAuthorAddresses: false,
  validatePages: false,
});

// Default configuration for Electron platform
export const getDefaultElectronConfig = (): PlebbitOptions => ({
  plebbitRpcClientsOptions: ['ws://localhost:9138'],
  httpRoutersOptions: ['https://peers.pleb.bot', 'https://routing.lol', 'https://peers.forumindex.com', 'https://peers.plebpubsub.xyz'],
  chainProviders: {
    eth: {
      urls: ['ethers.js', 'https://ethrpc.xyz', 'viem'],
      chainId: 1,
    },
    avax: {
      urls: ['https://api.avax.network/ext/bc/C/rpc'],
      chainId: 43114,
    },
    matic: {
      urls: ['https://polygon-rpc.com'],
      chainId: 137,
    },
    sol: {
      urls: ['https://solrpc.xyz'],
      chainId: 1,
    },
  },
  resolveAuthorAddresses: false,
  validatePages: false,
});

// Check if RPC URL is localhost
const isLocalhostRpc = (url: string): boolean => {
  return url.includes('localhost') || url.includes('127.0.0.1');
};

// Check if account has non-localhost RPC configuration
const hasNonLocalhostRpc = (options: PlebbitOptions): boolean => {
  const hasRpcOptions = (options.plebbitRpcClientsOptions?.length ?? 0) > 0;
  return hasRpcOptions && !options.plebbitRpcClientsOptions?.some(isLocalhostRpc);
};

// Check if account has pubsub providers configured
const hasPubsubProviders = (options: PlebbitOptions): boolean => {
  return (options.pubsubKuboRpcClientsOptions?.length ?? 0) > 0 || (options.ipfsGatewayUrls?.length ?? 0) > 0;
};

// Check if account has localhost RPC configured
const hasLocalhostRpc = (options: PlebbitOptions): boolean => {
  const hasRpcOptions = (options.plebbitRpcClientsOptions?.length ?? 0) > 0;
  return hasRpcOptions && (options.plebbitRpcClientsOptions?.some(isLocalhostRpc) ?? false);
};

/**
 * Transforms plebbit options for imported accounts based on platform and existing configuration
 *
 * Logic:
 * - Preserves non-localhost RPC configurations
 * - On Electron: replaces pubsub providers with localhost RPC
 * - On Web: replaces localhost RPC with pubsub providers
 * - Sets platform-appropriate defaults for missing configurations
 */
export const transformPlebbitOptionsForImport = (importedAccount: ImportedAccount, isElectron: boolean): PlebbitOptions => {
  const currentOptions = importedAccount.account?.plebbitOptions || {};

  // Don't overwrite non-localhost RPC configurations
  if (hasNonLocalhostRpc(currentOptions)) {
    return currentOptions;
  }

  if (isElectron) {
    // On electron: if account has pubsub providers, replace with localhost RPC
    if (hasPubsubProviders(currentOptions)) {
      return getDefaultElectronConfig();
    }
    // If already has localhost RPC or no providers, use electron defaults
    return (currentOptions.plebbitRpcClientsOptions?.length ?? 0) > 0 ? currentOptions : getDefaultElectronConfig();
  } else {
    // On web: if account has localhost RPC, replace with pubsub providers
    if (hasLocalhostRpc(currentOptions)) {
      return getDefaultWebConfig();
    }
    // If no RPC or has pubsub providers, use web defaults
    return (currentOptions.pubsubKuboRpcClientsOptions?.length ?? 0) > 0 ? currentOptions : getDefaultWebConfig();
  }
};

/**
 * Processes an imported account by transforming its plebbit options
 * Returns the modified account as a JSON string ready for import
 */
export const processImportedAccount = (accountJson: string, isElectron: boolean): string => {
  const importedAccount = JSON.parse(accountJson);

  // Transform plebbitOptions based on platform and existing config
  if (importedAccount.account?.plebbitOptions) {
    importedAccount.account.plebbitOptions = transformPlebbitOptionsForImport(importedAccount, isElectron);
  } else {
    // If no plebbitOptions exist, set defaults based on platform
    importedAccount.account.plebbitOptions = isElectron ? getDefaultElectronConfig() : getDefaultWebConfig();
  }

  return JSON.stringify(importedAccount);
};
