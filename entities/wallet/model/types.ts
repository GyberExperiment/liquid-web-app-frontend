/**
 * Типы для сущности "кошелек"
 */

export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  isConnected: boolean;
  lastUpdated?: Date;
}

export interface ChainInfo {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  isTestnet: boolean;
}

// Возможные статусы подключения кошелька
export enum WalletConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

// Ошибки работы с кошельком
export enum WalletError {
  CONNECTION_REJECTED = 'connection_rejected',
  CHAIN_NOT_SUPPORTED = 'chain_not_supported',
  WALLET_NOT_INSTALLED = 'wallet_not_installed',
  UNKNOWN_ERROR = 'unknown_error'
}

// Поддерживаемые сети
export const SUPPORTED_CHAINS: Record<number, ChainInfo> = {
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
    isTestnet: false
  },
  11155111: {
    id: 11155111,
    name: 'Sepolia',
    symbol: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  137: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorerUrl: 'https://polygonscan.com',
    isTestnet: false
  }
};
