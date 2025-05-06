import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module '@emotion/styled' {
  import styled from '@emotion/styled/base';
  export * from '@emotion/styled/base';
  export default styled;
}

declare module 'react' {
  export = React;
  export as namespace React;
}
