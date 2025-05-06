"use client";
import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { ethers } from 'ethers';
import { useWalletStore, walletUtils } from '@/entities/wallet';
import { useSendTransaction, SendTransactionState, FormData } from '../model';

interface TransactionFormProps {
  className?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

const FormContainer = styled.div`
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  border-radius: 16px;
  padding: 24px;
  max-width: 480px;
  width: 100%;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 24px;
  color: #ffffff;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #a0a0c0;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #2a2a3c;
  border: 1px solid #3d3d56;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #6e45e1;
  }
  
  &::placeholder {
    color: #6c6c8b;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: #2a2a3c;
  border: 1px solid #3d3d56;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    border-color: #6e45e1;
  }
  
  &::placeholder {
    color: #6c6c8b;
  }
`;

const GasOptions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const GasOption = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 0;
  background: ${props => props.active ? '#6e45e1' : '#2a2a3c'};
  border: 1px solid ${props => props.active ? '#6e45e1' : '#3d3d56'};
  border-radius: 8px;
  color: ${props => props.active ? '#ffffff' : '#a0a0c0'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#6e45e1' : '#3d3d56'};
  }
`;

const ErrorMessage = styled.div`
  color: #ff5555;
  font-size: 14px;
  margin-top: 8px;
`;

const AdvancedOptionsToggle = styled.button`
  background: none;
  border: none;
  color: #a0a0c0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  margin-bottom: 16px;
  
  &:hover {
    color: #ffffff;
  }
`;

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
  color: #a0a0c0;
`;

const SubmitButton = styled.button<{ state: SendTransactionState }>`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: ${props => 
    props.state === SendTransactionState.CONFIRMING || 
    props.state === SendTransactionState.PENDING ? 'wait' : 'pointer'
  };
  
  background: ${props => {
    switch (props.state) {
      case SendTransactionState.SUCCESS:
        return '#4CAF50';
      case SendTransactionState.ERROR:
        return '#F44336';
      case SendTransactionState.CONFIRMING:
      case SendTransactionState.PENDING:
        return '#FFC107';
      default:
        return 'linear-gradient(90deg, #6e45e1 0%, #88d3ce 100%)';
    }
  }};
  
  color: white;
  border: none;
  outline: none;
  transition: all 0.2s ease;
  
  &:hover {
    ${props => 
      props.state !== SendTransactionState.CONFIRMING && 
      props.state !== SendTransactionState.PENDING && `
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(110, 69, 225, 0.4);
      `
    }
  }
  
  &:disabled {
    background: #3d3d56;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  margin-right: 8px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const TransactionSuccess = styled.div`
  padding: 16px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TransactionHash = styled.a`
  word-break: break-all;
  color: #4CAF50;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0a0c0;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const Value = styled.div`
  color: #ffffff;
  font-weight: 500;
`;

const TransactionForm: React.FC<TransactionFormProps> = ({
  className,
  onSuccess,
  onError
}) => {
  const { address, balance, chainId } = useWalletStore();
  const { 
    state, 
    transaction, 
    error, 
    sendTransaction, 
    getGasPrice, 
    estimateGas,
    resetState 
  } = useSendTransaction();
  
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    amount: '',
    note: '',
    gasPrice: '',
    gasLimit: ''
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gasPriceOptions, setGasPriceOptions] = useState<{ slow: string; average: string; fast: string } | null>(null);
  const [selectedGasOption, setSelectedGasOption] = useState<'slow' | 'average' | 'fast'>('average');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Загрузка цен на газ
  useEffect(() => {
    const loadGasPrice = async () => {
      const gasPrice = await getGasPrice();
      if (gasPrice) {
        setGasPriceOptions(gasPrice);
        setFormData(prev => ({
          ...prev,
          gasPrice: gasPrice.average
        }));
      }
    };
    
    if (address) {
      loadGasPrice();
    }
  }, [address, getGasPrice]);
  
  // Ресет формы при успешной отправке
  useEffect(() => {
    if (state === SendTransactionState.SUCCESS && transaction?.hash) {
      onSuccess?.(transaction.hash);
    } else if (state === SendTransactionState.ERROR && error) {
      onError?.(error);
    }
  }, [state, transaction, error, onSuccess, onError]);
  
  // Обработка изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError(null);
  };
  
  // Выбор опции газа
  const handleGasOptionSelect = (option: 'slow' | 'average' | 'fast') => {
    if (!gasPriceOptions) return;
    
    setSelectedGasOption(option);
    setFormData(prev => ({
      ...prev,
      gasPrice: gasPriceOptions[option]
    }));
  };
  
  // Оценка газа
  const handleEstimateGas = useCallback(async () => {
    const gas = await estimateGas(formData);
    if (gas) {
      const gasWithBuffer = Math.ceil(parseInt(gas) * 1.2).toString(); // +20% буфер
      setFormData(prev => ({ ...prev, gasLimit: gasWithBuffer }));
    }
  }, [estimateGas, formData]);
  
  // Валидация формы
  const validateForm = (): boolean => {
    if (!formData.recipient) {
      setValidationError('Введите адрес получателя');
      return false;
    }
    
    if (!ethers.utils.isAddress(formData.recipient)) {
      setValidationError('Некорректный адрес получателя');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setValidationError('Введите сумму для отправки');
      return false;
    }
    
    try {
      ethers.utils.parseEther(formData.amount);
    } catch (err) {
      setValidationError('Некорректный формат суммы');
      return false;
    }
    
    const amountInEther = ethers.utils.parseEther(formData.amount);
    const balanceInEther = balance ? ethers.BigNumber.from(balance) : ethers.BigNumber.from(0);
    
    if (amountInEther.gt(balanceInEther)) {
      setValidationError('Недостаточно средств');
      return false;
    }
    
    return true;
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await sendTransaction(formData);
  };
  
  // Сброс формы
  const handleReset = () => {
    setFormData({
      recipient: '',
      amount: '',
      note: '',
      gasPrice: gasPriceOptions ? gasPriceOptions.average : '',
      gasLimit: ''
    });
    setValidationError(null);
    resetState();
  };
  
  // Получение текста кнопки отправки
  const getSubmitButtonText = (): string => {
    switch (state) {
      case SendTransactionState.VALIDATING:
        return 'Валидация...';
      case SendTransactionState.CONFIRMING:
        return 'Подтвердите в кошельке...';
      case SendTransactionState.PENDING:
        return 'Ожидание подтверждения...';
      case SendTransactionState.SUCCESS:
        return 'Транзакция отправлена!';
      case SendTransactionState.ERROR:
        return 'Попробовать снова';
      default:
        return 'Отправить';
    }
  };
  
  // Получение ссылки на блок-эксплорер
  const getExplorerUrl = (hash: string): string => {
    const baseUrl = chainId === 1
      ? 'https://etherscan.io'
      : chainId === 11155111
        ? 'https://sepolia.etherscan.io'
        : chainId === 137
          ? 'https://polygonscan.com'
          : 'https://etherscan.io';
    
    return `${baseUrl}/tx/${hash}`;
  };
  
  const isFormDisabled = 
    state === SendTransactionState.CONFIRMING || 
    state === SendTransactionState.PENDING;
  
  return (
    <FormContainer className={className}>
      <Title>Отправить транзакцию</Title>
      
      {state === SendTransactionState.SUCCESS && transaction?.hash && (
        <TransactionSuccess>
          <div>Транзакция успешно отправлена! 🎉</div>
          <Row>
            <div>Хеш:</div>
            <TransactionHash
              href={getExplorerUrl(transaction.hash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transaction.hash.substring(0, 18)}...
            </TransactionHash>
          </Row>
          <Row>
            <div>Получатель:</div>
            <Value>{walletUtils.formatAddress(transaction.to)}</Value>
          </Row>
          <Row>
            <div>Сумма:</div>
            <Value>
              {walletUtils.formatBalance(transaction.value)} ETH
            </Value>
          </Row>
          <SubmitButton 
            state={state} 
            onClick={handleReset}
          >
            Новая транзакция
          </SubmitButton>
        </TransactionSuccess>
      )}
      
      {state !== SendTransactionState.SUCCESS && (
        <form onSubmit={handleSubmit}>
          <BalanceInfo>
            <div>Ваш баланс:</div>
            <div>{balance ? walletUtils.formatBalance(balance) : '0'} ETH</div>
          </BalanceInfo>
          
          <FormGroup>
            <Label htmlFor="recipient">Адрес получателя</Label>
            <Input
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0x..."
              disabled={isFormDisabled}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="amount">Сумма (ETH)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.0001"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.0"
              disabled={isFormDisabled}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="note">Примечание (опционально)</Label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Назначение платежа..."
              disabled={isFormDisabled}
            />
          </FormGroup>
          
          <AdvancedOptionsToggle 
            type="button" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isFormDisabled}
          >
            {showAdvanced ? '▼' : '▶'} Расширенные настройки
          </AdvancedOptionsToggle>
          
          {showAdvanced && (
            <>
              <FormGroup>
                <Label>Скорость транзакции</Label>
                <GasOptions>
                  {gasPriceOptions && (
                    <>
                      <GasOption
                        type="button"
                        active={selectedGasOption === 'slow'}
                        onClick={() => handleGasOptionSelect('slow')}
                        disabled={isFormDisabled}
                      >
                        Медленно<br/>
                        {gasPriceOptions.slow} Gwei
                      </GasOption>
                      <GasOption
                        type="button"
                        active={selectedGasOption === 'average'}
                        onClick={() => handleGasOptionSelect('average')}
                        disabled={isFormDisabled}
                      >
                        Средне<br/>
                        {gasPriceOptions.average} Gwei
                      </GasOption>
                      <GasOption
                        type="button"
                        active={selectedGasOption === 'fast'}
                        onClick={() => handleGasOptionSelect('fast')}
                        disabled={isFormDisabled}
                      >
                        Быстро<br/>
                        {gasPriceOptions.fast} Gwei
                      </GasOption>
                    </>
                  )}
                </GasOptions>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="gasLimit">
                  Лимит газа
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6e45e1',
                      marginLeft: '8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={handleEstimateGas}
                    disabled={isFormDisabled}
                  >
                    (рассчитать)
                  </button>
                </Label>
                <Input
                  id="gasLimit"
                  name="gasLimit"
                  value={formData.gasLimit}
                  onChange={handleInputChange}
                  placeholder="21000"
                  disabled={isFormDisabled}
                />
              </FormGroup>
            </>
          )}
          
          {(validationError || error) && (
            <ErrorMessage>
              {validationError || error}
            </ErrorMessage>
          )}
          
          <SubmitButton 
            type="submit" 
            state={state}
            disabled={!address || isFormDisabled}
          >
            {(state === SendTransactionState.CONFIRMING || state === SendTransactionState.PENDING) && (
              <LoadingSpinner />
            )}
            {getSubmitButtonText()}
          </SubmitButton>
        </form>
      )}
    </FormContainer>
  );
};

export default TransactionForm;
