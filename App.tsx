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
  const [transferFromAccount] = useState('XXXXXXX2249');
  const [transferFromBank] = useState('Savings Account');
  const [transferTxnId, setTransferTxnId] = useState('');
  const [includeSummary, setIncludeSummary] = useState(false);
  const [includeNominee, setIncludeNominee] = useState(false);
  const [showBalance, setShowBalance] = useState(false); // State to toggle balance visibility
  const [isRefreshing, setIsRefreshing] = useState(false);

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

    // When 6 digits are entered, validate automatically.
    if (transferMpin === '189198') {
      Keyboard.dismiss();
      transferInputRef.current?.blur();
      const suffix = Math.floor(100000 + Math.random() * 900000);
      setTransferTxnId(`THXW${suffix}`);
      setTimeout(() => setCurrentScreen('transferProgress'), 120);
    } else {
      // wrong PIN: briefly dismiss keyboard, clear and refocus for retry
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



  // --- SCREEN 1: SPLASH ---
  if (currentScreen === 'splash') {
    return (
      <View style={styles.splashBackground}>
        <StatusBar barStyle="light-content" />
        <Image 
          source={{ uri: 'https://i.ibb.co/Fkw39Lg3/yonosbi-logo-removebg-preview.png' }} 
          style={styles.logoSplash} 
          resizeMode="contain" 
        />
      </View>
    );
  }


  // --- FUND TRANSFER DEMO FLOW ---
  // This is a local UI simulation. It does not connect to a bank or move real money.
  if (currentScreen === 'fundTransfer') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>Fund Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle-outline" size={19} color="#4A148C" />
            <Text style={styles.demoNoticeText}>NEFT Charges 1%-3% for an International Transfers.</Text>
          </View>

          <Text style={styles.sectionTitle}>Payments & Transfers</Text>
          <View style={styles.transferOptionGrid}>
            <TransferOption icon="sync-outline" title="Quick Transfer" subtitle="Upto ₹50,000" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="phone-portrait-outline" title="Send Money" subtitle="To Own/Other Account" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="globe-outline" title="Send Money A..." subtitle="International" onPress={() => chooseRecipient(recipients[0])} />
            <TransferOption icon="calendar-outline" title="Schedule Payments" subtitle="Schedule a transfer" onPress={() => chooseRecipient(recipients[0])} />
          </View>

          <View style={styles.transferDivider} />
          <View style={styles.recentTransferHeader}>
            <Text style={styles.sectionTitle}>Recents</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          {recipients.map((recipient) => (
            <TouchableOpacity key={recipient.name} style={styles.recipientRow} onPress={() => chooseRecipient(recipient)} activeOpacity={0.75}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>{recipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.recipientName}>{recipient.name}</Text>
                <Text style={styles.recipientBank}>{recipient.bank}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777" />
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
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('fundTransfer')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>{selectedRecipient.name}</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle-outline" size={19} color="#4A148C" />
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
            <Ionicons name="shield-checkmark-outline" size={22} color="#4A148C" />
            <Text style={styles.transferSecurityText}>Verify the recipient details before continuing.</Text>
          </View>

          <TouchableOpacity style={styles.primaryPayButton} onPress={openTransferDetails}>
            <Text style={styles.primaryPayText}>Pay</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferDetails') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('recipientDetails')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>Fund Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
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
              {transferMode === 'IMPS' ? 'Instant transfer, available 24x7' : transferMode === 'NEFT' ? 'Electronic bank transfer' : 'High-value bank transfer'}
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
            <Text style={styles.fromAccountText}>{transferFromAccount}</Text>
            <Text style={styles.fromAccountSub}>{transferFromBank}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryPayButton, !transferAmount && styles.disabledButton]}
            onPress={openReview}
            disabled={!transferAmount}
          >
            <Text style={styles.primaryPayText}>Proceed</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferReview') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('transferDetails')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>Verify Transfer</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </View>

        <ScrollView contentContainerStyle={styles.transferScroll}>
          <View style={styles.reviewAmountCard}>
            <Text style={styles.reviewAmount}>{formatTransferAmount()}</Text>
            <Text style={styles.reviewPurpose}>Money Transfer</Text>
            <Text style={styles.reviewMode}>Mode of Transfer: {transferMode}</Text>
          </View>

          <Text style={styles.reviewSectionTitle}>To</Text>
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

          <Text style={styles.reviewSectionTitle}>From</Text>
          <View style={styles.reviewPartyCard}>
            <View style={styles.accountIconCircle}>
              <Ionicons name="wallet-outline" size={21} color="#FFF" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.recipientName}>Rishabh Tripathi</Text>
              <Text style={styles.recipientBank}>Savings Account • {transferFromAccount}</Text>
            </View>
          </View>

          <View style={styles.demoNotice}>
            <Ionicons name="information-circle-outline" size={19} color="#4A148C" />
            <Text style={styles.demoNoticeText}>RTGS Transactions must be for ₹2 lakh or more.</Text>
          </View>

          <View style={styles.reviewButtons}>
            <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('transferDetails')}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={openMpinConfirmation}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
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
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('transferReview')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>mPIN Confirmation</Text>
          <View style={styles.demoPill}><Text style={styles.demoPillText}>View All</Text></View>
        </View>

        <View style={styles.mpinTransferContainer}>
          <View style={styles.mpinShield}>
            <Ionicons name="shield-checkmark-outline" size={36} color="#4A148C" />
          </View>
          <Text style={styles.mpinTitle}>Enter mPIN</Text>
          <Text style={styles.mpinSubtitle}>Enter the 6-digit demo mPIN to continue.</Text>

          <TouchableOpacity activeOpacity={1} onPress={() => transferInputRef.current?.focus()} style={styles.transferPinDisplay}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.transferPinBox}>
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
            <Ionicons name="information-circle-outline" size={17} color="#4A148C" />
            <Text style={styles.demoCredentialText}>Demo mPIN: 189198</Text>
          </View>

          {/* Submit button removed — validation happens automatically when 6 digits are entered */}
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferProgress') {
    return (
      <SafeAreaView style={styles.progressScreen}>
        <StatusBar barStyle="light-content" />
        <View style={styles.progressInner}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.progressTitle}>Transaction in progress</Text>
          <Text style={styles.progressSubtitle}>Please wait...</Text>

          <View style={styles.progressTimeline}>
            <View style={styles.progressTimelineRow}>
              <View style={styles.progressDotActive}><Ionicons name="checkmark" size={14} color="#FFF" /></View>
              <Text style={styles.progressStepActive}>Payment Processed</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressTimelineRow}>
              <View style={styles.progressDotPending} />
              <Text style={styles.progressStepPending}>Waiting for confirmation</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'transferSuccess') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successTop}>
          <View style={styles.successCheck}><Ionicons name="checkmark" size={40} color="#FFF" /></View>
          <Text style={styles.successTitle}>Transaction Successful!</Text>
          <Text style={styles.successAmount}>{formatTransferAmount()}</Text>
          <Text style={styles.successPurpose}>Money Transfer</Text>
        </View>

        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successCard}>
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>To</Text>
              <View style={styles.successValueBlock}>
                <Text style={styles.successValue}>{selectedRecipient.name}</Text>
                <Text style={styles.successSubValue}>{selectedRecipient.bank}</Text>
                <Text style={styles.successSubValue}>{selectedRecipient.account}</Text>
              </View>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>From</Text>
              <View style={styles.successValueBlock}>
                <Text style={styles.successValue}>Rishabh Tripathi</Text>
                <Text style={styles.successSubValue}>{transferFromBank} • {transferFromAccount}</Text>
              </View>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Mode</Text>
              <Text style={styles.successValue}>{transferMode}</Text>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Purpose</Text>
              <Text style={styles.successValue}>Money Transfer</Text>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Transaction ID</Text>
              <Text style={styles.successValue}>{transferTxnId}</Text>
            </View>

            <View style={styles.successSeparator} />

            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Status</Text>
              <Text style={styles.successStatus}>Successful</Text>
            </View>
          </View>

         <View style={styles.demoNotice}>
            <Ionicons name="information-circle-outline" size={19} color="#4A148C" />
            <Text style={styles.demoNoticeText}>Copy Transaction ID for further verifications and details.</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryPayButton}
            onPress={() => {
              setTransferAmount('');
              setTransferMpin('');
              setCurrentScreen('dashboard');
            }}
          >
            <Text style={styles.primaryPayText}>Done</Text>
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
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('transactions')}>
            <Ionicons name="chevron-back" size={28} color="#4A148C" />
          </TouchableOpacity>
          <Text style={styles.requestHeaderText}>Request Statement</Text>
        </View>

        <ScrollView style={styles.flex1} contentContainerStyle={styles.ph20}>
          <View style={styles.formGroup}>
            <View style={styles.row}>
               <View style={styles.radioCircle} />
               <Text style={styles.labelSmall}>Select Duration</Text>
            </View>
            <TouchableOpacity style={styles.picker} onPress={() => toggleDropdown('duration')}>
              <Text style={styles.pickerText}>{duration}</Text>
              <Ionicons name="chevron-down" size={20} color="#4A148C" />
            </TouchableOpacity>
            {activeDropdown === 'duration' && (
              <View style={styles.dropdownList}>
                {['Last 3 months', 'Last 6 months', 'Last one year', 'Custom dates'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setDuration(item); setActiveDropdown('none'); }}>
                    <Text>{item}</Text>
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
              <Ionicons name="chevron-down" size={20} color="#4A148C" />
            </TouchableOpacity>
            {activeDropdown === 'year' && (
              <View style={styles.dropdownList}>
                {['2022 - 2023', '2023 - 2024', '2024 - 2025', '2025 - 2026'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setFinancialYear(item); setActiveDropdown('none'); }}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.labelVerySmall}>Format</Text>
            <TouchableOpacity style={styles.picker} onPress={() => toggleDropdown('format')}>
              <Text style={styles.pickerText}>{format}</Text>
              <Ionicons name="chevron-down" size={20} color="#4A148C" />
            </TouchableOpacity>
            {activeDropdown === 'format' && (
              <View style={styles.dropdownList}>
                {['PDF', 'Excel'].map(item => (
                  <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => { setFormat(item); setActiveDropdown('none'); }}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

{/* Full Screen PDF Modal */}
<Modal 
  visible={pdfVisible} 
  animationType="fade" 
  transparent={true} // Makes it look like a popup
  onRequestClose={() => setPdfVisible(false)}
>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: '80%', backgroundColor: '#FFF', padding: 25, borderRadius: 15, alignItems: 'center' }}>
      
      {/* Success Tick Icon */}
      <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />

      {/* Success Message */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>
        Statement Sent!
      </Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 }}>
        Your statement has been sent to your registered email.
      </Text>

      {/* Close Button */}
      <TouchableOpacity 
        onPress={() => setPdfVisible(false)}
        style={{ marginTop: 20, backgroundColor: '#7B1FA2', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 25 }}
      >
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
      
    </View>
  </View>
</Modal>



          <View style={styles.rowBetweenMargin}>
            <View style={styles.row}>
              <Text style={styles.switchLabel}>Include all account summary</Text>
              <Ionicons name="information-circle-outline" size={18} color="#4A148C" style={styles.ml5} />
            </View>
            <Switch
              value={includeSummary}
              onValueChange={setIncludeSummary}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeSummary ? "#4A148C" : "#FFF"}
            />
          </View>

          <View style={styles.rowBetweenMargin}>
            <Text style={styles.switchLabel}>Include nominee details</Text>
            <Switch
              value={includeNominee}
              onValueChange={setIncludeNominee}
              trackColor={{ false: "#DDD", true: "#BA68C8" }}
              thumbColor={includeNominee ? "#4A148C" : "#FFF"}
            />
          </View>

          <View style={[styles.row, styles.mt10]}>
            <Text style={styles.passLogicText}>Password logic</Text>
            <Ionicons name="information-circle-outline" size={16} color="#4A148C" style={styles.ml5} />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#4A148C" />
            <Text style={styles.infoBoxText}>Maximum 5 downloads per account in a day. 2000 transactions per download.</Text>
          </View>

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={handleDownload}>
              <Text style={styles.outlineBtnText}>Download</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.digiLockerRow}>
            <Text style={styles.digiText}>Upload to DigiLocker</Text>
            <View style={styles.digiBrand}>
              <Text style={styles.digiMiniText}>DigiLocker</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SCREEN 4: TRANSACTIONS ---
  if (currentScreen === 'transactions') {
    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.transHeader}>
          <TouchableOpacity onPress={() => setCurrentScreen('dashboard')}>
            <Ionicons name="chevron-back" size={28} color="#555" />
          </TouchableOpacity>
          <Text style={styles.transHeaderText}>Transactions</Text>
          <View style={styles.row}>
            <Feather name="bell" size={22} color="#555" style={styles.headerIcon} />
            <MaterialIcons name="headset-mic" size={22} color="#555" />
          </View>
        </View>

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
                <Image source={{ uri: 'https://i.ibb.co/Fkw39Lg3/yonosbi-logo-removebg-preview.png' }} style={styles.sbiMiniLogo} />
              </View>
              <View style={styles.flex1}>
                <View style={styles.row}>
                  <Text style={styles.accountNumber}>XXXXXXX2249</Text>
                  <Ionicons name="eye-outline" size={18} color="#555" style={styles.ml10} />
                </View>
                <Text style={styles.accountType}>Savings Account</Text>
                <Text style={styles.availableBalanceLabel}>Available Balance: <Text style={styles.bold}>₹6,85,636.44</Text></Text>
              </View>
              <Ionicons name="chevron-down" size={24} color="#555" />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#888" />
              <TextInput placeholder="Search here..." style={styles.searchInput} />
            </View>
            <MaterialCommunityIcons name="filter-variant" size={24} color="#555" style={styles.mh10} />
            <MaterialCommunityIcons name="swap-vertical" size={24} color="#555" />
          </View>

          <View style={styles.recentTransHeader}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.recentTransText}>Recent Transfers</Text>
              <Ionicons name="chevron-down" size={16} color="#4A148C" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.requestStatementBtn} onPress={() => setCurrentScreen('requestStatement')}>
              <Text style={styles.requestStatementText}>Request Statement</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>May 2026</Text>
          </View>

          <TransactionItem title="CHQ- AIR INDIA DPST 472748..." date="09/04/2026" amount="25,00,000.00" balance="68,636.44" />
          <TransactionItem title="IMPS- JITENDER DPST 903467..." date="21/04/2026" amount="4,00,000.00" balance="19,35,087.43" isCredit />
          <TransactionItem title="EPF- SALARY WTDR 470823..." date="20/04/2026" amount="11,04,704.45" balance="15,35,087.43" isCredit />
          <TransactionItem title="CHQ- TRANSFER TO 536344..." date="10/03/2026" amount="2,15,000.00" balance="4,04,768.23" />
          <TransactionItem title="UPI- TRANSFER TO 536233..." date="03/03/2026" amount="15,000.00" balance="4,19,568.23" />
          <TransactionItem title="UPI- TRANSFER TO 696395..." date="02/03/2026" amount="200.00" balance="4,04,768.23" />
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
          <ActivityIndicator size="large" color="#4A148C" />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.dashboardContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.dashHeader}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://i.ibb.co/LdfV1v2s/BED36544-95-E4-4-A45-92-DD-02739-BEAA96-B-1-201-a.jpg' }}
              style={styles.avatarCircle}
            />
            <View style={styles.ml10}>
              <Text style={styles.dashGreeting}>Hello <Text style={styles.bold}>Rishabh,</Text></Text>
              <Text style={styles.dashSub}>Let's get started!</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Feather name="search" size={22} color="#555" style={styles.headerIcon} />
            <Feather name="bell" size={22} color="#555" style={styles.headerIcon} />
            <MaterialCommunityIcons name="logout" size={22} color="#555" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.dashTabs}>
            <Text style={[styles.dashTabActive, styles.dashTabText]}>Banking</Text>
            <Text style={styles.dashTabText}>Lifestyle</Text>
            <Text style={styles.dashTabText}>Rewards</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
            <LinearGradient colors={['#C2185B', '#880E4F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bankCard}>
               <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>TRANSACTION ACCOUNT (49)</Text>
                  <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                    <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="#FFF" />
                  </TouchableOpacity>
               </View>
               <Text style={styles.cardSub}>Total Balance</Text>
               <View style={styles.rowBetween}>
                 <Text style={styles.balanceText}>{showBalance ? '₹6,53,63,823.44' : 'XXXX,XXXX.XX'}</Text>
                 <TouchableOpacity onPress={handleRefresh}>
                   <MaterialCommunityIcons name="refresh" size={24} color="#FFF" />
                 </TouchableOpacity>
               </View>
               <View style={[styles.row, styles.mt20]}>
                  <Text style={styles.cardLink}>View Accounts</Text>
                  <TouchableOpacity onPress={() => setCurrentScreen('transactions')}>
                    <Text style={[styles.cardLink, styles.ml20]}>Transactions</Text>
                  </TouchableOpacity>
               </View>
            </LinearGradient>
            <View style={styles.investCard}>
               <Text style={styles.investTitle}>INVESTMENTS</Text>
               <Text style={styles.investSub}>Ready to start investing?</Text>
               <Text style={styles.investLink}>Invest Now</Text>
            </View>
          </ScrollView>

          <View style={styles.paySection}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Payments & Transfers</Text>
              <Text style={styles.dashboardDemoLabel}>DEMO</Text>
            </View>
            <View style={styles.subTabRow}>
              <Text style={styles.subTabActive}>UPI</Text>
              <TouchableOpacity onPress={openFundTransfer}>
                <Text style={styles.subTabText}>Fund Transfer</Text>
              </TouchableOpacity>
              <Text style={styles.subTabText}>Bills</Text>
              <Text style={styles.subTabText}>Yono Cash</Text>
            </View>
            <View style={styles.upiAlert}>
              <MaterialIcons name="error" size={18} color="#D32F2F" />
              <Text style={styles.upiAlertText}>You haven't created a UPI...</Text>
              <Text style={styles.activateText}>Activate UPI ID</Text>
            </View>
            <View style={styles.upiGrid}>
               <DashGridItem icon="book-outline" label="Pay to mobile or contact" />
               <DashGridItem icon="phone-portrait-outline" label="Pay UPI ID or Number" />
               <DashGridItem icon="business-outline" label="Pay to Bank A/C" />
               <DashGridItem icon="eye-outline" label="View Transaction" />
            </View>

            {/* Banner Section Added Here */}
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
           <View style={styles.fabContainerDash}><View style={styles.fabDash}><MaterialCommunityIcons name="qrcode-scan" size={26} color="#FFF" /></View><Text style={styles.fabLabelDash}>Scan QR</Text></View>
           <NavItemDash icon="shield-check-outline" label="Insurance" isMCI />
           <NavItemDash icon="chart-line" label="Investments" isMCI />
        </View>
      </SafeAreaView>
    );
  }

  // --- SCREEN 2: LOGIN ---
  return (
    <LinearGradient colors={['#7B1FA2', '#F3E5F5']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.row}>
            <Image
              source={{ uri: 'https://i.ibb.co/LdfV1v2s/BED36544-95-E4-4-A45-92-DD-02739-BEAA96-B-1-201-a.jpg' }}
              style={[styles.avatarCircle, { marginRight: 10, borderWidth: 1.5, borderColor: '#FFF' }]}
            />
            <View><Text style={styles.greeting}>Hello</Text><Text style={styles.userName}>Rishabh</Text></View>
          </View>
          <View style={styles.headerRight}>
             <Image source={{ uri: 'https://i.ibb.co/Fkw39Lg3/yonosbi-logo-removebg-preview.png' }} style={styles.logoSmall} resizeMode="contain" />
              <TouchableOpacity style={styles.locateRow}><Ionicons name="location-sharp" size={14} color="#FFF" /><Text style={styles.locateText}> Locate Us</Text></TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Login using MPIN</Text>
            <TouchableOpacity activeOpacity={1} onPress={() => loginInputRef.current?.focus()} style={styles.pinDisplayContainer}>
              {[...Array(6)].map((_, i) => (<View key={i} style={styles.pinBox}>{mpin.length > i && <View style={styles.bullet} />}</View>))}
            </TouchableOpacity>
            <TextInput ref={loginInputRef} value={mpin} onChangeText={handleMpinChange} keyboardType="number-pad" maxLength={6} style={styles.hiddenInput} autoFocus={true} />
            <TouchableOpacity style={styles.forgotBtn}><Text style={styles.forgotText}>Forgot MPIN?</Text></TouchableOpacity>
            <View style={styles.orRow}><View style={styles.line} /><Text style={styles.orText}> OR </Text><View style={styles.line} /></View>
            <TouchableOpacity><Text style={styles.loginWith}>Login with <Text style={styles.underline}>Username</Text></Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.viewBalanceBtn}><Text style={styles.viewBalanceText}>View Balance</Text></TouchableOpacity>

          <View style={styles.tabSection}>
             <View style={styles.tabHeader}>
                <View style={styles.activeTabWrapper}><Text style={styles.tabTextActive}>Transact</Text><View style={styles.activeIndicator} /></View>
                <Text style={styles.tabText}>Calculators</Text><Text style={styles.tabText}>Offers</Text>
             </View>
             <View style={styles.grid}>
                <GridItem label="Pay to Mobile or Contact" /><GridItem label="Quick Transfer" /><GridItem label="Send Money" /><GridItem label="Bill Payments" />
             </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <View style={styles.bottomNav}>
         <NavItem icon={<Ionicons name="search" size={22} color="#666" />} label="Yono Cash" />
         <NavItem icon={<MaterialIcons name="headset-mic" size={22} color="#666" />} label="Contact Us" />
         <View style={styles.fabContainer}><View style={styles.fab}><MaterialCommunityIcons name="qrcode-scan" size={28} color="#FFF" /></View><Text style={styles.fabLabel}>Scan QR</Text></View>
         <NavItem icon={<Ionicons name="grid-outline" size={22} color="#666" />} label="Products" />
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
      <Ionicons name={icon} size={27} color="#6A1B9A" />
    </View>
    <Text style={styles.transferOptionTitle}>{title}</Text>
    <Text style={styles.transferOptionSubtitle}>{subtitle}</Text>
  </TouchableOpacity>
);

// --- COMPONENTS ---
const GridItem = ({ label }: { label: string }) => (<View style={styles.gridItem}><View style={styles.iconCircle} /><Text style={styles.gridLabel}>{label}</Text></View>);
const DashGridItem = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
  <View style={styles.dashGridItem}><View style={styles.dashIconCircle}><Ionicons name={icon} size={24} color="#6A1B9A" /></View><Text style={styles.dashGridLabel}>{label}</Text></View>
);
const TransactionItem = ({ title, date, amount, balance, isCredit }: { title: string; date: string; amount: string; balance: string; isCredit?: boolean }) => (
  <View style={styles.transItem}><View style={styles.upiTag}></View>
    <View style={styles.rowBetween}><View style={styles.flex1}><Text style={styles.transTitle} numberOfLines={1}>{title}</Text><Text style={styles.transDate}>{date}</Text></View>
      <View style={styles.alignEnd}><View style={styles.row}><Text style={styles.transAmount}>₹{amount}</Text><Feather name={isCredit ? "arrow-down-left" : "arrow-up-right"} size={16} color={isCredit ? "#2E7D32" : "#D32F2F"} style={styles.ml5} /></View><Text style={styles.transBalance}>Balance: ₹{balance}</Text></View>
    </View>
  </View>
);
const NavItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (<TouchableOpacity style={styles.navItem}>{icon}<Text style={styles.navLabel}>{label}</Text></TouchableOpacity>);
const NavItemDash = ({ icon, label, active, isMCI }: { icon: any; label: string; active?: boolean; isMCI?: boolean }) => (
  <TouchableOpacity style={styles.navItem}>{isMCI ? <MaterialCommunityIcons name={icon} size={22} color={active ? '#6A1B9A' : '#666'} /> : <Ionicons name={icon} size={22} color={active ? '#6A1B9A' : '#666'} />}
    <Text style={[styles.navLabel, active && {color: '#6A1B9A', fontWeight: 'bold'}]}>{label}</Text></TouchableOpacity>
);

const styles = StyleSheet.create({
  flex1: { flex: 1 }, container: { flex: 1 }, safeArea: { flex: 1 }, row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowBetweenMargin: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  ph20: { paddingHorizontal: 20, paddingBottom: 40 }, ml5: { marginLeft: 5 }, ml10: { marginLeft: 10 }, ml20: { marginLeft: 20 }, mt10: { marginTop: 10 }, mt20: { marginTop: 20 }, mh10: { marginHorizontal: 10 },
  bold: { fontWeight: 'bold' }, centerContent: { justifyContent: 'center', alignItems: 'center' },
  splashBackground: { flex: 1, backgroundColor: '#4A148C', justifyContent: 'center', alignItems: 'center' },
  logoSplash: { width: width * 0.6, height: 150 }, header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 16, opacity: 0.9 }, userName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  headerRight: { alignItems: 'flex-end' }, logoSmall: { width: 80, height: 30 }, locateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locateText: { color: '#FFF', fontSize: 12 }, loginCard: { backgroundColor: 'rgba(255,255,255,0.95)', margin: 16, borderRadius: 16, padding: 20, alignItems: 'center' },
  loginTitle: { fontSize: 16, color: '#4A148C', marginBottom: 20 }, pinDisplayContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  pinBox: { width: 40, height: 45, borderWidth: 1, borderColor: '#BA68C8', borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  bullet: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4A148C' }, hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 }, forgotText: { color: '#4A148C', fontSize: 13, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%' }, line: { flex: 1, height: 1, backgroundColor: '#DDD' },
  orText: { color: '#888', paddingHorizontal: 10 }, loginWith: { color: '#4A148C', fontSize: 15 }, underline: { textDecorationLine: 'underline', fontWeight: 'bold' },
  viewBalanceBtn: { backgroundColor: '#6A1B9A', marginHorizontal: 16, padding: 14, borderRadius: 25, alignItems: 'center' },
  viewBalanceText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }, tabSection: { flex: 1, backgroundColor: '#FFF', marginTop: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 },
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  tabText: { color: '#999', fontSize: 16, fontWeight: '500' }, tabTextActive: { color: '#4A148C', fontSize: 16, fontWeight: 'bold' },
  activeIndicator: { width: 20, height: 3, backgroundColor: '#4A148C', marginTop: 4, borderRadius: 2 },
  activeIndicatorLong: { width: '100%', height: 3, backgroundColor: '#4A148C', marginTop: 4, borderRadius: 2 },
  activeTabWrapper: { alignItems: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '23%', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3E5F5', marginBottom: 8, borderWidth: 1, borderColor: '#E1BEE7' },
  gridLabel: { fontSize: 10, textAlign: 'center', color: '#555' }, bottomNav: { flexDirection: 'row', height: 80, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', paddingBottom: 15 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, navLabel: { fontSize: 10, color: '#666', marginTop: 4 },
  fabContainer: { flex: 1, alignItems: 'center', marginTop: -30 }, fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF' },
  fabLabel: { fontSize: 10, color: '#4A148C', fontWeight: 'bold', marginTop: 4 }, dashboardContainer: { flex: 1, backgroundColor: '#F8F9FB' },
  dashHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E1BEE7', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#4A148C', fontWeight: 'bold' }, dashGreeting: { fontSize: 18, color: '#333' }, dashSub: { fontSize: 14, color: '#777' },
  headerIcon: { marginRight: 15 }, dashTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 }, dashTabText: { fontSize: 16, color: '#888', marginRight: 25 },
  dashTabActive: { color: '#4A148C', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#4A148C', paddingBottom: 5 },
  cardScroll: { paddingLeft: 20, marginBottom: 20 }, bankCard: { width: width * 0.75, borderRadius: 20, padding: 20, marginRight: 15, height: 160 },
  cardTitle: { color: '#FFF', fontSize: 11, opacity: 0.8 }, cardSub: { color: '#FFF', fontSize: 13, marginTop: 15 },
  balanceText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' }, cardLink: { color: '#FFF', textDecorationLine: 'underline', fontSize: 14 },
  investCard: { width: width * 0.5, backgroundColor: '#F0F0F0', borderRadius: 20, padding: 20, marginRight: 20, height: 160 },
  investTitle: { fontSize: 12, color: '#666' }, investSub: { fontSize: 14, color: '#333', marginTop: 15, marginBottom: 10 }, investLink: { color: '#4A148C', fontWeight: 'bold' },
  paySection: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }, subTabRow: { flexDirection: 'row', marginBottom: 20 },
  subTabActive: { color: '#4A148C', fontWeight: 'bold', marginRight: 20, borderBottomWidth: 2, borderBottomColor: '#4A148C' },
  subTabText: { color: '#888', marginRight: 20 }, upiAlert: { flexDirection: 'row', backgroundColor: '#FBE9E7', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  upiAlertText: { flex: 1, fontSize: 12, color: '#333', marginLeft: 8 }, activateText: { color: '#4A148C', fontWeight: 'bold', fontSize: 12 },
  upiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashGridItem: { width: '23%', alignItems: 'center', marginBottom: 20 },
  dashIconCircle: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  dashGridLabel: { fontSize: 10, textAlign: 'center', color: '#555' }, bottomNavDash: { flexDirection: 'row', height: 75, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', paddingBottom: 10, alignItems: 'center' },
  fabContainerDash: { flex: 1, alignItems: 'center', marginTop: -25 }, fabDash: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabLabelDash: { fontSize: 10, color: '#6A1B9A', fontWeight: 'bold', marginTop: 4 },
  transHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  transHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1, marginLeft: 15 },
  transTabs: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#EEE', paddingBottom: 0 },
  transTabActive: { fontSize: 15, color: '#4A148C', fontWeight: 'bold', paddingBottom: 8 },
  transTabText: { fontSize: 15, color: '#888', marginLeft: 30, paddingBottom: 8 },
  accountSelectorCard: { margin: 15, backgroundColor: '#F0F2F5', borderRadius: 12, padding: 15, borderBottomWidth: 2, borderColor: '#BA68C8' },
  selectAccountLabel: { fontSize: 14, color: '#555', marginBottom: 10 }, accountBox: { flexDirection: 'row', alignItems: 'center' },
  sbiIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00A1E1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  sbiMiniLogo: { width: 25, height: 25, tintColor: '#FFF' }, accountNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  accountType: { fontSize: 12, color: '#777', marginTop: 2 }, availableBalanceLabel: { fontSize: 12, color: '#777', marginTop: 2 },
  searchContainer: { flexDirection: 'row', paddingHorizontal: 15, alignItems: 'center', marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 8, paddingHorizontal: 12, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 }, recentTransHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, alignItems: 'center', marginBottom: 15 },
  recentTransText: { fontSize: 16, fontWeight: 'bold', color: '#4A148C', marginRight: 5 },
  requestStatementBtn: { borderWidth: 1, borderColor: '#4A148C', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8 },
  requestStatementText: { color: '#4A148C', fontWeight: 'bold', fontSize: 12 },
  dateSeparator: { backgroundColor: '#F0F2F5', paddingVertical: 10, paddingHorizontal: 15 }, dateText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  transItem: { padding: 15, borderBottomWidth: 1, borderColor: '#EEE' }, upiTag: { backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 5 },
  upiTagText: { fontSize: 10, color: '#888' }, transTitle: { fontSize: 14, color: '#333', fontWeight: '500' }, transDate: { fontSize: 11, color: '#888', marginTop: 4 },
  transAmount: { fontSize: 15, color: '#4A148C', fontWeight: 'bold' }, transBalance: { fontSize: 11, color: '#888', marginTop: 4 }, alignEnd: { alignItems: 'flex-end' },
  requestHeaderText: { fontSize: 20, fontWeight: 'bold', color: '#4A148C', flex: 1, marginLeft: 10 },
  formGroup: { marginBottom: 25 },
  labelSmall: { fontSize: 14, color: '#666', marginLeft: 10 },
  labelVerySmall: { fontSize: 12, color: '#888', marginBottom: 8 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#888' },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#DDD', paddingVertical: 10, marginTop: 5 },
  pickerText: { fontSize: 16, color: '#333' },
  switchLabel: { fontSize: 14, color: '#333' },
  passLogicText: { fontSize: 14, color: '#666' },
  infoBox: { flexDirection: 'row', backgroundColor: '#F3E5F5', padding: 15, borderRadius: 8, marginVertical: 20, alignItems: 'center' },
  infoBoxText: { flex: 1, fontSize: 12, color: '#4A148C', marginLeft: 10 },
  outlineBtn: { width: '48%', borderWidth: 1, borderColor: '#CCC', borderRadius: 25, paddingVertical: 12, alignItems: 'center' },
  outlineBtnText: { color: '#888', fontWeight: 'bold', fontSize: 15 },
  digiLockerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 15, borderRadius: 8, marginTop: 20 },
  digiText: { color: '#4A148C', fontSize: 14 },
  digiBrand: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#4A148C' },
  digiMiniText: { fontSize: 10, color: '#4A148C', fontWeight: 'bold' },
  dropdownList: { backgroundColor: '#FFF', elevation: 3, borderRadius: 4, marginTop: 5 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  dashboardBanner: { width: '100%', height: 120, borderRadius: 12, marginTop: 10, overflow: 'hidden' },

  dashboardDemoLabel: { color: '#6A1B9A', fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginBottom: 15 },
  // Fund Transfer demo flow
  transferScroll: { padding: 20, paddingBottom: 40 },
  demoPill: { backgroundColor: '#F3E5F5', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  demoPillText: { color: '#6A1B9A', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  demoNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EFF8', borderRadius: 10, padding: 12, marginBottom: 20 },
  demoNoticeText: { flex: 1, color: '#5E4A66', fontSize: 11, marginLeft: 8, lineHeight: 16 },
  transferOptionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 5 },
  transferOption: { width: '23%', minHeight: 128, alignItems: 'center', marginBottom: 16 },
  transferOptionIcon: { width: 58, height: 58, borderRadius: 15, backgroundColor: '#F5EAF8', borderWidth: 1, borderColor: '#E4D1EA', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  transferOptionTitle: { color: '#4E3857', fontSize: 11, textAlign: 'center', fontWeight: '500', lineHeight: 15 },
  transferOptionSubtitle: { color: '#777', fontSize: 8.5, textAlign: 'center', marginTop: 4, lineHeight: 12 },
  transferDivider: { height: 1, backgroundColor: '#E7E7E7', marginVertical: 10 },
  recentTransferHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllText: { color: '#6A1B9A', fontSize: 13, fontWeight: '600' },
  recipientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  recipientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0E5F4', borderWidth: 1, borderColor: '#CBAFD5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  recipientAvatarText: { color: '#6A1B9A', fontWeight: '700', fontSize: 13 },
  recipientName: { color: '#333', fontSize: 14, fontWeight: '600' },
  recipientBank: { color: '#777', fontSize: 11, marginTop: 4 },
  payeeCard: { backgroundColor: '#FFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9E1ED', padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  largeRecipientAvatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#F0E5F4', borderWidth: 1, borderColor: '#CBAFD5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  largeRecipientAvatarText: { color: '#6A1B9A', fontSize: 21, fontWeight: '700' },
  payeeFullName: { color: '#29212E', fontSize: 21, fontWeight: '700' },
  payeeBank: { color: '#5F5365', fontSize: 13, marginTop: 8 },
  payeeAccount: { color: '#777', fontSize: 12, marginTop: 5, letterSpacing: 0.5 },
  limitRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  limitLabel: { color: '#777', fontSize: 12 },
  limitValue: { color: '#4A148C', fontSize: 13, fontWeight: '700' },
  transferSecurityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F4FA', borderRadius: 10, padding: 13, marginTop: 16, marginBottom: 22 },
  transferSecurityText: { flex: 1, color: '#5E4A66', fontSize: 11, marginLeft: 8 },
  primaryPayButton: { backgroundColor: '#6A1B9A', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: '#4A148C', shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  primaryPayText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  disabledButton: { backgroundColor: '#D8D2DB', shadowOpacity: 0, elevation: 0 },
  miniPayeeHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 13, borderWidth: 1, borderColor: '#E9E1ED', marginBottom: 20 },
  transferModePill: { flexDirection: 'row', backgroundColor: '#EFEAF2', borderRadius: 26, padding: 4, marginBottom: 25 },
  transferModeActive: { flex: 1, textAlign: 'center', backgroundColor: '#E0D3E6', color: '#4A148C', borderRadius: 22, paddingVertical: 11, fontWeight: '700', fontSize: 13 },
  transferModeInactive: { flex: 1, textAlign: 'center', color: '#8D8491', paddingVertical: 11, fontSize: 13 },
  transferSectionTitle: { color: '#29212E', fontSize: 18, fontWeight: '700', marginBottom: 13 },
  inputCard: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E7E1E9', padding: 15, marginBottom: 13 },
  fieldLabel: { color: '#777', fontSize: 11, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#DDD', paddingBottom: 5 },
  rupeePrefix: { color: '#4A148C', fontSize: 24, fontWeight: '600', marginRight: 6 },
  amountInput: { flex: 1, color: '#333', fontSize: 22, fontWeight: '600', paddingVertical: 3 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: { borderWidth: 1, borderColor: '#D8CEDC', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#FFF' },
  modeChipActive: { backgroundColor: '#E8DDF0', borderColor: '#B79BC4' },
  modeChipText: { color: '#777', fontSize: 12, fontWeight: '600' },
  modeChipTextActive: { color: '#5B2676' },
  fieldHint: { color: '#999', fontSize: 10, marginTop: 8 },
  textField: { color: '#333', fontSize: 15, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#DDD' },
  fromAccountText: { color: '#333', fontSize: 15, fontWeight: '600' },
  fromAccountSub: { color: '#777', fontSize: 11, marginTop: 4 },
  reviewAmountCard: { backgroundColor: '#6A1B9A', borderRadius: 17, padding: 22, alignItems: 'center', marginBottom: 22 },
  reviewAmount: { color: '#FFF', fontSize: 30, fontWeight: '700' },
  reviewPurpose: { color: '#F4EAF7', fontSize: 13, marginTop: 7 },
  reviewMode: { color: '#E8D5ED', fontSize: 10, marginTop: 4 },
  reviewSectionTitle: { color: '#333', fontSize: 14, fontWeight: '700', marginBottom: 9, marginTop: 4 },
  reviewPartyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E8E1EA', padding: 13, marginBottom: 18 },
  accountIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6A1B9A', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  backButton: { width: '47%', borderWidth: 1, borderColor: '#6A1B9A', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: '#6A1B9A', fontSize: 15, fontWeight: '700' },
  confirmButton: { width: '47%', backgroundColor: '#6A1B9A', borderRadius: 26, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  mpinTransferContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  mpinShield: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#F1E7F4', justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  mpinTitle: { color: '#2E2631', fontSize: 21, fontWeight: '700' },
  mpinSubtitle: { color: '#777', fontSize: 12, textAlign: 'center', marginTop: 7, marginBottom: 25 },
  transferPinDisplay: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 7 },
  transferPinBox: { width: 43, height: 48, borderWidth: 1, borderColor: '#BA68C8', borderRadius: 7, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  demoCredentialNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5EFF8', borderRadius: 10, padding: 11, marginTop: 20, marginBottom: 22 },
  demoCredentialText: { color: '#5E4A66', fontSize: 11, marginLeft: 7 },
  progressScreen: { flex: 1, backgroundColor: '#7B1FA2' },
  progressInner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  progressTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 18 },
  progressSubtitle: { color: '#F0DDF5', fontSize: 13, marginTop: 5 },
  progressTimeline: { width: '100%', marginTop: 60 },
  progressTimelineRow: { flexDirection: 'row', alignItems: 'center' },
  progressDotActive: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#7ED321', alignItems: 'center', justifyContent: 'center' },
  progressDotPending: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#E8C9F0', marginHorizontal: 6 },
  progressStepActive: { color: '#FFF', fontSize: 13, fontWeight: '700', marginLeft: 10 },
  progressStepPending: { color: '#E8C9F0', fontSize: 13, marginLeft: 13 },
  progressLine: { width: 2, height: 28, backgroundColor: '#C894D3', marginLeft: 11, marginVertical: 2 },
  successTop: { backgroundColor: '#6A1B9A', paddingTop: 50, paddingBottom: 32, alignItems: 'center' },
  successCheck: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  successTitle: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  successAmount: { color: '#FFF', fontSize: 32, fontWeight: '800', marginTop: 12 },
  successPurpose: { color: '#F2FFE9', fontSize: 12, marginTop: 4 },
  successScroll: { padding: 20, paddingBottom: 40 },
  successCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 17, borderWidth: 1, borderColor: '#E7E7E7' },
  successRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  successLabel: { color: '#888', fontSize: 11, width: 82 },
  successValueBlock: { flex: 1, alignItems: 'flex-end' },
  successValue: { color: '#333', fontSize: 13, fontWeight: '600', textAlign: 'right' },
  successSubValue: { color: '#777', fontSize: 10, textAlign: 'right', marginTop: 3 },
  successStatus: { color: '#2E8B12', fontSize: 13, fontWeight: '700', textAlign: 'right' },
  successSeparator: { height: 1, backgroundColor: '#EFEFEF', marginVertical: 14 },
});
