"use client"
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { LogoContainer, LogoText } from "./styles";

const Logo = () => {
  return (
    <LogoContainer>
      <Link href="/">
        <Image src="img/logo.svg" alt="wallet" width={77} height={50} />
        <LogoText>
          <p>
            lqd
            <br />
            banks
          </p>
        </LogoText>
      </Link>
    </LogoContainer>
  );
};

export default Logo;
