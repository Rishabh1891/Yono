import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import type { TextInputInstance, ScrollViewInstance } from 'react-native';
import { SafeAreaView } from './safe-area';
import { yono as c } from '../constants/yono-theme';
import { Brand, IconButton, IconName, ServiceTile, useServicePreview } from './yono-ui';

type Action = () => void;
type RecentTransaction = { title: string; date: string; amount: string; isCredit?: boolean };

export function LoginScreen({ mpin, onMpinChange, inputRef, error }: {
  mpin: string; onMpinChange: (value: string) => void; inputRef: React.RefObject<TextInputInstance | null>; error: string;
}) {
  const preview = useServicePreview();
  const [quickTab, setQuickTab] = useState('Quick links');
  const quickLinks: { label: string; icon: IconName }[] = quickTab === 'Quick links'
    ? [{ label: 'YONO Cash', icon: 'cash-outline' }, { label: 'Quick Pay', icon: 'swap-horizontal-outline' }, { label: 'Bill Payments', icon: 'receipt-outline' }, { label: 'Open Account', icon: 'person-add-outline' }]
    : quickTab === 'Calculators'
      ? [{ label: 'Home Loan', icon: 'home-outline' }, { label: 'Personal Loan', icon: 'wallet-outline' }, { label: 'Fixed Deposit', icon: 'calculator-outline' }, { label: 'SIP', icon: 'trending-up-outline' }]
      : [{ label: 'Shopping', icon: 'bag-handle-outline' }, { label: 'Travel', icon: 'airplane-outline' }, { label: 'Dining', icon: 'restaurant-outline' }, { label: 'Rewards', icon: 'gift-outline' }];

  return <SafeAreaView style={s.page}>
    <StatusBar barStyle="dark-content" />
    <View style={s.topbar}><Brand /><View style={s.row}>
      <IconButton icon="language-outline" label="Language" onPress={() => preview.open('Language', 'This preview is available in English. The official YONO app supports additional Indian languages.')} />
      <IconButton icon="headset-outline" label="Help and support" onPress={() => preview.open('Help & support')} />
    </View></View>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.loginContent}>
        <View style={s.welcome}>
          <View style={s.avatar}><Text style={s.avatarText}>RT</Text><View style={s.onlineDot} /></View>
          <Text style={s.eyebrow}>WELCOME BACK</Text>
          <Text style={s.welcomeName}>Rishabh Tripathi</Text>
          <Text style={s.muted}>Your world of banking, in one place.</Text>
        </View>
        <View style={s.loginCard}>
          <View style={s.between}><Text style={s.loginTitle}>Login with mPIN</Text><Ionicons name="shield-checkmark-outline" size={20} color={c.purple} /></View>
          <Text style={s.loginHint}>Enter your 6-digit mPIN</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Enter six digit mPIN" onPress={() => inputRef.current?.focus()} style={s.pinRow}>
            {Array.from({ length: 6 }, (_, i) => <View key={i} style={[s.pinBox, mpin.length === i && s.pinFocus]}>{mpin.length > i ? <View style={s.pinDot} /> : <View style={s.pinDash} />}</View>)}
          </Pressable>
          <TextInput ref={inputRef} accessibilityLabel="YONO mPIN" value={mpin} onChangeText={onMpinChange} keyboardType="number-pad" maxLength={6} secureTextEntry caretHidden style={s.hiddenInput} />
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
          <View style={[s.between, { justifyContent: 'flex-end' }]}>
            <Pressable accessibilityRole="button" onPress={() => preview.open('Forgot mPIN?', 'To reset your mPIN, use the official YONO SBI app.')} style={s.textButton}><Text style={s.link}>Forgot mPIN?</Text></Pressable>
          </View>
          <Pressable accessibilityRole="button" style={s.primaryButton} onPress={() => mpin.length === 6 ? onMpinChange(mpin) : inputRef.current?.focus()}><Text style={s.primaryText}>Login</Text><Ionicons name="arrow-forward" size={18} color={c.white} /></Pressable>
          <View style={s.orRow}><View style={s.rule} /><Text style={s.orText}>or</Text><View style={s.rule} /></View>
          <Pressable accessibilityRole="button" onPress={() => preview.open('Login with User ID', 'User ID login is not available in this preview. Please log in with your mPIN.')} style={s.secondaryButton}><Text style={s.link}>Login with User ID</Text><Ionicons name="chevron-forward" size={16} color={c.purple} /></Pressable>
        </View>
        <View style={s.quickSection}>
          <View style={s.tabs}>{['Quick links', 'Calculators', 'Offers'].map(tab => <Pressable accessibilityRole="tab" accessibilityState={{ selected: quickTab === tab }} key={tab} onPress={() => setQuickTab(tab)} style={[s.tab, quickTab === tab && s.tabActive]}><Text style={[s.tabText, quickTab === tab && s.tabTextActive]}>{tab}</Text></Pressable>)}</View>
          <View style={s.grid}>{quickLinks.map(item => <ServiceTile key={item.label} {...item} onPress={() => preview.open(item.label)} />)}</View>
        </View>
        <LinearGradient colors={['#F0EAF8', '#FCEAF4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.loginBanner}>
          <View style={s.flex}><Text style={s.bannerEyebrow}>YOU ONLY NEED ONE</Text><Text style={s.bannerTitle}>A little simpler. A lot more you.</Text><Text style={s.bannerSub}>Bank. Pay. Invest. All with YONO.</Text></View>
          <View style={s.bannerIcon}><Ionicons name="sparkles-outline" size={39} color={c.magenta} /></View>
        </LinearGradient>
        <View style={s.secureFooter}><Ionicons name="lock-closed-outline" size={12} color={c.muted} /><Text style={s.footerText}>You only need one.</Text></View>
      </ScrollView>
    </KeyboardAvoidingView>
    <View style={s.loginBottom}>
      <BottomItem icon="location-outline" label="Locate us" onPress={() => preview.open('Locate us')} />
      <BottomItem icon="qr-code-outline" label="Scan & Pay" onPress={() => preview.open('Scan & Pay')} />
      <BottomItem icon="grid-outline" label="Services" onPress={() => preview.open('Services')} />
      <BottomItem icon="help-circle-outline" label="Support" onPress={() => preview.open('Help & support')} />
    </View>
    {preview.modal}
  </SafeAreaView>;
}

export function DashboardScreen({ balance, showBalance, toggleBalance, onPassbook, onStatement, onTransfer, onLogout, refreshing, onRefresh, recent }: {
  balance: string; showBalance: boolean; toggleBalance: Action; onPassbook: Action; onStatement: Action; onTransfer: Action; onLogout: Action;
  refreshing: boolean; onRefresh: Action; recent: RecentTransaction[];
}) {
  const preview = useServicePreview();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { width } = useWindowDimensions();
  // Web does not implement native Text's adjustsFontSizeToFit behavior.
  const balanceFontSize = Math.min(28, Math.max(17, (Math.min(width, 560) - 130) / 9.5));
  const [tab, setTab] = useState('Banking');
  const [serviceSearch, setServiceSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const services: { label: string; icon: IconName; onPress: Action }[] = [
    { label: 'Fund Transfer', icon: 'swap-horizontal-outline', onPress: onTransfer },
    { label: 'Bill Payments', icon: 'receipt-outline', onPress: () => preview.open('Bill Payments') },
    { label: 'YONO Cash', icon: 'cash-outline', onPress: () => preview.open('YONO Cash') },
    { label: 'Passbook', icon: 'book-outline', onPress: onPassbook },
    { label: 'Deposits', icon: 'server-outline', onPress: () => preview.open('Deposits') },
    { label: 'Cards', icon: 'card-outline', onPress: () => preview.open('Cards') },
    { label: 'Investments', icon: 'trending-up-outline', onPress: () => preview.open('Investments') },
    { label: 'All Services', icon: 'grid-outline', onPress: () => preview.open('All Services', 'Explore fund transfers, account passbook and statement requests from the dashboard. Other banking services require the official YONO SBI app.') },
  ];
  const openProfile = () => preview.open('My profile', 'Rishabh Tripathi\nSBI Savings Account · •••• 2249');
  return <SafeAreaView style={s.page}>
    <StatusBar barStyle="dark-content" />
    <View style={s.topbar}>
      <Pressable accessibilityRole="button" accessibilityLabel="My profile" onPress={openProfile} style={s.profileButton}><View style={s.smallAvatar}><Text style={s.smallAvatarText}>RT</Text></View><View style={{ flexShrink: 1 }}><Text style={s.hello}>Hello, Rishabh</Text><Text style={s.headerCaption}>Welcome to the world of YONO SBI</Text></View></Pressable>
      <View style={s.row}><IconButton icon="search-outline" label="Search services" onPress={() => setSearchOpen(!searchOpen)} /><IconButton icon="notifications-outline" label="Notifications" onPress={() => preview.open('Notifications', 'You’re all caught up. New account alerts and updates will appear here.')} /><IconButton icon="log-out-outline" label="Log out" onPress={onLogout} /></View>
    </View>
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={s.dashboardContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.purple} colors={[c.purple]} />}>
      <View style={s.tabs}>{['Banking', 'Payments', 'Lifestyle'].map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={[s.tab, tab === item && s.tabActive]}><Text style={[s.tabText, tab === item && s.tabTextActive]}>{item}</Text></Pressable>)}</View>
      {searchOpen && <View style={s.serviceSearch}><Ionicons name="search-outline" size={20} color={c.purple} /><TextInput autoFocus accessibilityLabel="Search services" placeholder="Search banking services" placeholderTextColor={c.muted} style={s.searchInput} value={serviceSearch} onChangeText={setServiceSearch} /><IconButton icon="close" label="Clear search" onPress={() => { setServiceSearch(''); setSearchOpen(false); }} /></View>}
      {searchOpen ? <View style={s.section}><Text style={s.sectionTitle}>Search services</Text><View style={s.grid}>{services.filter(item => item.label.toLowerCase().includes(serviceSearch.toLowerCase())).map(item => <ServiceTile key={item.label} {...item} />)}</View>{!services.some(item => item.label.toLowerCase().includes(serviceSearch.toLowerCase())) && <Text style={s.muted}>No services found. Try “transfer” or “passbook”.</Text>}</View> : <>
        {tab === 'Banking' && <>
          <View style={s.sectionHeading}><Text style={s.sectionTitle}>My accounts</Text><Pressable accessibilityRole="button" onPress={onPassbook} style={s.textButton}><Text style={s.link}>View all <Ionicons name="chevron-forward" size={12} /></Text></Pressable></View>
          <LinearGradient colors={[c.indigo, '#5650AD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.accountCard}>
            <View pointerEvents="none" style={s.cardOrb} /><View pointerEvents="none" style={s.cardOrbSmall} />
            <View style={s.between}><View style={s.row}><View style={s.accountSymbol}><Ionicons name="wallet-outline" size={19} color={c.white} /></View><View><Text style={s.accountTitle}>Savings Account</Text><Text style={s.accountDigits}>•••• ••• 2249</Text></View></View><View style={s.accountBadge}><Text style={s.accountBadgeText}>PRIMARY</Text></View></View>
            <Text style={s.balanceLabel}>Available balance</Text>
            <View style={s.between}><Text accessibilityLabel="Available balance" numberOfLines={1} adjustsFontSizeToFit style={[s.balance, { fontSize: balanceFontSize }]}>{showBalance ? `₹ ${balance}` : '₹ ••••••••'}</Text><IconButton icon={showBalance ? 'eye-outline' : 'eye-off-outline'} label={showBalance ? 'Hide balance' : 'Show balance'} onPress={toggleBalance} light /></View>
            <View style={s.cardDivider} /><View style={s.between}>
              <Pressable accessibilityRole="button" onPress={onPassbook} style={s.cardAction}><Ionicons name="book-outline" size={16} color={c.white} /><Text style={s.cardActionText}>View Passbook</Text><Ionicons name="chevron-forward" size={13} color={c.white} /></Pressable>
              <Pressable accessibilityRole="button" onPress={onStatement} style={s.cardAction}><Ionicons name="download-outline" size={16} color={c.white} /><Text style={s.cardActionText}>Statement</Text><Ionicons name="chevron-forward" size={13} color={c.white} /></Pressable>
            </View>
          </LinearGradient>
          <View style={s.pagination}><View style={s.pageDotActive} /></View>
          <View style={s.section}><View style={s.between}><Text style={s.sectionTitle}>Your everyday banking</Text><Ionicons name="star-outline" color={c.magenta} size={17} /></View><View style={s.grid}>{services.map(item => <ServiceTile key={item.label} {...item} />)}</View></View>
        </>}
        {(tab === 'Banking' || tab === 'Payments') && <View style={s.section}>
          <View style={s.between}><Text style={s.sectionTitle}>Pay with UPI</Text><Text style={s.upiBrand}>UPI <Text style={{ color: '#ED8B23' }}>❯</Text></Text></View>
          <View style={s.upiStrip}><View style={s.row}><View style={s.activeDot} /><Text style={s.upiId}>UPI ID: rishabh@sbi</Text></View><Pressable accessibilityRole="button" style={s.textButton} onPress={() => preview.open('Manage UPI')}><Text style={s.link}>Manage</Text></Pressable></View>
          <View style={s.grid}>
            <ServiceTile icon="scan-outline" label="Scan & Pay" onPress={() => preview.open('Scan & Pay')} tint={c.magenta} />
            <ServiceTile icon="people-outline" label="Pay to Contact" onPress={() => preview.open('Pay to Contact')} tint={c.magenta} />
            <ServiceTile icon="at-outline" label="Pay to UPI ID" onPress={() => preview.open('Pay to UPI ID')} tint={c.magenta} />
            <ServiceTile icon="business-outline" label="Bank Transfer" onPress={onTransfer} tint={c.magenta} />
          </View>
        </View>}
        {tab === 'Payments' && <View style={s.section}><Text style={s.sectionTitle}>Bills & recharges</Text><View style={s.grid}>{([{ label: 'Mobile Recharge', icon: 'phone-portrait-outline' }, { label: 'Electricity', icon: 'flash-outline' }, { label: 'Broadband', icon: 'wifi-outline' }, { label: 'FASTag', icon: 'car-outline' }] as const).map(item => <ServiceTile key={item.label} {...item} onPress={() => preview.open(item.label)} />)}</View></View>}
        {tab === 'Lifestyle' && <View style={s.section}><Text style={s.sectionTitle}>More to your everyday</Text><Text style={[s.muted, { marginTop: 8, marginBottom: 16 }]}>Discover shopping, travel and rewards with YONO.</Text><View style={s.grid}>{([{ label: 'Shopping', icon: 'bag-handle-outline' }, { label: 'Flights', icon: 'airplane-outline' }, { label: 'Hotels', icon: 'bed-outline' }, { label: 'SBI Rewardz', icon: 'gift-outline' }] as const).map(item => <ServiceTile key={item.label} {...item} onPress={() => preview.open(item.label)} />)}</View></View>}
        <LinearGradient colors={['#EEE7F8', '#FAE7F2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.discoverCard}>
          <View style={s.flex}><Text style={s.bannerEyebrow}>MAKE ROOM FOR YOUR DREAMS</Text><Text style={s.discoverTitle}>Small steps. Bigger possibilities.</Text><Text style={s.bannerSub}>Explore deposits & investments.</Text><Pressable accessibilityRole="button" onPress={() => preview.open('Deposits & investments')} style={s.discoverButton}><Text style={s.link}>Explore now</Text><Ionicons name="arrow-forward" size={15} color={c.purple} /></Pressable></View>
          <View style={s.growthArt}><View style={[s.growthBar, { height: 35, backgroundColor: '#C1A0DC' }]} /><View style={[s.growthBar, { height: 59, backgroundColor: '#9B71C0' }]} /><View style={[s.growthBar, { height: 85, backgroundColor: c.purple }]} /><View style={s.growthCoin}><Text style={s.growthRupee}>₹</Text></View></View>
        </LinearGradient>
        {tab === 'Banking' && <View style={s.section}><View style={s.between}><Text style={s.sectionTitle}>Recent transactions</Text><Pressable accessibilityRole="button" style={s.textButton} onPress={onPassbook}><Text style={s.link}>View all</Text></Pressable></View>{recent.map((item, i) => <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.title} in passbook`} key={`${item.date}-${i}`} onPress={onPassbook} style={s.recentRow}><View style={[s.recentIcon, item.isCredit && { backgroundColor: '#EBF6EF' }]}><Ionicons name={item.isCredit ? 'arrow-down' : 'arrow-up'} size={19} color={item.isCredit ? '#278053' : c.purple} /></View><View style={s.flex}><Text style={s.recentName} numberOfLines={1}>{item.title}</Text><Text style={s.recentDate}>{item.date}</Text></View><Text style={[s.recentAmount, item.isCredit && { color: '#278053' }]}>{item.isCredit ? '+' : '−'} ₹{item.amount}</Text></Pressable>)}</View>}
        <View style={s.secureFooter}><Ionicons name="shield-checkmark-outline" color={c.purple} size={14} /><Text style={s.footerText}>You only need one.</Text></View>
      </>}
    </ScrollView>
    <View style={s.bottomNav}>
      <BottomItem icon="home-outline" label="Home" active={tab === 'Banking'} onPress={() => { setTab('Banking'); setSearchOpen(false); scrollRef.current?.scrollTo({ y: 0, animated: true }); }} />
      <BottomItem icon="swap-horizontal-outline" label="Payments" active={tab === 'Payments'} onPress={() => { setTab('Payments'); setSearchOpen(false); scrollRef.current?.scrollTo({ y: 0, animated: true }); }} />
      <Pressable accessibilityRole="button" accessibilityLabel="Scan and Pay" onPress={() => preview.open('Scan & Pay')} style={s.scanItem}><LinearGradient colors={[c.purple, c.magenta]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.scanCircle}><Ionicons name="scan-outline" size={26} color={c.white} /></LinearGradient><Text style={s.scanLabel}>Scan & Pay</Text></Pressable>
      <BottomItem icon="grid-outline" label="Services" onPress={() => { setSearchOpen(true); setServiceSearch(''); scrollRef.current?.scrollTo({ y: 0, animated: true }); }} />
      <BottomItem icon="person-outline" label="Profile" onPress={openProfile} />
    </View>
    {preview.modal}
  </SafeAreaView>;
}

function BottomItem({ icon, label, onPress, active = false }: { icon: IconName; label: string; onPress: Action; active?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={s.bottomItem} onPress={onPress}><View style={[s.navIcon, active && s.navIconActive]}><Ionicons name={icon} size={22} color={active ? c.purple : c.muted} /></View><Text style={[s.navLabel, active && { color: c.purple, fontWeight: '700' }]}>{label}</Text></Pressable>;
}

const s = StyleSheet.create({
  flex: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center' }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  page: { flex: 1, backgroundColor: c.background },
  topbar: { minHeight: 78, backgroundColor: c.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.line },
  loginContent: { padding: 20, paddingBottom: 18 }, welcome: { alignItems: 'center', paddingTop: 10, paddingBottom: 25 },
  avatar: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#E9DDF3', alignItems: 'center', justifyContent: 'center', marginBottom: 17, borderWidth: 3, borderColor: c.white },
  avatarText: { color: c.purple, fontSize: 23, fontWeight: '600' }, onlineDot: { width: 13, height: 13, backgroundColor: '#45A277', borderWidth: 3, borderColor: c.white, borderRadius: 7, position: 'absolute', bottom: 0, right: 0 },
  eyebrow: { color: c.muted, fontSize: 10, letterSpacing: 1.8, fontWeight: '600' }, welcomeName: { fontSize: 25, fontWeight: '700', color: c.ink, marginTop: 6, marginBottom: 7, letterSpacing: -0.6 }, muted: { color: c.muted, fontSize: 12, lineHeight: 19 },
  loginCard: { padding: 21, backgroundColor: c.white, borderRadius: 20, borderWidth: 1, borderColor: c.line }, loginTitle: { color: c.ink, fontSize: 17, fontWeight: '700' }, loginHint: { color: c.muted, fontSize: 12, marginTop: 7, marginBottom: 22 },
  pinRow: { flexDirection: 'row', gap: 8, paddingBottom: 8 }, pinBox: { flex: 1, height: 49, borderWidth: 1, borderColor: '#DDD4E7', borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCFAFD' }, pinFocus: { borderColor: c.purple, borderWidth: 1.5 }, pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.purple }, pinDash: { width: 9, height: 2, backgroundColor: '#CCC0D7' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0.01, bottom: 0 }, textButton: { minHeight: 40, justifyContent: 'center' }, link: { color: c.purple, fontSize: 12, fontWeight: '600' },
  primaryButton: { minHeight: 49, backgroundColor: c.purple, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 }, primaryText: { color: c.white, fontWeight: '600', fontSize: 15 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, gap: 12 }, rule: { height: 1, flex: 1, backgroundColor: c.line }, orText: { fontSize: 11, color: c.muted }, secondaryButton: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, minHeight: 38, marginTop: 3 }, error: { color: '#B52C49', fontSize: 12, marginTop: 6 },
  quickSection: { marginTop: 21, backgroundColor: c.white, borderRadius: 18, overflow: 'hidden' }, tabs: { flexDirection: 'row', backgroundColor: c.white, borderBottomWidth: 1, borderBottomColor: c.line, paddingHorizontal: 16 }, tab: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabActive: { borderBottomColor: c.purple }, tabText: { color: c.muted, fontSize: 13 }, tabTextActive: { color: c.purple, fontWeight: '700' }, grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 12 },
  loginBanner: { borderRadius: 16, marginTop: 18, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 }, bannerEyebrow: { fontSize: 8, letterSpacing: 1.2, color: c.purple, fontWeight: '700' }, bannerTitle: { fontSize: 17, color: c.purpleDark, fontWeight: '700', marginTop: 7, lineHeight: 23 }, bannerSub: { color: '#82738F', fontSize: 11, marginTop: 7, lineHeight: 16 }, bannerIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF80', alignItems: 'center', justifyContent: 'center' },
  secureFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 19 }, footerText: { color: c.muted, fontSize: 9 }, loginBottom: { flexDirection: 'row', backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.line, minHeight: 68 },
  dashboardContent: { paddingBottom: 10 }, profileButton: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 }, smallAvatar: { width: 39, height: 39, backgroundColor: c.lavender, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, smallAvatarText: { fontSize: 13, color: c.purple, fontWeight: '600' }, hello: { fontSize: 14, color: c.ink, fontWeight: '700' }, headerCaption: { color: c.muted, fontSize: 9, marginTop: 4 },
  sectionHeading: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: c.ink, fontWeight: '700', fontSize: 16, letterSpacing: -0.2 },
  accountCard: { marginHorizontal: 20, borderRadius: 18, padding: 19, overflow: 'hidden' }, accountSymbol: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center', marginRight: 10 }, accountTitle: { color: c.white, fontSize: 13, fontWeight: '600' }, accountDigits: { color: '#DDDDF5', fontSize: 11, marginTop: 4, letterSpacing: 1 }, accountBadge: { borderWidth: 1, borderColor: '#FFFFFF30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 }, accountBadgeText: { fontSize: 8, fontWeight: '600', color: '#F0E9FF', letterSpacing: 0.7 },
  balanceLabel: { color: '#DDDAF4', fontSize: 11, marginTop: 21 }, balance: { color: c.white, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, flex: 1, fontVariant: ['tabular-nums'] }, cardDivider: { height: 1, backgroundColor: '#FFFFFF26', marginTop: 12, marginBottom: 6 }, cardAction: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 36 }, cardActionText: { color: c.white, fontSize: 11, fontWeight: '500' },
  cardOrb: { width: 260, height: 260, borderRadius: 130, backgroundColor: '#FFFFFF07', position: 'absolute', right: -95, top: -80 }, cardOrbSmall: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#1D196A24', position: 'absolute', right: -75, bottom: -130 }, pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, paddingVertical: 12 }, pageDotActive: { width: 17, height: 4, backgroundColor: c.purple, borderRadius: 2 }, pageDot: { width: 4, height: 4, backgroundColor: '#D6CADE', borderRadius: 2 },
  section: { backgroundColor: c.white, marginHorizontal: 16, marginBottom: 14, padding: 17, borderRadius: 18, borderWidth: 1, borderColor: '#EEEAF3' }, upiBrand: { fontSize: 18, fontWeight: '900', fontStyle: 'italic', color: '#4F4B54' }, upiStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: c.line, marginTop: 6 }, activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3CA578', marginRight: 6 }, upiId: { fontSize: 11, color: c.muted },
  discoverCard: { marginHorizontal: 16, padding: 20, marginBottom: 15, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden' }, discoverTitle: { color: c.purpleDark, fontSize: 20, fontWeight: '700', lineHeight: 26, marginTop: 8, letterSpacing: -0.5 }, discoverButton: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8, minHeight: 36 }, growthArt: { width: 95, height: 115, flexDirection: 'row', alignItems: 'flex-end', gap: 7, paddingBottom: 10 }, growthBar: { width: 22, borderRadius: 6, transform: [{ skewY: '-8deg' }] }, growthCoin: { position: 'absolute', top: 1, right: 3, width: 41, height: 41, borderRadius: 21, backgroundColor: '#F9D56E', borderWidth: 3, borderColor: '#FFEAA6', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '15deg' }] }, growthRupee: { fontSize: 23, fontWeight: '700', color: '#AD7E19' },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#F2EEF6' }, recentIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: c.lavender, alignItems: 'center', justifyContent: 'center' }, recentName: { fontSize: 12, color: c.ink, fontWeight: '600' }, recentDate: { fontSize: 10, color: c.muted, marginTop: 5 }, recentAmount: { fontSize: 12, color: c.ink, fontWeight: '600', fontVariant: ['tabular-nums'] },
  bottomNav: { flexDirection: 'row', minHeight: 76, backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 5 }, bottomItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 7, gap: 3 }, navIcon: { width: 44, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 15 }, navIconActive: { backgroundColor: c.lavender }, navLabel: { color: c.muted, fontSize: 9 }, scanItem: { flex: 1, alignItems: 'center', marginTop: -22, gap: 6 }, scanCircle: { width: 53, height: 53, borderRadius: 19, borderWidth: 4, borderColor: c.white, alignItems: 'center', justifyContent: 'center' }, scanLabel: { color: c.purple, fontSize: 9, fontWeight: '600' },
  serviceSearch: { margin: 16, paddingLeft: 14, backgroundColor: c.white, borderRadius: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.line }, searchInput: { flex: 1, color: c.ink, fontSize: 13, padding: 12 },
});
