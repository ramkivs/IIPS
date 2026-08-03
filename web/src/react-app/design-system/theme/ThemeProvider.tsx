import React, { createContext, useContext, useMemo } from 'react';
import { designTokenAliases, flattenDesignTokens, reactDesignTokens, type ReactDesignTokens } from '../tokens/tokens';

type ThemeContextValue = {
  name: string;
  tokens: ReactDesignTokens;
  cssVariables: Record<string, string>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, name = 'default', tokens = reactDesignTokens }: { children: React.ReactNode; name?: string; tokens?: ReactDesignTokens }) {
  const value = useMemo(() => ({ name, tokens, cssVariables: { ...flattenDesignTokens(tokens), ...designTokenAliases(tokens) } }), [name, tokens]);
  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={name} style={value.cssVariables as React.CSSProperties}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
