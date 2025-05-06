import styled from "@emotion/styled";

export const Container = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 1742px;
  max-width: 95vw;
  margin: 0 auto;
`;

export const TextContent = styled.div`
  width: 100%;
  max-width: 885px;
  display: flex;
  flex-direction: column;
  gap: 48px;

  h1 {
    font-size: 64px;
    line-height: 56px;
    line-height: 1.64em;
    letter-spacing: 0.15em;
    font-weight: 300;
  }

  p {
    font-size: 24px;
    line-height: 2.04em;
    letter-spacing: 0.15em;
    font-weight: 300;
  }
`

export const WiderText = styled.span`
  letter-spacing: 0.25em;
`

export const Lime = styled.span`
  color: #66FF63;
`