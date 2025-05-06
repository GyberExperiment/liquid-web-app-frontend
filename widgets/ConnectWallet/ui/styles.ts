import styled from "@emotion/styled";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 520px;
  height: 647px;
  background-color: black;
  border-radius: 59px;
  border: 1px solid white;
  position: relative;
  padding: 68px 54px 176px 54px;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

export const Title = styled.h2`
  font-family: "Inter", sans-serif;
  font-size: 44px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
  text-align: center;
`;

export const LowerContainer = styled.div`
  width: 520px;
  height: 647px;
  background-color: black;
  border-radius: 59px;
  border: 1px solid white;
  position: absolute;
  bottom: -13px;
  z-index: -1;
`;

export const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
`;

export const AddressText = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: white;
  margin-bottom: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  width: 100%;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BalanceText = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin-top: 8px;
`;

export const Button = styled.button`
  background-color: transparent;
  border: 1px solid white;
  color: white;
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;