import styled from "@emotion/styled";

export const Container = styled.header`
  display: flex;
  justify-content: center;
  background-color: #000;
  height: 154px;
  width: 100%;
  padding: 42px 124px 41px 71px;
  position: fixed;
  top: 0;
  z-index: 99999;
`;

export const Content = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Nav = styled.nav`
  display: flex;
  width: 100%;
  justify-content: space-evenly;

  a {
    font-size: 26px;
    letter-spacing: 0.07em;
    font-weight: 300;
    position: relative;

    &:after {
      content: "";
      display: block;
      width: 100%;
      position: absolute;
      bottom: 0;
      transform: scaleX(0);
      height: 2px;
      background: #fff;
      transition: 0.6s ease;
      transform-origin: left center;
    }

    &:hover:after,
    &.active:after {
      transform: scaleX(1);
    }
  }
`;

export const Icon = styled.div`
  display: flex;
  align-items: center;
`;
