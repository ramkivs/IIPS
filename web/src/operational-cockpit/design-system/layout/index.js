export function createLayoutPrimitive(type, props = {}) {
  if (!['AppShell','Stack','Grid','Flex','PageContainer','SectionContainer'].includes(type)) throw new Error(`Unsupported layout primitive: ${type}`);
  return deepFreeze({
    component: type,
    ownsBusinessLogic: false,
    usesRuntimeTokens: true,
    props: { ...props },
    guardrail: 'Layout primitives own layout only and must not compute operational state.'
  });
}

export const breakpoints = Object.freeze({
  wideDesktop: 1320,
  desktop: 1024,
  tablet: 768,
  mobile: 480
});

export function createResponsiveRule({ breakpoint, behavior }) {
  if (!Object.keys(breakpoints).includes(breakpoint)) throw new Error(`Unknown breakpoint: ${breakpoint}`);
  return Object.freeze({ breakpoint, minWidth: breakpoints[breakpoint], behavior });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
