import { render, screen } from '@testing-library/react';
import { WalletPage } from '../WalletPage';
import { useWallet } from '@/shared/lib/context/WalletContext';

// Мок для контекста кошелька
jest.mock('@/shared/lib/context/WalletContext', () => ({
  useWallet: jest.fn(),
}));

// Мок для AIAssistant
jest.mock('@/widgets/AIAssistant', () => ({
  AIAssistant: () => <div data-testid="ai-assistant">AI Ассистент</div>,
}));

describe('WalletPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('должна отображать страницу загрузки, когда кошелек подключается', () => {
    // Устанавливаем мок для useWallet
    (useWallet as jest.Mock).mockReturnValue({
      isConnected: false,
      isConnecting: true,
      address: null,
      balance: null,
      connectWallet: jest.fn(),
    });

    render(<WalletPage />);
    
    // Проверяем, что отображается индикатор загрузки
    expect(screen.queryByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('должна отображать кнопку подключения, когда кошелек не подключен', () => {
    // Устанавливаем мок для useWallet
    const connectWalletMock = jest.fn();
    (useWallet as jest.Mock).mockReturnValue({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null,
      connectWallet: connectWalletMock,
    });

    render(<WalletPage />);
    
    // Проверяем, что отображается кнопка подключения
    const connectButton = screen.getByText('Подключить кошелек');
    expect(connectButton).toBeInTheDocument();
    
    // Проверяем, что компонент AI Ассистента отображается
    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });

  test('должна отображать информацию о кошельке, когда кошелек подключен', () => {
    // Устанавливаем мок для useWallet с подключенным кошельком
    (useWallet as jest.Mock).mockReturnValue({
      isConnected: true,
      isConnecting: false,
      address: '0x123456789abcdef',
      balance: '1.23',
      connectWallet: jest.fn(),
    });

    render(<WalletPage />);
    
    // Проверяем, что отображается адрес и баланс кошелька
    expect(screen.getByText('Ваш кошелек')).toBeInTheDocument();
    expect(screen.getByText('0x123456789abcdef')).toBeInTheDocument();
    expect(screen.getByText('1.23')).toBeInTheDocument();
    
    // Проверяем наличие кнопок действий
    expect(screen.getByText('Отправить')).toBeInTheDocument();
    expect(screen.getByText('Получить')).toBeInTheDocument();
    expect(screen.getByText('История')).toBeInTheDocument();
    
    // Проверяем, что компонент AI Ассистента отображается
    expect(screen.getByTestId('ai-assistant')).toBeInTheDocument();
  });
});
