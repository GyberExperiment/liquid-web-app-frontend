"use client";
import React, { useEffect } from "react";
import Image from "next/image";

import { Loading } from "@/shared/ui";
import { useWallet } from "@/shared/lib/context/WalletContext";
import { AIAssistant } from "@/widgets/AIAssistant";

import { 
  Container, 
  WalletContainer, 
  WalletHeader, 
  WalletBalanceSection,
  BalanceTitle, 
  BalanceAmount, 
  ActionButton, 
  ActionsContainer,
  AddressContainer,
  AddressText
} from "./styles";

const WalletPage = () => {
  const { isConnected, address, balance, connectWallet, isConnecting } = useWallet();

  useEffect(() => {
    // Если кошелек еще не подключен, предложим пользователю подключить его
    if (!isConnected && !isConnecting) {
      // Можно автоматически запустить подключение или оставить пользователю кнопку
    }
  }, [isConnected, isConnecting]);

  if (isConnecting) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  if (!isConnected) {
    return (
      <Container>
        <WalletContainer>
          <WalletHeader>Кошелек не подключен</WalletHeader>
          <Image src="/img/metamask.png" alt="metamask" width={200} height={187} />
          <ActionButton onClick={connectWallet}>Подключить кошелек</ActionButton>
        </WalletContainer>
        <AIAssistant />
      </Container>
    );
  }

  return (
    <Container>
      <WalletContainer>
        <WalletHeader>Ваш кошелек</WalletHeader>
        
        <AddressContainer>
          <AddressText>{address}</AddressText>
        </AddressContainer>

        <WalletBalanceSection>
          <BalanceTitle>Баланс</BalanceTitle>
          <BalanceAmount>{balance}</BalanceAmount>
        </WalletBalanceSection>

        <ActionsContainer>
          <ActionButton>Отправить</ActionButton>
          <ActionButton>Получить</ActionButton>
          <ActionButton>История</ActionButton>
        </ActionsContainer>
      </WalletContainer>
      <AIAssistant />
    </Container>
  );
};

export default WalletPage;
