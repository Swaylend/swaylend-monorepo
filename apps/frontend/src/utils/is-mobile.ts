export const isMobile = (userAgent: string): boolean => {
  return /(Mobile|Android|Silk|Kindle|BlackBerry|Opera (Mini|Mobi)|iP(hone|ad|od)|webOS|Windows Phone|IEMobile)/i.test(
    userAgent
  );
};
