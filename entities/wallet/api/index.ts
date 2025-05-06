import { ethers } from 'ethers';
import { WalletInfo, WalletConnectionStatus, WalletError } from '../model/types';

/**
 * API для работы с кошельком
 */
export const walletApi = {
  /**
   * Получение баланса кошелька
   */
  async getBalance(address: string, provider: ethers.providers.Provider | null): Promise<string | null> {
    if (!address || !provider) return null;
    
    try {
      const balance = await provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      return null;
    }
  },

  /**
   * Получение текущего chainId
   */
  async getChainId(provider: ethers.providers.Web3Provider | null): Promise<number | null> {
    if (!provider) return null;
    
    try {
      const network = await provider.getNetwork();
      return network.chainId;
    } catch (error) {
      console.error('Ошибка получения chainId:', error);
      return null;
    }
  },

  /**
   * Проверка наличия MetaMask
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  },

  /**
   * Получение кода сети (используется для отображения в UI)
   */
  getNetworkCode(chainId: number | null): string {
    switch (chainId) {
      case 1:
        return 'ETH';
      case 11155111:
        return 'SEP';
      case 137:
        return 'MATIC';
      default:
        return chainId ? `CHAIN:${chainId}` : 'UNKNOWN';
    }
  },

  /**
   * Запрос на смену сети
   */
  async switchNetwork(provider: ethers.providers.Web3Provider | null, chainId: number): Promise<boolean> {
    if (!provider || !window.ethereum) return false;
    
    try {
      const hexChainId = '0x' + chainId.toString(16);
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
      
      return true;
    } catch (error: any) {
      // Если сеть не добавлена в MetaMask, предлагаем добавить
      if (error.code === 4902) {
        try {
          await this.addNetwork(provider, chainId);
          return true;
        } catch (addError) {
          console.error('Ошибка добавления сети:', addError);
          return false;
        }
      }
      
      console.error('Ошибка смены сети:', error);
      return false;
    }
  },

  /**
   * Добавление новой сети в MetaMask
   */
  async addNetwork(provider: ethers.providers.Web3Provider, chainId: number): Promise<boolean> {
    if (!provider || !window.ethereum) return false;
    
    try {
      const networkParams = {
        1: {
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.infura.io/v3/'],
          blockExplorerUrls: ['https://etherscan.io']
        },
        11155111: {
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        },
        137: {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com']
        }
      }[chainId];

      if (!networkParams) return false;

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams]
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка добавления сети:', error);
      return false;
    }
  }
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
