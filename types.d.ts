declare module 'react';
declare module '@emotion/styled';
declare module '@emotion/react';
declare module 'ethers';

// Глобальный тип убран из Window, чтобы избежать конфликта с типами в puterAI.ts
interface Window {
  ethereum?: any;
}
