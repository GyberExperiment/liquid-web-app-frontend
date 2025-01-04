"use client"
import React from 'react';
import { Button } from './styles';

interface ButtonWhiteProps {
  action: VoidFunction;
  text: string;
}

const ButtonWhite = ({ action, text }: ButtonWhiteProps) => {
  return (
    <Button onClick={action}>{text}</Button>
  );
};

export default ButtonWhite;