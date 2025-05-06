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
   * Загрузка скрипта с указанного URL
   * @param url URL скрипта для загрузки
   * @returns Promise<boolean> - успешна ли загрузка
   */
  private loadScript(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        resolve(true);
      };
      
      script.onerror = () => {
        console.error(`Не удалось загрузить скрипт: ${url}`);
        resolve(false);
      };
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Инициализация сервиса и подключение к Puter API
   */
  public async initialize(): Promise<boolean> {
    // Если уже инициализирован, возвращаем true
    if (this.isInitialized) return true;
    
    // Проверка на браузерную среду
    if (typeof window === 'undefined') {
      console.warn('Не удалось инициализировать Puter API: не в браузере');
      return false;
    }
    
    // Проверка, уже загружен ли API
    if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
      this.isInitialized = true;
      return true;
    }
    
    // Если API ещё не загружен, пытаемся загрузить его
    try {
      // Загрузка скрипта Puter API
      const loaded = await this.loadScript(this.API_SCRIPT_URL);
      
      if (!loaded) {
        console.error('Не удалось загрузить Puter API');
        return false;
      }
      
      // Проверяем, загрузился ли необходимый функционал
      if (window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function') {
        this.isInitialized = true;
        return true;
      } else {
        console.error('Puter API загружен, но функционал AI недоступен');
        return false;
      }
    } catch (error) {
      console.error('Ошибка при инициализации Puter API:', error);
      return false;
    }
  }
  
  /**
   * Проверка инициализации API
   */
  private checkIsInitialized(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Проверяет инициализацию и при необходимости инициализирует сервис
   * @returns Promise<boolean> - успешна ли инициализация
   */
  public async ensureInitialized(): Promise<boolean> {
    if (this.isInitialized) return true;
    return this.initialize();
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
      // Проверяем, что window.puter доступен
      if (!window.puter || !window.puter.ai || typeof window.puter.ai.chat !== 'function') {
        console.error('Сервис AI недоступен или не инициализирован');
        return 'Извините, сервис AI временно недоступен. Пожалуйста, попробуйте позже.';
      }
      
      // Для демонстрации используем заглушку, если в дев-режиме
      if (process.env.NODE_ENV === 'development') {
        return `Ответ Claude 3.7 на запрос: "${prompt}". Это демо-режим.`;
      }

      const response = await window.puter.ai.chat(prompt, {
        model: this.MODEL,
        temperature: options?.temperature || 0.7,
        stream: false
      });
      
      // Проверяем, что ответ не является AsyncGenerator (не потоковый ответ)
      if (typeof response === 'object' && !('next' in response)) {
        // Проверяем наличие ответа и его формат
        const claudeResponse = response as { message?: { content?: Array<{ text: string }> } };
        
        if (!claudeResponse.message || !claudeResponse.message.content || !claudeResponse.message.content[0]) {
          return 'Получен пустой ответ от AI. Пожалуйста, попробуйте ещё раз.';
        }
        
        // Извлекаем текст из ответа согласно новому формату Claude 3.7
        return claudeResponse.message.content[0].text || 'Не удалось получить осмысленный ответ от AI.';
      } else {
        return 'Получен неправильный формат ответа от AI.';
      }
    } catch (error) {
      console.error('Ошибка при запросе к Claude 3.7:', error);
      // Возвращаем сообщение об ошибке вместо выбрасывания исключения
      return 'Произошла ошибка при обращении к AI. Пожалуйста, попробуйте позже.';
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
      // Проверяем инициализацию
      const initialized = await this.ensureInitialized();
      if (!initialized) {
        return {
          success: false,
          message: 'Сервис AI не инициализирован. Пожалуйста, перезагрузите страницу.',
          action: 'error'
        };
      }
      
      // Формируем запрос в зависимости от типа
      let prompt: string;
      
      // Для режима разработки возвращаем заглушку
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: `Демо-ответ на запрос по кошельку типа "${request.type}". В продакшен-режиме здесь будет ответ от Claude 3.7 Sonnet.`,
          action: request.type
        };
      }
      
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
        message: 'Не удалось получить рекомендации. Пожалуйста, попробуйте позже.',
        action: 'error'
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