"use client";
import React from "react";

import { BuildWalletSection } from "@/widgets/BuildWalletSection";
import { LetsStartSection } from "@/widgets/LetsStartSection";
import { ServersSection } from "@/widgets/ServersSection";

import { Container } from "./styles";
import { ConnectWallet } from "@/widgets/ConnectWallet";

const MainPage = () => {
  return (
    <Container>
      <ServersSection isWorking={true} />
      <BuildWalletSection />
      <LetsStartSection />
      <ConnectWallet />
    </Container>
  );
};

export default MainPage;
