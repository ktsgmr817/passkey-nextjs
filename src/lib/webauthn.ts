import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const registerPasskey = async (userName: string) => {
  try {
    // 登録オプションを取得
    const response = await fetch('/api/auth/register-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get registration options');
    }

    const options = await response.json();

    // パスキー作成
    const attResp = await startRegistration(options);

    // 登録を検証
    const verificationResponse = await fetch('/api/auth/register-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attResp),
    });

    if (!verificationResponse.ok) {
      const error = await verificationResponse.json();
      throw new Error(error.error || 'Registration verification failed');
    }

    const verification = await verificationResponse.json();
    return verification;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginWithPasskey = async (userName: string) => {
  try {
    // ログインオプションを取得
    const response = await fetch('/api/auth/login-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get login options');
    }

    const options = await response.json();

    // パスキー認証
    const asseResp = await startAuthentication(options);

    // ログインを検証
    const verificationResponse = await fetch('/api/auth/login-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asseResp),
    });

    if (!verificationResponse.ok) {
      const error = await verificationResponse.json();
      throw new Error(error.error || 'Login verification failed');
    }

    const verification = await verificationResponse.json();
    return verification;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getSession = async () => {
  try {
    const response = await fetch('/api/auth/session');
    
    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return await response.json();
  } catch (error) {
    console.error('Session error:', error);
    throw error;
  }
};