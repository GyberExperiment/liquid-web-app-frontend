import { ethers } from 'ethers';
import { useState, useCallback } from 'react';
import { useWalletStore } from '@/entities/wallet';
import { SendTransactionParams, Transaction, TransactionStatus } from '@/entities/transaction/model/types';

export interface SendTransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export enum SendTransactionState {
  IDLE = 'idle',
  VALIDATING = 'validating',
  CONFIRMING = 'confirming',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface FormData {
  recipient: string;
  amount: string;
  note?: string;
  gasPrice?: string;
  gasLimit?: string;
}

// Хук для отправки транзакций
export const useSendTransaction = () => {
  const { address, provider, signer } = useWalletStore();
  const [state, setState] = useState<SendTransactionState>(SendTransactionState.IDLE);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Валидация формы
  const validateForm = useCallback((data: FormData): string | null => {
    if (!data.recipient || !ethers.utils.isAddress(data.recipient)) {
      return 'Указан недействительный адрес получателя';
    }

    if (!data.amount || parseFloat(data.amount) <= 0) {
      return 'Укажите корректную сумму для отправки';
    }

    try {
      // Проверяем, что сумма может быть конвертирована в ethers.BigNumber
      ethers.utils.parseEther(data.amount);
    } catch (err) {
      return 'Некорректный формат суммы';
    }

    return null;
  }, []);

  // Отправка транзакции
  const sendTransaction = useCallback(async (data: FormData): Promise<SendTransactionResult> => {
    if (!address || !signer) {
      return { success: false, error: 'Кошелек не подключен' };
    }

    setState(SendTransactionState.VALIDATING);
    setError(null);

    // Валидация формы
    const validationError = validateForm(data);
    if (validationError) {
      setState(SendTransactionState.ERROR);
      setError(validationError);
      return { success: false, error: validationError };
    }

    try {
      setState(SendTransactionState.CONFIRMING);

      // Создаем транзакцию
      const tx = {
        to: data.recipient,
        value: ethers.utils.parseEther(data.amount),
        gasPrice: data.gasPrice ? ethers.utils.parseUnits(data.gasPrice, 'gwei') : undefined,
        gasLimit: data.gasLimit ? ethers.utils.hexlify(parseInt(data.gasLimit)) : undefined
      };

      // Отправляем транзакцию
      const transaction = await signer.sendTransaction(tx);
      
      setState(SendTransactionState.PENDING);
      
      // Создаем объект транзакции для UI
      const createdTransaction: Transaction = {
        hash: transaction.hash,
        from: address,
        to: data.recipient,
        value: ethers.utils.parseEther(data.amount).toString(),
        timestamp: new Date().toISOString(),
        status: TransactionStatus.PENDING,
        chainId: (await provider?.getNetwork())?.chainId || 0,
        gasPrice: transaction.gasPrice?.toString(),
        gas: transaction.gasLimit?.toString(),
        note: data.note
      };
      
      setTransaction(createdTransaction);

      // Ожидаем подтверждения
      const receipt = await transaction.wait();
      
      // Обновляем статус
      const confirmedTransaction: Transaction = {
        ...createdTransaction,
        status: receipt.status === 1 ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
        blockNumber: receipt.blockNumber
      };
      
      setTransaction(confirmedTransaction);
      setState(receipt.status === 1 ? SendTransactionState.SUCCESS : SendTransactionState.ERROR);
      
      return { 
        success: receipt.status === 1, 
        transactionHash: transaction.hash,
        error: receipt.status !== 1 ? 'Транзакция не подтверждена' : undefined
      };
    } catch (err: any) {
      console.error('Ошибка отправки транзакции:', err);
      
      setState(SendTransactionState.ERROR);
      
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  }, [address, provider, signer, validateForm]);

  // Оценка газа для транзакции
  const estimateGas = useCallback(async (data: FormData): Promise<string | null> => {
    if (!address || !provider || !data.recipient || !data.amount) {
      return null;
    }

    try {
      const gasEstimate = await provider.estimateGas({
        from: address,
        to: data.recipient,
        value: ethers.utils.parseEther(data.amount)
      });

      return gasEstimate.toString();
    } catch (err) {
      console.error('Ошибка оценки газа:', err);
      return null;
    }
  }, [address, provider]);

  // Получение текущей цены газа
  const getGasPrice = useCallback(async (): Promise<{ slow: string; average: string; fast: string } | null> => {
    if (!provider) return null;

    try {
      const gasPrice = await provider.getGasPrice();
      const gasPriceInGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      
      return {
        slow: (gasPriceInGwei * 0.8).toFixed(2),
        average: gasPriceInGwei.toFixed(2),
        fast: (gasPriceInGwei * 1.2).toFixed(2)
      };
    } catch (err) {
      console.error('Ошибка получения цены газа:', err);
      return null;
    }
  }, [provider]);

  // Расшифровка сообщений ошибок
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    const message = error.message || 'Неизвестная ошибка';
    
    // Известные ошибки MetaMask
    if (message.includes('user rejected')) {
      return 'Транзакция отклонена пользователем';
    }
    
    if (message.includes('insufficient funds')) {
      return 'Недостаточно средств для выполнения транзакции';
    }
    
    if (message.includes('nonce')) {
      return 'Ошибка nonce: попробуйте сбросить аккаунт в MetaMask';
    }
    
    if (message.includes('gas')) {
      return 'Ошибка с лимитом газа или ценой газа';
    }
    
    return message;
  };

  // Сброс состояния
  const resetState = useCallback(() => {
    setState(SendTransactionState.IDLE);
    setTransaction(null);
    setError(null);
  }, []);

  return {
    state,
    transaction,
    error,
    sendTransaction,
    estimateGas,
    getGasPrice,
    resetState
  };
};
