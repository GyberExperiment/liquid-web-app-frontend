import styled from "@emotion/styled";

export const Status = styled.p<{ isWorking: boolean }>`
  color: ${(props) => (props.isWorking ? "#7FFF7C" : "red")};
`;