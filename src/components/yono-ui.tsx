import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from './safe-area';
import { yono as c } from '../constants/yono-theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export function Brand({ light = false, large = false }: { light?: boolean; large?: boolean }) {
  return <View accessibilityLabel="YONO SBI" style={s.brand}>
    <Text style={[s.wordmark, large && { fontSize: 47 }, light && { color: c.white }]}>yono</Text>
    <View style={[s.brandRule, light && { backgroundColor: '#FFFFFF60' }]} />
    <View style={s.sbiMark}><View style={s.keyhole} /><View style={s.keyStem} /></View>
    <Text style={[s.sbiText, light && { color: c.white }]}>SBI</Text>
  </View>;
}

export function IconButton({ icon, label, onPress, light = false }: {
  icon: IconName; label: string; onPress: () => void; light?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => [s.iconButton, pressed && { opacity: 0.5 }]}>
    <Ionicons name={icon} size={23} color={light ? c.white : c.purple} />
  </Pressable>;
}

export function ServiceTile({ icon, label, onPress, tint = c.purple }: {
  icon: IconName; label: string; onPress: () => void; tint?: string;
}) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.tile, pressed && { opacity: 0.55 }]}>
    <View style={[s.tileIcon, { backgroundColor: `${tint}0D` }]}><Ionicons name={icon} color={tint} size={27} /></View>
    <Text style={s.tileLabel}>{label}</Text>
  </Pressable>;
}

// Extra services have a clear local preview instead of simulating a bank connection.
export function useServicePreview() {
  const [service, setService] = useState<{ title: string; description: string } | null>(null);
  const open = (title: string, description?: string) => setService({ title, description: description || `${title} is available in the official YONO SBI app. This preview is not connected to SBI banking services.` });
  const modal = <Modal visible={!!service} transparent animationType="slide" onRequestClose={() => setService(null)}>
    <View style={s.overlay}>
      <Pressable accessibilityLabel="Close service preview" style={StyleSheet.absoluteFill} onPress={() => setService(null)} />
      <SafeAreaView edges={['bottom']} style={s.sheet}>
        <View style={s.handle} />
        <View style={s.sheetHeader}><Text accessibilityRole="header" style={s.sheetTitle}>{service?.title}</Text><IconButton icon="close" label="Close" onPress={() => setService(null)} /></View>
        <ScrollView><Text style={s.sheetBody}>{service?.description}</Text></ScrollView>
        <Pressable accessibilityRole="button" style={s.button} onPress={() => setService(null)}><Text style={s.buttonText}>Got it</Text></Pressable>
      </SafeAreaView>
    </View>
  </Modal>;
  return { open, modal };
}

const s = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  wordmark: { fontSize: 32, color: c.purple, fontWeight: '800', letterSpacing: -1.8 },
  brandRule: { height: 24, width: 1, backgroundColor: '#D9CDE6', marginHorizontal: 4 },
  sbiMark: { width: 22, height: 22, borderRadius: 11, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  keyhole: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.white },
  keyStem: { width: 3, height: 10, backgroundColor: c.white, position: 'absolute', bottom: 0 },
  sbiText: { color: c.purpleDark, fontSize: 23, fontWeight: '800', letterSpacing: -1 },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tile: { width: '25%', alignItems: 'center', paddingHorizontal: 3, paddingVertical: 9, gap: 9 },
  tileIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { color: c.ink, fontSize: 11, lineHeight: 16, textAlign: 'center', minHeight: 32 },
  overlay: { flex: 1, backgroundColor: '#1D0D354D', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { width: '100%', maxWidth: 560, maxHeight: '80%', backgroundColor: c.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DDD6E5', alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sheetTitle: { fontSize: 21, fontWeight: '700', color: c.ink, flex: 1 },
  sheetBody: { fontSize: 15, lineHeight: 24, color: c.muted, marginVertical: 16 },
  button: { backgroundColor: c.purple, borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: c.white, fontWeight: '700', fontSize: 15 },
});
