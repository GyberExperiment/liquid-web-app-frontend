"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@/shared/lib/context/WalletContext";
import { Loading } from "@/shared/ui";
import styled from "@emotion/styled";

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(45deg, #6e45e1, #88d3ce);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const AddressDisplay = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-family: monospace;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.5rem;
    overflow-x: auto;
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #6e45e1;
  cursor: pointer;
  margin-left: 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h3`
  margin-top: 0;
  color: #333;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
`;

const BalanceValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
`;

const CurrencyLabel = styled.span`
  font-size: 1rem;
  color: #666;
  margin-left: 0.5rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const ChainBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #f0f9ff;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
`;

const TabsContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }
`;

interface TabProps {
  active: boolean;
}

const Tab = styled.button.attrs<TabProps>((props) => ({ type: 'button' } as { type: string }))<TabProps>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${(props: TabProps) => props.active ? '#6e45e1' : 'transparent'};
  color: ${(props: TabProps) => props.active ? '#6e45e1' : '#4b5563'};
  font-weight: ${(props: TabProps) => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: #6e45e1;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

interface ChainInfo {
  [key: number]: {
    name: string;
    icon: string;
  };
}

const CHAIN_INFO: ChainInfo = {
  1: { name: 'Ethereum Mainnet', icon: 'ETH' },
  11155111: { name: 'Sepolia', icon: 'SEP' },
  137: { name: 'Polygon', icon: 'MATIC' },
  80001: { name: 'Mumbai', icon: 'MATIC' },
  56: { name: 'BNB Smart Chain', icon: 'BNB' },
  42161: { name: 'Arbitrum One', icon: 'ARB' },
  43114: { name: 'Avalanche C-Chain', icon: 'AVAX' },
  10: { name: 'Optimism', icon: 'OP' },
  // Добавьте другие сети по мере необходимости
};

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: string;
}

export const ProfilePage: React.FC = () => {
  const { address, balance, chainId, isConnected, getTransactionHistory, formatAddress, isLoadingTransactions } = useWallet();
  const [activeTab, setActiveTab] = useState('assets');
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка истории транзакций
  useEffect(() => {
    const loadTransactionHistory = async () => {
      if (!isConnected || !address) return;
      
      setIsLoading(true);
      try {
        const history = await getTransactionHistory();
        setTransactions(history);
      } catch (error) {
        console.error('Ошибка при загрузке истории транзакций:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTransactionHistory();
  }, [isConnected, address, getTransactionHistory]);
  
  // Форматируем дату транзакции
  const formatTransactionDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Получаем информацию о текущей сети
  const getChainInfo = () => {
    if (!chainId) return { name: 'Неизвестная сеть', icon: '?' };
    return CHAIN_INFO[chainId] || { name: `Сеть ${chainId}`, icon: '?' };
  };

  const chainInfo = getChainInfo();

  if (!isConnected) {
    return (
      <ProfileContainer>
        <EmptyState>
          <h2>Кошелек не подключен</h2>
          <p>Пожалуйста, подключите ваш кошелек для просмотра профиля</p>
        </EmptyState>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>{address ? address.substring(2, 4).toUpperCase() : '?'}</Avatar>
        <ProfileInfo>
          <h1>Профиль кошелька</h1>
          <AddressDisplay>
            {address || 'Адрес не доступен'}
            <CopyButton onClick={copyToClipboard}>
              {copied ? 'Скопировано!' : 'Копировать адрес'}
            </CopyButton>
          </AddressDisplay>
          <ChainBadge>
            {chainInfo.icon} {chainInfo.name}
          </ChainBadge>
        </ProfileInfo>
      </ProfileHeader>

      <Cards>
        <Card>
          <CardTitle>Баланс</CardTitle>
          <BalanceValue>
            {balance || '0.00'} <CurrencyLabel>ETH</CurrencyLabel>
          </BalanceValue>
        </Card>
        
        <Card>
          <CardTitle>Статистика</CardTitle>
          <StatGrid>
            <StatItem>
              <StatLabel>Всего транзакций</StatLabel>
              <StatValue>{transactions.length}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>NFT</StatLabel>
              <StatValue>3</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Первая транзакция</StatLabel>
              <StatValue>{transactions.length > 0 ? formatTransactionDate(transactions[transactions.length - 1].timestamp) : 'Нет'}</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>Токены</StatLabel>
              <StatValue>6</StatValue>
            </StatItem>
          </StatGrid>
        </Card>
      </Cards>

      <TabsContainer>
        <TabList>
          <Tab 
            active={activeTab === 'assets'} 
            onClick={() => setActiveTab('assets')}
          >
            Активы
          </Tab>
          <Tab 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
          >
            Активность
          </Tab>
          <Tab 
            active={activeTab === 'nft'} 
            onClick={() => setActiveTab('nft')}
          >
            NFT
          </Tab>
        </TabList>

        {activeTab === 'assets' && (
          <Card>
            <EmptyState>
              <p>В настоящее время у вас нет дополнительных токенов</p>
            </EmptyState>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            {isLoading || isLoadingTransactions ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loading />
              </div>
            ) : transactions.length > 0 ? (
              <div>
                <CardTitle>Последние транзакции</CardTitle>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Хэш</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Дата</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>От</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Кому</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx: Transaction) => {
                        const isSent = tx.from === address;
                        return (
                          <tr key={tx.hash} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <a 
                                href={`https://etherscan.io/tx/${tx.hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#6e45e1', textDecoration: 'none', fontFamily: 'monospace' }}
                              >
                                {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                              </a>
                            </td>
                            <td style={{ padding: '0.75rem' }}>{formatTransactionDate(tx.timestamp)}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ fontFamily: 'monospace' }}>
                                {formatAddress(tx.from)}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{ fontFamily: 'monospace' }}>
                                {formatAddress(tx.to)}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', color: isSent ? '#dc2626' : '#16a34a' }}>
                              {isSent ? '- ' : '+ '}{tx.value} ETH
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState>
                <p>История транзакций будет отображаться здесь</p>
              </EmptyState>
            )}
          </Card>
        )}

        {activeTab === 'nft' && (
          <Card>
            <EmptyState>
              <p>У вас пока нет NFT</p>
            </EmptyState>
          </Card>
        )}
      </TabsContainer>
    </ProfileContainer>
  );
};

export default ProfilePage;
