// ClientAPI/AuthApi.js
// ─────────────────────────────────────────────────────────
// RTI News — Auth API Client
// Base URL: https://rtiapi.roofze.in/api
// ─────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; 

const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:8082/api'
  : 'https://rtiapi.roofze.in/api';

const getAuthToken = async () => {
  const asyncToken = await AsyncStorage.getItem('auth_token');
  if (asyncToken) return asyncToken;

  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('auth_token');
  }

  return null;
};

// ─── Helper: FormData request ─────────────────────────────
const postFormData = async (endpoint, fields = {}, token = null) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json = await response.json();
  return { status: response.status, data: json };
};

// ─── Helper: JSON request ─────────────────────────────────
const postJSON = async (endpoint, body = {}, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await response.json();
  return { status: response.status, data: json };
};

const getJSON = async (endpoint, token = null) => {
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('URL:', `${BASE_URL}${endpoint}`);
  console.log('Headers:', headers);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  console.log('Status:', response.status);

  const json = await response.json();
  return { status: response.status, data: json };
};

// ─────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────
export const AuthAPI = {

  /**
   * Register a new user
   * POST /register
   * Body: firstname, middlename, lastname, mobile_no, email, password, confirmed, referral_code
   */
  register: async ({ firstName, middleName = '', lastName, mobile, email, password, referralCode = '' }) => {
    try {
      const { status, data } = await postFormData('/register', {
        firstname:     firstName.trim(),
        middlename:    middleName.trim(),
        lastname:      lastName.trim(),
        mobile_no:     mobile.trim(),
        email:         email.trim().toLowerCase(),
        password:      password,
        confirmed:     password,
        referral_code: referralCode.trim() || '',
      });

      if (status === 200 || status === 201) {
        // Token save karo future requests ke liye
        const token = data?.token || data?.access_token || data?.authorization?.token || null;
if (token) {
  try {
    await AsyncStorage.setItem('auth_token', token);
    // Web fallback
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  } catch {}
}
        return {
          ok:      true,
          data,
          token:   data?.token || data?.access_token || null,
          user:    data?.user  || null,
          message: data?.message || 'Registration successful!',
        };
      }

      if (status === 422) {
        const errors = data?.errors || {};
        const firstError =
          Object.values(errors).flat()[0] ||
          data?.message ||
          'Validation failed. Please check your details.';
        return { ok: false, message: firstError, errors };
      }

      return {
        ok:      false,
        message: data?.message || `Server error (${status}). Please try again.`,
        errors:  data?.errors  || {},
      };

    } catch (err) {
      console.error('[AuthAPI.register] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error. Please check your internet connection.' };
    }
  },

  /**
   * Login user
   * POST /login
   * Body: email, password
   */
  login: async ({ email, password }) => {
    try {
      const { status, data } = await postFormData('/login', {
        email:    email.trim().toLowerCase(),
        password: password,
      });

      if (status === 200 || status === 201) {
        const token = data?.token || data?.access_token || data?.authorization?.token || null;
        console.log('[AuthAPI.login] Response data:', JSON.stringify(data));
        console.log('[AuthAPI.login] Token found:', token);
        if (token) {
          try {
            await AsyncStorage.setItem('auth_token', token);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('auth_token', token);
            }
            console.log('[AuthAPI.login] Token saved successfully');
          } catch (e) {
            console.warn('[AuthAPI.login] Token save failed:', e);
          }
        }
        return {
          ok:      true,
          token:   token,
          user:    data?.user  || null,
          message: data?.message || 'Login successful!',
        };
      }

      return {
        ok:      false,
        message: data?.message || 'Invalid credentials.',
      };
    } catch (err) {
      console.error('[AuthAPI.login] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error. Please check your internet connection.' };
    }
  },

  /**
   * Forgot Password — Step 1: Request OTP
   * POST /forgot-password/request-otp
   * Body: email
   */
  requestForgotOTP: async ({ email }) => {
    try {
      const { status, data } = await postFormData('/forgot-password/request-otp', {
        email: email.trim().toLowerCase(),
      });

      if (status === 200 || status === 201) {
        return { ok: true, message: data?.message || 'OTP sent successfully!', data };
      }

      if (status === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Invalid email address.';
        return { ok: false, message: firstError, errors };
      }

      return { ok: false, message: data?.message || `Server error (${status}). Please try again.` };
    } catch (err) {
      console.error('[AuthAPI.requestForgotOTP] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error. Please check your internet connection.' };
    }
  },

  /**
   * Forgot Password — Step 2: Verify OTP
   * POST /forgot-password/verify-otp
   * Body: email, otp
   */
  verifyForgotOTP: async ({ email, otp }) => {
    try {
      const { status, data } = await postFormData('/forgot-password/verify-otp', {
        email: email.trim().toLowerCase(),
        otp:   String(otp).trim(),
      });

      if (status === 200 || status === 201) {
        return {
          ok:         true,
          message:    data?.message || 'OTP verified successfully!',
          resetToken: data?.reset_token || data?.token || null,
          data,
        };
      }

      if (status === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Invalid or expired OTP.';
        return { ok: false, message: firstError, errors };
      }

      return { ok: false, message: data?.message || 'Invalid or expired OTP. Please try again.' };
    } catch (err) {
      console.error('[AuthAPI.verifyForgotOTP] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error. Please check your internet connection.' };
    }
  },

  /**
   * Forgot Password — Step 3: Reset Password
   * POST /forgot-password/reset-password
   * Body: email, otp, password
   */
  resetPassword: async ({ email, otp, password }) => {
    try {
      const { status, data } = await postFormData('/forgot-password/reset-password', {
        email:    email.trim().toLowerCase(),
        otp:      String(otp).trim(),
        password: password,
      });

      if (status === 200 || status === 201) {
        return { ok: true, message: data?.message || 'Password reset successfully!', data };
      }

      if (status === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Reset failed. Please try again.';
        return { ok: false, message: firstError, errors };
      }

      return { ok: false, message: data?.message || `Server error (${status}). Please try again.` };
    } catch (err) {
      console.error('[AuthAPI.resetPassword] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error. Please check your internet connection.' };
    }
  },

  /**
   * Update State / District / Taluka
   * POST /state
   * Headers: Authorization: Bearer {token}
   * Body: state, district, taluka
   */
  updateState: async ({ state, district, taluka }) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        return { ok: false, isAuth: true, message: 'Not logged in.' };
      }

      const { status, data } = await postFormData('/state', {
        state:    state    || '',
        district: district || '',
        taluka:   taluka   || '',
      }, token);

      if (status === 200 || status === 201) {
        return { ok: true, message: data?.message || 'Location updated successfully!', data };
      }

      if (status === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Validation failed.';
        return { ok: false, message: firstError, errors };
      }

      if (status === 401) {
        return { ok: false, isAuth: true, message: 'Session expired. Please login again.' };
      }

      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.updateState] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  // ── PROFILE API ────────────────────────────────────────

/**
 * Get current user profile
 * GET /profile
 */
getProfile: async () => {
  try {
    const token = await getAuthToken();
    if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };
    
    const { status, data } = await getJSON('/profile', token);
    
    if (status === 200 || status === 201) {
      return { ok: true, user: data?.user || data?.data || data };
    }
    if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
    return { ok: false, message: data?.message || 'Unable to fetch profile.' };
  } catch (err) {
    return { ok: false, isNetwork: true, message: 'Network error.' };
  }
},

/**
 * Upload profile image (first time)
 * POST /profile  (form-data: profile_image)
 */
uploadProfileImage: async (imageUri) => {
  try {
    const token = await getAuthToken();
    if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

    const formData = new FormData();

    if (Platform.OS === 'web') {
      // Web: base64 uri ko Blob mein convert karo
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('profile_image', blob, 'profile.jpg');
    } else {
      // Native: file uri directly
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        // Content-Type: multipart/form-data - intentionally omit, browser sets boundary
      },
      body: formData,
    });

    const json = await res.json();
    if (res.status === 200 || res.status === 201) {
      return { ok: true, data: json, imageUrl: json?.profile_image || json?.data?.profile_image || '' };
    }
    if (res.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
    return { ok: false, message: json?.message || 'Upload failed.' };
  } catch (err) {
    return { ok: false, isNetwork: true, message: 'Network error.' };
  }
},

/**
 * Update profile image
 * POST /profile/image  (form-data: profile_image)
 */
updateProfileImage: async (imageUri) => {
  try {
    const token = await getAuthToken();
    if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('profile_image', blob, 'profile.jpg');
    } else {
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    const res = await fetch(`${BASE_URL}/profile/image`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (res.status === 200 || res.status === 201) {
      return { ok: true, data: json, imageUrl: json?.profile_image || json?.data?.profile_image || '' };
    }
    if (res.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
    return { ok: false, message: json?.message || 'Update failed.' };
  } catch (err) {
    return { ok: false, isNetwork: true, message: 'Network error.' };
  }
},

/**
 * Update profile text fields
 * POST /profile  (JSON: name, village, bio, contact_number)
 */
updateProfile: async ({ name, village, bio, contact_number }) => {
  try {
    const token = await getAuthToken();
    if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

    const formData = new FormData();
    formData.append('name', name || '');
    formData.append('village', village || '');
    formData.append('bio', bio || '');
    formData.append('contact_number', contact_number || '');

    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await res.json();
    if (res.status === 200 || res.status === 201) {
      return { ok: true, user: json?.user || json?.data || json };
    }
    if (res.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
    if (res.status === 422) {
      const errors = json?.errors || {};
      const firstError = Object.values(errors).flat()[0] || json?.message || 'Validation failed.';
      return { ok: false, message: firstError, errors };
    }
   return { ok: false, message: json?.message || 'Update failed.' };
  } catch (err) {
    return { ok: false, isNetwork: true, message: 'Network error.' };
  }
},

// ── REFERRAL API ────────────────────────────────────────

  /**
   * Get referral summary for current user
   * GET /referrals (no params needed — backend reads current user from token)
   * Headers: Authorization: Bearer {token}
   */
  getReferrals: async () => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const { status, data } = await getJSON('/referrals', token);

      if (status === 200 || status === 201) {
        return { ok: true, data };
      }
      if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (status === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Validation failed.';
        return { ok: false, message: firstError, errors };
      }
      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.getReferrals] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },


};

export { postFormData, postJSON, getJSON };
