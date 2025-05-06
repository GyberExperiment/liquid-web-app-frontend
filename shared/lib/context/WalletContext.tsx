"use client";
import React from "react";
import { ethers } from "ethers";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isLoadingTransactions: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
  getTransactionHistory: () => Promise<Transaction[]>;
  refreshBalance: () => Promise<void>;
  formatAddress: (address: string | null) => string;
}

const defaultContext: WalletContextType = {
  isConnected: false,
  address: null,
  balance: null,
  chainId: null,
  isConnecting: false,
  isLoadingTransactions: false,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  sendTransaction: async () => null,
  getTransactionHistory: async () => [],
  refreshBalance: async () => {},
  formatAddress: () => '',
};

const WalletContext = React.createContext<WalletContextType>(defaultContext);

export const useWallet = () => React.useContext(WalletContext);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Получение баланса кошелька
  const getWalletBalance = async (address: string, provider: any) => {
    try {
      const balanceWei = await provider.getBalance(address);
      return formatEther(balanceWei);
    } catch (err) {
      console.error("Ошибка при получении баланса:", err);
      return "0.0";
    }
  };

  // Подключение к кошельку через MetaMask
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Проверяем наличие ethereum провайдера
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Запрашиваем доступ к аккаунтам пользователя
        const accounts = await provider.send("eth_requestAccounts", []);
        const userAddress = accounts[0];
        
        // Получаем баланс
        const userBalance = await getWalletBalance(userAddress, provider);
        
        // Получаем ID сети
        const network = await provider.getNetwork();
        const userChainId = Number(network.chainId);
        
        // Обновляем состояние
        setAddress(userAddress);
        setBalance(userBalance);
        setChainId(userChainId);
        setIsConnected(true);
        
        // Сохраняем в localStorage
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", userAddress);
      } else {
        throw new Error("MetaMask не обнаружен. Пожалуйста, установите расширение MetaMask");
      }
    } catch (err: any) {
      setError(err.message || "Ошибка подключения кошелька");
      console.error("Ошибка подключения:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setChainId(null);
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
  };

  // Отправка транзакции
  const sendTransaction = async (to: string, amount: string): Promise<string | null> => {
    try {
      if (!isConnected || !address) {
        throw new Error("Кошелек не подключен");
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Конвертируем amount в Wei
        const parsedAmount = ethers.parseEther(amount);
        
        // Отправляем транзакцию
        const tx = await signer.sendTransaction({
          to,
          value: parsedAmount
        });
        
        // Ожидаем выполнение транзакции
        const receipt = await tx.wait();
        
        // Обновляем баланс
        const newBalance = await getWalletBalance(address, provider);
        setBalance(newBalance);
        
        return tx.hash;
      } else {
        throw new Error("MetaMask не обнаружен");
      }
    } catch (err: any) {
      console.error("Ошибка при отправке транзакции:", err);
      setError(err.message || "Ошибка при отправке транзакции");
      return null;
    }
  };

  // Типы для транзакций
  interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
  }

  // Кеш для хранения транзакций
  const [transactionCache, setTransactionCache] = React.useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = React.useState(false);

  // Получение истории транзакций
  const getTransactionHistory = async (): Promise<Transaction[]> => {
    if (!address) return [];
    
    setIsLoadingTransactions(true);
    
    try {
      // Сначала проверяем кеш
      if (transactionCache.length > 0) {
        return transactionCache;
      }
      
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // В реальном проекте здесь будет вызов к API блокчейна
        // Для примера используем Etherscan API или Alchemy API
        
        // Пока используем фиктивные данные, но с реальной структурой
        const mockTransactions: Transaction[] = [
          {
            hash: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
            from: address,
            to: "0x4567890abcdef123456789abcdef123456789abcdef",
            value: "0.1",
            timestamp: new Date().toISOString(),
            status: "completed"
          },
          {
            hash: "0x234567890abcdef123456789abcdef123456789abcdef123456789abcdef1234",
            from: "0xabcdef123456789abcdef123456789abcdef123456",
            to: address as string,
            value: "0.25",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: "completed"
          },
          {
            hash: "0x345678901abcdef123456789abcdef123456789abcdef123456789abcdef1234",
            from: address,
            to: "0x567890abcdef123456789abcdef123456789abcdef",
            value: "0.05",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            status: "completed"
          }
        ];
        
        // Сохраняем транзакции в кеш
        setTransactionCache(mockTransactions);
        return mockTransactions;
      } else {
        throw new Error("MetaMask не обнаружен");
      }
    } catch (err: any) {
      console.error("Ошибка при получении истории транзакций:", err);
      setError(err.message || "Ошибка при получении истории транзакций");
      return [];
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Слушатели событий от провайдера
  React.useEffect(() => {
    const setupEventListeners = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Слушатель изменения аккаунтов
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            // Если пользователь отключил все кошельки
            disconnectWallet();
          } else {
            // Обновляем текущий адрес
            setAddress(accounts[0]);
            
            // Обновляем баланс
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            getWalletBalance(accounts[0], provider)
              .then(newBalance => setBalance(newBalance))
              .catch(err => console.error("Ошибка при обновлении баланса:", err));
          }
        });
        
        // Слушатель изменения сети
        window.ethereum.on('chainChanged', (chainId: string) => {
          setChainId(parseInt(chainId, 16));
        });
      }
    };
    
    if (isConnected) {
      setupEventListeners();
    }
    
    // Очистка слушателей при размонтировании
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [address]);

  // Проверяем, был ли кошелек подключен ранее
  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = localStorage.getItem("walletConnected");
      const savedAddress = localStorage.getItem("walletAddress");
      
      if (connected === "true" && savedAddress && typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Проверяем, существует ли сохраненный адрес в текущих аккаунтах
          const accounts = await provider.listAccounts();
          let accountExists = false;
          
          // Добавляем проверку на null/undefined
          if (savedAddress && accounts && accounts.length > 0) {
            accountExists = accounts.some((account: { address: string }) => 
              account && account.address && savedAddress && 
              account.address.toLowerCase() === savedAddress.toLowerCase()
            );
          }
          
          if (accountExists) {
            // Получаем информацию о сети
            const network = await provider.getNetwork();
            
            // Получаем баланс
            const userBalance = await getWalletBalance(savedAddress, provider);
            
            setAddress(savedAddress);
            setBalance(userBalance);
            setChainId(Number(network.chainId));
            setIsConnected(true);
          } else {
            // Сохраненный адрес больше не актуален
            disconnectWallet();
          }
        } catch (err) {
          console.error("Ошибка при восстановлении подключения:", err);
          disconnectWallet();
        }
      }
    };
    
    checkConnection();
  }, []);

  // Функция для обновления баланса
  const refreshBalance = async () => {
    if (!address || !isConnected) return;
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const newBalance = await getWalletBalance(address, provider);
        setBalance(newBalance);
      }
    } catch (err) {
      console.error("Ошибка при обновлении баланса:", err);
    }
  };

  // Функция для форматирования адреса (сокращение для отображения)
  const formatAddress = (addr: string | null): string => {
    if (!addr) return '';
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  };

  const value = {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    isLoadingTransactions,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getTransactionHistory,
    refreshBalance,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Добавляем типы в глобальную область видимости
declare global {
  interface Window {
    ethereum?: any;
  }
}
