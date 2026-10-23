import statementTransactions from '../constants/statement-transactions.json';
import { DashboardScreen, LoginScreen } from '../components/yono-screens';
import { Brand } from '../components/yono-ui';
import { SpendAnalysis } from '../components/spend-analysis';
import { SafeAreaProvider, SafeAreaView } from '../components/safe-area';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  View
} from 'react-native';

const SbiLogo = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => <Brand light large={size === 'large'} />;

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
  month: string;
}

// Monetary calculations use integer paise to avoid floating-point rounding drift.
const CURRENT_BALANCE_PAISE = 9125784931;
const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const CURRENT_BALANCE = formatPaise(CURRENT_BALANCE_PAISE);
const parsePaise = (amount: string) => {
  const [rupees, paise = ''] = amount.replace(/,/g, '').split('.');
  return Number(rupees) * 100 + Number(paise.padEnd(2, '0'));
};

const TRANSACTION_HISTORY: Omit<Transaction, 'balance'>[] = [
  // September 2026 (Statement Batch)
  { title: 'Mr Archana', subtitle: 'WDL TFR UPI/DR/508660462095/Mr archana/IDIB/7838953936/UPI 0097694162092 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '03/09/2026', amount: '20,500.00', isCredit: false, month: 'September 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/657489321564/Air India SBI/R825607848/NEFT AT 00614 NEW DELHI', date: '02/09/2026', postDate: '02/09/2026', amount: '2,86,802.24', isCredit: true, month: 'September 2026' },
  { title: 'Dinesh K', subtitle: 'WDL TFR UPI/DR/508728059523/DINESH K/BKID/q274255738/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '49,656.00', isCredit: false, month: 'September 2026' },
  { title: 'Bishwaji', subtitle: 'WDL TFR UPI/DR/508739893393/Bishwaji/SBIN/9958026679/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '4,000.00', isCredit: false, month: 'September 2026' },
  { title: 'Bishwaji', subtitle: 'WDL TFR UPI/DR/508749980074/Bishwaji/SBIN/9958026679/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '35,200.00', isCredit: false, month: 'September 2026' },
  { title: 'Akanksha', subtitle: 'WDL TFR UPI/DR/508709195394/akanksha/ICIC/akankshash/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '500.00', isCredit: false, month: 'September 2026' },
  { title: 'Rishabh', subtitle: 'WDL TFR UPI/DR/508700699588/rishabht/ICIC/rishabhtri/UPI 0097695162091 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '1,000.00', isCredit: false, month: 'September 2026' },
  { title: 'Ms Sonia', subtitle: 'WDL TFR UPI/DR/545432776302/Ms SONIA/CBIN/sonia.onep/UPI 0097696162090 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '290.00', isCredit: false, month: 'September 2026' },
  { title: 'Ms Sonia', subtitle: 'WDL TFR UPI/DR/509045593850/Ms SONIA/CBIN/sonia.onep/UPI 0097691162095 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '1,800.00', isCredit: false, month: 'September 2026' },
  { title: 'Vikas CH', subtitle: 'WDL TFR UPI/DR/509027891806/VIKAS CH/YESB/q311679753/UPI 0097691162095 AT 00614 NARAINGARH', date: '02/09/2026', postDate: '02/09/2026', amount: '3,400.00', isCredit: false, month: 'September 2026' },

  // August 2026
  { title: 'Apple Media Services', subtitle: 'DEP TFR UPI/CR/102209673166/APPLE ME/HDFC/appleservi/Mand 0097738162095 AT 00614 NARAINGARH', date: '13/08/2026', postDate: '13/08/2026', amount: '289.00', isCredit: true, month: 'August 2026' },
  { title: 'Apple Media Services', subtitle: 'WDL TFR UPI/DR/102194712169/APPLE ME/HDFC/appleservi/UPI 0097694162092 AT 00614 NARAINGARH', date: '11/08/2026', postDate: '11/08/2026', amount: '289.00', isCredit: false, month: 'August 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/653245127852/Air India/SBI/462587496/NEFT AT 00614 NEW DELHI', date: '01/08/2026', postDate: '01/08/2026', amount: '2,78,390.18', isCredit: true, month: 'August 2026' },

  // July 2026
  { title: 'Rishabh (IMPS)', subtitle: 'DEP TFR IMPS/533421787598/ICI-XX138-RISHABH /IMPS Tran 0098333162095 AT 00614 NARAINGARH', date: '30/07/2026', postDate: '30/07/2026', amount: '599.49', isCredit: true, month: 'July 2026' },
  { title: 'Gopal GU', subtitle: 'WDL TFR UPI/DR/392363227492/GOPAL GU/YESB/q013228365/Sent 0097690162095 AT 00614 NARAINGARH', date: '16/07/2026', postDate: '16/07/2026', amount: '600.00', isCredit: false, month: 'July 2026' },
  { title: 'Gopal GU', subtitle: 'WDL TFR UPI/DR/392338526402/GOPAL GU/YESB/q013228365/Sent 0097696162090 AT 00614 NARAINGARH', date: '15/07/2026', postDate: '15/07/2026', amount: '650.00', isCredit: false, month: 'July 2026' },
  { title: 'Shatrudh', subtitle: 'WDL TFR UPI/DR/531924227253/SHATRUDH/YESB/paytmqr6ir/Sent 0097696162090 AT 00614 NARAINGARH', date: '15/07/2026', postDate: '15/07/2026', amount: '725.03', isCredit: false, month: 'July 2026' },
  { title: 'Mr Gopal', subtitle: 'WDL TFR UPI/DR/531731352838/Mr GOPAL/UTIB/9818858918/Sent 0097694162092 AT 00614 NARAINGARH', date: '13/07/2026', postDate: '13/07/2026', amount: '775.04', isCredit: false, month: 'July 2026' },
  { title: 'Surjit K', subtitle: 'WDL TFR UPI/DR/392189657182/Surjit K/PPIW/surjit.yad/Sent 0097694162092 AT 00614 NARAINGARH', date: '13/07/2026', postDate: '13/07/2026', amount: '825.00', isCredit: false, month: 'July 2026' },
  { title: 'Mr Mohan', subtitle: 'WDL TFR UPI/DR/531610331242/Mr MOHAN/YESB/q576682970/Sent 0097693162093 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '875.02', isCredit: false, month: 'July 2026' },
  { title: 'Apple Media Services', subtitle: 'DEP TFR UPI/CR/101951563261/APPLE ME/HDFC/appleservi/Mand 0097735162098 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '950.50', isCredit: true, month: 'July 2026' },
  { title: 'Apple Media Services', subtitle: 'WDL TFR UPI/DR/101951356609/APPLE ME/HDFC/appleservi/UPI 0097693162093 AT 00614 NARAINGARH', date: '12/07/2026', postDate: '12/07/2026', amount: '1,000.00', isCredit: false, month: 'July 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/684593127486/Air India/SBI/563214796/NEFT AT 00614 NEW DELHI', date: '03/07/2026', postDate: '10/07/2026', amount: '2,87,116.66', isCredit: true, month: 'July 2026' },

  // June 2026
  { title: 'Sushila', subtitle: 'WDL TFR UPI/DR/527769922823/SUSHILAD/YESB/q312456890/Sent 0097691162095 AT 00614 NARAINGARH', date: '04/06/2026', postDate: '04/06/2026', amount: '95,728.05', isCredit: false, month: 'June 2026' },
  { title: 'Chandan', subtitle: 'WDL TFR UPI/DR/527769096810/CHANDAN/FDRL/9315873397/Sent 0097691162095 AT 00614 NARAINGARH', date: '04/06/2026', postDate: '04/06/2026', amount: '115.00', isCredit: false, month: 'June 2026' },
  { title: 'Air India', subtitle: 'DEP TFR NEFT/DR/400596843278/Air India/SBI/796548213/NEFT AT 00614 NEW DELHI', date: '01/06/2026', postDate: '01/06/2026', amount: '3,55,116.66', isCredit: true, month: 'June 2026' },
];
// Keep PDF salary dates intact; space the other imported entries backward
// from 22 October 2026. UTC avoids device timezone and daylight-saving shifts.
const transactionDate = (value: string) => {
  const [day, month, year] = value.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
};
let statementDate = Date.UTC(2026, 9, 22);
let rescheduledCount = 0;
const datedStatementTransactions = statementTransactions.map(transaction => {
  if (transaction.isCredit && transaction.title.toLowerCase() === 'air india') {
    return transaction;
  }
  const date = new Date(statementDate).toLocaleDateString('en-GB', { timeZone: 'UTC' });
  const month = new Date(statementDate).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  // Alternate one-day and two-day intervals, without moving salary entries.
  statementDate -= (rescheduledCount++ % 2 === 0 ? 1 : 2) * 86_400_000;
  return { ...transaction, date, postDate: date, month };
});
const orderedTransactions = [...TRANSACTION_HISTORY, ...datedStatementTransactions]
  .sort((a, b) => transactionDate(b.date) - transactionDate(a.date));

// Anchor the closing balance and work backward in paise. Editing a historical
// amount recalculates earlier running balances and the implied opening balance.
let precedingBalancePaise = CURRENT_BALANCE_PAISE;
const PDF_TRANSACTIONS: Transaction[] = orderedTransactions.map(transaction => {
  const balance = formatPaise(precedingBalancePaise);
  const amountPaise = parsePaise(transaction.amount);
  precedingBalancePaise += transaction.isCredit ? -amountPaise : amountPaise;
  return { ...transaction, amount: formatPaise(amountPaise), balance };
});

export default function App() {
  return <SafeAreaProvider><View style={styles.appBackdrop}><View style={styles.appFrame}><YonoApp /></View></View></SafeAreaProvider>;
}

function YonoApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [mpin, setMpin] = useState<string>('');
  const [pinError, setPinError] = useState('');
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
  const [transactionType, setTransactionType] = useState<'all' | 'credit' | 'debit'>('all');
  const [oldestFirst, setOldestFirst] = useState(false);
  const [passbookTab, setPassbookTab] = useState<'transactions' | 'analysis'>('transactions');

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

  const loginInputRef = useRef<TextInputInstance>(null);
  const transferInputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('login');
      }, 1400);
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
    setPinError('');
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
          setPinError('Incorrect mPIN. Please try again.');
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
  const filteredTransactions = [...(oldestFirst ? [...PDF_TRANSACTIONS].reverse() : PDF_TRANSACTIONS)].filter(t =>
    (transactionType === 'all' || (transactionType === 'credit' ? t.isCredit : !t.isCredit)) && (
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.subtitle && t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    t.date.includes(searchQuery) ||
    t.amount.includes(searchQuery)
  ));

  const months = [...new Set(PDF_TRANSACTIONS.map(transaction => transaction.month))];

  // --- SCREEN 1: SPLASH ---
  if (currentScreen === 'splash') {
    return (
      <LinearGradient colors={['#492273', '#663399', '#B51C86']} style={styles.splashBackground}>
        <StatusBar barStyle="light-content" />
        <View style={styles.splashContent}>
          <SbiLogo size="large" />
          <Text style={styles.splashTagline}>You only need one.</Text>
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('dashboard')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Fund Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color="#663399" />
            <Text style={styles.demoNoticeText}>Transfer to a saved payee, or make a quick payment.</Text>
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
            <TouchableOpacity accessibilityRole="button" onPress={() => chooseRecipient(recipients[0])}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recipients.map((recipient, idx) => (
            <TouchableOpacity accessibilityRole="button" key={recipient.account + idx} style={styles.recipientRow} onPress={() => chooseRecipient(recipient)} activeOpacity={0.75}>
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('fundTransfer')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight} numberOfLines={1}>{selectedRecipient.name}</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Payee</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="shield-checkmark" size={20} color="#663399" />
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
            <Ionicons name="lock-closed-outline" size={20} color="#663399" />
            <Text style={styles.transferSecurityText}>Verify payee details carefully before confirming payment.</Text>
          </View>

          <TouchableOpacity accessibilityRole="button" style={styles.primaryPayButton} onPress={openTransferDetails} activeOpacity={0.85}>
            <Text style={styles.primaryPayText}>Pay Now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferDetails') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('recipientDetails')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Enter Amount</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Step 1 of 2</Text></View>
        </View>

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
                <TouchableOpacity accessibilityRole="button"
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
            <Text style={styles.fromAccountSub}>Available Balance: ₹{CURRENT_BALANCE}</Text>
          </View>

          <TouchableOpacity accessibilityRole="button"
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('transferDetails')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Verify Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Step 2 of 2</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <LinearGradient colors={['#663399', '#B51C86']} style={styles.reviewAmountCard}>
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
            <View accessibilityLabel="Rishabh Tripathi" style={styles.accountAvatar}><Text style={styles.accountAvatarText}>RT</Text></View>
            <View style={styles.flex1}>
              <Text style={styles.recipientName}>Rishabh Tripathi</Text>
              <Text style={styles.recipientBank}>SBI Savings A/C • {transferFromAccount}</Text>
            </View>
          </View>

          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={20} color="#663399" />
            <Text style={styles.demoNoticeText}>Check the recipient and amount before confirming your transfer.</Text>
          </View>

          <View style={styles.reviewButtons}>
            <TouchableOpacity accessibilityRole="button" style={styles.backButton} onPress={() => setCurrentScreen('transferDetails')}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.confirmButton} onPress={openMpinConfirmation} activeOpacity={0.85}>
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('transferReview')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>mPIN Authorization</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>Security</Text></View>
        </View>

        <View style={styles.mpinTransferContainer}>
          <View style={styles.mpinShield}>
            <Ionicons name="shield-checkmark" size={38} color="#663399" />
          </View>
          <Text style={styles.mpinTitle}>Enter 6-Digit mPIN</Text>
          <Text style={styles.mpinSubtitle}>Enter your YONO SBI mPIN to authorize transaction.</Text>

          <TouchableOpacity accessibilityRole="button" activeOpacity={1} onPress={() => transferInputRef.current?.focus()} style={styles.transferPinDisplay}>
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

        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferProgress') {
    return (
      <LinearGradient colors={['#492273', '#663399', '#B51C86']} style={styles.progressScreen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.progressInner}>
          <ActivityIndicator size="large" color="#00B2E3" />
          <Text style={styles.progressTitle}>Transaction Processing...</Text>
          <Text style={styles.progressSubtitle}>Preparing your demo transfer</Text>

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
        <StatusBar barStyle="dark-content" />
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
            <Text style={styles.demoNoticeText}>Demo transfer complete. No money has been moved.</Text>
          </View>

          <TouchableOpacity accessibilityRole="button"
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('transactions')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Request Account Statement</Text>
        </View>

        <ScrollView style={styles.flex1} contentContainerStyle={styles.ph20}>
          <View style={styles.formGroup}>
            <View style={styles.row}>
               <View style={styles.radioCircle} />
               <Text style={styles.labelSmall}>Select Duration</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" style={styles.picker} onPress={() => toggleDropdown('duration')}>
              <Text style={styles.pickerText}>{duration}</Text>
              <Ionicons name="chevron-down" size={20} color="#663399" />
            </TouchableOpacity>
            {activeDropdown === 'duration' && (
              <View style={styles.dropdownList}>
                {['Last 3 months', 'Last 6 months', 'Last one year', 'Custom dates'].map(item => (
                  <TouchableOpacity accessibilityRole="button" key={item} style={styles.dropdownItem} onPress={() => { setDuration(item); setActiveDropdown('none'); }}>
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
            <TouchableOpacity accessibilityRole="button" style={styles.picker} onPress={() => toggleDropdown('year')}>
              <Text style={styles.pickerText}>{financialYear}</Text>
              <Ionicons name="chevron-down" size={20} color="#663399" />
            </TouchableOpacity>
            {activeDropdown === 'year' && (
              <View style={styles.dropdownList}>
                {['2026 - 2027', '2025 - 2026', '2024 - 2025', '2023 - 2024'].map(item => (
                  <TouchableOpacity accessibilityRole="button" key={item} style={styles.dropdownItem} onPress={() => { setFinancialYear(item); setActiveDropdown('none'); }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.labelVerySmall}>Format</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.picker} onPress={() => toggleDropdown('format')}>
              <Text style={styles.pickerText}>{format}</Text>
              <Ionicons name="chevron-down" size={20} color="#663399" />
            </TouchableOpacity>
            {activeDropdown === 'format' && (
              <View style={styles.dropdownList}>
                {['PDF', 'Excel'].map(item => (
                  <TouchableOpacity accessibilityRole="button" key={item} style={styles.dropdownItem} onPress={() => { setFormat(item); setActiveDropdown('none'); }}>
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
                <TouchableOpacity accessibilityRole="button"
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
              <Ionicons name="information-circle-outline" size={18} color="#663399" style={styles.ml5} />
            </View>
            <Switch
              value={includeSummary}
              onValueChange={setIncludeSummary}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeSummary ? "#663399" : "#FFF"}
            />
          </View>

          <View style={styles.rowBetweenMargin}>
            <Text style={styles.switchLabel}>Include nominee details</Text>
            <Switch
              value={includeNominee}
              onValueChange={setIncludeNominee}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeNominee ? "#663399" : "#FFF"}
            />
          </View>

          <View style={[styles.row, styles.mt10]}>
            <Text style={styles.passLogicText}>Password Protection Logic</Text>
            <Ionicons name="information-circle-outline" size={16} color="#663399" style={styles.ml5} />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#663399" />
            <Text style={styles.infoBoxText}>Max 5 statement downloads per account daily. Up to 2000 transactions per request.</Text>
          </View>

          <View style={styles.rowBetween}>
            <TouchableOpacity accessibilityRole="button" style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Email Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Download Statement</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity accessibilityRole="button" style={styles.digiLockerRow}>
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeaderBar}>
          <TouchableOpacity accessibilityRole="button" onPress={() => setCurrentScreen('dashboard')} accessibilityLabel="Go back" style={styles.headerBackBtn}>
            <Ionicons name="chevron-back" size={26} color="#663399" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>View Passbook</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Request account statement" style={styles.headerBackBtn} onPress={() => setCurrentScreen('requestStatement')}>
            <Ionicons name="document-text-outline" size={23} color="#663399" />
          </TouchableOpacity>
        </View>

        <View style={styles.transTabs}>
          <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: passbookTab === 'transactions' }} onPress={() => setPassbookTab('transactions')} style={styles.passbookTab}>
            <Text style={[styles.transTabText, passbookTab === 'transactions' && styles.transTabActive]}>Transactions</Text>
            {passbookTab === 'transactions' && <View style={styles.activeIndicatorLong} />}
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="tab" accessibilityState={{ selected: passbookTab === 'analysis' }} onPress={() => setPassbookTab('analysis')} style={styles.passbookTab}>
            <Text style={[styles.transTabText, passbookTab === 'analysis' && styles.transTabActive]}>Spend Analysis</Text>
            {passbookTab === 'analysis' && <View style={styles.activeIndicatorLong} />}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.flex1}>
          {passbookTab === 'analysis' ? <SpendAnalysis transactions={PDF_TRANSACTIONS} /> : <>
          <View style={styles.accountSelectorCard}>
            <Text style={styles.selectAccountLabel}>Select Account</Text>
            <View style={styles.accountBox}>
              <View accessibilityLabel="Rishabh Tripathi" style={styles.accountAvatar}><Text style={styles.accountAvatarText}>RT</Text></View>
              <View style={styles.flex1}>
                <View style={styles.row}>
                  <Text style={styles.accountNumber}>{showBalance ? '41935162249' : '•••• ••• 2249'}</Text>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={showBalance ? 'Hide account details' : 'Show account details'} onPress={() => setShowBalance(!showBalance)} style={styles.accountEyeButton}><Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={18} color="#663399" /></TouchableOpacity>
                </View>
                <Text style={styles.accountType}>SBI REGULAR SB CHQ-INDIVIDUALS (NARAINGARH)</Text>
                <Text style={styles.availableBalanceLabel}>Clear Balance: <Text style={styles.bold}>{showBalance ? `₹${CURRENT_BALANCE} CR` : '₹ ••••••••'}</Text></Text>
              </View>
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
                <TouchableOpacity accessibilityRole="button" onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#888" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Filter: ${transactionType}. Tap to change`} onPress={() => setTransactionType(transactionType === 'all' ? 'credit' : transactionType === 'credit' ? 'debit' : 'all')} style={styles.mh10}>
              <MaterialCommunityIcons name="filter-variant" size={24} color="#663399" />
              <Text style={styles.transDate}>{transactionType === 'all' ? 'All' : transactionType === 'credit' ? 'Credits' : 'Debits'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={oldestFirst ? 'Show newest first' : 'Show oldest first'} onPress={() => setOldestFirst(!oldestFirst)}>
              <MaterialCommunityIcons name="swap-vertical" size={24} color="#663399" />
            </TouchableOpacity>
          </View>

          <View style={styles.recentTransHeader}>
            <Text style={styles.recentTransText}>Account Passbook</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.requestStatementBtn} onPress={() => setCurrentScreen('requestStatement')}>
              <Text style={styles.requestStatementText}>Request Statement</Text>
            </TouchableOpacity>
          </View>

          {filteredTransactions.length === 0 && <Text style={[styles.transDate, { padding: 24, textAlign: 'center' }]}>No transactions match your search.</Text>}
          {(oldestFirst ? [...months].reverse() : months).map(m => {
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
          </>}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Keep account and transfer state in one place while sharing the new UI.
  if (currentScreen === 'dashboard') {
    return <DashboardScreen
      balance={CURRENT_BALANCE}
      showBalance={showBalance}
      toggleBalance={() => setShowBalance(!showBalance)}
      onPassbook={() => setCurrentScreen('transactions')}
      onStatement={() => setCurrentScreen('requestStatement')}
      onTransfer={openFundTransfer}
      onLogout={() => { setMpin(''); setPinError(''); setShowBalance(false); setCurrentScreen('login'); }}
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      recent={PDF_TRANSACTIONS.slice(0, 3)}
    />;
  }

  return <LoginScreen mpin={mpin} onMpinChange={handleMpinChange} inputRef={loginInputRef} error={pinError} />;
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
  <TouchableOpacity accessibilityRole="button" style={styles.transferOption} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.transferOptionIcon}>
      <Ionicons name={icon} size={26} color="#663399" />
    </View>
    <Text style={styles.transferOptionTitle}>{title}</Text>
    <Text style={styles.transferOptionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

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
}) => {
  const [expanded, setExpanded] = useState(false);
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${title}, ${isCredit ? 'credit' : 'debit'} ${amount}, ${date}. View details`} accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} activeOpacity={0.75} style={styles.transItem}>
    <View style={styles.transactionMain}>
      <View style={[styles.transactionDirection, isCredit && styles.transactionCredit]}>
        <Ionicons name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'} size={20} color={isCredit ? '#278053' : '#663399'} />
      </View>
      <View style={styles.transactionIdentity}>
        <Text style={styles.transTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.transDate}>{date} · {isCredit ? 'Received' : 'Paid'}</Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={[styles.transAmount, isCredit && { color: '#278053' }]}>{isCredit ? '+' : '−'}₹{amount}</Text>
        <Text style={styles.transBalance}>Bal: ₹{balance}</Text>
      </View>
      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color="#A79BAF" />
    </View>
    {expanded && <View style={styles.transactionDetail}>
      <Text style={styles.transactionDetailLabel}>{isCredit ? 'CREDIT' : 'DEBIT'} · SBI PASSBOOK</Text>
      {!!subtitle && <Text selectable style={styles.transSubtitle}>{subtitle}</Text>}
      <Text style={styles.transDate}>Value date: {date}{postDate && postDate !== date ? ` · Post date: ${postDate}` : ''}</Text>
    </View>}
  </TouchableOpacity>;
};

const styles = StyleSheet.create({
  accountAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12, backgroundColor: '#F0EAF6', alignItems: 'center', justifyContent: 'center' },
  accountAvatarText: { color: '#663399', fontSize: 14, fontWeight: '600' },
  appBackdrop: { flex: 1, backgroundColor: '#EAE6F0', alignItems: 'center' },
  appFrame: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 560 : undefined, overflow: 'hidden', backgroundColor: '#F5F4F8' },
  flex1: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowBetweenMargin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  ph20: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  ml5: { marginLeft: 5 },
  mt10: { marginTop: 10 },
  mh10: { marginHorizontal: 10 },
  bold: { fontWeight: 'bold' },
  
  // Splash Screen
  splashBackground: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
  splashContent: { alignItems: 'center', marginTop: 160 },
  splashTagline: { color: '#FFF', fontSize: 16, letterSpacing: 1.2, marginTop: 10, opacity: 0.9, fontWeight: '500' },
  splashFooter: { marginBottom: 20 },
  splashFooterText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2 },

  
  // Login Card & PIN
  pinBoxFocused: { borderColor: '#663399', backgroundColor: '#FFF' },
  bullet: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#663399' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
  
  
  // Tab Section
  activeIndicatorLong: { width: '100%', height: 3, backgroundColor: '#663399', marginTop: 4, borderRadius: 2 },
  

  // Dashboard Styles
  dashboardContainer: { flex: 1, backgroundColor: '#F5F4F8' },
  avatarCircleSmall: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#24212B', marginBottom: 14 },

  // Generic Top Header Bar
  transHeaderBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, minHeight: 68, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EAE6EF' },
  headerBackBtn: { minWidth: 40, minHeight: 44, justifyContent: 'center' },
  headerTitleLight: { fontSize: 17, fontWeight: '600', color: '#24212B', flex: 1, marginLeft: 4 },
  
  transTabs: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EFEFEF' },
  transTabActive: { color: '#663399', fontWeight: '700' },
  transTabText: { fontSize: 13, color: '#888', paddingVertical: 14 },
  passbookTab: { flex: 1, alignItems: 'center' },
  accountEyeButton: { minWidth: 44, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  accountSelectorCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#EAE6EF' },
  selectAccountLabel: { fontSize: 12, color: '#777', marginBottom: 8, fontWeight: '600' },
  accountBox: { flexDirection: 'row', alignItems: 'center' },
  accountProfilePicture: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 1, borderColor: '#E6D8EC', backgroundColor: '#F0EAF6' },
  accountNumber: { fontSize: 17, fontWeight: 'bold', color: '#24212B' },
  accountType: { fontSize: 11.5, color: '#777', marginTop: 2 },
  availableBalanceLabel: { fontSize: 12, color: '#555', marginTop: 3 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E2D5E6' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  recentTransHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center', marginBottom: 12 },
  recentTransText: { fontSize: 15, fontWeight: 'bold', color: '#663399' },
  requestStatementBtn: { borderWidth: 1.5, borderColor: '#663399', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#FFF' },
  requestStatementText: { color: '#663399', fontWeight: 'bold', fontSize: 12 },
  dateSeparator: { backgroundColor: '#F5F4F8', paddingVertical: 13, paddingHorizontal: 18 },
  dateText: { fontSize: 11, color: '#76717E', fontWeight: '600', letterSpacing: 0.4 },
  transItem: { paddingHorizontal: 16, paddingVertical: 18, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#F0EAF2' },
  transactionMain: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  transactionIdentity: { flex: 1, minWidth: 0 },
  transactionDirection: { width: 35, height: 35, borderRadius: 12, backgroundColor: '#F0EAF6', alignItems: 'center', justifyContent: 'center' },
  transactionCredit: { backgroundColor: '#EAF5EF' },
  transactionDetail: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#F0EAF6' },
  transactionDetailLabel: { color: '#663399', fontSize: 9, fontWeight: '700', marginBottom: 7, letterSpacing: 0.7 },
  transTitle: { fontSize: 13, color: '#24212B', fontWeight: '600', lineHeight: 19 },
  transSubtitle: { fontSize: 10.5, color: '#666', marginTop: 2, lineHeight: 14 },
  transDate: { fontSize: 10, color: '#888', marginTop: 4 },
  transAmount: { fontSize: 13, color: '#24212B', fontWeight: '600', fontVariant: ['tabular-nums'] },
  transBalance: { fontSize: 9, color: '#777', marginTop: 4, fontVariant: ['tabular-nums'] },
  alignEnd: { alignItems: 'flex-end' },
  
  // Request Statement
  formGroup: { marginBottom: 20, backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#EAE6EF' },
  labelSmall: { fontSize: 14, color: '#444', marginLeft: 8, fontWeight: '600' },
  labelVerySmall: { fontSize: 12, color: '#777', marginBottom: 6, fontWeight: '600' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#663399' },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#DCD1E7', paddingVertical: 10, marginTop: 4 },
  pickerText: { fontSize: 15, color: '#333' },
  switchLabel: { fontSize: 14, color: '#333' },
  passLogicText: { fontSize: 13, color: '#663399', fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: '#F0EAF6', padding: 14, borderRadius: 10, marginVertical: 18, alignItems: 'center' },
  infoBoxText: { flex: 1, fontSize: 11.5, color: '#492273', marginLeft: 10, lineHeight: 16 },
  outlineBtn: { width: '48%', borderWidth: 1.5, borderColor: '#663399', borderRadius: 25, paddingVertical: 11, alignItems: 'center', backgroundColor: '#FFF' },
  outlineBtnText: { color: '#663399', fontWeight: 'bold', fontSize: 13.5 },
  digiLockerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginTop: 18, borderWidth: 1, borderColor: '#EAE6EF' },
  digiText: { color: '#663399', fontSize: 13.5, fontWeight: '600' },
  digiBrand: { backgroundColor: '#F0EAF6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#663399' },
  digiMiniText: { fontSize: 10, color: '#663399', fontWeight: 'bold' },
  dropdownList: { backgroundColor: '#FFF', elevation: 4, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#EAE6EF' },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F4EEF6' },
  dropdownItemText: { color: '#333', fontSize: 14 },
  
  // Statement Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '82%', backgroundColor: '#FFF', padding: 26, borderRadius: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 19, fontWeight: 'bold', color: '#24212B', marginTop: 14 },
  modalSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  modalOkBtn: { marginTop: 22, backgroundColor: '#663399', paddingVertical: 11, paddingHorizontal: 36, borderRadius: 25 },
  modalOkBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // Fund Transfer
  transferScroll: { padding: 18, paddingBottom: 40 },
  demoPill: { backgroundColor: '#F0EAF6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  demoPillText: { color: '#663399', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  demoNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0EAF6', borderRadius: 12, padding: 12, marginBottom: 18 },
  demoNoticeText: { flex: 1, color: '#492273', fontSize: 11.5, marginLeft: 8, lineHeight: 16 },
  transferOptionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 },
  transferOption: { width: '23%', minHeight: 124, alignItems: 'center', marginBottom: 16 },
  transferOptionIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F0EAF6', borderWidth: 1, borderColor: '#EAE6EF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  transferOptionTitle: { color: '#24212B', fontSize: 11, textAlign: 'center', fontWeight: '600', lineHeight: 15 },
  transferOptionSubtitle: { color: '#777', fontSize: 8.5, textAlign: 'center', marginTop: 3 },
  transferDivider: { height: 1, backgroundColor: '#E8E2EA', marginVertical: 10 },
  recentTransferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  viewAllText: { color: '#663399', fontSize: 13, fontWeight: '700' },
  recipientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0EAF2' },
  recipientAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F0EAF6', borderWidth: 1, borderColor: '#E2CBE6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientAvatarText: { color: '#663399', fontWeight: '700', fontSize: 13 },
  recipientName: { color: '#24212B', fontSize: 14, fontWeight: '600' },
  recipientBank: { color: '#777', fontSize: 11, marginTop: 3 },
  payeeCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#EAE6EF', padding: 24, alignItems: 'center', elevation: 3 },
  largeRecipientAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F0EAF6', borderWidth: 1.5, borderColor: '#D8B8E0', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  largeRecipientAvatarText: { color: '#663399', fontSize: 22, fontWeight: '700' },
  payeeFullName: { color: '#24212B', fontSize: 20, fontWeight: '700' },
  payeeBank: { color: '#666', fontSize: 13, marginTop: 6 },
  payeeAccount: { color: '#888', fontSize: 12, marginTop: 4, letterSpacing: 0.5 },
  limitRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#EFE8F2' },
  limitLabel: { color: '#777', fontSize: 12 },
  limitValue: { color: '#663399', fontSize: 13, fontWeight: '700' },
  transferSecurityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0EAF6', borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 20 },
  transferSecurityText: { flex: 1, color: '#492273', fontSize: 11.5, marginLeft: 8 },
  primaryPayButton: { backgroundColor: '#663399', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 3 },
  primaryPayText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  disabledButton: { backgroundColor: '#CCCCCC', elevation: 0 },
  miniPayeeHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#EAE6EF', marginBottom: 18 },
  transferModePill: { flexDirection: 'row', backgroundColor: '#EFE3F2', borderRadius: 26, padding: 4, marginBottom: 22 },
  transferModeActive: { flex: 1, textAlign: 'center', backgroundColor: '#663399', color: '#FFF', borderRadius: 22, paddingVertical: 10, fontWeight: '700', fontSize: 13 },
  transferModeInactive: { flex: 1, textAlign: 'center', color: '#663399', paddingVertical: 10, fontSize: 13, fontWeight: '600' },
  transferSectionTitle: { color: '#24212B', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  inputCard: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#EAE6EF', padding: 15, marginBottom: 14 },
  fieldLabel: { color: '#777', fontSize: 11.5, marginBottom: 8, fontWeight: '600' },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#DCD1E7', paddingBottom: 6 },
  rupeePrefix: { color: '#663399', fontSize: 24, fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, color: '#24212B', fontSize: 22, fontWeight: '700', paddingVertical: 2 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { borderWidth: 1, borderColor: '#DCD1E7', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#FFF' },
  modeChipActive: { backgroundColor: '#663399', borderColor: '#663399' },
  modeChipText: { color: '#777', fontSize: 12, fontWeight: '600' },
  modeChipTextActive: { color: '#FFF' },
  fieldHint: { color: '#888', fontSize: 10.5, marginTop: 8 },
  textField: { color: '#333', fontSize: 15, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#DDD' },
  fromAccountText: { color: '#24212B', fontSize: 15, fontWeight: '600' },
  fromAccountSub: { color: '#777', fontSize: 11, marginTop: 4 },
  reviewAmountCard: { borderRadius: 18, padding: 22, alignItems: 'center', marginBottom: 20, elevation: 4 },
  reviewAmount: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  reviewPurpose: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6 },
  reviewMode: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4 },
  reviewSectionTitle: { color: '#24212B', fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  reviewPartyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#EAE6EF', padding: 14, marginBottom: 16 },
  reviewButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  backButton: { width: '47%', borderWidth: 1.5, borderColor: '#663399', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  backButtonText: { color: '#663399', fontSize: 15, fontWeight: '700' },
  confirmButton: { width: '47%', backgroundColor: '#663399', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  confirmButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  mpinTransferContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  mpinShield: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#F0EAF6', justifyContent: 'center', alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#E2CBE6' },
  mpinTitle: { color: '#24212B', fontSize: 20, fontWeight: '700' },
  mpinSubtitle: { color: '#777', fontSize: 12, textAlign: 'center', marginTop: 6, marginBottom: 25 },
  transferPinDisplay: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 5 },
  transferPinBox: { width: 42, height: 48, borderWidth: 1.5, borderColor: '#DCD1E7', borderRadius: 8, backgroundColor: '#FCFAFD', justifyContent: 'center', alignItems: 'center' },
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
  successValue: { color: '#24212B', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  successValueBold: { color: '#663399', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  successSubValue: { color: '#777', fontSize: 10.5, textAlign: 'right', marginTop: 3 },
  successStatus: { color: '#2E7D32', fontSize: 13, fontWeight: '800', textAlign: 'right' },
  successSeparator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 13 },
});
