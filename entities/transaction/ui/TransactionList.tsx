"use client";
import React from 'react';
import styled from '@emotion/styled';
import { Transaction, TransactionStatus } from '../model/types';
import { walletUtils } from '@/entities/wallet';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  withAIInsights?: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
`;

const TransactionCard = styled.div`
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  border-radius: 12px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const TransactionIcon = styled.div<{ status: TransactionStatus }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  
  ${({ status }) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'background-color: rgba(76, 175, 80, 0.2); color: #4CAF50;';
      case TransactionStatus.PENDING:
        return 'background-color: rgba(255, 193, 7, 0.2); color: #FFC107;';
      case TransactionStatus.FAILED:
        return 'background-color: rgba(244, 67, 54, 0.2); color: #F44336;';
      default:
        return 'background-color: rgba(158, 158, 158, 0.2); color: #9E9E9E;';
    }
  }}
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TransactionHash = styled.a`
  color: #88d3ce;
  font-family: monospace;
  font-size: 14px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TransactionAddresses = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #a0a0c0;
`;

const Address = styled.span`
  font-family: monospace;
`;

const Arrow = styled.span`
  color: #6e45e1;
`;

const TransactionDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const Amount = styled.div`
  font-size: 18px;
  font-weight: 600;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: #a0a0c0;
`;

const StatusBadge = styled.div<{ status: TransactionStatus }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 4px;
  
  ${({ status }) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'background-color: rgba(76, 175, 80, 0.2); color: #4CAF50;';
      case TransactionStatus.PENDING:
        return 'background-color: rgba(255, 193, 7, 0.2); color: #FFC107;';
      case TransactionStatus.FAILED:
        return 'background-color: rgba(244, 67, 54, 0.2); color: #F44336;';
      default:
        return 'background-color: rgba(158, 158, 158, 0.2); color: #9E9E9E;';
    }
  }}
`;

const Note = styled.div`
  font-size: 14px;
  color: #a0a0c0;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const AIInsight = styled.div`
  background-color: rgba(110, 69, 225, 0.1);
  border-left: 3px solid #6e45e1;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 14px;
  color: #d1d1e0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #6e45e1;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #F44336;
  text-align: center;
  padding: 20px;
  background: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #a0a0c0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

// Генерация ИИ-инсайта для транзакции
const generateAIInsight = (transaction: Transaction): string => {
  // В реальном приложении здесь был бы настоящий ИИ-анализ,
  // но для примера используем простую логику
  const insights = [
    'Эта транзакция имеет высокий приоритет, что привело к повышенной комиссии. Рекомендуется планировать транзакции на периоды с низкой загрузкой сети для экономии.',
    'Замечена регулярная активность с этим адресом. Возможно, стоит настроить автоматические транзакции для удобства.',
    'Эта транзакция происходила во время высокой волатильности рынка. Рекомендуется анализировать рыночные условия перед крупными операциями.',
    'Данная транзакция имеет оптимальные параметры газа, что демонстрирует эффективное использование ресурсов сети.',
    'Стоимость газа для этой транзакции выше среднего. В будущем используйте инструменты прогнозирования газа для выбора оптимального времени транзакции.'
  ];
  
  // Выбор инсайта на основе хеша транзакции для стабильности
  const hashSum = transaction.hash
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  
  return insights[hashSum % insights.length];
};

// Форматирование даты транзакции
const formatDate = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return timestamp;
  }
};

// Получение иконки для статуса транзакции
const getStatusIcon = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return '✓';
    case TransactionStatus.PENDING:
      return '⏳';
    case TransactionStatus.FAILED:
      return '✕';
    default:
      return '?';
  }
};

// Получение текста статуса
const getStatusText = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return 'Выполнено';
    case TransactionStatus.PENDING:
      return 'В обработке';
    case TransactionStatus.FAILED:
      return 'Ошибка';
    default:
      return 'Неизвестно';
  }
};

// Получение ссылки на блок-эксплорер
const getExplorerUrl = (hash: string, chainId?: number): string => {
  const baseUrl = chainId === 1
    ? 'https://etherscan.io'
    : chainId === 11155111
      ? 'https://sepolia.etherscan.io'
      : chainId === 137
        ? 'https://polygonscan.com'
        : 'https://etherscan.io';
  
  return `${baseUrl}/tx/${hash}`;
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  error,
  className,
  withAIInsights = false
}) => {
  if (isLoading) {
    return (
      <LoadingContainer className={className}>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <ErrorMessage className={className}>
        {error}
      </ErrorMessage>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState className={className}>
        Транзакции не найдены.
      </EmptyState>
    );
  }
  
  return (
    <Container className={className}>
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.hash}>
          <TransactionIcon status={transaction.status}>
            {getStatusIcon(transaction.status)}
          </TransactionIcon>
          
          <TransactionInfo>
            <TransactionHash
              href={getExplorerUrl(transaction.hash, transaction.chainId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transaction.hash.substring(0, 20)}...
            </TransactionHash>
            
            <TransactionAddresses>
              <Address>{walletUtils.formatAddress(transaction.from)}</Address>
              <Arrow>→</Arrow>
              <Address>{walletUtils.formatAddress(transaction.to)}</Address>
            </TransactionAddresses>
            
            {transaction.note && (
              <Note>{transaction.note}</Note>
            )}
            
            {withAIInsights && (
              <AIInsight>
                <strong>💡 ИИ-инсайт:</strong> {generateAIInsight(transaction)}
              </AIInsight>
            )}
          </TransactionInfo>
          
          <TransactionDetails>
            <Amount>{walletUtils.formatBalance(transaction.value)} ETH</Amount>
            <Timestamp>{formatDate(transaction.timestamp)}</Timestamp>
            <StatusBadge status={transaction.status}>
              {getStatusText(transaction.status)}
            </StatusBadge>
          </TransactionDetails>
        </TransactionCard>
      ))}
    </Container>
  );
};

export default TransactionList;
