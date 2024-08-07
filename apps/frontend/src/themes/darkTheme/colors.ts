const colors = {
  neutral0: '#FFFFFF',
  neutral1: '#F0F2FA',
  neutral2: '#E3E9F9',
  neutral3: '#DFE5FA',
  neutral4: '#9A9ABD',
  neutral5: '#313A45',
  neutral6: '#1F262B',
  neutral7: '#1A1D1F',
  neutral8: '#111315',
  primary01: '#3FE8BD',
  primary02: '#1DD4A6',
  primary03: '#00B493',
  secondary1: '#FF6A55',
  secondary2: '#FFB8AE',
  secondary3: '#CFDAFF',
};
// eslint-disable-next-line
export default {
  ...colors,
  mainBackground: colors.neutral6,
  text: colors.neutral2,
  disabledBtnTextColor: 'rgba(255, 255, 255, 0.35)',
  disabledBtnColor: colors.neutral5,

  tutorial: {
    background: '#262F33',
  },

  button: {
    backgroundDisabled: colors.neutral5,

    primaryColor: colors.neutral7,
    primaryBackground: colors.primary01,
    primaryBackgroundHover: colors.primary02,

    secondaryColor: colors.neutral1,
    secondaryBackground: colors.neutral5,
    secondaryBackgroundHover: colors.neutral4,
  },
  divider: 'rgba(223, 229, 250, 0.2)',
  switch: {
    background: colors.neutral5,
    circleColor: colors.neutral6,
  },
  modal: {
    background: colors.neutral7,
    mask: 'rgba(49, 58, 69, 0.8)',
  },
  table: {
    headerColor: colors.neutral4,
    background: 'rgba(169, 213, 245, 0.05);',
  },
  tooltip: {
    border: 'none',
    background: '#262F33',
    hoverElement: colors.neutral5,
  },
  tokenTooltip: {
    background: '#262F33',
  },
  header: {
    navLinkBackground: colors.neutral5,
    walletInfoColor: colors.neutral4,
    walletAddressBackground: colors.neutral5,
    mobileMenuIconBackground: colors.neutral5,
    mobileMenuIconColor: colors.neutral2,
  },
  skeleton: {
    base: colors.neutral6,
    highlight: colors.neutral5,
  },
  switchButtons: {
    selectedBackground: colors.neutral6,
    selectedColor: colors.neutral3,
    secondaryBackground: colors.neutral5,
    secondaryColor: colors.neutral4,
  },
  dashboard: {
    tokenRowSelected: '#313A45',
    tokenRowColor: '#262F33',
    cardBackground: '#262F33',
  },
  supplyBtn: {
    background: '#1F262B',
    backgroundSelected: '#333D46',
    backgroundDisabled: '#232A2E',
  },

  card: {
    background: '#262F33',
    border: colors.neutral5,
  },
  icon: {
    borderColor: 'none',
  },
  progressBar: {
    main: colors.primary03,
    secondary: colors.neutral5,
    red: colors.primary03,
  },
  gradient: 'rgba(0, 0, 0, 0.5);',
  notifications: {
    boxShadow:
      '0px 0px 14px -4px rgba(227, 233, 249, 0.05), 0px 32px 48px -8px rgba(227, 233, 249, 0.1)',
    background: colors.neutral7,
    warningBackground: 'rgb(150 93 85 / 60%)',
  },
  textArea: {
    borderColor: colors.neutral5,
  },
  tokenDescGradient:
    'linear-gradient(180deg, rgba(248, 248, 255, 0) 0%, #181931 100%)',
  noNftGradient:
    '-webkit-linear-gradient(rgba(255, 255, 255, 0), rgb(20 22 49) 57.65%);',
};
