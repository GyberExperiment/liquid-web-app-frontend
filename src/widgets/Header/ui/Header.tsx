import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Logo } from "@/shared/ui";

import { Container, Icon, Nav, Content } from "./styles";

export default function Header() {
  const pathname = usePathname();

  return (
    <Container>
      <Content>
        <Logo />
        <Nav>
          <Link href="/about" className={pathname === "/about" ? "active" : ""}>
            /about
          </Link>
          <Link
            href="/product"
            className={pathname === "/product" ? "active" : ""}
          >
            /product
          </Link>
          <Link
            href="/roadmap"
            className={pathname === "/roadmap" ? "active" : ""}
          >
            /roadmap
          </Link>
          <Link href="/docs" className={pathname === "/docs" ? "active" : ""}>
            /docs
          </Link>
          <Link
            href="/profile"
            className={pathname === "/profile" ? "active" : ""}
          >
            /profile
          </Link>
        </Nav>
        <Icon>
          <Link href="/wallet">
            <Image src="img/wallet.svg" alt="wallet" width={57} height={57} />
          </Link>
        </Icon>
      </Content>
    </Container>
  );
}
