import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const SbiLogo = ({ size = 'medium', dark = false }: { size?: 'small' | 'medium' | 'large'; dark?: boolean }) => {
  const scale = size === 'small' ? 0.65 : size === 'large' ? 1.3 : 1;
  const outerRadius = 20 * scale;
  const innerRadius = 5.5 * scale;
  const barWidth = 6.5 * scale;
  const barHeight = 20 * scale;
  const fontSize = size === 'small' ? 18 : size === 'large' ? 36 : 26;
  const sbiFontSize = size === 'small' ? 15 : size === 'large' ? 28 : 20;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: outerRadius * 2,
        height: outerRadius * 2,
        borderRadius: outerRadius,
        backgroundColor: '#00A1E1',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <View style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
          borderRadius: innerRadius,
          backgroundColor: dark ? '#FFF' : '#70006B',
          position: 'absolute'
        }} />
        <View style={{
          width: barWidth,
          height: barHeight,
          backgroundColor: dark ? '#FFF' : '#70006B',
          position: 'absolute',
          bottom: 0
        }} />
      </View>
      <Text style={{
        marginLeft: 8 * scale,
        fontSize: fontSize,
        fontWeight: '900',
        color: dark ? '#70006B' : '#FFF',
        letterSpacing: -0.5
      }}>
        yono <Text style={{ color: '#00A1E1', fontWeight: '800', fontSize: sbiFontSize }}>SBI</Text>
      </Text>
    </View>
  );
};

type Screen =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'transactions'
  | 'requestStatement'
  | 'fundTransfer'
  | 'recipientDetails'
  | 'transferDetails'
  | 'transferReview'
  | 'mpinConfirmation'
  | 'transferProgress'
  | 'transferSuccess';

interface Transaction {
  title: string;
  subtitle?: string;
  date: string;
  postDate?: string;
  amount: string;
  balance: string;
  isCredit?: boolean;
  month: 'September 2026' | 'August 2026' | 'July 2026' | 'June 2026';
}

const PDF_TRANSACTIONS: Transaction[] = [
  // September 2026 (Statement Batch)
  { title: 'Mr Archana', subtitle: 'WDL TFR UPI/DR/508660462095/Mr archana/IDIB/7838953936/UPI 0097694162092 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '03/09/2026', amount: '20,500.00', balance: '14,84,145.22', isCredit: false, month: 'September 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/657489321564/Air India SBI/R825607848/NEFT AT 00614 NEW DELHI', date: '02/09/2026', postDate: '02/09/2026', amount: '3,02,457.33', balance: '15,04,645.22', isCredit: true, month: 'September 2026' },
  { title: 'Dinesh K', subtitle: 'WDL TFR UPI/DR/508728059523/DINESH K/BKID/q274255738/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '49,656.00', balance: '14,34,489.22', isCredit: false, month: 'September 2026' },
  { title: 'Bishwaji', subtitle: 'WDL TFR UPI/DR/508739893393/Bishwaji/SBIN/9958026679/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '4,000.00', balance: '14,34,039.22', isCredit: false, month: 'September 2026' },
  { title: 'Bishwaji', subtitle: 'WDL TFR UPI/DR/508749980074/Bishwaji/SBIN/9958026679/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '35,200.00', balance: '13,98,839.22', isCredit: false, month: 'September 2026' },
  { title: 'Akanksha', subtitle: 'WDL TFR UPI/DR/508709195394/akanksha/ICIC/akankshash/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '500.00', balance: '13,98,339.22', isCredit: false, month: 'September 2026' },
  { title: 'Rishabh', subtitle: 'WDL TFR UPI/DR/508700699588/rishabht/ICIC/rishabhtri/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '1,000.00', balance: '13,97,339.22', isCredit: false, month: 'September 2026' },
  { title: 'Ms Sonia', subtitle: 'WDL TFR UPI/DR/545432776302/Ms SONIA/CBIN/sonia.onep/UPI 0097696162090 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '290.00', balance: '13,97,049.22', isCredit: false, month: 'September 2026' },
  { title: 'Ms Sonia', subtitle: 'WDL TFR UPI/DR/509045593850/Ms SONIA/CBIN/sonia.onep/UPI 0097691162095 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '1,800.00', balance: '13,95,539.22', isCredit: false, month: 'September 2026' },
  { title: 'Vikas CH', subtitle: 'WDL TFR UPI/DR/509027891806/VIKAS CH/YESB/q311679753/UPI 0097691162095 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '3,400.00', balance: '13,92,139.22', isCredit: false, month: 'September 2026' },

  // August 2026
  { title: 'Apple Media Services', subtitle: 'DEP TFR UPI/CR/102209673166/APPLE ME/HDFC/appleservi/Mand 0097738162095 AT 00614 NARAINGARH', date: '13/08/2026', postDate: '13/08/2026', amount: '289.00', balance: '12,02,644.69', isCredit: true, month: 'August 2026' },
  { title: 'Apple Media Services', subtitle: 'WDL TFR UPI/DR/102194712169/APPLE ME/HDFC/appleservi/UPI 0097694162092 AT 00614 NARAINGARH', date: '11/08/2026', postDate: '11/08/2026', amount: '289.00', balance: '12,02,355.69', isCredit: false, month: 'August 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/653245127852/Air India/SBI/462587496/NEFT AT 00614 NEW DELHI', date: '01/08/2026', postDate: '01/08/2026', amount: '2,78,390.18', balance: '12,02,644.69', isCredit: true, month: 'August 2026' },

  // July 2026
  { title: 'Rishabh (IMPS)', subtitle: 'DEP TFR IMPS/533421787598/ICI-XX138-RISHABH /IMPS Tran 0098333162095 AT 00614 NARAINGARH', date: '30/07/2026', postDate: '30/07/2026', amount: '599.49', balance: '9,24,254.51', isCredit: false, month: 'July 2026' },
  { title: 'Gopal GU', subtitle: 'WDL TFR UPI/DR/392363227492/GOPAL GU/YESB/q013228365/Sent 0097690162095 AT 00614 NARAINGARH', date: '16/07/2026', postDate: '16/07/2026', amount: '600.00', balance: '9,24,854.00', isCredit: false, month: 'July 2026' },
  { title: 'Gopal GU', subtitle: 'WDL TFR UPI/DR/392338526402/GOPAL GU/YESB/q013228365/Sent 0097696162090 AT 00614 NARAINGARH', date: '15/07/2026', postDate: '15/07/2026', amount: '650.00', balance: '9,25,454.00', isCredit: false, month: 'July 2026' },
  { title: 'Shatrudh', subtitle: 'WDL TFR UPI/DR/531924227253/SHATRUDH/YESB/paytmqr6ir/Sent 0097696162090 AT 00614 NARAINGARH', date: '15/07/2026', postDate: '15/07/2026', amount: '725.03', balance: '9,26,104.00', isCredit: false, month: 'July 2026' },
  { title: 'Mr Gopal', subtitle: 'WDL TFR UPI/DR/531731352838/Mr GOPAL/UTIB/9818858918/Sent 0097694162092 AT 00614 NARAINGARH', date: '13/07/2026', postDate: '13/07/2026', amount: '775.04', balance: '9,26,829.03', isCredit: false, month: 'July 2026' },
  { title: 'Surjit K', subtitle: 'WDL TFR UPI/DR/392189657182/Surjit K/PPIW/surjit.yad/Sent 0097694162092 AT 00614 NARAINGARH', date: '13/07/2026', postDate: '13/07/2026', amount: '825.00', balance: '9,27,604.34', isCredit: false, month: 'July 2026' },
  { title: 'Mr Mohan', subtitle: 'WDL TFR UPI/DR/531610331242/Mr MOHAN/YESB/q576682970/Sent 0097693162093 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '875.02', balance: '9,28,429.34', isCredit: false, month: 'July 2026' },
  { title: 'Apple Media Services', subtitle: 'DEP TFR UPI/CR/101951563261/APPLE ME/HDFC/appleservi/Mand 0097735162098 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '950.50', balance: '9,29,304.36', isCredit: false, month: 'July 2026' },
  { title: 'Apple Media Services', subtitle: 'WDL TFR UPI/DR/101951356609/APPLE ME/HDFC/appleservi/UPI 0097693162093 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '1,000.00', balance: '9,30,254.41', isCredit: false, month: 'July 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/684593127486/Air India/SBI/563214796/NEFT AT 00614 NEW DELHI', date: '03/07/2026', postDate: '10/07/2026', amount: '2,87,116.66', balance: '9,31,254.41', isCredit: true, month: 'July 2026' },

  // June 2026
  { title: 'Sushila', subtitle: 'WDL TFR UPI/DR/527769922823/SUSHILAD/YESB/q312456890/Sent 0097691162095 AT 00614 NARAINGARH', date: '04/06/2026', postDate: '04/06/2026', amount: '95,728.05', balance: '6,44,137.75', isCredit: false, month: 'June 2026' },
  { title: 'Chandan', subtitle: 'WDL TFR UPI/DR/527769096810/CHANDAN/FDRL/9315873397/Sent 0097691162095 AT 00614 NARAINGARH', date: '04/06/2026', postDate: '04/06/2026', amount: '115.00', balance: '7,39,866.25', isCredit: false, month: 'June 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/400596843278/Air India/SBI/796548213/NEFT AT 00614 NEW DELHI', date: '01/06/2026', postDate: '01/06/2026', amount: '3,55,116.66', balance: '7,39,981.25', isCredit: true, month: 'June 2026' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [mpin, setMpin] = useState<string>('');
  const [transferMpin, setTransferMpin] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState({
    name: 'Jitender Tripathi',
    bank: 'ICICI Bank Limited',
    account: 'XXXXXX7316',
    limit: '₹15,00,000',
  });
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('Money Transfer');
  const [transferMode, setTransferMode] = useState<'IMPS' | 'NEFT' | 'RTGS'>('IMPS');
  const [transferFromAccount] = useState('41935162249');
  const [transferFromBank] = useState('SBI Savings Account');
  const [transferTxnId, setTransferTxnId] = useState('');
  const [includeSummary, setIncludeSummary] = useState(false);
  const [includeNominee, setIncludeNominee] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };
  
  // Dropdown states
  const [duration, setDuration] = useState('Duration');
  const [financialYear, setFinancialYear] = useState('Financial Year');
  const [format, setFormat] = useState('PDF');
  const [activeDropdown, setActiveDropdown] = useState<'none' | 'duration' | 'year' | 'format'>('none');

  const loginInputRef = useRef<TextInput>(null);
  const transferInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const recipients = [
    { name: 'Jitender Tripathi', bank: 'ICICI Bank Limited', account: 'XXXXXX7316', limit: '₹15,00,000' },
    { name: 'Archana Tripathi', bank: 'HDFC Bank Limited', account: 'XXXXXX8421', limit: '₹12,50,000' },
    { name: 'Mahesh Singh', bank: 'State Bank of India', account: 'XXXXXX6184', limit: '₹20,00,000' },
    { name: 'Aman Goyal', bank: 'Axis Bank Limited', account: 'XXXXXX9275', limit: '₹18,00,000' },
    { name: 'Pradeep Kumar', bank: 'Kotak Mahindra Bank', account: 'XXXXXX5539', limit: '₹15,00,000' },
  ];

  const openFundTransfer = () => {
    setCurrentScreen('fundTransfer');
  };

  const chooseRecipient = (recipient: typeof recipients[number]) => {
    setSelectedRecipient(recipient);
    setTransferAmount('');
    setTransferPurpose('Money Transfer');
    setTransferMode('IMPS');
    setCurrentScreen('recipientDetails');
  };

  const openTransferDetails = () => {
    setCurrentScreen('transferDetails');
  };

  const openReview = () => {
    if (!transferAmount.trim()) return;
    setCurrentScreen('transferReview');
  };

  const openMpinConfirmation = () => {
    setTransferMpin('');
    setCurrentScreen('mpinConfirmation');
  };

  const submitTransferMpin = () => {
    if (transferMpin !== '189198') return;
    const suffix = Math.floor(100000 + Math.random() * 900000);
    setTransferTxnId(`THXW${suffix}`);
    setCurrentScreen('transferProgress');
  };

  useEffect(() => {
    if (currentScreen !== 'mpinConfirmation') return;
    if (transferMpin.length !== 6) return;

    if (transferMpin === '189198') {
      Keyboard.dismiss();
      transferInputRef.current?.blur();
      const suffix = Math.floor(100000 + Math.random() * 900000);
      setTransferTxnId(`THXW${suffix}`);
      setTimeout(() => setCurrentScreen('transferProgress'), 120);
    } else {
      Keyboard.dismiss();
      transferInputRef.current?.blur();
      setTimeout(() => {
        setTransferMpin('');
        transferInputRef.current?.focus();
      }, 600);
    }
  }, [transferMpin, currentScreen]);

  useEffect(() => {
    if (currentScreen !== 'transferProgress') return;
    const timer = setTimeout(() => {
      setCurrentScreen('transferSuccess');
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentScreen]);

  const formatTransferAmount = () => {
    const numeric = Number(transferAmount.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric) || numeric <= 0) return '₹0.00';
    return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTransferAmountInput = (value: string) => {
    const [integerPart = '', decimalPart] = value.replace(/[^0-9.]/g, '').split('.');
    const formattedInteger = integerPart ? Number(integerPart).toLocaleString('en-IN') : '';
    return decimalPart === undefined ? formattedInteger : `${formattedInteger}.${decimalPart}`;
  };

  const handleMpinChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
    setMpin(cleaned);
    if (cleaned.length === 6) {
      if (cleaned === '189198') {
        Keyboard.dismiss();
        loginInputRef.current?.blur();
        setTimeout(() => setCurrentScreen('dashboard'), 200);
      } else {
        Keyboard.dismiss();
        loginInputRef.current?.blur();
        setTimeout(() => {
          setMpin('');
          loginInputRef.current?.focus();
        }, 600);
      }
    }
  };

  const toggleDropdown = (type: 'duration' | 'year' | 'format') => {
    setActiveDropdown(activeDropdown === type ? 'none' : type);
  };

  const [pdfVisible, setPdfVisible] = useState(false);
  const handleDownload = () => {
    setPdfVisible(true);
  };

  // Filtered Transactions
  const filteredTransactions = PDF_TRANSACTIONS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subtitle && t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    t.date.includes(searchQuery) ||
    t.amount.includes(searchQuery)
  );

  const months: ('September 2026' | 'August 2026' | 'July 2026' | 'June 2026')[] = [
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026'
  ];

  // --- SCREEN 1: SPLASH ---
  if (currentScreen === 'splash') {
    return (
      <LinearGradient colors={['#4A004C', '#70006B', '#8E0A78']} style={styles.splashBackground}>
        <StatusBar barStyle="light-content" />
        <View style={styles.splashContent}>
          <SbiLogo size="large" />
          <Text style={styles.splashTagline}>For You. For India.</Text>
        </View>
        <View style={styles.splashFooter}>
          <Text style={styles.splashFooterText}>STATE BANK OF INDIA</Text>
        </View>
      </LinearGradient>
    );
  }

  // --- FUND TRANSFER DEMO FLOW ---
  if (currentScreen === 'fundTransfer') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Fund Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color="#70006B" />
            <Text style={styles.demoNoticeText}>NEFT/IMPS charges 1%-3% for International Transfers.</Text>
          </View>

          <Text style={styles.sectionTitle}>Payments & Transfers</Text>
          <View style={styles.transferOptionGrid}>
            <TransferOption icon="sync-outline" title="Quick Transfer" subtitle="Upto ₹50,000" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="phone-portrait-outline" title="Send Money" subtitle="To Own/Other A/C" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="globe-outline" title="Send Money A..." subtitle="International" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="calendar-outline" title="Schedule Pay" subtitle="Schedule transfer" onPress={() => chooseRecipient(recipients[0])} />
          </View>

          <View style={styles.transferDivider} />
          <View style={styles.recentTransferHeader}>
            <Text style={styles.sectionTitle}>Recent Payees</Text>
            <TouchableOpacity onPress={() => chooseRecipient(recipients[0])}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recipients.map((recipient, idx) => (
            <TouchableOpacity key={recipient.account + idx} style={styles.recipientRow} onPress={() => chooseRecipient(recipient)} activeOpacity={0.75}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>{recipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <Text style={styles.recipientBank}>{recipient.bank}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'recipientDetails') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('fundTransfer')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight} numberOfLines={1}>{selectedRecipient.name}</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Payee</Text></View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#70006B" />
            <Text style={styles.demoNoticeText}>Payees with inactive bank accounts are not eligible for transfers.</Text>
          </View>

          <View style={styles.payeeCard}>
            <View style={styles.largeRecipientAvatar}>
              <Text style={styles.largeRecipientAvatarText}>{selectedRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
            </View>
            <Text style={styles.payeeFullName}>{selectedRecipient.name}</Text>
            <Text style={styles.payeeBank}>{selectedRecipient.bank}</Text>
            <Text style={styles.payeeAccount}>{selectedRecipient.account}</Text>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Payee Limit</Text>
              <Text style={styles.limitValue}>{selectedRecipient.limit}</Text>
            </View>
          </View>

          <View style={styles.transferSecurityBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#70006B" />
            <Text style={styles.transferSecurityText}>Verify payee details carefully before confirming payment.</Text>
          </View>

          <TouchableOpacity style={styles.primaryPayButton} onPress={openTransferDetails} activeOpacity={0.85}>
            <Text style={styles.primaryPayText}>Pay Now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferDetails') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('recipientDetails')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Enter Amount</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Step 1 of 2</Text></View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <View style={styles.miniPayeeHeader}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientAvatarText}>{selectedRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
              <Text style={styles.recipientBank}>{selectedRecipient.bank} • {selectedRecipient.account}</Text>
            </View>
          </View>

          <View style={styles.transferModePill}>
            <Text style={styles.transferModeActive}>Transfer Now</Text>
            <Text style={styles.transferModeInactive}>Schedule Pay</Text>
          </View>

          <Text style={styles.transferSectionTitle}>Transaction Details</Text>

          <View style={styles.inputCard}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                value={transferAmount}
                onChangeText={(text) => setTransferAmount(formatTransferAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="Enter amount"
                placeholderTextColor="#A6A6A6"
                style={styles.amountInput}
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.fieldLabel}>Mode of Transfer</Text>
            <View style={styles.modeRow}>
              {(['IMPS', 'NEFT', 'RTGS'] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTransferMode(mode)}
                  style={[styles.modeChip, transferMode === mode && styles.modeChipActive]}
                >
                  <Text style={[styles.modeChipText, transferMode === mode && styles.modeChipTextActive]}>{mode}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldHint}>
              {transferMode === 'IMPS' ? 'Instant transfer, 24x7 available' : transferMode === 'NEFT' ? 'Electronic batch transfer' : 'High-value instant transfer (₹2L+)'}
            </Text>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.fieldLabel}>Purpose</Text>
            <TextInput
              value={transferPurpose}
              onChangeText={setTransferPurpose}
              style={styles.textField}
              placeholder="Purpose"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.fieldLabel}>Paying From</Text>
            <Text style={styles.fromAccountText}>SBI Savings A/C • {transferFromAccount}</Text>
            <Text style={styles.fromAccountSub}>Available Balance: ₹15,17,342.09</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryPayButton, !transferAmount && styles.disabledButton]}
            onPress={openReview}
            disabled={!transferAmount}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryPayText}>Proceed to Review</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferReview') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('transferDetails')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Verify Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Step 2 of 2</Text></View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <LinearGradient colors={['#70006B', '#8E0A78']} style={styles.reviewAmountCard}>
            <Text style={styles.reviewAmount}>{formatTransferAmount()}</Text>
            <Text style={styles.reviewPurpose}>{transferPurpose}</Text>
            <Text style={styles.reviewMode}>Mode: {transferMode}</Text>
          </LinearGradient>

          <Text style={styles.reviewSectionTitle}>To Payee</Text>
          <View style={styles.reviewPartyCard}>
            <View style={styles.recipientAvatar}>
              <Text style={styles.recipientAvatarText}>{selectedRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
            </View>
            <View style={styles.flex1}>
              <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
              <Text style={styles.recipientBank}>{selectedRecipient.bank}</Text>
              <Text style={styles.recipientBank}>{selectedRecipient.account}</Text>
            </View>
          </View>

          <Text style={styles.reviewSectionTitle}>From Account</Text>
          <View style={styles.reviewPartyCard}>
            <Image
              source={{ uri: 'https://i.ibb.co/LdfV1v2s/BED36544-95-E4-4-A45-92-DD-02739-BEAA96-B-1-201-a.jpg' }}
              style={styles.avatarCircleSmall}
            />
            <View style={styles.flex1}>
              <Text style={styles.recipientName}>Rishabh Tripathi</Text>
              <Text style={styles.recipientBank}>SBI Savings A/C • {transferFromAccount}</Text>
            </View>
          </View>

          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color="#70006B" />
            <Text style={styles.demoNoticeText}>RTGS Transactions must be for ₹2 Lakhs or more.</Text>
          </View>

          <View style={styles.reviewButtons}>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('transferDetails')}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={openMpinConfirmation} activeOpacity={0.85}>
              <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'mpinConfirmation') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('transferReview')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>mPIN Authorization</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Security</Text></View>
        </LinearGradient>

        <View style={styles.mpinTransferContainer}>
          <View style={styles.mpinShield}>
            <Ionicons name="shield-checkmark" size={38} color="#70006B" />
          </View>
          <Text style={styles.mpinTitle}>Enter 6-Digit mPIN</Text>
          <Text style={styles.mpinSubtitle}>Enter your YONO SBI demo mPIN to authorize transaction.</Text>

          <TouchableOpacity activeOpacity={1} onPress={() => transferInputRef.current?.focus()} style={styles.transferPinDisplay}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[styles.transferPinBox, transferMpin.length === i && styles.pinBoxFocused]}>
                {transferMpin.length > i && <View style={styles.bullet} />}
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={transferInputRef}
            value={transferMpin}
            onChangeText={(text) => setTransferMpin(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
          />

          <View style={styles.demoCredentialNotice}>
            <Ionicons name="key-outline" size={18} color="#70006B" />
            <Text style={styles.demoCredentialText}>Demo mPIN: <Text style={styles.bold}>189198</Text></Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferProgress') {
    return (
      <LinearGradient colors={['#4A004C', '#70006B', '#8E0A78']} style={styles.progressScreen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.progressInner}>
          <ActivityIndicator size="large" color="#00B2E3" />
          <Text style={styles.progressTitle}>Transaction Processing...</Text>
          <Text style={styles.progressSubtitle}>Connecting securely to SBI Core Banking System</Text>

          <View style={styles.progressTimeline}>
            <View style={styles.progressTimelineRow}>
              <View style={styles.progressDotActive}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
              <Text style={styles.progressStepActive}>mPIN Verified</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressTimelineRow}>
              <View style={styles.progressDotPending} />
              <Text style={styles.progressStepPending}>Processing Fund Settlement</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (currentScreen === 'transferSuccess') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.successTop}>
          <View style={styles.successCheck}><Ionicons name="checkmark" size={44} color="#FFF" /></View>
          <Text style={styles.successTitle}>Transaction Successful!</Text>
          <Text style={styles.successAmount}>{formatTransferAmount()}</Text>
          <Text style={styles.successPurpose}>{transferPurpose}</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>To Payee</Text>
              <View style={styles.successValueBlock}>
                <Text style={styles.successValue}>{selectedRecipient.name}</Text>
                <Text style={styles.successSubValue}>{selectedRecipient.bank}</Text>
                <Text style={styles.successSubValue}>{selectedRecipient.account}</Text>
              </View>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>From Account</Text>
              <View style={styles.successValueBlock}>
                <Text style={styles.successValue}>Rishabh Tripathi</Text>
                <Text style={styles.successSubValue}>{transferFromBank} • {transferFromAccount}</Text>
              </View>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Transfer Mode</Text>
              <Text style={styles.successValue}>{transferMode}</Text>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Transaction Ref ID</Text>
              <Text style={styles.successValueBold}>{transferTxnId}</Text>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Status</Text>
              <Text style={styles.successStatus}>SUCCESSFUL</Text>
            </View>
          </View>

          <View style={styles.demoNotice}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
            <Text style={styles.demoNoticeText}>Reference ID copied. Keep for your bank records.</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryPayButton}
            onPress={() => {
              setTransferAmount('');
              setTransferMpin('');
              setCurrentScreen('dashboard');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryPayText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SCREEN 5: REQUEST STATEMENT ---
  if (currentScreen === 'requestStatement') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('transactions')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Request Account Statement</Text>
        </LinearGradient>

        <ScrollView style={styles.flex1} contentContainerStyle={styles.ph20}>
          <View style={styles.formGroup}>
            <View style={styles.row}>
               <View style={styles.radioCircle} />
               <Text style={styles.labelSmall}>Select Duration</Text>
            </View>
            <TouchableOpacity style={styles.picker} onPress={() => toggleDropdown('duration')}>
              <Text style={styles.pickerText}>{duration}</Text>
              <Ionicons name="chevron-down" size={20} color="#70006B" />
            </TouchableOpacity>
            {activeDropdown === 'duration' && (
              <View style={styles.dropdownList}>
                {['Last 3 months', 'Last 6 months', 'Last one year', 'Custom dates'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setDuration(item); setActiveDropdown('none'); }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <View style={styles.row}>
               <View style={styles.radioCircle} />
               <Text style={styles.labelSmall}>Select Financial Year</Text>
            </View>
            <TouchableOpacity style={styles.picker} onPress={() => toggleDropdown('year')}>
              <Text style={styles.pickerText}>{financialYear}</Text>
              <Ionicons name="chevron-down" size={20} color="#70006B" />
            </TouchableOpacity>
            {activeDropdown === 'year' && (
              <View style={styles.dropdownList}>
                {['2022 - 2023', '2023 - 2024', '2024 - 2025', '2025 - 2026'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setFinancialYear(item); setActiveDropdown('none'); }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.labelVerySmall}>Format</Text>
            <TouchableOpacity style={styles.picker} onPress={() => toggleDropdown('format')}>
              <Text style={styles.pickerText}>{format}</Text>
              <Ionicons name="chevron-down" size={20} color="#70006B" />
            </TouchableOpacity>
            {activeDropdown === 'format' && (
              <View style={styles.dropdownList}>
                {['PDF', 'Excel'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setFormat(item); setActiveDropdown('none'); }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Full Screen PDF Modal */}
          <Modal 
            visible={pdfVisible} 
            animationType="fade" 
            transparent={true}
            onRequestClose={() => setPdfVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Ionicons name="checkmark-circle" size={72} color="#2E7D32" />
                <Text style={styles.modalTitle}>Statement Dispatched!</Text>
                <Text style={styles.modalSub}>Statement for Account 41935162249 has been sent to rishabhtripathi1891@gmail.com.</Text>
                <TouchableOpacity 
                  onPress={() => setPdfVisible(false)}
                  style={styles.modalOkBtn}
                >
                  <Text style={styles.modalOkBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.rowBetweenMargin}>
            <View style={styles.row}>
              <Text style={styles.switchLabel}>Include all account summary</Text>
              <Ionicons name="information-circle-outline" size={18} color="#70006B" style={styles.ml5} />
            </View>
            <Switch
              value={includeSummary}
              onValueChange={setIncludeSummary}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeSummary ? "#70006B" : "#FFF"}
            />
          </View>

          <View style={styles.rowBetweenMargin}>
            <Text style={styles.switchLabel}>Include nominee details</Text>
            <Switch
              value={includeNominee}
              onValueChange={setIncludeNominee}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeNominee ? "#70006B" : "#FFF"}
            />
          </View>

          <View style={[styles.row, styles.mt10]}>
            <Text style={styles.passLogicText}>Password Protection Logic</Text>
            <Ionicons name="information-circle-outline" size={16} color="#70006B" style={styles.ml5} />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#70006B" />
            <Text style={styles.infoBoxText}>Max 5 statement downloads per account daily. Up to 2000 transactions per request.</Text>
          </View>

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Email Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Download Statement</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.digiLockerRow}>
            <Text style={styles.digiText}>Sync Statement to DigiLocker</Text>
            <View style={styles.digiBrand}>
              <Text style={styles.digiMiniText}>DigiLocker</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SCREEN 4: TRANSACTIONS / PASSBOOK ---
  if (currentScreen === 'transactions') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#500052', '#70006B']} style={styles.transHeaderBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')} style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>View Passbook</Text>
          <View style={styles.row}>
            <Feather name="bell" size={22} color="#FFF" style={styles.headerIcon} />
            <MaterialIcons name="headset-mic" size={22} color="#FFF" />
          </View>
        </LinearGradient>

        <View style={styles.transTabs}>
          <View style={styles.activeTabWrapper}>
            <Text style={styles.transTabActive}>Transaction Details</Text>
            <View style={styles.activeIndicatorLong} />
          </View>
          <Text style={styles.transTabText}>Spend Analysis</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.flex1}>
          <View style={styles.accountSelectorCard}>
            <Text style={styles.selectAccountLabel}>Select Account</Text>
            <View style={styles.accountBox}>
              <View style={styles.sbiIconCircle}>
                <SbiLogo size="small" dark />
              </View>
              <View style={styles.flex1}>
                <View style={styles.row}>
                  <Text style={styles.accountNumber}>41935162249</Text>
                  <Ionicons name="eye-outline" size={18} color="#555" style={styles.ml10} />
                </View>
                <Text style={styles.accountType}>SBI REGULAR SB CHQ-INDIVIDUALS (NARAINGARH)</Text>
                <Text style={styles.availableBalanceLabel}>Clear Balance: <Text style={styles.bold}>₹15,17,342.09CR</Text></Text>
              </View>
              <Ionicons name="chevron-down" size={22} color="#555" />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#888" />
              <TextInput 
                placeholder="Search transactions..." 
                style={styles.searchInput} 
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#888" />
                </TouchableOpacity>
              ) : null}
            </View>
            <MaterialCommunityIcons name="filter-variant" size={24} color="#70006B" style={styles.mh10} />
            <MaterialCommunityIcons name="swap-vertical" size={24} color="#70006B" />
          </View>

          <View style={styles.recentTransHeader}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.recentTransText}>Account Passbook</Text>
              <Ionicons name="chevron-down" size={16} color="#70006B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.requestStatementBtn} onPress={() => setCurrentScreen('requestStatement')}>
              <Text style={styles.requestStatementText}>Request Statement</Text>
            </TouchableOpacity>
          </View>

          {months.map(m => {
            const mTransactions = filteredTransactions.filter(t => t.month === m);
            if (mTransactions.length === 0) return null;

            return (
              <View key={m}>
                <View style={styles.dateSeparator}>
                  <Text style={styles.dateText}>{m}</Text>
                </View>
                {mTransactions.map((t, idx) => (
                  <TransactionItem 
                    key={m + idx + t.date + t.amount}
                    title={t.title}
                    subtitle={t.subtitle} 
                    date={t.date}
                    postDate={t.postDate} 
                    amount={t.amount} 
                    balance={t.balance} 
                    isCredit={t.isCredit} 
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SCREEN 3: DASHBOARD ---
  if (currentScreen === 'dashboard') {
    if (isRefreshing) {
      return (
        <SafeAreaView style={[styles.dashboardContainer, styles.centerContent]}>
          <StatusBar barStyle="dark-content" />
          <ActivityIndicator size="large" color="#70006B" />
          <Text style={styles.refreshText}>Syncing SBI Account Data...</Text>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        
        {/* Top App Bar */}
        <LinearGradient colors={['#500052', '#70006B']} style={styles.dashHeaderBar}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://i.ibb.co/LdfV1v2s/BED36544-95-E4-4-A45-92-DD-02739-BEAA96-B-1-201-a.jpg' }}
              style={styles.avatarCircleHeader}
            />
            <View style={styles.ml10}>
              <Text style={styles.dashGreetingLight}>Hello <Text style={styles.bold}>Rishabh,</Text></Text>
              <Text style={styles.dashSubLight}>Welcome to YONO SBI</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Feather name="search" size={22} color="#FFF" style={styles.headerIcon} />
            <Feather name="bell" size={22} color="#FFF" style={styles.headerIcon} />
            <TouchableOpacity onPress={() => setCurrentScreen('login')}>
              <MaterialCommunityIcons name="logout" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dashScrollContent}>
          <View style={styles.dashTabs}>
            <Text style={[styles.dashTabActive, styles.dashTabText]}>Banking</Text>
            <Text style={styles.dashTabText}>Lifestyle</Text>
            <Text style={styles.dashTabText}>YONO Pay</Text>
          </View>

          {/* SBI Account Balance Card */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            <LinearGradient colors={['#70006B', '#9C1B88']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bankCard}>
               <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>SAVINGS ACCOUNT (41935162249)</Text>
                  <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                    <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={22} color="#FFF" />
                  </TouchableOpacity>
               </View>
               <Text style={styles.cardSub}>Clear Balance</Text>
               <View style={styles.rowBetween}>
                 <Text style={styles.balanceText}>{showBalance ? '₹15,17,342.09' : 'XXXX,XXXX.XX'}</Text>
                 <TouchableOpacity onPress={handleRefresh}>
                   <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
                 </TouchableOpacity>
               </View>
               <View style={[styles.rowBetween, styles.mt20]}>
                  <TouchableOpacity onPress={() => setCurrentScreen('transactions')}>
                    <Text style={styles.cardLink}>View Passbook →</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={openFundTransfer}>
                    <Text style={styles.cardLink}>Transfer Money →</Text>
                  </TouchableOpacity>
               </View>
            </LinearGradient>
            <View style={styles.investCard}>
               <Text style={styles.investTitle}>INVESTMENTS & LOANS</Text>
               <Text style={styles.investSub}>Pre-approved Personal Loans & Mutual Funds</Text>
               <Text style={styles.investLink}>Explore Offers →</Text>
            </View>
          </ScrollView>

          <View style={styles.paySection}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Payments & YONO Pay</Text>
              <Text style={styles.dashboardDemoLabel}>SBI SECURE</Text>
            </View>
            <View style={styles.subTabRow}>
              <Text style={styles.subTabActive}>UPI Pay</Text>
              <TouchableOpacity onPress={openFundTransfer}>
                <Text style={styles.subTabText}>Fund Transfer</Text>
              </TouchableOpacity>
              <Text style={styles.subTabText}>Bills & Recharge</Text>
              <Text style={styles.subTabText}>YONO Cash</Text>
            </View>
            <View style={styles.upiAlert}>
              <MaterialIcons name="security" size={18} color="#00A1E1" />
              <Text style={styles.upiAlertText}>UPI ID active: rishabh@sbi</Text>
              <Text style={styles.activateText}>Manage UPI</Text>
            </View>
            <View style={styles.upiGrid}>
               <DashGridItem icon="book-outline" label="Pay Contacts" />
               <DashGridItem icon="phone-portrait-outline" label="UPI ID / No." />
               <DashGridItem icon="business-outline" label="Bank A/C Pay" />
               <DashGridItem icon="eye-outline" label="Passbook" onPress={() => setCurrentScreen('transactions')} />
            </View>

            <Image 
              source={{ uri: 'https://sbi.bank.in/documents/18605015/56894108/YONO+Homepage+Carousel+Banner+1.png/a658ae1b-bd9a-59f5-52e5-01b1f8a78c1c?t=1767952747595' }} 
              style={styles.dashboardBanner}
              resizeMode="stretch"
            />
          </View>
        </ScrollView>

        <View style={styles.bottomNavDash}>
           <NavItemDash icon="home" label="Home" active />
           <NavItemDash icon="hand-coin-outline" label="Loans" isMCI />
           <View style={styles.fabContainerDash}>
             <LinearGradient colors={['#70006B', '#00A1E1']} style={styles.fabDash}>
               <MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFF" />
             </LinearGradient>
             <Text style={styles.fabLabelDash}>Scan QR</Text>
           </View>
           <NavItemDash icon="shield-check-outline" label="Insurance" isMCI />
           <NavItemDash icon="chart-line" label="Investments" isMCI />
        </View>
      </SafeAreaView>
    );
  }

  // --- SCREEN 2: LOGIN ---
  return (
    <LinearGradient colors={['#4A004C', '#70006B', '#F4F5F8']} locations={[0, 0.35, 1]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://i.ibb.co/LdfV1v2s/BED36544-95-E4-4-A45-92-DD-02739-BEAA96-B-1-201-a.jpg' }}
              style={[styles.avatarCircle, { marginRight: 12, borderWidth: 2, borderColor: '#FFF' }]}
            />
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>Rishabh Tripathi</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
             <SbiLogo size="small" />
              <TouchableOpacity style={styles.locateRow}>
                <Ionicons name="location-sharp" size={13} color="#FFF" />
                <Text style={styles.locateText}> Locate Us</Text>
              </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Enter YONO mPIN</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => loginInputRef.current?.focus()} style={styles.pinDisplayContainer}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={[styles.pinBox, mpin.length === i && styles.pinBoxFocused]}>
                  {mpin.length > i && <View style={styles.bullet} />}
                </View>
              ))}
            </TouchableOpacity>
            <TextInput ref={loginInputRef} value={mpin} onChangeText={handleMpinChange} keyboardType="number-pad" maxLength={6} style={styles.hiddenInput} autoFocus={true} />
            
            <View style={styles.rowBetweenWidth}>
              <TouchableOpacity style={styles.forgotBtn}><Text style={styles.forgotText}>Forgot mPIN?</Text></TouchableOpacity>
            </View>

            <View style={styles.orRow}>
              <View style={styles.line} />
              <Text style={styles.orText}> OR </Text>
              <View style={styles.line} />
            </View>
            <TouchableOpacity><Text style={styles.loginWith}>Login using <Text style={styles.underline}>User ID / Password</Text></Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.viewBalanceBtn} onPress={() => setShowBalance(!showBalance)}>
            <Ionicons name="eye-outline" size={20} color="#FFF" style={styles.mr8} />
            <Text style={styles.viewBalanceText}>View Quick Balance</Text>
          </TouchableOpacity>

          <View style={styles.tabSection}>
             <View style={styles.tabHeader}>
                <View style={styles.activeTabWrapper}><Text style={styles.tabTextActive}>Transact</Text><View style={styles.activeIndicator} /></View>
                <Text style={styles.tabText}>Calculators</Text>
                <Text style={styles.tabText}>SBI Offers</Text>
             </View>
             <View style={styles.grid}>
                <GridItem label="Yono Cash" icon="wallet-outline" />
                <GridItem label="Quick Transfer" icon="swap-horizontal-outline" />
                <GridItem label="Send Money" icon="paper-plane-outline" />
                <GridItem label="Bill Pay" icon="receipt-outline" />
             </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <View style={styles.bottomNav}>
         <NavItem icon={<Ionicons name="card-outline" size={22} color="#666" />} label="Cards" />
         <NavItem icon={<MaterialIcons name="headset-mic" size={22} color="#666" />} label="Helpline" />
         <View style={styles.fabContainer}>
           <LinearGradient colors={['#70006B', '#00A1E1']} style={styles.fab}>
             <MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFF" />
           </LinearGradient>
           <Text style={styles.fabLabel}>Scan QR</Text>
         </View>
         <NavItem icon={<Ionicons name="grid-outline" size={22} color="#666" />} label="Services" />
         <NavItem icon={<MaterialCommunityIcons name="dots-horizontal" size={22} color="#666" />} label="More" />
      </View>
    </LinearGradient>
  );
}

const TransferOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.transferOption} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.transferOptionIcon}>
      <Ionicons name={icon} size={26} color="#70006B" />
    </View>
    <Text style={styles.transferOptionTitle}>{title}</Text>
    <Text style={styles.transferOptionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

const GridItem = ({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.gridItem}>
    <View style={styles.iconCircle}>
      {icon && <Ionicons name={icon} size={22} color="#70006B" />}
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </View>
);

const DashGridItem = ({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) => {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component style={styles.dashGridItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.dashIconCircle}>
        <Ionicons name={icon} size={22} color="#70006B" />
      </View>
      <Text style={styles.dashGridLabel}>{label}</Text>
    </Component>
  );
};

const TransactionItem = ({
  title,
  subtitle,
  date,
  postDate,
  amount,
  balance,
  isCredit,
}: {
  title: string;
  subtitle?: string;
  date: string;
  postDate?: string;
  amount: string;
  balance: string;
  isCredit?: boolean;
}) => (
  <View style={styles.transItem}>
    <View style={styles.rowBetween}>
      <View style={styles.upiTag}>
        <Text style={styles.upiTagText}>{isCredit ? 'CREDIT' : 'DEBIT'} • SBI PASSBOOK</Text>
      </View>
      {postDate && postDate !== date ? (
        <Text style={styles.postDateText}>Post Date: {postDate}</Text>
      ) : null}
    </View>
    <View style={styles.rowBetween}>
      <View style={styles.flex1}>
        <Text style={styles.transTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.transSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
        <Text style={styles.transDate}>Value Date: {date}</Text>
      </View>
      <View style={styles.alignEnd}>
        <View style={styles.row}>
          <Text style={[styles.transAmount, isCredit ? { color: '#2E7D32' } : { color: '#D32F2F' }]}>
            {isCredit ? '+' : '-'}₹{amount}
          </Text>
          <Feather
            name={isCredit ? 'arrow-down-left' : 'arrow-up-right'}
            size={16}
            color={isCredit ? '#2E7D32' : '#D32F2F'}
            style={styles.ml5}
          />
        </View>
        <Text style={styles.transBalance}>Bal: ₹{balance}</Text>
      </View>
    </View>
  </View>
);

const NavItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <TouchableOpacity style={styles.navItem}>
    {icon}
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavItemDash = ({
  icon,
  label,
  active,
  isMCI,
}: {
  icon: any;
  label: string;
  active?: boolean;
  isMCI?: boolean;
}) => (
  <TouchableOpacity style={styles.navItem}>
    {isMCI ? (
      <MaterialCommunityIcons name={icon} size={22} color={active ? '#70006B' : '#666'} />
    ) : (
      <Ionicons name={icon} size={22} color={active ? '#70006B' : '#666'} />
    )}
    <Text style={[styles.navLabel, active && { color: '#70006B', fontWeight: 'bold' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowBetweenWidth: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 8 },
  rowBetweenMargin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  ph20: { paddingHorizontal: 20, paddingBottom: 40 },
  ml5: { marginLeft: 5 },
  ml10: { marginLeft: 10 },
  ml20: { marginLeft: 20 },
  mr8: { marginRight: 8 },
  mt10: { marginTop: 10 },
  mt20: { marginTop: 20 },
  mh10: { marginHorizontal: 10 },
  bold: { fontWeight: 'bold' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  
  // Splash Screen
  splashBackground: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
  splashContent: { alignItems: 'center', marginTop: 160 },
  logoSplash: { width: width * 0.7, height: 160 },
  splashTagline: { color: '#FFF', fontSize: 16, letterSpacing: 1.2, marginTop: 10, opacity: 0.9, fontWeight: '500' },
  splashFooter: { marginBottom: 20 },
  splashFooterText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2 },

  // Header Bar
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 13, opacity: 0.9 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' },
  logoSmall: { width: 90, height: 32 },
  locateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  locateText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  
  // Login Card & PIN
  loginCard: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 10, borderRadius: 20, padding: 22, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  loginTitle: { fontSize: 16, color: '#70006B', fontWeight: '700', marginBottom: 20 },
  pinDisplayContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  pinBox: { width: 42, height: 48, borderWidth: 1.5, borderColor: '#D0B4DB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBF8FC' },
  pinBoxFocused: { borderColor: '#70006B', backgroundColor: '#FFF' },
  bullet: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#70006B' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
  demoCredentialHint: { color: '#666', fontSize: 11 },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: '#70006B', fontSize: 12, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#E5D6EA' },
  orText: { color: '#888', paddingHorizontal: 10, fontSize: 12, fontWeight: '600' },
  loginWith: { color: '#70006B', fontSize: 14 },
  underline: { textDecorationLine: 'underline', fontWeight: 'bold' },
  
  // Quick View Balance
  viewBalanceBtn: { flexDirection: 'row', backgroundColor: '#70006B', marginHorizontal: 16, marginTop: 15, paddingVertical: 13, borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  viewBalanceText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  
  // Tab Section
  tabSection: { flex: 1, backgroundColor: '#FFF', marginTop: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  tabText: { color: '#999', fontSize: 15, fontWeight: '500' },
  tabTextActive: { color: '#70006B', fontSize: 15, fontWeight: 'bold' },
  activeIndicator: { width: 22, height: 3, backgroundColor: '#70006B', marginTop: 4, borderRadius: 2 },
  activeIndicatorLong: { width: '100%', height: 3, backgroundColor: '#70006B', marginTop: 4, borderRadius: 2 },
  activeTabWrapper: { alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '23%', alignItems: 'center', marginBottom: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F5EBF7', marginBottom: 6, borderWidth: 1, borderColor: '#E8D2EC', justifyContent: 'center', alignItems: 'center' },
  gridLabel: { fontSize: 10.5, textAlign: 'center', color: '#555', fontWeight: '500' },
  
  // Bottom Navigation
  bottomNav: { flexDirection: 'row', height: 75, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EFEFEF', paddingBottom: 10 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 10, color: '#666', marginTop: 3 },
  fabContainer: { flex: 1, alignItems: 'center', marginTop: -26 },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 4 },
  fabLabel: { fontSize: 10, color: '#70006B', fontWeight: 'bold', marginTop: 3 },

  // Dashboard Styles
  dashboardContainer: { flex: 1, backgroundColor: '#F4F5F8' },
  dashHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' },
  avatarCircleHeader: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#FFF' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20 },
  avatarCircleSmall: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  dashGreetingLight: { fontSize: 16, color: '#FFF' },
  dashSubLight: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  headerIcon: { marginRight: 15 },
  dashTabs: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 14 },
  dashTabText: { fontSize: 15, color: '#777', marginRight: 25, fontWeight: '500' },
  dashTabActive: { color: '#70006B', fontWeight: 'bold', borderBottomWidth: 2.5, borderBottomColor: '#70006B', paddingBottom: 4 },
  cardScroll: { paddingLeft: 20, marginBottom: 18 },
  bankCard: { width: width * 0.78, borderRadius: 20, padding: 20, marginRight: 15, height: 165, elevation: 3 },
  cardTitle: { color: '#FFF', fontSize: 10.5, opacity: 0.85, fontWeight: '700', letterSpacing: 0.5 },
  cardSub: { color: '#FFF', fontSize: 12, marginTop: 14, opacity: 0.9 },
  balanceText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  cardLink: { color: '#FFF', textDecorationLine: 'underline', fontSize: 13, fontWeight: '600' },
  investCard: { width: width * 0.55, backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginRight: 20, height: 165, borderWidth: 1, borderColor: '#EBE5EC', elevation: 2 },
  investTitle: { fontSize: 11, color: '#70006B', fontWeight: '700', letterSpacing: 0.5 },
  investSub: { fontSize: 13, color: '#333', marginTop: 14, marginBottom: 10, lineHeight: 18 },
  investLink: { color: '#70006B', fontWeight: 'bold', fontSize: 13 },
  refreshText: { color: '#70006B', marginTop: 12, fontWeight: '600', fontSize: 14 },

  dashScrollContent: { paddingBottom: 10 },
  paySection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 4, paddingBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2B0830', marginBottom: 14 },
  subTabRow: { flexDirection: 'row', marginBottom: 18 },
  subTabActive: { color: '#70006B', fontWeight: 'bold', marginRight: 20, borderBottomWidth: 2, borderBottomColor: '#70006B', paddingBottom: 2 },
  subTabText: { color: '#888', marginRight: 20, fontSize: 13 },
  upiAlert: { flexDirection: 'row', backgroundColor: '#E1F5FE', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 18 },
  upiAlertText: { flex: 1, fontSize: 12, color: '#0277BD', marginLeft: 8, fontWeight: '500' },
  activateText: { color: '#70006B', fontWeight: 'bold', fontSize: 12 },
  upiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashGridItem: { width: '23%', alignItems: 'center', marginBottom: 16 },
  dashIconCircle: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5EBF7', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  dashGridLabel: { fontSize: 10.5, textAlign: 'center', color: '#555', fontWeight: '500', minHeight: 28, lineHeight: 13.5 },
  bottomNavDash: { flexDirection: 'row', height: 75, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EFEFEF', paddingBottom: 8, alignItems: 'center' },
  fabContainerDash: { flex: 1, alignItems: 'center', marginTop: -24 },
  fabDash: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabLabelDash: { fontSize: 10, color: '#70006B', fontWeight: 'bold', marginTop: 3 },

  // Generic Top Header Bar
  transHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' },
  headerBackBtn: { padding: 4 },
  headerTitleLight: { fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1, marginLeft: 10 },
  
  transHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  transTabs: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EFEFEF' },
  transTabActive: { fontSize: 14, color: '#70006B', fontWeight: 'bold', paddingVertical: 12 },
  transTabText: { fontSize: 14, color: '#888', marginLeft: 28, paddingVertical: 12 },
  accountSelectorCard: { margin: 15, backgroundColor: '#FFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E6D8EC', elevation: 2 },
  selectAccountLabel: { fontSize: 12, color: '#777', marginBottom: 8, fontWeight: '600' },
  accountBox: { flexDirection: 'row', alignItems: 'center' },
  sbiIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#70006B', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sbiMiniLogo: { width: 24, height: 24 },
  accountNumber: { fontSize: 17, fontWeight: 'bold', color: '#2B0830' },
  accountType: { fontSize: 11.5, color: '#777', marginTop: 2 },
  availableBalanceLabel: { fontSize: 12, color: '#555', marginTop: 3 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E2D5E6' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  recentTransHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center', marginBottom: 12 },
  recentTransText: { fontSize: 15, fontWeight: 'bold', color: '#70006B' },
  requestStatementBtn: { borderWidth: 1.5, borderColor: '#70006B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#FFF' },
  requestStatementText: { color: '#70006B', fontWeight: 'bold', fontSize: 12 },
  dateSeparator: { backgroundColor: '#EFE6F2', paddingVertical: 8, paddingHorizontal: 15 },
  dateText: { fontSize: 12, color: '#70006B', fontWeight: 'bold' },
  transItem: { padding: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F0EAF2' },
  upiTag: { backgroundColor: '#F3E8F5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  upiTagText: { fontSize: 9, color: '#70006B', fontWeight: '700' },
  postDateText: { fontSize: 10, color: '#70006B', fontWeight: '600' },
  transTitle: { fontSize: 14, color: '#222', fontWeight: '700', lineHeight: 19 },
  transSubtitle: { fontSize: 10.5, color: '#666', marginTop: 2, lineHeight: 14 },
  transDate: { fontSize: 11, color: '#888', marginTop: 4 },
  transAmount: { fontSize: 15, fontWeight: 'bold' },
  transBalance: { fontSize: 11, color: '#777', marginTop: 4 },
  alignEnd: { alignItems: 'flex-end' },
  
  // Request Statement
  formGroup: { marginBottom: 20 },
  labelSmall: { fontSize: 14, color: '#444', marginLeft: 8, fontWeight: '600' },
  labelVerySmall: { fontSize: 12, color: '#777', marginBottom: 6, fontWeight: '600' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#70006B' },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#D8C3DD', paddingVertical: 10, marginTop: 4 },
  pickerText: { fontSize: 15, color: '#333' },
  switchLabel: { fontSize: 14, color: '#333' },
  passLogicText: { fontSize: 13, color: '#70006B', fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: '#F5EBF7', padding: 14, borderRadius: 10, marginVertical: 18, alignItems: 'center' },
  infoBoxText: { flex: 1, fontSize: 11.5, color: '#500052', marginLeft: 10, lineHeight: 16 },
  outlineBtn: { width: '48%', borderWidth: 1.5, borderColor: '#70006B', borderRadius: 25, paddingVertical: 11, alignItems: 'center', backgroundColor: '#FFF' },
  outlineBtnText: { color: '#70006B', fontWeight: 'bold', fontSize: 13.5 },
  digiLockerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 18, borderWidth: 1, borderColor: '#E8D8EC' },
  digiText: { color: '#70006B', fontSize: 13.5, fontWeight: '600' },
  digiBrand: { backgroundColor: '#F5EBF7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#70006B' },
  digiMiniText: { fontSize: 10, color: '#70006B', fontWeight: 'bold' },
  dropdownList: { backgroundColor: '#FFF', elevation: 4, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#E8DCEB' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F4EEF6' },
  dropdownItemText: { color: '#333', fontSize: 14 },
  dashboardBanner: { width: '100%', height: 125, borderRadius: 14, marginTop: 14, overflow: 'hidden' },
  dashboardDemoLabel: { color: '#70006B', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  
  // Statement Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '82%', backgroundColor: '#FFF', padding: 26, borderRadius: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 19, fontWeight: 'bold', color: '#2B0830', marginTop: 14 },
  modalSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  modalOkBtn: { marginTop: 22, backgroundColor: '#70006B', paddingVertical: 11, paddingHorizontal: 36, borderRadius: 25 },
  modalOkBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // Fund Transfer
  transferScroll: { padding: 18, paddingBottom: 40 },
  demoPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  demoPillText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  demoNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EBF7', borderRadius: 12, padding: 12, marginBottom: 18 },
  demoNoticeText: { flex: 1, color: '#500052', fontSize: 11.5, marginLeft: 8, lineHeight: 16 },
  transferOptionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  transferOption: { width: '23%', minHeight: 124, alignItems: 'center', marginBottom: 16 },
  transferOptionIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F5EBF7', borderWidth: 1, borderColor: '#E8D2EC', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  transferOptionTitle: { color: '#2B0830', fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 15 },
  transferOptionSubtitle: { color: '#777', fontSize: 8.5, textAlign: 'center', marginTop: 3 },
  transferDivider: { height: 1, backgroundColor: '#E8E2EA', marginVertical: 10 },
  recentTransferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  viewAllText: { color: '#70006B', fontSize: 13, fontWeight: '700' },
  recipientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0EAF2' },
  recipientAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F5EBF7', borderWidth: 1, borderColor: '#E2CBE6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientAvatarText: { color: '#70006B', fontWeight: '700', fontSize: 13 },
  recipientName: { color: '#2B0830', fontSize: 14, fontWeight: '600' },
  recipientBank: { color: '#777', fontSize: 11, marginTop: 3 },
  payeeCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E8DCEB', padding: 24, alignItems: 'center', elevation: 3 },
  largeRecipientAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F5EBF7', borderWidth: 1.5, borderColor: '#D8B8E0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  largeRecipientAvatarText: { color: '#70006B', fontSize: 22, fontWeight: '700' },
  payeeFullName: { color: '#2B0830', fontSize: 20, fontWeight: '700' },
  payeeBank: { color: '#666', fontSize: 13, marginTop: 6 },
  payeeAccount: { color: '#888', fontSize: 12, marginTop: 4, letterSpacing: 0.5 },
  limitRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#EFE8F2' },
  limitLabel: { color: '#777', fontSize: 12 },
  limitValue: { color: '#70006B', fontSize: 13, fontWeight: '700' },
  transferSecurityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EBF7', borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 20 },
  transferSecurityText: { flex: 1, color: '#500052', fontSize: 11.5, marginLeft: 8 },
  primaryPayButton: { backgroundColor: '#70006B', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 3 },
  primaryPayText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  disabledButton: { backgroundColor: '#CCCCCC', elevation: 0 },
  miniPayeeHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E8DCEB', marginBottom: 18 },
  transferModePill: { flexDirection: 'row', backgroundColor: '#EFE3F2', borderRadius: 26, padding: 4, marginBottom: 22 },
  transferModeActive: { flex: 1, textAlign: 'center', backgroundColor: '#70006B', color: '#FFF', borderRadius: 22, paddingVertical: 10, fontWeight: '700', fontSize: 13 },
  transferModeInactive: { flex: 1, textAlign: 'center', color: '#70006B', paddingVertical: 10, fontSize: 13, fontWeight: '600' },
  transferSectionTitle: { color: '#2B0830', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  inputCard: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8DCEB', padding: 15, marginBottom: 14 },
  fieldLabel: { color: '#777', fontSize: 11.5, marginBottom: 8, fontWeight: '600' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#D8C3DD', paddingBottom: 6 },
  rupeePrefix: { color: '#70006B', fontSize: 24, fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, color: '#2B0830', fontSize: 22, fontWeight: '700', paddingVertical: 2 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { borderWidth: 1, borderColor: '#D8C3DD', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#FFF' },
  modeChipActive: { backgroundColor: '#70006B', borderColor: '#70006B' },
  modeChipText: { color: '#777', fontSize: 12, fontWeight: '600' },
  modeChipTextActive: { color: '#FFF' },
  fieldHint: { color: '#888', fontSize: 10.5, marginTop: 8 },
  textField: { color: '#333', fontSize: 15, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#DDD' },
  fromAccountText: { color: '#2B0830', fontSize: 15, fontWeight: '600' },
  fromAccountSub: { color: '#777', fontSize: 11, marginTop: 4 },
  reviewAmountCard: { borderRadius: 18, padding: 22, alignItems: 'center', marginBottom: 20, elevation: 4 },
  reviewAmount: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  reviewPurpose: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6 },
  reviewMode: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4 },
  reviewSectionTitle: { color: '#2B0830', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  reviewPartyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E8DCEB', padding: 14, marginBottom: 16 },
  reviewButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  backButton: { width: '47%', borderWidth: 1.5, borderColor: '#70006B', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  backButtonText: { color: '#70006B', fontSize: 15, fontWeight: '700' },
  confirmButton: { width: '47%', backgroundColor: '#70006B', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  confirmButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  mpinTransferContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  mpinShield: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#F5EBF7', justifyContent: 'center', alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#E2CBE6' },
  mpinTitle: { color: '#2B0830', fontSize: 20, fontWeight: '700' },
  mpinSubtitle: { color: '#777', fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 25 },
  transferPinDisplay: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  transferPinBox: { width: 42, height: 48, borderWidth: 1.5, borderColor: '#D0B4DB', borderRadius: 8, backgroundColor: '#FBF8FC', justifyContent: 'center', alignItems: 'center' },
  demoCredentialNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EBF7', borderRadius: 10, padding: 12, marginTop: 22 },
  demoCredentialText: { color: '#500052', fontSize: 12, marginLeft: 8 },
  progressScreen: { flex: 1 },
  progressInner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  progressTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 20 },
  progressSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 6, textAlign: 'center' },
  progressTimeline: { width: '100%', marginTop: 50 },
  progressTimelineRow: { flexDirection: 'row', alignItems: 'center' },
  progressDotActive: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  progressDotPending: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#FFF', marginHorizontal: 6 },
  progressStepActive: { color: '#FFF', fontSize: 13.5, fontWeight: '700', marginLeft: 10 },
  progressStepPending: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, marginLeft: 13 },
  progressLine: { width: 2, height: 28, backgroundColor: 'rgba(255,255,255,0.4)', marginLeft: 12, marginVertical: 2 },
  successTop: { paddingTop: 45, paddingBottom: 30, alignItems: 'center' },
  successCheck: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  successAmount: { color: '#FFF', fontSize: 32, fontWeight: '800', marginTop: 8 },
  successPurpose: { color: '#E8F5E9', fontSize: 12.5, marginTop: 4 },
  successScroll: { padding: 18, paddingBottom: 40 },
  successCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E8E8E8', elevation: 2 },
  successRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  successLabel: { color: '#888', fontSize: 12, width: 90 },
  successValueBlock: { flex: 1, alignItems: 'flex-end' },
  successValue: { color: '#2B0830', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  successValueBold: { color: '#70006B', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  successSubValue: { color: '#777', fontSize: 10.5, textAlign: 'right', marginTop: 3 },
  successStatus: { color: '#2E7D32', fontSize: 13, fontWeight: '800', textAlign: 'right' },
  successSeparator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 13 },
});
