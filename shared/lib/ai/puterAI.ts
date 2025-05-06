"use client";

/**
 * Модуль для работы только с Claude 3.7 Sonnet и распознаванием речи через Puter API v2
 * Основано на документации: https://developer.puter.com/tutorials/free-unlimited-claude-37-sonnet-api
 */

// Типы для работы с Claude API
export interface ClaudeOptions {
  model?: string; // По умолчанию 'claude-3-7-sonnet'
  stream?: boolean; // Потоковая передача
  temperature?: number; // 0-1
}

// Тип для частей стримингового ответа
export interface StreamPart {
  text?: string;
  done?: boolean;
}

// Типы для работы с кошельком через AI
export interface WalletAIRequest {
  type: 'connect' | 'balance' | 'send' | 'help' | 'analytics' | 'advice';
  amount?: string;
  address?: string;
  currency?: string;
  note?: string;
}

export interface WalletAIResponse {
  success: boolean;
  message: string;
  action?: string;
  data?: any;
}

// Тип для результата распознавания речи
export interface SpeechRecognitionResult {
  success: boolean;
  text: string;
  error?: string;
}

// Объявление типов для Puter API
declare global {
  interface Window {
    puter?: {
      ai: {
        // Метод для обращения к Claude 3.7
        chat: (prompt: string, options?: ClaudeOptions | string) => Promise<{
          message: {
            content: [{ text: string }]
          }
        } | AsyncGenerator<StreamPart, void, unknown>>;
        
        // Модуль распознавания речи (если доступен)
        speech?: {
          recognize?: (audioBlob: Blob) => Promise<string>;
        };
      };
      
      // Вспомогательный метод для вывода текста
      print?: (content: string) => void;
    };
  }
  
  // MediaDevices API уже определен в стандартных типах TypeScript
}

/**
 * Сервис для работы с Claude 3.7 Sonnet через Puter API
 */
export class PuterAIService {
  private static instance: PuterAIService;
  private isInitialized = false;
  
  // Константы
  private readonly MODEL = 'claude-3-7-sonnet';
  private readonly API_SCRIPT_URL = 'https://js.puter.com/v2/';

  private constructor() {}

  /**
   * Получение экземпляра сервиса (синглтон)
   */
  public static getInstance(): PuterAIService {
    if (!PuterAIService.instance) {
      PuterAIService.instance = new PuterAIService();
    }
    return PuterAIService.instance;
  }

  /**
   * Инициализация Puter API
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    return new Promise((resolve) => {
      // Проверка на браузерную среду
      if (typeof window === 'undefined') {
        console.warn('Не удалось инициализировать Puter API: не в браузере');
        return resolve(false);
      }
      
      // Проверка, уже загружен ли API
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        this.isInitialized = true;
        return resolve(true);
      }

      try {
        // Загрузка скрипта Puter API
        const script = document.createElement('script');
        script.src = this.API_SCRIPT_URL;
        script.async = true;
        
        script.onload = () => {
          if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
            this.isInitialized = true;
            resolve(true);
          } else {
            console.error('Puter API загружен, но функционал AI недоступен');
            resolve(false);
          }
        };
        
        script.onerror = () => {
          console.error('Не удалось загрузить Puter API');
          resolve(false);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Ошибка при загрузке Puter API:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Проверка инициализации API
   */
  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized) {
      return await this.initialize();
    }
    return true;
  }
  
  /**
   * Проверка доступности распознавания речи
   */
  private isSpeechRecognitionAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 
             !!window.puter && 
             !!window.puter.ai && 
             !!window.puter.ai.speech &&
             typeof window.puter.ai.speech.recognize === 'function';
    } catch (error) {
      console.error('Ошибка при проверке доступности распознавания речи:', error);
      return false;
    }
  }
  
  /**
   * Получение ответа от Claude 3.7
   * @param prompt Запрос к AI
   * @param options Дополнительные опции
   */
  public async getAssistance(prompt: string, options?: Partial<ClaudeOptions>): Promise<string> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      throw new Error('Сервис AI не инициализирован');
    }
    
    if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') {
      throw new Error('API Puter недоступен');
    }
    
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: this.MODEL,
        temperature: options?.temperature || 0.7,
        stream: false
      });
      
      // Извлекаем текст из ответа согласно новому формату Claude 3.7
      return (response as any).message.content[0].text;
    } catch (error) {
      console.error('Ошибка при запросе к Claude 3.7:', error);
      throw error;
    }
  }
  
  /**
   * Получение потокового ответа от Claude 3.7
   * @param prompt Запрос к AI
   * @param options Дополнительные опции
   */
  public async getStreamingAssistance(prompt: string, options?: Partial<ClaudeOptions>): Promise<AsyncGenerator<StreamPart, void, unknown> | null> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.error('Сервис AI не инициализирован');
      return null;
    }
    
    if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') {
      console.error('API Puter недоступен');
      return null;
    }
    
    try {
      const response = await window.puter.ai.chat(prompt, {
        model: this.MODEL,
        temperature: options?.temperature || 0.7,
        stream: true
      });
      
      return response as AsyncGenerator<StreamPart, void, unknown>;
    } catch (error) {
      console.error('Ошибка при потоковом запросе к Claude 3.7:', error);
      return null;
    }
  }
  
  /**
   * Получение консультации по кошельку от AI
   * @param request Запрос информации
   */
  public async getWalletAssistance(request: WalletAIRequest): Promise<WalletAIResponse> {
    try {
      // Формируем запрос в зависимости от типа
      let prompt: string;
      
      switch (request.type) {
        case 'connect':
          prompt = 'Объясни, как подключить криптокошелек и какие преимущества это дает';
          break;
        case 'balance':
          prompt = `Проанализируй текущий баланс кошелька и предложи стратегии управления активами`;
          break;
        case 'send':
          prompt = `Я хочу отправить ${request.amount || 'некоторое количество'} ${request.currency || 'криптовалюты'} на адрес ${request.address || ''}. Какие комиссии ожидать и как обеспечить безопасность?`;
          break;
        case 'analytics':
          prompt = 'Проанализируй мои транзакции и предложи улучшения для финансового управления';
          break;
        case 'advice':
          prompt = 'Дай советы по безопасному хранению криптовалюты и минимизации рисков';
          break;
        case 'help':
        default:
          prompt = 'Объясни основные функции криптокошелька и как их использовать эффективно';
      }
      
      // Добавляем контекст запроса, если есть
      if (request.note) {
        prompt += `\n\nДополнительная информация: ${request.note}`;
      }
      
      // Получаем ответ от Claude 3.7
      const message = await this.getAssistance(prompt);
      
      return {
        success: true,
        message,
        action: request.type
      };
    } catch (error) {
      console.error('Ошибка при получении рекомендаций по кошельку:', error);
      return {
        success: false,
        message: 'Не удалось получить рекомендации. Пожалуйста, попробуйте позже.'
      };
    }
  }
  
  /**
   * Распознавание речи (если API доступно)
   * @param audioBlob Аудиофайл для распознавания
   */
  public async recognizeSpeech(audioBlob: Blob): Promise<SpeechRecognitionResult> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      return {
        success: false,
        text: '',
        error: 'Сервис AI не инициализирован'
      };
    }
    
    // Проверяем доступность API распознавания речи
    if (!this.isSpeechRecognitionAvailable()) {
      return {
        success: false,
        text: '',
        error: 'API распознавания речи недоступно'
      };
    }
    
    try {
      // @ts-ignore - знаем, что метод существует из проверки выше
      const text = await window.puter.ai.speech.recognize(audioBlob);
      
      return {
        success: true,
        text
      };
    } catch (error) {
      console.error('Ошибка при распознавании речи:', error);
      return {
        success: false,
        text: '',
        error: 'Ошибка при распознавании речи'
      };
    }
  }
  
  /**
   * Запись аудио с микрофона для распознавания речи
   * @param durationMs Продолжительность записи в миллисекундах
   */
  public async recordSpeech(durationMs = 5000): Promise<SpeechRecognitionResult> {
    // Проверяем, доступен ли браузерный API для записи
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        success: false,
        text: '',
        error: 'API записи аудио недоступно в этой среде'
      };
    }
    
    try {
      // Запрашиваем доступ к микрофону
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Создаем рекордер
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      // Настраиваем обработчики событий
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });
      
      // Начинаем запись
      mediaRecorder.start();
      
      // Ждем указанное время, затем останавливаем запись
      await new Promise(resolve => setTimeout(resolve, durationMs));
      mediaRecorder.stop();
      
      // Ждем, пока получим все данные
      const audioBlob = await new Promise<Blob>((resolve) => {
        mediaRecorder.addEventListener('stop', () => {
          // Останавливаем все треки
          stream.getTracks().forEach(track => track.stop());
          
          // Формируем блоб из всех чанков
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve(audioBlob);
        });
      });
      
      // Отправляем блоб на распознавание
      return await this.recognizeSpeech(audioBlob);
    } catch (error) {
      console.error('Ошибка при записи аудио:', error);
      return {
        success: false,
        text: '',
        error: 'Не удалось записать аудио с микрофона'
      };
    }
  }
}  

// Экспортируем экземпляр сервиса
export const puterAI = PuterAIService.getInstance();