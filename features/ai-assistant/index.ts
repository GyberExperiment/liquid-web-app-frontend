/**
 * Публичное API для ИИ-ассистента
 */

// Модель
export { useAIAssistant } from './model';
export { AIAssistantRequestType } from './model/types';
export type { 
  AIAssistantRequest, 
  AIAssistantResponse, 
  AIAssistantState 
} from './model/types';

// UI-компоненты
export { default as AIAssistantChat } from './ui/AIAssistantChat';
export { default as AIPortfolioAdvisor } from './ui/AIPortfolioAdvisor';
