// ClientAPI/AuthApi.js
// ─────────────────────────────────────────────────────────
// RTI News — Auth API Client
// Base URL: https://rtiapi.roofze.in/api
// ─────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'https://rtiapi.roofze.in/api';
const REQUEST_TIMEOUT_MS = 30000;

const redactHeaders = (headers = {}) => {
  const safe = { ...headers };
  if (safe.Authorization) safe.Authorization = 'Bearer <redacted>';
  return safe;
};

const serializeError = (err) => ({
  name: err?.name,
  message: err?.message,
  stack: err?.stack,
  cause: err?.cause ? String(err.cause) : undefined,
});

const summarizePayload = (payload) => {
  if (!payload) return null;
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    return '[FormData payload]';
  }
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload);
  } catch {
    return '[Unserializable payload]';
  }
};

const readResponseBody = async (response, context) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (err) {
    const rawBody = text.slice(0, 1000);
    console.error('[AuthAPI] Response JSON parse failed:', {
      ...context,
      status: response.status,
      contentType: response.headers?.get?.('content-type'),
      rawBody,
      error: serializeError(err),
    });
    return {
      message: rawBody || `Unexpected non-JSON response (${response.status}).`,
      rawBody,
      parseError: serializeError(err),
    };
  }
};

const fetchWithDebug = async (endpoint, options = {}, debugBody = null) => {
  const url = `${BASE_URL}${endpoint}`;
  const startedAt = Date.now();
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  const context = {
    url,
    method: options.method || 'GET',
    platform: Platform.OS,
    timeoutMs: REQUEST_TIMEOUT_MS,
  };

  console.log('[AuthAPI] Request:', {
    ...context,
    headers: redactHeaders(options.headers),
    body: summarizePayload(debugBody),
  });

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller?.signal,
    });
    const data = await readResponseBody(response, context);
    const result = {
      status: response.status,
      ok: response.ok,
      contentType: response.headers?.get?.('content-type'),
      durationMs: Date.now() - startedAt,
      data,
    };

    console.log('[AuthAPI] Response:', {
      ...context,
      status: result.status,
      ok: result.ok,
      contentType: result.contentType,
      durationMs: result.durationMs,
      body: result.data,
    });

    return result;
  } catch (err) {
    const isTimeout = err?.name === 'AbortError';
    console.error('[AuthAPI] Fetch failed:', {
      ...context,
      durationMs: Date.now() - startedAt,
      isTimeout,
      error: serializeError(err),
    });
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

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

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetchWithDebug(endpoint, {
    method: 'POST',
    headers,
    body: formData,
  }, formData);

  return { status: response.status, data: response.data };
};

// ─── Helper: JSON request ─────────────────────────────────
const postJSON = async (endpoint, body = {}, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetchWithDebug(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }, body);

  return { status: response.status, data: response.data };
};

const getJSON = async (endpoint, token = null) => {
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetchWithDebug(endpoint, {
    method: 'GET',
    headers,
  });

  return { status: response.status, data: response.data };
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
      const { status, data } = await postJSON('/register', {
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
      const { status, data } = await postJSON('/login', {
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
  updateState: async ({ state, district, taluka }, tokenOverride = null) => {
    try {
      const token = tokenOverride || await getAuthToken();
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
  } catch (_err) {
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
  } catch (_err) {
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
  } catch (_err) {
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
  } catch (_err) {
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

  // ── NEWS API ────────────────────────────────────────────

  /**
   * Create News
   * POST /news
   * Body (form-data): tittle, sub_tittle, description, report_type, media_type, media (file)
   * Headers: Authorization: Bearer {token}
   * media_type: 0 = None, 1 = Image, 2 = Video, 3 = File  (confirm with backend if unsure)
   */
  createNews: async ({
    title,
    subTitle = '',
    description,
    reportType,
    mediaType = 0,
    mediaUri = null,
    mediaName = 'media',
    mediaMime = '',
  }) => {
    try {
      console.log("Received mediaUri:", mediaUri);
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const formData = new FormData();
      formData.append('tittle', title || '');
      formData.append('sub_tittle', subTitle || '');
      formData.append('description', description || '');
      formData.append('report_type', reportType || '');
      formData.append('media_type', String(mediaType));

      if (mediaUri) {
        if (Platform.OS === 'web') {
          const fileRes = await fetch(mediaUri);
          const blob = await fileRes.blob();
          formData.append('media', blob, mediaName);
        } else {
          formData.append('media', {
            uri: mediaUri,
            type: mediaMime || 'application/octet-stream',
            name: mediaName,
          });
        }
      }

      const res = await fetch(`${BASE_URL}/news`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Content-Type intentionally omit — browser/RN sets multipart boundary
        },
        body: formData,
      });

      const json = await res.json();

      if (res.status === 200 || res.status === 201) {
        return { ok: true, data: json, news: json?.news || json?.data || json };
      }
      if (res.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (res.status === 422) {
        const errors = json?.errors || {};
        const firstError = Object.values(errors).flat()[0] || json?.message || 'Validation failed.';
        return { ok: false, message: firstError, errors };
      }
      return { ok: false, message: json?.message || `Server error (${res.status}).` };
    } catch (err) {
      console.error('[AuthAPI.createNews] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Like / Unlike a news item
   * POST /likes
   * Body (form-data): user_id, news_id
   * Headers: Authorization: Bearer {token}
   * Response: { message, like: { like: 1|0, is_deleted: 0|1, ... } }
   */
  likeNews: async ({ userId, newsId }) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const { status, data } = await postFormData('/likes', {
        user_id: String(userId),
        news_id: String(newsId),
      }, token);

      if (status === 200 || status === 201) {
        // like: 1 = liked, is_deleted: 1 = unliked (toggle response)
        const liked = data?.like?.like === 1 && data?.like?.is_deleted !== 1;
        return { ok: true, liked, data };
      }
      if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.likeNews] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Get News List (Index)
   * GET /news
   * Headers: Authorization: Bearer {token}
   */
  getNewsList: async (params = {}) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      // Agar query params bhejne ho (page, filter etc) to yaha build karo
      const query = new URLSearchParams(params).toString();
      const endpoint = query ? `/news?${query}` : '/news';

      const { status, data } = await getJSON(endpoint, token);

      if (status === 200 || status === 201) {
        return { ok: true, news: data?.data || data?.news || data };
      }
      if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.getNewsList] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Get single News by ID (Show)
   * GET /news/{id}
   * Headers: Authorization: Bearer {token}
   */
  getNewsById: async (newsId) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const { status, data } = await getJSON(`/news/${newsId}`, token);

      if (status === 200 || status === 201) {
        return { ok: true, news: data?.data || data?.news || data };
      }
      if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (status === 404) return { ok: false, message: 'News not found.' };
      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.getNewsById] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Update News
   * POST /news/{id}  (Laravel mein _method: PUT bhejna form-data ke saath)
   * Body (form-data): tittle, sub_tittle, description, report_type, media_type, media (file, optional)
   * Headers: Authorization: Bearer {token}
   */
  updateNews: async (newsId, {
    title,
    subTitle = '',
    description,
    reportType,
    mediaType = 0,
    mediaUri = null,
    mediaName = 'media',
    mediaMime = '',
  }) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const formData = new FormData();
      formData.append('_method', 'PUT'); // Laravel form-data + PUT trick
      formData.append('tittle', title || '');
      formData.append('sub_tittle', subTitle || '');
      formData.append('description', description || '');
      formData.append('report_type', reportType || '');
      formData.append('media_type', String(mediaType));

      if (mediaUri) {
        if (Platform.OS === 'web') {
          const fileRes = await fetch(mediaUri);
          const blob = await fileRes.blob();
          formData.append('media', blob, mediaName);
        } else {
          formData.append('media', {
            uri: mediaUri,
            type: mediaMime || 'application/octet-stream',
            name: mediaName,
          });
        }
      }

      const res = await fetch(`${BASE_URL}/news/${newsId}`, {
        method: 'POST', // _method override PUT ke liye
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

      if (res.status === 200 || res.status === 201) {
        return { ok: true, data: json, news: json?.news || json?.data || json };
      }
      if (res.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (res.status === 404) return { ok: false, message: 'News not found.' };
      if (res.status === 422) {
        const errors = json?.errors || {};
        const firstError = Object.values(errors).flat()[0] || json?.message || 'Validation failed.';
        return { ok: false, message: firstError, errors };
      }
      return { ok: false, message: json?.message || `Server error (${res.status}).` };
    } catch (err) {
      console.error('[AuthAPI.updateNews] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Update News Status
   * POST /news/{id}/status  (ya PUT, backend route confirm kar lena)
   * Body (form-data): status
   * Headers: Authorization: Bearer {token}
   */
  updateNewsStatus: async (newsId, status) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const { status: resStatus, data } = await postFormData(`/news/${newsId}/status`, {
        status: status,
      }, token);

      if (resStatus === 200 || resStatus === 201) {
        return { ok: true, message: data?.message || 'Status updated successfully!', data };
      }
      if (resStatus === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (resStatus === 404) return { ok: false, message: 'News not found.' };
      if (resStatus === 422) {
        const errors = data?.errors || {};
        const firstError = Object.values(errors).flat()[0] || data?.message || 'Validation failed.';
        return { ok: false, message: firstError, errors };
      }
      return { ok: false, message: data?.message || `Server error (${resStatus}).` };
    } catch (err) {
      console.error('[AuthAPI.updateNewsStatus] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Delete News (Destroy)
   * DELETE /news/{id}
   * Headers: Authorization: Bearer {token}
   */
  deleteNews: async (newsId) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const response = await fetch(`${BASE_URL}/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        return { ok: true, message: json?.message || 'News deleted successfully!', data: json };
      }
      if (response.status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      if (response.status === 404) return { ok: false, message: 'News not found.' };
      return { ok: false, message: json?.message || `Server error (${response.status}).` };
    } catch (err) {
      console.error('[AuthAPI.deleteNews] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },

  /**
   * Get news counts (likes, comments, shares, views)
   * POST /counts
   * Body (form-data): news_id
   * Headers: Authorization: Bearer {token}
   */
  getNewsCounts: async ({ newsId }) => {
    try {
      const token = await getAuthToken();
      if (!token) return { ok: false, isAuth: true, message: 'Not logged in.' };

      const { status, data } = await postFormData('/counts', {
        news_id: String(newsId),
      }, token);

      if (status === 200 || status === 201) {
        return { ok: true, counts: data?.counts || data?.data || data };
      }
      if (status === 401) return { ok: false, isAuth: true, message: 'Session expired.' };
      return { ok: false, message: data?.message || `Server error (${status}).` };
    } catch (err) {
      console.error('[AuthAPI.getNewsCounts] Error:', err);
      return { ok: false, isNetwork: true, message: 'Network error.' };
    }
  },
};

export { postFormData, postJSON, getJSON };
