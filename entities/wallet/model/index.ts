import { ethers } from 'ethers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletInfo, WalletConnectionStatus, WalletError, SUPPORTED_CHAINS } from './types';

interface WalletState {
  // Основные данные
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  status: WalletConnectionStatus;
  error: WalletError | null;
  
  // Служебные данные
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  lastUpdated: Date | null;

  // Действия
  setWalletInfo: (info: Partial<WalletInfo>) => void;
  setStatus: (status: WalletConnectionStatus, error?: WalletError | null) => void;
  setProvider: (provider: ethers.providers.Web3Provider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  reset: () => void;
}

export const initialWalletState = {
  address: null,
  chainId: null,
  balance: null,
  isConnected: false,
  status: WalletConnectionStatus.DISCONNECTED,
  error: null,
  provider: null,
  signer: null,
  lastUpdated: null
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...initialWalletState,

      setWalletInfo: (info) => set((state) => ({
        ...state,
        ...info,
        lastUpdated: new Date()
      })),

      setStatus: (status, error = null) => set((state) => ({
        ...state,
        status,
        error,
        isConnected: status === WalletConnectionStatus.CONNECTED
      })),

      setProvider: (provider) => set((state) => ({
        ...state,
        provider
      })),

      setSigner: (signer) => set((state) => ({
        ...state,
        signer
      })),

      reset: () => set(initialWalletState)
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected
      })
    }
  )
);

// Хелперы для работы с кошельком
export const walletUtils = {
  // Форматирование адреса для отображения (0x1234...5678)
  formatAddress: (address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  // Получение информации о сети по chainId
  getChainInfo: (chainId: number | null) => {
    if (!chainId) return null;
    return SUPPORTED_CHAINS[chainId] || null;
  },

  // Проверка, поддерживается ли указанная сеть
  isChainSupported: (chainId: number | null): boolean => {
    if (!chainId) return false;
    return !!SUPPORTED_CHAINS[chainId];
  },
  
  // Получение провайдера Web3
  getProvider: (): ethers.providers.Web3Provider | null => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }
    
    return new ethers.providers.Web3Provider(window.ethereum);
  },
  
  // Форматирование баланса для отображения
  formatBalance: (balance: string | null, decimals: number = 18, fixed: number = 4): string => {
    if (!balance) return '0';
    
    try {
      return parseFloat(ethers.utils.formatUnits(balance, decimals))
        .toFixed(fixed)
        .replace(/\.?0+$/, ''); // Убираем лишние нули в конце
    } catch (error) {
      console.error('Ошибка форматирования баланса:', error);
      return '0';
    }
  }
};
