"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ButtonWhite } from "@/shared/ui";

import { Container, UpperText, VisualContent, MainContent } from "./styles";

export default function BuildWalletSection() {
  const router = useRouter();

  return (
    <>
      <Container>
        <UpperText>FULL/SCAN</UpperText>
        <VisualContent>
          <Image src="/img/bitcoin.png" alt="icon" width={743} height={743} />

          <MainContent>
            <Image
              src="/img/rectangles.png"
              alt="icon"
              width={409}
              height={409}
            />
            <p>
              <span>BUILD</span>
              <br />
              YOUR
              <br />
              WALLET
            </p>
            <ButtonWhite text="NOW" action={() => router.push("#connectWallet")} />
          </MainContent>

          <Image
            src="/img/connectNow.png"
            alt="icon"
            width={409}
            height={818}
          />
        </VisualContent>
      </Container>
    </>
  );
}
