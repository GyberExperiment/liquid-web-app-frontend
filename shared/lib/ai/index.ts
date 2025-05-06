/**
 * @deprecated Импортируйте из @/features/ai-integration вместо shared/lib/ai
 * Переходный модуль для обеспечения обратной совместимости
 */

// Реэкспорт из нового местоположения
export { puterAI } from '@/features/ai-integration';

// Экспорт типов через export type
export type { 
  ClaudeOptions, 
  StreamPart, 
  WalletAIRequest, 
  WalletAIResponse,
  SpeechRecognitionResult 
} from '@/features/ai-integration';
