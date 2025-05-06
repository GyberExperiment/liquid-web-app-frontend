import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useWalletStore, walletApi, WalletConnectionStatus, WalletError } from '@/entities/wallet';

export const useWalletConnect = () => {
  const {
    address, 
    chainId, 
    balance, 
    isConnected, 
    status, 
    error,
    setWalletInfo, 
    setStatus, 
    setProvider, 
    setSigner, 
    reset
  } = useWalletStore();

  // Подключение кошелька
  const connectWallet = useCallback(async () => {
    if (status === WalletConnectionStatus.CONNECTING) return;
    
    // Проверяем наличие MetaMask
    if (!walletApi.isMetaMaskInstalled()) {
      setStatus(WalletConnectionStatus.ERROR, WalletError.WALLET_NOT_INSTALLED);
      return;
    }
    
    try {
      setStatus(WalletConnectionStatus.CONNECTING);
      
      // Запрашиваем доступ к аккаунтам
      const provider = walletApi.getProvider();
      if (!provider) {
        throw new Error('Не удалось получить Web3 провайдер');
      }
      
      // Запрашиваем аккаунты
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const chainId = await walletApi.getChainId(provider);
      const balance = await walletApi.getBalance(address, provider);
      
      // Сохраняем состояние
      setProvider(provider);
      setSigner(signer);
      setWalletInfo({
        address,
        chainId,
        balance,
        isConnected: true
      });
      setStatus(WalletConnectionStatus.CONNECTED);
      
      // Подписываемся на события MetaMask
      setupEventListeners();
      
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      setStatus(
        WalletConnectionStatus.ERROR, 
        error.code === 4001 
          ? WalletError.CONNECTION_REJECTED 
          : WalletError.UNKNOWN_ERROR
      );
      disconnectWallet();
    }
  }, [status, setStatus, setProvider, setSigner, setWalletInfo]);

  // Отключение кошелька
  const disconnectWallet = useCallback(() => {
    reset();
    removeEventListeners();
  }, [reset]);

  // Обновление баланса
  const refreshBalance = useCallback(async () => {
    if (!address || !isConnected) return;
    
    try {
      const provider = walletApi.getProvider();
      const balance = await walletApi.getBalance(address, provider);
      
      if (balance) {
        setWalletInfo({ balance });
      }
    } catch (error) {
      console.error('Ошибка при обновлении баланса:', error);
    }
  }, [address, isConnected, setWalletInfo]);

  // Установка слушателей событий
  const setupEventListeners = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Пользователь отключил аккаунт в MetaMask
        disconnectWallet();
      } else if (accounts[0] !== address) {
        // Пользователь сменил аккаунт
        connectWallet();
      }
    };
    
    const handleChainChanged = (chainIdHex: string) => {
      // При смене сети в MetaMask перезагружаем страницу (рекомендация MetaMask)
      window.location.reload();
    };
    
    const handleDisconnect = (error: { code: number; message: string }) => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [address, connectWallet, disconnectWallet]);
  
  // Удаление слушателей событий
  const removeEventListeners = () => {
    if (typeof window === 'undefined' || !window.ethereum?.removeListener) return;
    
    window.ethereum.removeListener('accountsChanged', () => {});
    window.ethereum.removeListener('chainChanged', () => {});
    window.ethereum.removeListener('disconnect', () => {});
  };

  // Смена сети
  const switchNetwork = useCallback(async (chainId: number) => {
    const provider = walletApi.getProvider();
    const result = await walletApi.switchNetwork(provider, chainId);
    
    if (result) {
      // При смене сети в MetaMask мы получим событие chainChanged,
      // которое перезагрузит страницу
      return true;
    }
    
    return false;
  }, []);

  return {
    address,
    chainId,
    balance,
    isConnected,
    status,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    switchNetwork
  };
};
