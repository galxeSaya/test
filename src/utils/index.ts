export const getIsMobile = () =>
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// export const getIsMobile = () => true;
