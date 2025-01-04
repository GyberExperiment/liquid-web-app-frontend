"use client";
import Image from "next/image";

import { Container, TextContent } from "./styles";
import { WorkingStatus } from "@/shared/ui";

interface ServersSectionProps {
  isWorking: boolean;
}

export default function ServersSection({ isWorking }: ServersSectionProps) {
  return (
    <>
      <Container>
        <TextContent>
          <h1>lqd servers</h1>
          <WorkingStatus isWorking={isWorking} />
        </TextContent>
        <Image src="/img/star.png" alt="star" width={439} height={439} />
      </Container>
    </>
  );
}
