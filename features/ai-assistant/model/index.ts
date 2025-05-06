import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { puterAI } from '@/shared/lib/ai/puterAI';
import { useWalletStore } from '@/entities/wallet';
import { AIAssistantRequest, AIAssistantResponse, AIAssistantRequestType, AIAssistantState } from './types';

// Store для состояния ассистента
export const useAIAssistantStore = create<AIAssistantState>((set) => ({
  isReady: false,
  isProcessing: false,
  conversation: [],
  
  // Инициализация ассистента
  initialize: async () => {
    try {
      set({ isProcessing: true });
      const initialized = await puterAI.initialize();
      set({ isReady: initialized, isProcessing: false });
      return initialized;
    } catch (error) {
      set({ 
        isReady: false, 
        isProcessing: false, 
        error: 'Не удалось инициализировать ИИ-ассистента'
      });
      return false;
    }
  },
  
  // Отправка запроса ассистенту
  sendRequest: async (request: AIAssistantRequest) => {
    try {
      set((state) => ({ 
        isProcessing: true,
        conversation: [
          ...state.conversation,
          { 
            request, 
            response: { content: '', loading: true } 
          }
        ]
      }));
      
      // Преобразуем запрос в промпт для LLM
      let prompt = '';
      switch (request.type) {
        case AIAssistantRequestType.TRANSACTION_ANALYSIS:
          prompt = `Проанализируй следующие транзакции кошелька ${request.context?.walletAddress} и дай рекомендации по оптимизации: ${request.content}`;
          break;
        case AIAssistantRequestType.PORTFOLIO_ADVICE:
          prompt = `На основе баланса ${request.context?.balance} ETH и токенов ${JSON.stringify(request.context?.tokens)}, предложи оптимальную стратегию диверсификации портфеля. ${request.content}`;
          break;
        case AIAssistantRequestType.MARKET_ANALYSIS:
          prompt = `Проанализируй текущее состояние крипторынка и дай прогноз по тренду. Особое внимание удели: ${request.content}`;
          break;
        case AIAssistantRequestType.SECURITY_CHECK:
          prompt = `Выполни проверку безопасности кошелька ${request.context?.walletAddress} и оцени риски. ${request.content}`;
          break;
        case AIAssistantRequestType.TAX_ESTIMATION:
          prompt = `На основе транзакций ${JSON.stringify(request.context?.transactions)} оцени возможные налоговые обязательства. ${request.content}`;
          break;
        case AIAssistantRequestType.CUSTOM_QUESTION:
        default:
          prompt = request.content;
      }
      
      // Дополняем промпт инструкциями по формату ответа
      prompt += '\n\nОтвет дай в следующем формате:\n1. Краткое резюме\n2. Детальный анализ\n3. Конкретные рекомендации';
      
      // Отправляем запрос к AI
      const response = await puterAI.getWalletAssistance({
        type: 'advice',
        note: request.type
      });
      
      // Обрабатываем ответ
      if (response.success) {
        // Простой парсинг для выделения рекомендаций
        const recommendations = extractRecommendations(response.message);
        const insights = extractInsights(response.message);
        const sentiment = analyzeSentiment(response.message);
        
        set((state) => {
          const newConversation = [...state.conversation];
          const lastIndex = newConversation.length - 1;
          
          if (lastIndex >= 0) {
            newConversation[lastIndex].response = {
              content: response.message,
              recommendations,
              insights,
              sentiment,
              loading: false
            };
          }
          
          return {
            isProcessing: false,
            conversation: newConversation
          };
        });
      } else {
        set((state) => {
          const newConversation = [...state.conversation];
          const lastIndex = newConversation.length - 1;
          
          if (lastIndex >= 0) {
            newConversation[lastIndex].response = {
              content: 'Не удалось получить ответ от ИИ-ассистента',
              loading: false,
              error: response.message
            };
          }
          
          return {
            isProcessing: false,
            conversation: newConversation,
            error: response.message
          };
        });
      }
    } catch (error) {
      set((state) => {
        const newConversation = [...state.conversation];
        const lastIndex = newConversation.length - 1;
        
        if (lastIndex >= 0) {
          newConversation[lastIndex].response = {
            content: 'Произошла ошибка при обработке запроса',
            loading: false,
            error: error.message
          };
        }
        
        return {
          isProcessing: false,
          conversation: newConversation,
          error: error.message
        };
      });
    }
  },
  
  // Очистка истории разговора
  clearConversation: () => {
    set({ conversation: [] });
  }
}));

// Хук для использования AI ассистента в компонентах
export const useAIAssistant = () => {
  const aiStore = useAIAssistantStore();
  const { address, balance, chainId } = useWalletStore();
  
  // Извлечение последнего ответа
  const getLastResponse = useCallback((): AIAssistantResponse | null => {
    const conversation = aiStore.conversation;
    if (conversation.length === 0) return null;
    
    return conversation[conversation.length - 1].response;
  }, [aiStore.conversation]);
  
  // Отправка запроса с автоматическим добавлением контекста кошелька
  const sendRequest = useCallback(async (
    type: AIAssistantRequestType,
    content: string,
    additionalContext?: Record<string, any>
  ) => {
    const request: AIAssistantRequest = {
      type,
      content,
      context: {
        walletAddress: address,
        balance,
        chainId,
        ...additionalContext
      }
    };
    
    await aiStore.sendRequest(request);
  }, [address, balance, chainId, aiStore]);
  
  return {
    isReady: aiStore.isReady,
    isProcessing: aiStore.isProcessing,
    error: aiStore.error,
    conversation: aiStore.conversation,
    initialize: aiStore.initialize,
    sendRequest,
    getLastResponse,
    clearConversation: aiStore.clearConversation
  };
};

// Вспомогательные функции для обработки ответов AI
function extractRecommendations(text: string): string[] {
  // Пытаемся найти секцию с рекомендациями
  const recommendationsRegex = /(?:рекомендации|советы|предложения)[\s\n:]*(.+?)(?=\n\n|$)/si;
  const match = text.match(recommendationsRegex);
  
  if (!match || !match[1]) return [];
  
  // Разбиваем на отдельные рекомендации
  return match[1]
    .split(/\n[-*•]|\.\s+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function extractInsights(text: string): string[] {
  // Пытаемся найти инсайты или аналитику
  const insightsRegex = /(?:анализ|выводы|наблюдения|аналитика)[\s\n:]*(.+?)(?=\n\n|$)/si;
  const match = text.match(insightsRegex);
  
  if (!match || !match[1]) return [];
  
  // Разбиваем на отдельные инсайты
  return match[1]
    .split(/\n[-*•]|\.\s+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['рост', 'увеличение', 'прибыль', 'выгода', 'оптимизация', 'улучшение', 'позитивный', 'положительный'];
  const negativeWords = ['падение', 'снижение', 'риск', 'опасность', 'убыток', 'негативный', 'отрицательный', 'проблема'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Подсчитываем положительные и отрицательные слова
  for (const word of positiveWords) {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  }
  
  for (const word of negativeWords) {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  }
  
  // Определяем тональность
  if (positiveCount > negativeCount * 1.5) return 'positive';
  if (negativeCount > positiveCount * 1.5) return 'negative';
  return 'neutral';
}
