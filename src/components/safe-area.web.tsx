import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

type Edge = 'top' | 'right' | 'bottom' | 'left';
type Props = ViewProps & { edges?: readonly Edge[] };
const allEdges: readonly Edge[] = ['top', 'right', 'bottom', 'left'];
const paddingKeys = { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' } as const;

// SDK 58 streams web routes. Native safe-area measurement can interrupt hydration,
// so web uses browser CSS insets and keeps the provider only on native platforms.
export function SafeAreaProvider({ children }: PropsWithChildren) {
  return children;
}

export function SafeAreaView({ edges = allEdges, style, ...props }: Props) {
  const flat = StyleSheet.flatten(style) || {};
  const insets: Record<string, string> = {};
  for (const edge of edges) {
    const key = paddingKeys[edge];
    const base = flat[key] ?? (edge === 'top' || edge === 'bottom' ? flat.paddingVertical : flat.paddingHorizontal) ?? flat.padding ?? 0;
    const cssBase = typeof base === 'number' ? `${base}px` : base;
    insets[key] = `calc(${cssBase} + env(safe-area-inset-${edge}, 0px))`;
  }
  // CSS env()/calc() are supported by RN Web but not native ViewStyle types.
  return <View {...props} style={[style, insets as unknown as ViewStyle]} />;
}
