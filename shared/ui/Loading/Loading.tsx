"use client"
import React from 'react';
import Image from 'next/image';

import { Container, Circle,  } from './styles';

const Loading = () => {
  return (
    <Container>
      <Circle className="outer" />
      <Circle className="middle" />
      <Circle className="inner" />
      <Image src="/img/metamask.png" alt="logo" width={114} height={107} />
    </Container>
  );
};

export default Loading;