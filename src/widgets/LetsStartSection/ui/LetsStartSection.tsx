"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

import { ButtonWhite } from '@/shared/ui';

import { Container } from './styles';

const LetsStartSection = () => {
  const router = useRouter()

  return (
    <Container>
      <h1>LETS START</h1>
      <ButtonWhite text="NOW" action={() => router.push("#connectWallet")} />
    </Container>
  );
};

export default LetsStartSection;