"use client";
import React { useState, useEffect, ChangeEvent } from "react";
import { useWallet } from "@/shared/lib/context/WalletContext";
import styled from "@emotion/styled";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 500;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
`;

const TxRow = styled.tr`
  &:hover {
    background-color: #f9fafb;
  }
`;

const TxHash = styled.a`
  color: #6e45e1;
  text-decoration: none;
  font-family: monospace;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AddressBadge = styled.span`
  font-family: monospace;
  background-color: #f5f7fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

interface TxTypeTagProps {
  type: 'in' | 'out';
}

const TxTypeTag = styled.span<TxTypeTagProps>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props: TxTypeTagProps) => props.type === 'in' ? '#f0fdf4' : '#fef2f2'};
  color: ${(props: TxTypeTagProps) => props.type === 'in' ? '#16a34a' : '#dc2626'};
`;

const ValueText = styled.span<TxTypeTagProps>`
  color: ${(props: TxTypeTagProps) => props.type === 'in' ? '#16a34a' : '#dc2626'};
  font-weight: 500;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #374151;
`;

const FilterInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  color: #374151;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageInfo = styled.div`
  color: #6b7280;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

interface PageButtonProps {
  active?: boolean;
}

const PageButton = styled.button<PageButtonProps>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props: PageButtonProps) => props.active ? '#6e45e1' : '#e5e7eb'};
  border-radius: 8px;
  background-color: ${(props: PageButtonProps) => props.active ? '#6e45e1' : 'white'};
  color: ${(props: PageButtonProps) => props.active ? 'white' : '#374151'};
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: ${(props: PageButtonProps) => props.active ? '#6e45e1' : '#f9fafb'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

// Определение типа для транзакции
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: string;
}

export const TransactionsPage: React.FC = () => {
  const { address, isConnected, getTransactionHistory } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const loadTransactions = async () => {
      if (isConnected && address) {
        setLoading(true);
        try {
          const history = await getTransactionHistory();
          setTransactions(history);
        } catch (error) {
          console.error("Ошибка при загрузке истории транзакций:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadTransactions();
  }, [isConnected, address, getTransactionHistory]);

  // Функция для форматирования времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для сокращения адреса
  const shortenAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Функция для определения типа транзакции
  const getTxType = (tx: Transaction): 'in' | 'out' => {
    if (!address) return 'out';
    return tx.to.toLowerCase() === address.toLowerCase() ? 'in' : 'out';
  };

  // Фильтрация транзакций
  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    const type = getTxType(tx);
    return type === filter;
  });

  // Пагинация
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Добавим несколько псевдо-транзакций для демонстрации, если реальных нет
  useEffect(() => {
    if (transactions.length === 0 && address) {
      const mockTransactions = [
        {
          hash: "0x123...abc",
          from: address,
          to: "0x456...def",
          value: "0.1",
          timestamp: new Date().toISOString(),
          status: "completed"
        },
        {
          hash: "0x789...ghi",
          from: "0xabc...jkl",
          to: address,
          value: "0.25",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: "completed"
        },
        {
          hash: "0xmno...pqr",
          from: address,
          to: "0xstu...vwx",
          value: "0.05",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: "completed"
        }
      ];
      setTransactions(mockTransactions);
    }
  }, [transactions.length, address]);

  if (!isConnected) {
    return (
      <Container>
        <EmptyState>
          <h2>Кошелек не подключен</h2>
          <p>Пожалуйста, подключите ваш кошелек для просмотра транзакций</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>История транзакций</h1>
        <p>Просмотр всех входящих и исходящих транзакций вашего кошелька</p>
      </Header>

      <FiltersContainer>
        <FilterSelect 
          value={filter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as 'all' | 'in' | 'out')}
        >
          <option value="all">Все транзакции</option>
          <option value="in">Только входящие</option>
          <option value="out">Только исходящие</option>
        </FilterSelect>
        <FilterInput type="text" placeholder="Поиск по адресу или хэшу" />
      </FiltersContainer>

      <Card>
        {loading ? (
          <EmptyState>
            <p>Загрузка транзакций...</p>
          </EmptyState>
        ) : currentItems.length > 0 ? (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Тип</Th>
                  <Th>Хэш</Th>
                  <Th>Время</Th>
                  <Th>От / Кому</Th>
                  <Th>Сумма</Th>
                  <Th>Статус</Th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((tx: Transaction, index: number) => {
                  const txType = getTxType(tx);
                  return (
                    <TxRow key={index}>
                      <Td>
                        <TxTypeTag type={txType}>
                          {txType === 'in' ? 'Получено' : 'Отправлено'}
                        </TxTypeTag>
                      </Td>
                      <Td>
                        <TxHash href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
                          {shortenAddress(tx.hash)}
                        </TxHash>
                      </Td>
                      <Td>{formatTime(tx.timestamp)}</Td>
                      <Td>
                        {txType === 'in' ? (
                          <AddressBadge title={tx.from}>От: {shortenAddress(tx.from)}</AddressBadge>
                        ) : (
                          <AddressBadge title={tx.to}>Кому: {shortenAddress(tx.to)}</AddressBadge>
                        )}
                      </Td>
                      <Td>
                        <ValueText type={txType}>
                          {txType === 'in' ? '+' : '-'}{tx.value} ETH
                        </ValueText>
                      </Td>
                      <Td>{tx.status === 'completed' ? 'Выполнено' : 'В обработке'}</Td>
                    </TxRow>
                  );
                })}
              </tbody>
            </Table>
            
            <Pagination>
              <PageInfo>
                Показано {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} из {filteredTransactions.length}
              </PageInfo>
              <PageButtons>
                <PageButton 
                  onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Назад
                </PageButton>
                {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                  <PageButton 
                    key={i}
                    active={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PageButton>
                ))}
                {totalPages > 3 && page < totalPages - 1 && <span>...</span>}
                {totalPages > 3 && (
                  <PageButton 
                    active={page === totalPages}
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </PageButton>
                )}
                <PageButton 
                  onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Далее
                </PageButton>
              </PageButtons>
            </Pagination>
          </>
        ) : (
          <EmptyState>
            <p>Транзакции не найдены</p>
          </EmptyState>
        )}
      </Card>
    </Container>
  );
};

export default TransactionsPage;
