declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FC<React.SVGAttributes<SVGElement>>;
  const src: string;
  export default src;
}
