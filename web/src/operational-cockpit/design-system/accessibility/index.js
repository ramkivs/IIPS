export const accessibilityBaseline = Object.freeze({
  wcagTarget: 'WCAG 2.2 AA',
  keyboard: Object.freeze(['all interactive elements keyboard operable', 'visible focus required', 'Escape closes drawer when safe']),
  focusManagement: Object.freeze(['row selection moves focus to drawer heading', 'drawer close restores focus', 'refresh notices do not steal focus unless blocking']),
  screenReader: Object.freeze(['landmark regions labelled', 'status changes announced', 'color never sole indicator']),
  touchTargets: '44px minimum where applicable',
  reducedMotion: true
});
