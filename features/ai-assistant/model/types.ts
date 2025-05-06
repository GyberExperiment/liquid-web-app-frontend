/**
 * Типы для ИИ-ассистента
 */

// Типы запросов к ассистенту
export enum AIAssistantRequestType {
  TRANSACTION_ANALYSIS = 'transaction_analysis',
  PORTFOLIO_ADVICE = 'portfolio_advice',
  MARKET_ANALYSIS = 'market_analysis',
  SECURITY_CHECK = 'security_check',
  TAX_ESTIMATION = 'tax_estimation',
  CUSTOM_QUESTION = 'custom_question',
}

// Параметры запроса к ассистенту
export interface AIAssistantRequest {
  type: AIAssistantRequestType;
  content: string;
  context?: {
    walletAddress?: string;
    transactions?: any[];
    balance?: string;
    tokens?: any[];
    chainId?: number;
    [key: string]: any;
  };
}

// Ответ от ассистента
export interface AIAssistantResponse {
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  recommendations?: string[];
  insights?: string[];
  loading: boolean;
  error?: string;
}

// Состояние ИИ
export interface AIAssistantState {
  isReady: boolean;
  isProcessing: boolean;
  conversation: {
    request: AIAssistantRequest;
    response: AIAssistantResponse;
  }[];
  error?: string;
}
