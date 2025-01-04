import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

export const moveToMiddle = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.84);
  }
  100% {
    transform: scale(0.84);
  }
`;

export const moveToInner = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.66);
  }
`;

export const Container = styled.div`
  position: relative;
  width: 364px;
  height: 364px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

export const Circle = styled.div`
  position: absolute;
  border: 1px solid white;
  box-shadow: 0 0 0 5px black, 0 0 0 6px white;
  border-radius: 50%;
  width: 95%;
  height: 95%;
  
  &.middle {
    animation: ${moveToMiddle} 4s ease-in-out forwards;
  }

  &.inner {
    animation: ${moveToInner} 4s ease-in-out forwards;
  }
`;