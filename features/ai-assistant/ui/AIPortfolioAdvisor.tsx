"use client";
import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAIAssistant } from '../model';
import { AIAssistantRequestType } from '../model/types';
import { useWalletStore, walletUtils } from '@/entities/wallet';

interface AIPortfolioAdvisorProps {
  className?: string;
  tokens?: any[];
}

const Container = styled.div`
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  border-radius: 16px;
  padding: 20px;
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div`
  margin-bottom: 16px;
`;

const RecommendationsList = styled.div`
  margin-top: 16px;
`;

const RecommendationItem = styled.div<{ sentiment?: 'positive' | 'neutral' | 'negative' }>`
  padding: 10px 12px;
  background: ${({ sentiment }) => 
    sentiment === 'positive' ? 'rgba(76, 175, 80, 0.1)' : 
    sentiment === 'negative' ? 'rgba(244, 67, 54, 0.1)' : 
    'rgba(255, 255, 255, 0.05)'
  };
  border-left: 3px solid ${({ sentiment }) => 
    sentiment === 'positive' ? '#4CAF50' : 
    sentiment === 'negative' ? '#F44336' : 
    '#FFC107'
  };
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const InsightsList = styled.div`
  margin-top: 16px;
`;

const InsightItem = styled.div`
  padding: 10px 12px;
  background: rgba(110, 69, 225, 0.1);
  border-left: 3px solid #6e45e1;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #6e45e1 0%, #88d3ce 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(110, 69, 225, 0.4);
  }
  
  &:disabled {
    background: #3d3d56;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const StatusIndicator = styled.div<{ isReady: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ isReady }) => (isReady ? '#4CAF50' : '#F44336')};
  margin-right: 8px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #6e45e1;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AIPortfolioAdvisor: React.FC<AIPortfolioAdvisorProps> = ({
  className,
  tokens = []
}) => {
  const { address, balance, chainId } = useWalletStore();
  const { 
    isReady, 
    isProcessing, 
    conversation, 
    initialize, 
    sendRequest, 
    getLastResponse 
  } = useAIAssistant();
  
  const [requestSent, setRequestSent] = useState(false);
  
  // Инициализация AI при монтировании
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Функция для запроса рекомендаций
  const handleRequestAdvice = async () => {
    if (!isReady || isProcessing || !address) return;
    
    const query = `Проанализируй мой криптопортфель и дай рекомендации по оптимизации. 
      Адрес: ${address}
      Баланс: ${walletUtils.formatBalance(balance)} ETH
      Сеть: ${chainId}
      ${tokens.length > 0 ? `Токены: ${JSON.stringify(tokens)}` : 'Других токенов нет'}`;
    
    await sendRequest(AIAssistantRequestType.PORTFOLIO_ADVICE, query, {
      tokens
    });
    
    setRequestSent(true);
  };
  
  // Получение последнего ответа
  const response = getLastResponse();
  
  // Отображение различных состояний
  const renderContent = () => {
    if (!address) {
      return <Content>Подключите кошелек, чтобы получить рекомендации по портфелю.</Content>;
    }
    
    if (!isReady) {
      return <Content>ИИ-ассистент не инициализирован. Обновите страницу или попробуйте позже.</Content>;
    }
    
    if (isProcessing) {
      return (
        <LoadingIndicator>
          <LoadingSpinner />
        </LoadingIndicator>
      );
    }
    
    if (!requestSent) {
      return (
        <Content>
          <p>Получите персональный анализ вашего криптопортфеля и рекомендации по оптимизации от ИИ-ассистента.</p>
          <Button onClick={handleRequestAdvice}>Получить рекомендации</Button>
        </Content>
      );
    }
    
    if (response?.error) {
      return (
        <Content>
          <p>Произошла ошибка при получении рекомендаций: {response.error}</p>
          <Button onClick={handleRequestAdvice}>Попробовать снова</Button>
        </Content>
      );
    }
    
    if (response?.content) {
      return (
        <Content>
          <div>{response.content}</div>
          
          {response.insights && response.insights.length > 0 && (
            <InsightsList>
              <h4>Ключевые наблюдения:</h4>
              {response.insights.map((insight, index) => (
                <InsightItem key={index}>{insight}</InsightItem>
              ))}
            </InsightsList>
          )}
          
          {response.recommendations && response.recommendations.length > 0 && (
            <RecommendationsList>
              <h4>Рекомендации:</h4>
              {response.recommendations.map((recommendation, index) => (
                <RecommendationItem 
                  key={index}
                  sentiment={
                    recommendation.includes('увеличить') || 
                    recommendation.includes('добавить') || 
                    recommendation.includes('купить') 
                      ? 'positive' 
                      : recommendation.includes('уменьшить') || 
                        recommendation.includes('продать') || 
                        recommendation.includes('избегать')
                          ? 'negative'
                          : 'neutral'
                  }
                >
                  {recommendation}
                </RecommendationItem>
              ))}
            </RecommendationsList>
          )}
          
          <Button 
            onClick={handleRequestAdvice}
            style={{ marginTop: '16px' }}
          >
            Обновить рекомендации
          </Button>
        </Content>
      );
    }
    
    return <Content>Нет доступных рекомендаций.</Content>;
  };
  
  return (
    <Container className={className}>
      <Header>
        <Title>
          <StatusIndicator isReady={isReady} />
          ИИ-аналитика портфеля
        </Title>
      </Header>
      
      {renderContent()}
    </Container>
  );
};

export default AIPortfolioAdvisor;
