"use client";
import { Header } from "@/widgets/Header";

export default function InfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}