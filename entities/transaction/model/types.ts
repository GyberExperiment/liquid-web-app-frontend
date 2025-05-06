/**
 * Типы для сущности "транзакция"
 */

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: TransactionStatus;
  chainId: number;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
  blockNumber?: number;
  note?: string;
  category?: TransactionCategory;
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum TransactionCategory {
  TRANSFER = 'transfer',
  SWAP = 'swap',
  CONTRACT_INTERACTION = 'contract_interaction',
  STAKING = 'staking',
  LENDING = 'lending',
  UNKNOWN = 'unknown'
}

export interface TransactionFilter {
  status?: TransactionStatus;
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  minValue?: string;
  maxValue?: string;
}

// Параметры для отправки транзакции
export interface SendTransactionParams {
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  nonce?: number;
  note?: string;
}
