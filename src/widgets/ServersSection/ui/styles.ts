import styled from "@emotion/styled";

export const Container = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 561px;
  width: 1745px;
  max-width: 95vw;
  padding: 18px 21px 104px 87px;
  border: 1px solid #FFF;
  border-radius: 48px;
  margin: 0 auto;
`;

export const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 50px;

  p, h1 {
    font-size: 97px;
    font-weight: 300;
    letter-spacing: 0.54em;
    line-height: 1.64em;
    font-family: "Consolas", "Inter", sans-serif;
  }
`;
