"use client";
import React from 'react';
import styled from '@emotion/styled';
import { useWalletConnect } from '../model';
import { WalletConnectionStatus } from '@/entities/wallet';

interface ConnectButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
}

const Button = styled.button<{
  $status: WalletConnectionStatus;
  $variant: 'primary' | 'secondary' | 'outline';
  $size: 'small' | 'medium' | 'large';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
  
  /* Размеры */
  ${(props) => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 8px 12px;
          font-size: 12px;
        `;
      case 'large':
        return `
          padding: 12px 24px;
          font-size: 16px;
        `;
      default: // medium
        return `
          padding: 10px 18px;
          font-size: 14px;
        `;
    }
  }}
  
  /* Варианты стилей */
  ${(props) => {
    if (props.$status === WalletConnectionStatus.CONNECTING) {
      return `
        background-color: #E0E0E0;
        color: #707070;
        cursor: wait;
        
        &:hover {
          background-color: #E0E0E0;
        }
      `;
    }
    
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(90deg, #6e45e1 0%, #88d3ce 100%);
          color: white;
          
          &:hover {
            box-shadow: 0 5px 15px rgba(110, 69, 225, 0.4);
            transform: translateY(-2px);
          }
          
          &:active {
            transform: translateY(0);
            box-shadow: 0 2px 8px rgba(110, 69, 225, 0.4);
          }
        `;
      case 'secondary':
        return `
          background-color: #2d2d44;
          color: white;
          
          &:hover {
            background-color: #3a3a57;
          }
          
          &:active {
            background-color: #333348;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: #6e45e1;
          border: 1px solid #6e45e1;
          
          &:hover {
            background-color: rgba(110, 69, 225, 0.05);
          }
          
          &:active {
            background-color: rgba(110, 69, 225, 0.1);
          }
        `;
    }
  }}
  
  /* Состояние подключен/отключен */
  ${(props) => 
    props.$status === WalletConnectionStatus.CONNECTED && `
      background-color: #4CAF50;
      color: white;
      
      &:hover {
        background-color: #43A047;
        box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
      }
    `
  }
  
  /* Состояние ошибки */
  ${(props) => 
    props.$status === WalletConnectionStatus.ERROR && `
      background-color: #F44336;
      color: white;
      
      &:hover {
        background-color: #E53935;
        box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
      }
    `
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    ${(props) => props.$size === 'large' && `
      padding: 10px 20px;
      font-size: 14px;
    `}
  }
`;

const StatusDot = styled.span<{ $status: WalletConnectionStatus }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${(props) => {
    switch (props.$status) {
      case WalletConnectionStatus.CONNECTED:
        return 'background-color: #4CAF50;'; // Зеленый
      case WalletConnectionStatus.CONNECTING:
        return 'background-color: #FFC107; animation: pulse 1.5s infinite;'; // Желтый с пульсацией
      case WalletConnectionStatus.ERROR:
        return 'background-color: #F44336;'; // Красный
      default:
        return 'background-color: #9E9E9E;'; // Серый
    }
  }}
  
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  className,
  variant = 'primary',
  size = 'medium',
  showStatus = false
}) => {
  const { status, isConnected, connectWallet, disconnectWallet } = useWalletConnect();
  
  const handleClick = () => {
    if (status === WalletConnectionStatus.CONNECTING) return;
    
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };
  
  const getButtonText = () => {
    switch (status) {
      case WalletConnectionStatus.CONNECTED:
        return 'Отключить';
      case WalletConnectionStatus.CONNECTING:
        return 'Подключение...';
      case WalletConnectionStatus.ERROR:
        return 'Повторить';
      default:
        return 'Подключить кошелек';
    }
  };
  
  return (
    <Button 
      className={className}
      onClick={handleClick}
      $status={status}
      $variant={variant}
      $size={size}
    >
      {status === WalletConnectionStatus.CONNECTING && <LoadingSpinner />}
      {showStatus && <StatusDot $status={status} />}
      {getButtonText()}
    </Button>
  );
};

export default ConnectButton;
