const MOBILE_REGEX =
  /(Mobile|Android|Silk|Kindle|BlackBerry|Opera (Mini|Mobi)|iP(hone|ad|od)|webOS|Windows Phone|IEMobile)/i;

export const isMobile = (userAgent: string): boolean => {
  return MOBILE_REGEX.test(userAgent);
};
