import styled from "@emotion/styled";

export const Container = styled.main`
  display: grid;
  grid-template-rows: repeat(4, max(100vh, 1000px));
  justify-items: center;
  align-items: center;
  grid-gap: 100px;
`;