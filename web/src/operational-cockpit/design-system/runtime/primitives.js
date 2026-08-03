import { createPrimitiveDescriptor } from '../primitives/index.js';

export function renderPrimitive(name, { props = {}, children = [] } = {}) {
  const descriptor = createPrimitiveDescriptor(name, props);
  return deepFreeze({
    ...descriptor,
    renderType: 'virtual-node',
    tagName: tagForPrimitive(name),
    className: `iips-${name.toLowerCase()}`,
    attributes: createAttributes(name, props),
    children: Array.isArray(children) ? children : [children],
    usesRuntimeTokens: true
  });
}

export function renderButton(props = {}, children = []) { return renderPrimitive('Button', { props, children }); }
export function renderCard(props = {}, children = []) { return renderPrimitive('Card', { props, children }); }
export function renderPanel(props = {}, children = []) { return renderPrimitive('Panel', { props, children }); }
export function renderBadge(props = {}, children = []) { return renderPrimitive('Badge', { props, children }); }
export function renderDrawer(props = {}, children = []) { return renderPrimitive('Drawer', { props, children }); }
export function renderDataTable(props = {}, children = []) { return renderPrimitive('DataTable', { props, children }); }
export function renderEmptyState(props = {}, children = []) { return renderPrimitive('EmptyState', { props, children }); }
export function renderStatusPill(props = {}, children = []) { return renderPrimitive('StatusPill', { props, children }); }

function tagForPrimitive(name) {
  return ({ Button:'button', Card:'section', Panel:'section', Badge:'span', Drawer:'aside', DataTable:'table', EmptyState:'section', StatusPill:'span' })[name] ?? 'div';
}

function createAttributes(name, props) {
  const attributes = { ...props };
  if (name === 'Button') attributes.type = attributes.type ?? 'button';
  if (name === 'Drawer') attributes.role = attributes.role ?? 'complementary';
  if (name === 'EmptyState') attributes.role = attributes.role ?? 'status';
  if (name === 'Badge' || name === 'StatusPill') attributes['aria-label'] = attributes['aria-label'] ?? attributes.label ?? attributes.children ?? name;
  return Object.freeze(attributes);
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
