"use client";
import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useAIAssistant } from '../model';
import { AIAssistantRequestType } from '../model/types';
import { walletUtils } from '@/entities/wallet';

interface AIAssistantChatProps {
  className?: string;
  defaultOpen?: boolean;
}

const Container = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: ${({ isOpen }) => (isOpen ? '0' : '-500px')};
  right: 40px;
  width: 380px;
  height: 500px;
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.2);
  transition: bottom 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 90%;
    right: 5%;
  }
`;

const Header = styled.div`
  background: linear-gradient(90deg, #6e45e1 0%, #88d3ce 100%);
  padding: 16px;
  color: white;
  font-weight: bold;
  border-radius: 16px 16px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2a2a3c;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #6e45e1;
    border-radius: 20px;
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  ${({ isUser }) =>
    isUser
      ? `
    background: #6e45e1;
    color: white;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  `
      : `
    background: #3d3d56;
    color: white;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  `}
`;

const InputContainer = styled.div`
  display: flex;
  padding: 16px;
  gap: 8px;
  background: #2a2a3c;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  background: #3d3d56;
  border: none;
  border-radius: 24px;
  color: white;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  background: ${({ disabled }) => disabled ? '#3d3d56' : '#6e45e1'};
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ disabled }) => disabled ? '#3d3d56' : '#5a36c9'};
  }
`;

const SuggestionsContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  padding: 0 16px;
  gap: 8px;
  flex-wrap: wrap;
`;

const Suggestion = styled.button`
  background: #3d3d56;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #6e45e1;
  }
`;

const AIStatus = styled.div<{ isReady: boolean }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${({ isReady }) => (isReady ? '#4CAF50' : '#F44336')};
  color: white;
`;

const LoadingDots = styled.div`
  display: inline-flex;
  align-items: center;
  
  &::after {
    content: '...';
    animation: dots 1.5s infinite;
    width: 24px;
    text-align: left;
    display: inline-block;
  }
  
  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60%, 100% { content: '...'; }
  }
`;

const RecommendationsContainer = styled.div`
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
`;

const RecommendationTitle = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
`;

const RecommendationItem = styled.div`
  font-size: 12px;
  padding: 4px 0;
  color: #88d3ce;
`;

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  className,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    isReady,
    isProcessing,
    conversation,
    initialize,
    sendRequest
  } = useAIAssistant();
  
  // Инициализация AI при монтировании
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Скролл к последнему сообщению
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);
  
  // Отправка сообщения
  const handleSendMessage = async () => {
    if (!message.trim() || isProcessing) return;
    
    await sendRequest(AIAssistantRequestType.CUSTOM_QUESTION, message);
    setMessage('');
  };
  
  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Выбор предложенной подсказки
  const handleSuggestionClick = async (suggestion: string) => {
    if (isProcessing) return;
    
    await sendRequest(AIAssistantRequestType.CUSTOM_QUESTION, suggestion);
  };
  
  // Предложенные подсказки
  const suggestions = [
    'Как обезопасить кошелек?',
    'Объясни DeFi простыми словами',
    'Что такое газ в Ethereum?',
    'Как снизить комиссии?'
  ];
  
  return (
    <Container isOpen={isOpen} className={className}>
      <Header onClick={() => setIsOpen(!isOpen)}>
        <HeaderTitle>
          <HeaderIcon>🤖</HeaderIcon>
          LQD Ассистент
        </HeaderTitle>
        <AIStatus isReady={isReady}>
          {isReady ? 'Онлайн' : 'Офлайн'}
        </AIStatus>
      </Header>
      
      <ChatContainer ref={chatContainerRef}>
        {conversation.length === 0 ? (
          <Message isUser={false}>
            Привет! Я криптовалютный ассистент LQD Banks. Чем могу помочь?
          </Message>
        ) : (
          conversation.map((item, index) => (
            <React.Fragment key={index}>
              <Message isUser={true}>
                {item.request.content}
              </Message>
              
              <Message isUser={false}>
                {item.response.loading ? (
                  <LoadingDots>Думаю</LoadingDots>
                ) : item.response.error ? (
                  <>Извините, произошла ошибка: {item.response.error}</>
                ) : (
                  <>
                    {item.response.content}
                    
                    {item.response.recommendations && item.response.recommendations.length > 0 && (
                      <RecommendationsContainer>
                        <RecommendationTitle>Рекомендации:</RecommendationTitle>
                        {item.response.recommendations.slice(0, 3).map((rec, i) => (
                          <RecommendationItem key={i}>• {rec}</RecommendationItem>
                        ))}
                      </RecommendationsContainer>
                    )}
                  </>
                )}
              </Message>
            </React.Fragment>
          ))
        )}
      </ChatContainer>
      
      {conversation.length === 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion) => (
            <Suggestion 
              key={suggestion} 
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isProcessing || !isReady}
            >
              {suggestion}
            </Suggestion>
          ))}
        </SuggestionsContainer>
      )}
      
      <InputContainer>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          onKeyPress={handleKeyPress}
          disabled={isProcessing || !isReady}
        />
        <SendButton 
          onClick={handleSendMessage}
          disabled={isProcessing || !isReady || !message.trim()}
        >
          {isProcessing ? '⏳' : '➤'}
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default AIAssistantChat;
