"use client";
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { walletUtils } from '../model';
import { WalletConnectionStatus } from '../model/types';

interface WalletCardProps {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  status: WalletConnectionStatus;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

const Container = styled.div<{ clickable?: boolean }>`
  background: linear-gradient(145deg, #1e1e2e, #2d2d44);
  border-radius: 16px;
  padding: 20px;
  color: #ffffff;
  min-width: 280px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  ${props => props.clickable && `
    cursor: pointer;
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
    }
  `}
  
  @media (max-width: 768px) {
    min-width: 220px;
    padding: 15px;
  }
`;

const AddressRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const AddressLabel = styled.div`
  font-size: 14px;
  color: #a0a0c0;
`;

const Address = styled.div`
  font-family: monospace;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
`;

const Balance = styled.div`
  font-size: 22px;
  font-weight: 600;
  margin-top: 8px;
`;

const ChainBadge = styled.div`
  background-color: #6e45e1;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 8px;
  font-weight: 500;
`;

const StatusIndicator = styled.div<{ status: WalletConnectionStatus }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  
  ${props => {
    switch (props.status) {
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

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
  color: #a0a0c0;
`;

const NetworkRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: #a0a0c0;
`;

const WalletCard: React.FC<WalletCardProps> = ({
  address,
  balance,
  chainId,
  status,
  className,
  clickable = false,
  onClick
}) => {
  const [copied, setCopied] = useState(false);

  // Сетевая информация
  const networkName = chainId ? walletUtils.getChainInfo(chainId)?.name : 'Нет подключения';
  const networkCode = walletUtils.getNetworkCode(chainId);

  // Форматированный адрес и баланс
  const formattedAddress = address ? walletUtils.formatAddress(address) : '—';
  const formattedBalance = balance ? walletUtils.formatBalance(balance) : '0';

  // Статус соединения
  const getStatusText = (status: WalletConnectionStatus): string => {
    switch (status) {
      case WalletConnectionStatus.CONNECTED:
        return 'Подключено';
      case WalletConnectionStatus.CONNECTING:
        return 'Подключение...';
      case WalletConnectionStatus.ERROR:
        return 'Ошибка';
      default:
        return 'Отключено';
    }
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Ошибка копирования адреса:', err));
  };

  return (
    <Container className={className} clickable={clickable} onClick={onClick}>
      <StatusRow>
        <StatusIndicator status={status} />
        {getStatusText(status)}
      </StatusRow>
      
      <AddressRow>
        <AddressLabel>Адрес</AddressLabel>
        <Address onClick={copyToClipboard}>
          {copied ? 'Скопировано!' : formattedAddress}
        </Address>
      </AddressRow>
      
      <BalanceRow>
        <Balance>{formattedBalance}</Balance>
        <ChainBadge>{networkCode}</ChainBadge>
      </BalanceRow>
      
      <NetworkRow>
        <div>Сеть</div>
        <div>{networkName}</div>
      </NetworkRow>
    </Container>
  );
};

export default WalletCard;
