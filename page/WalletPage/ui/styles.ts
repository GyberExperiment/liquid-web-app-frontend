import styled from "@emotion/styled";

export const Container = styled.main`
  display: grid;
  grid-template-rows: repeat(1, max(100vh, 1000px));
  justify-items: center;
  align-items: center;
  grid-gap: 100px;
  padding: 0 20px;
`;

export const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  background-color: #000;
  border: 1px solid #fff;
  border-radius: 20px;
  padding: 40px;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
    border: 1px solid #fff;
    border-radius: 20px;
    bottom: -10px;
    right: -10px;
    z-index: -1;
  }
`;

export const WalletHeader = styled.h1`
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 40px;
  width: 100%;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 100px;
    height: 3px;
    background-color: #fff;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

export const AddressContainer = styled.div`
  width: 100%;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 30px;
`;

export const AddressText = styled.div`
  font-family: monospace;
  font-size: 16px;
  text-align: center;
  word-break: break-all;
  color: rgba(255, 255, 255, 0.8);
`;

export const WalletBalanceSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 10px;
`;

export const BalanceTitle = styled.h2`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.7);
`;

export const BalanceAmount = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #fff;
`;

export const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const ActionButton = styled.button`
  padding: 12px 25px;
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 600px) {
    width: 100%;
  }
`;
