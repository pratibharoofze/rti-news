import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import WithdrawStyles from '../styles/WithdrawStyles';
import { UserStore } from '../store/UserStore';

const PAGE_SIZE = 10;

const initialForm = {
  amount:         '',
  payment_mode:   'bank',
  bank_name:      '',
  account_number: '',
  ifsc:           '',
  upi_id:         '',
  transferFull:   false,
};

const IFSC_REGEX    = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_REGEX = /^\d{9,18}$/;

function validateForm(form) {
  const errors = {};
  if (!form.amount.trim()) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(form.amount) || Number(form.amount) <= 0) {
    errors.amount = 'Enter a valid amount greater than 0.';
  }
  if (form.payment_mode === 'bank') {
    if (!form.bank_name.trim()) {
      errors.bank_name = 'Bank name is required.';
    } else if (form.bank_name.trim().length < 3) {
      errors.bank_name = 'Enter a valid bank name (min 3 chars).';
    }
    if (!form.account_number.trim()) {
      errors.account_number = 'Account number is required.';
    } else if (!ACCOUNT_REGEX.test(form.account_number.trim())) {
      errors.account_number = 'Account number must be 9–18 digits only.';
    }
    if (!form.ifsc.trim()) {
      errors.ifsc = 'IFSC code is required.';
    } else if (!IFSC_REGEX.test(form.ifsc.trim().toUpperCase())) {
      errors.ifsc = 'Invalid IFSC (e.g. SBIN0001234).';
    }
  }
  if (form.payment_mode === 'upi') {
    if (!form.upi_id.trim()) {
      errors.upi_id = 'UPI ID is required.';
    } else if (!form.upi_id.includes('@')) {
      errors.upi_id = 'Enter a valid UPI ID (e.g. name@upi).';
    }
  }
  return errors;
}

export default function WithdrawScreen({ navigation }) {
  const { showToast } = useToast();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm]     = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [withdrawData, setWithdrawData] = useState({
    currentUser:       null,
    available_balance: 0,
    requests:          [],
  });

  const moduleName = 'Withdraw';

  const loadWithdraw = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getWithdrawSummary();
    setLoading(false);
    if (!data) {
      navigation.replace('Login');
      return;
    }
    setWithdrawData(data);
    setCurrentPage(1);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadWithdraw();
    }, [loadWithdraw])
  );

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleTransferFull = () => {
    const newVal = !form.transferFull;
    setForm((prev) => ({
      ...prev,
      transferFull: newVal,
      amount: newVal ? String(withdrawData.available_balance) : '',
    }));
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    const payload = {
      amount:       form.amount,
      payment_mode: form.payment_mode,
      ...(form.payment_mode === 'bank'
        ? {
            bank_name:      form.bank_name.trim(),
            account_number: form.account_number.trim(),
            ifsc:           form.ifsc.trim().toUpperCase(),
          }
        : { upi_id: form.upi_id.trim() }),
    };
    const result = await UserStore.createWithdrawRequest(payload);
    setSubmitting(false);
    if (!result.ok) {
      showToast(result.message, 'error');
      return;
    }
    setForm(initialForm);
    setErrors({});
    setSuccessMessage('Withdrawal request submitted successfully.');
    setTimeout(() => setSuccessMessage(''), 3000);
    loadWithdraw();
  };

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return withdrawData.requests;
    const q = searchQuery.toLowerCase();
    return withdrawData.requests.filter(
      (r) =>
        r.amount?.toString().includes(q) ||
        r.payment_mode?.toLowerCase().includes(q) ||
        r.bank_name?.toLowerCase().includes(q) ||
        r.account_number?.toString().includes(q) ||
        r.ifsc?.toLowerCase().includes(q) ||
        r.upi_id?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.date?.toLowerCase().includes(q)
    );
  }, [withdrawData.requests, searchQuery]);

  const totalRecords  = filteredRequests.length;
  const totalPages    = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const pagedRequests = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return WithdrawStyles.statusApproved;
      case 'rejected': return WithdrawStyles.statusRejected;
      default:         return WithdrawStyles.statusPending;
    }
  };
  const statusTextStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return WithdrawStyles.statusTextApproved;
      case 'rejected': return WithdrawStyles.statusTextRejected;
      default:         return WithdrawStyles.statusTextPending;
    }
  };

  // Mask account number like image: XXXXXXXXXX8745
  const maskAccount = (acc) => {
    if (!acc || acc.length <= 4) return acc;
    return 'X'.repeat(acc.length - 4) + acc.slice(-4);
  };

  return (
    <View style={WithdrawStyles.root}>

      {/* ── Back Arrow Button ── */}
      <TouchableOpacity
        onPress={() => navigation.navigate('QuickMenu')}
        style={WithdrawStyles.backBtn}
      >
        <Feather name="arrow-left" size={20} color="#e8603c" />
        <Text style={WithdrawStyles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={WithdrawStyles.scrollView}
        contentContainerStyle={WithdrawStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero ── */}
        <View style={WithdrawStyles.heroCard}>
          <Text style={WithdrawStyles.heroEyebrow}>Earnings</Text>
          <Text style={WithdrawStyles.heroTitle}>Withdraw Earnings</Text>
        </View>

        {/* ── Available Balance ── */}
        <View style={WithdrawStyles.balanceCard}>
          <Feather name="credit-card" size={22} color="#e8603c" />
          <View style={WithdrawStyles.balanceInfo}>
            <Text style={WithdrawStyles.balanceLabel}>Available Balance</Text>
            <Text style={WithdrawStyles.balanceValue}>
              ₹{withdrawData.available_balance}
            </Text>
          </View>
        </View>

        {/* Success Message */}
        {successMessage ? (
          <Text style={WithdrawStyles.successText}>{successMessage}</Text>
        ) : null}

        {/* ── WITHDRAW EARNING Card (image style) ── */}
        <View style={WithdrawStyles.card}>
          <Text style={WithdrawStyles.sectionTitle}>WITHDRAW EARNING</Text>

          {/* Transfer Mode + Account (image top meta row) */}
          <View style={WithdrawStyles.withdrawMetaRow}>
            <View style={WithdrawStyles.withdrawMetaItem}>
              <Text style={WithdrawStyles.withdrawMetaLabel}>Transfer mode</Text>
              <Text style={WithdrawStyles.withdrawMetaValue}>
                {form.payment_mode === 'upi' ? 'UPI' : 'Bank'}
              </Text>
            </View>
            {form.payment_mode === 'bank' && form.account_number ? (
              <View style={WithdrawStyles.withdrawMetaItem}>
                <Text style={WithdrawStyles.withdrawMetaLabel}>Acc number</Text>
                <Text style={WithdrawStyles.withdrawMetaValue}>
                  {maskAccount(form.account_number)}
                </Text>
              </View>
            ) : form.payment_mode === 'upi' && form.upi_id ? (
              <View style={WithdrawStyles.withdrawMetaItem}>
                <Text style={WithdrawStyles.withdrawMetaLabel}>UPI ID</Text>
                <Text style={WithdrawStyles.withdrawMetaValue}>{form.upi_id}</Text>
              </View>
            ) : null}
          </View>

          {/* Amount Input */}
          <View style={WithdrawStyles.inputGroup}>
            <Text style={WithdrawStyles.inputLabel}>Enter amount</Text>
            <TextInput
              style={[WithdrawStyles.input, errors.amount && WithdrawStyles.inputError]}
              value={form.amount}
              onChangeText={(v) => handleChange('amount', v)}
              placeholder="₹0"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
            {errors.amount ? (
              <Text style={WithdrawStyles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          {/* Transfer full amount checkbox */}
          <TouchableOpacity style={WithdrawStyles.checkRow} onPress={handleTransferFull}>
            <View style={[WithdrawStyles.checkBox, form.transferFull && WithdrawStyles.checkBoxActive]}>
              {form.transferFull && <Feather name="check" size={11} color="#fff" />}
            </View>
            <Text style={WithdrawStyles.checkLabel}>Transfer full amount</Text>
          </TouchableOpacity>

          {/* Payment Mode Toggle */}
          <View style={WithdrawStyles.inputGroup}>
            <Text style={WithdrawStyles.inputLabel}>Payment Mode</Text>
            <View style={WithdrawStyles.modeRow}>
              <TouchableOpacity
                style={[WithdrawStyles.modeBtn, form.payment_mode === 'bank' && WithdrawStyles.modeBtnActive]}
                onPress={() => { handleChange('payment_mode', 'bank'); setErrors({}); }}
              >
                <Feather name="home" size={14} color={form.payment_mode === 'bank' ? '#fff' : '#888'} />
                <Text style={[WithdrawStyles.modeBtnText, form.payment_mode === 'bank' && WithdrawStyles.modeBtnTextActive]}>
                  Bank Transfer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[WithdrawStyles.modeBtn, form.payment_mode === 'upi' && WithdrawStyles.modeBtnActive]}
                onPress={() => { handleChange('payment_mode', 'upi'); setErrors({}); }}
              >
                <Feather name="smartphone" size={14} color={form.payment_mode === 'upi' ? '#fff' : '#888'} />
                <Text style={[WithdrawStyles.modeBtnText, form.payment_mode === 'upi' && WithdrawStyles.modeBtnTextActive]}>
                  UPI
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {form.payment_mode === 'bank' && (
            <>
              <View style={WithdrawStyles.inputGroup}>
                <Text style={WithdrawStyles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={[WithdrawStyles.input, errors.bank_name && WithdrawStyles.inputError]}
                  value={form.bank_name}
                  onChangeText={(v) => handleChange('bank_name', v)}
                  placeholder="e.g. State Bank of India"
                  placeholderTextColor="#ccc"
                />
                {errors.bank_name ? (
                  <Text style={WithdrawStyles.errorText}>{errors.bank_name}</Text>
                ) : null}
              </View>

              <View style={WithdrawStyles.inputGroup}>
                <Text style={WithdrawStyles.inputLabel}>Account Number</Text>
                <TextInput
                  style={[WithdrawStyles.input, errors.account_number && WithdrawStyles.inputError]}
                  value={form.account_number}
                  onChangeText={(v) => handleChange('account_number', v.replace(/\D/g, ''))}
                  placeholder="9–18 digit account number"
                  placeholderTextColor="#ccc"
                  keyboardType="numeric"
                  maxLength={18}
                />
                {errors.account_number ? (
                  <Text style={WithdrawStyles.errorText}>{errors.account_number}</Text>
                ) : null}
              </View>

              <View style={WithdrawStyles.inputGroup}>
                <Text style={WithdrawStyles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={[WithdrawStyles.input, errors.ifsc && WithdrawStyles.inputError]}
                  value={form.ifsc}
                  onChangeText={(v) => handleChange('ifsc', v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="e.g. SBIN0001234"
                  placeholderTextColor="#ccc"
                  autoCapitalize="characters"
                  maxLength={11}
                />
                {errors.ifsc ? (
                  <Text style={WithdrawStyles.errorText}>{errors.ifsc}</Text>
                ) : (
                  <Text style={WithdrawStyles.hintText}>
                    Format: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)
                  </Text>
                )}
              </View>
            </>
          )}

          {form.payment_mode === 'upi' && (
            <View style={WithdrawStyles.inputGroup}>
              <Text style={WithdrawStyles.inputLabel}>UPI ID</Text>
              <TextInput
                style={[WithdrawStyles.input, errors.upi_id && WithdrawStyles.inputError]}
                value={form.upi_id}
                onChangeText={(v) => handleChange('upi_id', v)}
                placeholder="e.g. name@upi"
                placeholderTextColor="#ccc"
                autoCapitalize="none"
              />
              {errors.upi_id ? (
                <Text style={WithdrawStyles.errorText}>{errors.upi_id}</Text>
              ) : null}
            </View>
          )}

          <TouchableOpacity
            style={[WithdrawStyles.submitButton, submitting && WithdrawStyles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Feather name="arrow-up-circle" size={17} color="#fff" />
            <Text style={WithdrawStyles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Withdrawal Status DataTable ── */}
        <View style={WithdrawStyles.card}>
          <View style={WithdrawStyles.tableTopRow}>
            <Text style={WithdrawStyles.sectionTitle}>Withdrawal Status</Text>
            <Text style={WithdrawStyles.recordCount}>
              {totalRecords} record{totalRecords !== 1 ? 's' : ''}
            </Text>
          </View>

          {loading ? (
            <Text style={WithdrawStyles.loadingText}>Loading withdrawal data...</Text>
          ) : withdrawData.requests.length === 0 ? (
            <Text style={WithdrawStyles.emptyText}>No withdrawal requests found.</Text>
          ) : (
            <>
              <View style={WithdrawStyles.searchWrap}>
                <Feather name="search" size={15} color="#ccc" />
                <TextInput
                  style={WithdrawStyles.searchInput}
                  value={searchQuery}
                  onChangeText={(v) => { setSearchQuery(v); setCurrentPage(1); }}
                  placeholder="Search by amount, bank, status…"
                  placeholderTextColor="#ccc"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQuery(''); setCurrentPage(1); }}>
                    <Feather name="x" size={15} color="#ccc" />
                  </TouchableOpacity>
                )}
              </View>

              {totalRecords === 0 ? (
                <Text style={WithdrawStyles.emptyText}>No records match your search.</Text>
              ) : (
                <>
                  {pagedRequests.map((item, index) => (
                    <View
                      key={item.id ?? index}
                      style={[
                        WithdrawStyles.requestCard,
                        index % 2 === 0 && WithdrawStyles.requestCardEven,
                        index === pagedRequests.length - 1 && WithdrawStyles.requestCardLast,
                      ]}
                    >
                      <View style={WithdrawStyles.requestTopRow}>
                        <Text style={WithdrawStyles.requestAmount}>₹{item.amount}</Text>
                        <View style={[WithdrawStyles.statusBadge, statusStyle(item.status)]}>
                          <Text style={[WithdrawStyles.statusText, statusTextStyle(item.status)]}>
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <View style={WithdrawStyles.requestMetaRow}>
                        <Feather name="credit-card" size={12} color="#ccc" />
                        <Text style={WithdrawStyles.requestMeta}>
                          Mode:{' '}
                          <Text style={WithdrawStyles.requestMetaBold}>
                            {item.payment_mode === 'upi' ? 'UPI' : 'Bank Transfer'}
                          </Text>
                        </Text>
                      </View>

                      {item.payment_mode === 'bank' ? (
                        <>
                          <View style={WithdrawStyles.requestMetaRow}>
                            <Feather name="home" size={12} color="#ccc" />
                            <Text style={WithdrawStyles.requestMeta}>
                              Bank: <Text style={WithdrawStyles.requestMetaBold}>{item.bank_name}</Text>
                            </Text>
                          </View>
                          <View style={WithdrawStyles.requestMetaRow}>
                            <Feather name="hash" size={12} color="#ccc" />
                            <Text style={WithdrawStyles.requestMeta}>
                              Account:{' '}
                              <Text style={WithdrawStyles.requestMetaBold}>
                                {maskAccount(item.account_number)}
                              </Text>
                            </Text>
                          </View>
                          <View style={WithdrawStyles.requestMetaRow}>
                            <Feather name="tag" size={12} color="#ccc" />
                            <Text style={WithdrawStyles.requestMeta}>
                              IFSC: <Text style={WithdrawStyles.requestMetaBold}>{item.ifsc}</Text>
                            </Text>
                          </View>
                        </>
                      ) : (
                        <View style={WithdrawStyles.requestMetaRow}>
                          <Feather name="smartphone" size={12} color="#ccc" />
                          <Text style={WithdrawStyles.requestMeta}>
                            UPI ID: <Text style={WithdrawStyles.requestMetaBold}>{item.upi_id}</Text>
                          </Text>
                        </View>
                      )}

                      <Text style={WithdrawStyles.requestDate}>
                        Requested on: {item.date}
                      </Text>
                    </View>
                  ))}

                  <View style={WithdrawStyles.paginationWrap}>
                    <Text style={WithdrawStyles.paginationInfo}>
                      Showing{' '}
                      {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalRecords)}–
                      {Math.min(currentPage * PAGE_SIZE, totalRecords)} of {totalRecords}
                    </Text>
                    <View style={WithdrawStyles.paginationControls}>
                      <TouchableOpacity
                        style={[WithdrawStyles.pageBtn, currentPage === 1 && WithdrawStyles.pageBtnDisabled]}
                        onPress={() => goToPage(1)} disabled={currentPage === 1}
                      >
                        <Feather name="chevrons-left" size={13} color={currentPage === 1 ? '#ddd' : '#666'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[WithdrawStyles.pageBtn, currentPage === 1 && WithdrawStyles.pageBtnDisabled]}
                        onPress={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                      >
                        <Feather name="chevron-left" size={13} color={currentPage === 1 ? '#ddd' : '#666'} />
                      </TouchableOpacity>
                      {pageNumbers.map((page) => (
                        <TouchableOpacity
                          key={page}
                          style={[WithdrawStyles.pageBtn, page === currentPage && WithdrawStyles.pageBtnActive]}
                          onPress={() => goToPage(page)}
                        >
                          <Text style={[WithdrawStyles.pageBtnText, page === currentPage && WithdrawStyles.pageBtnTextActive]}>
                            {page}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[WithdrawStyles.pageBtn, currentPage === totalPages && WithdrawStyles.pageBtnDisabled]}
                        onPress={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                      >
                        <Feather name="chevron-right" size={13} color={currentPage === totalPages ? '#ddd' : '#666'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[WithdrawStyles.pageBtn, currentPage === totalPages && WithdrawStyles.pageBtnDisabled]}
                        onPress={() => goToPage(totalPages)} disabled={currentPage === totalPages}
                      >
                        <Feather name="chevrons-right" size={13} color={currentPage === totalPages ? '#ddd' : '#666'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />
    </View>
  );
}