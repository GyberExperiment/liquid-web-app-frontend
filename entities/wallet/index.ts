/**
 * Публичное API для сущности "кошелек"
 */

// Типы и модели
export { WalletInfo, WalletConnectionStatus, WalletError, SUPPORTED_CHAINS, ChainInfo } from './model/types';
export { useWalletStore, walletUtils } from './model';

// API-клиенты
export { walletApi } from './api';

// UI-компоненты
export { default as WalletCard } from './ui/WalletCard';
