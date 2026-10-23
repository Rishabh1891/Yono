import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { yono as c } from '../constants/yono-theme';

type Entry = { title: string; amount: string; month: string; isCredit?: boolean };
const money = (value: number) => `₹${(value / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const paise = (amount: string) => {
  const [rupees, decimal = ''] = amount.replaceAll(',', '').split('.');
  return Number(rupees) * 100 + Number(decimal.padEnd(2, '0'));
};

export function SpendAnalysis({ transactions }: { transactions: Entry[] }) {
  const month = transactions[0]?.month;
  const entries = transactions.filter(t => t.month === month);
  const income = entries.filter(t => t.isCredit).reduce((total, t) => total + paise(t.amount), 0);
  const outgoing = entries.filter(t => !t.isCredit).reduce((total, t) => total + paise(t.amount), 0);
  const merchants = new Map<string, number>();
  entries.filter(t => !t.isCredit).forEach(t => merchants.set(t.title, (merchants.get(t.title) || 0) + paise(t.amount)));
  const top = [...merchants].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const colors = [c.purple, c.magenta, c.indigo, '#A17DC4', '#C8AFDF'];

  return <View style={s.content}>
    <Text style={s.eyebrow}>YOUR MONEY AT A GLANCE</Text>
    <Text style={s.title}>{month || 'Spend analysis'}</Text>
    <View style={s.summary}>
      <View style={s.summaryItem}><Ionicons name="arrow-down-circle-outline" size={25} color="#278053" /><Text style={s.label}>Money in</Text><Text adjustsFontSizeToFit numberOfLines={1} style={s.amount}>{money(income)}</Text></View>
      <View style={s.divider} />
      <View style={s.summaryItem}><Ionicons name="arrow-up-circle-outline" size={25} color={c.magenta} /><Text style={s.label}>Money out</Text><Text adjustsFontSizeToFit numberOfLines={1} style={s.amount}>{money(outgoing)}</Text></View>
    </View>
    <View style={s.card}><Text style={s.cardTitle}>Where your money went</Text><Text style={s.caption}>Your top payees this month</Text>
      {top.map(([name, total], i) => <View key={name} style={s.merchant}>
        <View style={s.row}><Text style={s.name} numberOfLines={1}>{name}</Text><Text style={s.value}>{money(total)}</Text></View>
        <View accessibilityLabel={`${name}: ${outgoing ? Math.round(total / outgoing * 100) : 0}% of outgoing payments`} style={s.track}><View style={[s.fill, { width: `${outgoing ? total / outgoing * 100 : 0}%`, backgroundColor: colors[i] }]} /></View>
      </View>)}
      {top.length === 0 && <Text style={s.caption}>No outgoing payments for this month.</Text>}
    </View>
    <View style={s.note}><Ionicons name="information-circle-outline" size={18} color={c.purple} /><Text style={s.noteText}>Calculated from the transactions in your demo passbook.</Text></View>
  </View>;
}

const s = StyleSheet.create({
  content: { padding: 20, gap: 12 }, eyebrow: { fontSize: 9, fontWeight: '600', letterSpacing: 1.4, color: c.muted }, title: { fontSize: 23, fontWeight: '700', color: c.ink, marginBottom: 7 },
  summary: { flexDirection: 'row', backgroundColor: c.white, borderRadius: 18, borderWidth: 1, borderColor: c.line, paddingVertical: 20 }, summaryItem: { flex: 1, paddingHorizontal: 18, gap: 9 }, divider: { width: 1, backgroundColor: c.line }, label: { fontSize: 12, color: c.muted }, amount: { fontSize: 21, fontWeight: '700', color: c.ink },
  card: { backgroundColor: c.white, borderRadius: 18, borderWidth: 1, borderColor: c.line, padding: 20, marginTop: 4 }, cardTitle: { fontSize: 16, fontWeight: '700', color: c.ink }, caption: { color: c.muted, fontSize: 12, marginTop: 8 }, merchant: { marginTop: 25 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }, name: { flex: 1, fontSize: 12, color: c.ink }, value: { fontSize: 12, fontWeight: '600', color: c.purple }, track: { height: 7, backgroundColor: c.lavender, borderRadius: 4, marginTop: 10, overflow: 'hidden' }, fill: { height: 7, borderRadius: 4 },
  note: { flexDirection: 'row', gap: 8, padding: 10 }, noteText: { flex: 1, color: c.muted, fontSize: 11, lineHeight: 17 },
});
