import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Container, Title, LowerContainer } from "./styles";

const ConnectWallet = () => {
  return (
    <Link href={"/wallet"} id="connectWallet">
      <Container>
        <Title>CONNECT WALLET</Title>
        <Image src="/img/metamask.png" alt="connect" width={256} height={240} />

        <LowerContainer />
      </Container>
    </Link>
  );
};

export default ConnectWallet;
