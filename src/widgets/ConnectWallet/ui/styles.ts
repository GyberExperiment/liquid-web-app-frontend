import styled from "@emotion/styled";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;;
  width: 520px;
  height: 647px;
  background-color: black;
  border-radius: 59px;
  border: 1px solid white;
  position: relative;
  padding: 68px 54px 176px 54px;
`;

export const Title = styled.h2`
  font-family: "Inter", sans-serif;
  font-size: 44px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
`;

export const LowerContainer = styled.div`
  width: 520px;
  height: 647px;
  background-color: black;
  border-radius: 59px;
  border: 1px solid white;
  position: absolute;
  bottom: -13px;
  z-index: -1;
`;