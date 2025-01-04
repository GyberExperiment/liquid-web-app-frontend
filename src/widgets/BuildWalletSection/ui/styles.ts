import styled from "@emotion/styled";

export const Container = styled.section`
  display: flex;
  flex-direction: column;
  height: 841px;
  width: 1785px;
  max-width: 95vw;
  margin: 0 auto;
  font-family: "Consolas", "Inter", sans-serif;
`;

export const UpperText = styled.p`
  font-size: 41px;
  line-height: 0.7;
  letter-spacing: 0.89em;
`;

export const VisualContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: 818;
  width: 100%;
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  p {
    font-size: 41px;
    line-height: 1.64em;
    letter-spacing: 0.89em;

    span {
      color: #FF47F8;
    }
  }
`