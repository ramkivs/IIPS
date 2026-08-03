export const primitiveCatalog = Object.freeze({
  Button: Object.freeze({ purpose: 'Trigger user intent', ownsBusinessLogic: false, requiredA11y: ['keyboard operable', 'visible focus', 'accessible name'] }),
  Card: Object.freeze({ purpose: 'Group related content', ownsBusinessLogic: false, requiredA11y: ['semantic region when needed'] }),
  Panel: Object.freeze({ purpose: 'Major cockpit region', ownsBusinessLogic: false, requiredA11y: ['heading association'] }),
  Badge: Object.freeze({ purpose: 'Display backend-provided status', ownsBusinessLogic: false, requiredA11y: ['text label required', 'not color-only'] }),
  Drawer: Object.freeze({ purpose: 'Show selected item detail', ownsBusinessLogic: false, requiredA11y: ['focus on open', 'focus restore on close'] }),
  DataTable: Object.freeze({ purpose: 'Display tabular operational data', ownsBusinessLogic: false, requiredA11y: ['headers', 'row focus', 'selected state'] }),
  EmptyState: Object.freeze({ purpose: 'Display backend-provided empty/unavailable reason', ownsBusinessLogic: false, requiredA11y: ['status text announced'] }),
  StatusPill: Object.freeze({ purpose: 'Compact status display', ownsBusinessLogic: false, requiredA11y: ['text label required'] })
});

export function createPrimitiveDescriptor(name, props = {}) {
  const primitive = primitiveCatalog[name];
  if (!primitive) throw new Error(`Unknown design primitive: ${name}`);
  return deepFreeze({ component: name, ...primitive, props });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
