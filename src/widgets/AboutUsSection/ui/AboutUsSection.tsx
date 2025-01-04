"use client";
import React from "react";

import { Container, TextContent, WiderText, Lime } from "./styles";
import Image from "next/image";

const AboutUsSection = () => {
  return (
    <Container>
      <TextContent>
        <h1>/about LQD</h1>
        <p><WiderText>Welcome to <Lime>lqd!</Lime></WiderText></p>
        <p>
          Welcome to lqd! Our goal is to elevate decentralized finance (DeFi) to
          a new functional level where decentralized financial instruments can
          fully compete with and surpass traditional banking services in terms
          of convenience, power, and functionality.
        </p>
      </TextContent>

      <Image src="/img/tablet.png" alt="tablet" width={506} height={489} />
    </Container>
  );
};

export default AboutUsSection;
