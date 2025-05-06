import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletProvider, useWallet } from '../WalletContext';
import { ethers } from 'ethers';

// Мокаем модуль ethers
jest.mock('ethers', () => {
  // Создаем мок-функции для Web3Provider
  const mockGetBalance = jest.fn().mockResolvedValue('1000000000000000000'); // 1 ETH
  const mockGetNetwork = jest.fn().mockResolvedValue({ chainId: 1 });
  const mockGetSigner = jest.fn().mockReturnValue({
    sendTransaction: jest.fn().mockResolvedValue({
      hash: '0x123456789abcdef',
      wait: jest.fn().mockResolvedValue({})
    })
  });
  
  return {
    formatEther: jest.fn().mockReturnValue('1.0'),
    parseEther: jest.fn().mockReturnValue('1000000000000000000'),
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        getBalance: mockGetBalance,
        getNetwork: mockGetNetwork,
        getSigner: mockGetSigner,
        send: jest.fn().mockResolvedValue(['0x123456789abcdef'])
      }))
    }
  };
});

// Компонент для тестирования хуков
const TestComponent = () => {
  const walletContext = useWallet();
  
  return (
    <div>
      <div data-testid="connection-status">
        {walletContext.isConnected ? 'connected' : 'disconnected'}
      </div>
      <div data-testid="address">{walletContext.address || 'no-address'}</div>
      <div data-testid="balance">{walletContext.balance || '0'}</div>
      <button 
        data-testid="connect-button" 
        onClick={walletContext.connectWallet}
      >
        Connect
      </button>
      <button 
        data-testid="disconnect-button" 
        onClick={walletContext.disconnectWallet}
      >
        Disconnect
      </button>
    </div>
  );
};

describe('WalletContext', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    // Очищаем localStorage
    window.localStorage.clear();
    // Сбрасываем mock ethereum
    global.ethereum = {
      isMetaMask: true,
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });
  
  test('должен отображать начальное состояние отключенного кошелька', () => {
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
    
    expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('address')).toHaveTextContent('no-address');
    expect(screen.getByTestId('balance')).toHaveTextContent('0');
  });
  
  test('должен подключаться к кошельку при нажатии на кнопку connect', async () => {
    // Мокаем ethereum.request для имитации успешного подключения
    global.ethereum.request = jest.fn().mockResolvedValueOnce(['0x123456789abcdef']);
    
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
    
    // Проверяем начальное состояние
    expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
    
    // Имитируем нажатие на кнопку подключения
    fireEvent.click(screen.getByTestId('connect-button'));
    
    // Устанавливаем таймаут побольше для асинхронной операции
    jest.setTimeout(10000);
    
    // Ожидаем обновления состояния со значительным таймаутом
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    }, { timeout: 5000 });
    
    // Проверяем отдельно каждое значение
    await waitFor(() => expect(screen.getByTestId('address')).not.toHaveTextContent('no-address'));
    
    // Проверяем, что localStorage был обновлен
    expect(window.localStorage.setItem).toHaveBeenCalledWith('walletConnected', 'true');
  });
  
  test('должен отключаться от кошелька при нажатии на кнопку disconnect', async () => {
    // Устанавливаем начальное состояние как подключенное
    global.ethereum.request = jest.fn().mockResolvedValue(['0x123456789abcdef']);
    
    render(
      <WalletProvider>
        <TestComponent />
      </WalletProvider>
    );
    
    // Имитируем нажатие на кнопку подключения
    fireEvent.click(screen.getByTestId('connect-button'));
    
    // Ожидаем подключения
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('connected');
    });
    
    // Имитируем нажатие на кнопку отключения
    fireEvent.click(screen.getByTestId('disconnect-button'));
    
    // Проверяем, что произошло отключение
    expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('address')).toHaveTextContent('no-address');
    expect(screen.getByTestId('balance')).toHaveTextContent('0');
    
    // Проверяем, что localStorage был обновлен
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('walletConnected');
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('walletAddress');
  });
});
