"use client";
import React from "react";
import { useWallet } from "@/shared/lib/context/WalletContext";
import { puterAI, WalletAIRequest, WalletAIResponse } from "@/shared/lib/ai";

import {
  Container,
  Header,
  Body,
  Footer,
  Input,
  SendButton,
  MessageContainer,
  UserMessage,
  AIMessage,
  TypingIndicator,
  AssistantAvatar,
  UserAvatar,
  QuickActionsContainer,
  QuickActionButton,
  ToggleButton,
  HeaderTitle,
  MessageContent,
  MessageTime,
  SuggestionChip,
  SuggestionsContainer,
  VoiceButton,
  ErrorContainer,
  ErrorMessage,
  MarkdownContent
} from "./styles";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  isMarkdown?: boolean;
}

interface SuggestionItem {
  text: string;
  type: WalletAIRequest["type"];
}

export const AIAssistant: React.FC = () => {
  const { address, balance, chainId, isConnected } = useWallet();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestionItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingResponse]);

  // Фокусировка на поле ввода при открытии чата
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Инициализация AI при первой загрузке компонента
  React.useEffect(() => {
    const initAI = async () => {
      try {
        await puterAI.initialize();
        
        // Добавляем приветственное сообщение
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: "Привет! Я AI-помощник по управлению криптовалютным кошельком. Чем я могу помочь?",
          sender: "ai" as const,
          timestamp: new Date(),
          isMarkdown: true
        };
        
        setMessages((prev: Message[]) => [welcomeMessage]);
        
        // Генерируем начальные предложения в зависимости от статуса кошелька
        generateContextualSuggestions();
      } catch (error) {
        console.error("Ошибка при инициализации AI:", error);
        setError("Не удалось инициализировать AI-помощника. Проверьте подключение к интернету.");
      }
    };
    
    initAI();
  }, []);

  // Обновляем предложения при изменении состояния кошелька
  React.useEffect(() => {
    generateContextualSuggestions();
  }, [isConnected, address, balance, chainId]);

  // Генерация контекстуальных предложений на основе состояния кошелька
  const generateContextualSuggestions = () => {
    const baseSuggestions: SuggestionItem[] = [
      { text: "Как работает криптовалютный кошелек?", type: "help" },
      { text: "Советы по безопасности", type: "advice" }
    ];
    
    let contextSuggestions: SuggestionItem[] = [];
    
    if (!isConnected) {
      contextSuggestions = [
        { text: "Как подключить кошелек?", type: "connect" },
        { text: "Преимущества использования кошелька", type: "help" }
      ];
    } else {
      contextSuggestions = [
        { text: "Анализ моего баланса", type: "balance" },
        { text: "Как отправить средства?", type: "send" },
        { text: "Проанализировать мои транзакции", type: "analytics" }
      ];
      
      // Если у пользователя низкий баланс или его нет
      if (!balance || parseFloat(balance) < 0.1) {
        contextSuggestions.push({ 
          text: "Как пополнить кошелек?", 
          type: "help" 
        });
      }
      
      // Если у пользователя есть баланс
      if (balance && parseFloat(balance) > 0) {
        contextSuggestions.push({ 
          text: "Инвестиционные рекомендации", 
          type: "advice" 
        });
      }
    }
    
    // Объединяем и ограничиваем количество предложений
    setSuggestions([...contextSuggestions, ...baseSuggestions].slice(0, 4));
  };

  // Обработка запроса к AI
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setError(null);
    
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      // Определяем тип запроса на основе текста
      const requestType = determineRequestType(input);
      
      const request: WalletAIRequest = {
        type: requestType
      };
      
      // Если запрос связан с отправкой, пытаемся извлечь сумму и адрес
      if (requestType === "send") {
        const amountMatch = input.match(/(\d+(\.\d+)?)\s*(ETH|eth)/);
        const addressMatch = input.match(/0x[a-fA-F0-9]{40}/);
        
        if (amountMatch) {
          request.amount = amountMatch[1];
        }
        
        if (addressMatch) {
          request.address = addressMatch[0];
        }
      }
      
      // Добавляем контекст кошелька
      const userContext = isConnected 
        ? { address, balance, chainId }
        : undefined;
      
      // Получаем потоковый ответ от AI
      const stream = await puterAI.getStreamingAssistance(
        `Ответь на запрос пользователя о криптовалютном кошельке в формате Markdown. 
        Запрос: ${input}
        Тип запроса: ${requestType}
        ${userContext ? `Контекст: ${JSON.stringify(userContext)}` : ''}
        `
      );
      
      if (stream) {
        // Добавляем пустое сообщение для потокового ответа
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: "",
          sender: "ai",
          timestamp: new Date(),
          isMarkdown: true
        };
        
        setMessages((prev: Message[]) => [...prev, aiMessage]);
        
        // Собираем ответ по частям
        let fullResponse = "";
        for await (const chunk of stream) {
          fullResponse += chunk;
          
          // Обновляем последнее сообщение с новым контентом
          setMessages((prev: Message[]) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content = fullResponse;
            return newMessages;
          });
        }
      } else {
        // Если потоковый ответ не доступен, используем обычный запрос
        const response = await puterAI.getWalletAssistance(request, userContext);
        
        // Добавляем ответ AI
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: response.success ? response.message : "Извините, я не смог обработать ваш запрос.",
          sender: "ai",
          timestamp: new Date(),
          isMarkdown: true
        };
        
        setMessages((prev: Message[]) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса к AI:", error);
      
      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages((prev: Message[]) => [...prev, errorMessage]);
      setError("Не удалось получить ответ от AI. Проверьте подключение к интернету.");
    } finally {
      setIsTyping(false);
      setStreamingResponse("");
    }
  };

  // Определение типа запроса на основе текста
  const determineRequestType = (text: string): WalletAIRequest["type"] => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("подключ") || lowerText.includes("connect") || lowerText.includes("соединить")) {
      return "connect";
    } else if (lowerText.includes("баланс") || lowerText.includes("balance") || lowerText.includes("сколько") || lowerText.includes("остаток")) {
      return "balance";
    } else if (lowerText.includes("отправ") || lowerText.includes("перев") || lowerText.includes("send") || lowerText.includes("transfer")) {
      return "send";
    } else if (lowerText.includes("аналитик") || lowerText.includes("анализ") || lowerText.includes("analytics") || lowerText.includes("статистик")) {
      return "analytics";
    } else if (lowerText.includes("совет") || lowerText.includes("рекоменд") || lowerText.includes("advice") || lowerText.includes("безопас")) {
      return "advice";
    } else {
      return "help";
    }
  };

  // Обработка клика по быстрому действию или предложению
  const handleQuickAction = async (type: WalletAIRequest["type"], text: string) => {
    setError(null);
    const request: WalletAIRequest = { type };
    
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Получаем ответ от AI
      const userContext = isConnected 
        ? { address, balance, chainId }
        : undefined;
        
      const response = await puterAI.getWalletAssistance(request, userContext);
      
      // Добавляем ответ AI
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.success ? response.message : "Извините, я не смог обработать ваш запрос.",
        sender: "ai",
        timestamp: new Date(),
        isMarkdown: true
      };
      
      setMessages((prev: Message[]) => [...prev, aiMessage]);
      
      // Генерируем новые предложения
      generateContextualSuggestions();
    } catch (error) {
      console.error("Ошибка при выполнении быстрого действия:", error);
      
      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages((prev: Message[]) => [...prev, errorMessage]);
      setError("Не удалось выполнить действие. Попробуйте еще раз позже.");
    } finally {
      setIsTyping(false);
    }
  };

  // Обработка ввода в поле
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Обработка нажатия клавиши Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Форматирование времени
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Имитация голосового ввода (в реальном приложении использовать API распознавания речи)
  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Имитируем получение текста из голосового ввода
      setTimeout(() => {
        setInput("Покажи мой баланс кошелька");
        setIsRecording(false);
      }, 1500);
    } else {
      setIsRecording(true);
    }
  };

  if (!isOpen) {
    return (
      <ToggleButton onClick={() => setIsOpen(true)}>
        <AssistantAvatar src="/img/ai-assistant.svg" alt="AI" />
      </ToggleButton>
    );
  }

  return (
    <Container>
      <Header>
        <AssistantAvatar src="/img/ai-assistant.svg" alt="AI" />
        <HeaderTitle>AI-ассистент</HeaderTitle>
        <ToggleButton onClick={() => setIsOpen(false)}>✕</ToggleButton>
      </Header>
      
      <Body>
        {messages.map((message: Message) => (
          <MessageContainer key={message.id} sender={message.sender}>
            {message.sender === "ai" ? (
              <AIMessage>
                <AssistantAvatar src="/img/ai-assistant.svg" alt="AI" />
                <MessageContent>
                  {message.isMarkdown ? (
                    <MarkdownContent>{message.content}</MarkdownContent>
                  ) : (
                    message.content
                  )}
                  <MessageTime>{formatTime(message.timestamp)}</MessageTime>
                </MessageContent>
              </AIMessage>
            ) : (
              <UserMessage>
                <MessageContent>
                  {message.content}
                  <MessageTime>{formatTime(message.timestamp)}</MessageTime>
                </MessageContent>
                <UserAvatar src="/img/user-avatar.svg" alt="User" />
              </UserMessage>
            )}
          </MessageContainer>
        ))}
        
        {isTyping && (
          <MessageContainer sender="ai">
            <AIMessage>
              <AssistantAvatar src="/img/ai-assistant.svg" alt="AI" />
              <TypingIndicator>
                <span>.</span><span>.</span><span>.</span>
              </TypingIndicator>
            </AIMessage>
          </MessageContainer>
        )}
        
        {suggestions.length > 0 && messages.length <= 2 && (
          <SuggestionsContainer>
            {suggestions.map((suggestion: SuggestionItem, index: number) => (
              <SuggestionChip 
                key={index} 
                onClick={() => handleQuickAction(suggestion.type, suggestion.text)}
              >
                {suggestion.text}
              </SuggestionChip>
            ))}
          </SuggestionsContainer>
        )}
        
        {error && (
          <ErrorContainer>
            <ErrorMessage>{error}</ErrorMessage>
          </ErrorContainer>
        )}
        
        <div ref={messagesEndRef} />
      </Body>
      
      <Footer>
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? "Слушаю вас..." : "Задайте вопрос о вашем кошельке..."}
          disabled={isRecording}
        />
        <VoiceButton 
          active={isRecording} 
          onClick={toggleVoiceRecording}
        >
          🎤
        </VoiceButton>
        <SendButton 
          onClick={handleSendMessage}
          disabled={!input.trim() || isTyping}
        >
          ➤
        </SendButton>
      </Footer>
    </Container>
  );
};

export default AIAssistant;
