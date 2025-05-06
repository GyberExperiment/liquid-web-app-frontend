"use client";
import React from "react";
import Image from "next/image";
import { useWallet } from "@/shared/lib/context/WalletContext";

import { Container, Title, LowerContainer, WalletInfo, AddressText, BalanceText, Button, LoadingWrapper } from "./styles";
import { Loading } from "@/shared/ui";

const ConnectWallet = () => {
  const { isConnected, address, balance, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <Container onClick={handleClick}>
      {isConnecting ? (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      ) : isConnected ? (
        <>
          <Title>КОШЕЛЕК ПОДКЛЮЧЕН</Title>
          <WalletInfo>
            <AddressText>{address}</AddressText>
            <BalanceText>{balance}</BalanceText>
          </WalletInfo>
          <Image src="/img/metamask.png" alt="connected" width={128} height={120} />
          <Button>ОТКЛЮЧИТЬ</Button>
        </>
      ) : (
        <>
          <Title>ПОДКЛЮЧИТЬ КОШЕЛЕК</Title>
          <Image src="/img/metamask.png" alt="connect" width={256} height={240} />
          <Button>ПОДКЛЮЧИТЬ</Button>
        </>
      )}
      <LowerContainer />
    </Container>
  );
};

export default ConnectWallet;
