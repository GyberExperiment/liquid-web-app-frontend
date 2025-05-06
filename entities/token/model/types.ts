/**
 * Типы для сущности токенов
 */

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  price?: {
    usd: number;
    change24h?: number;
  };
  logoUrl?: string;
  type: TokenType;
}

export enum TokenType {
  NATIVE = 'native',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155'
}

export interface TokenBalance {
  token: Token;
  balance: string;
  formattedBalance: string;
  valueUsd?: number;
}

export interface TokensState {
  tokens: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export interface TokenFilter {
  type?: TokenType;
  minBalance?: string;
  search?: string;
}

export interface TokenPriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface TokenTransferEvent {
  tokenAddress: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  transactionHash: string;
}

export interface PopularToken {
  address: string;
  symbol: string;
  name: string;
  logoUrl: string;
  type: TokenType;
  popularity: number; // Относительная популярность (0-100)
}

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  socialLinks?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
  };
}
