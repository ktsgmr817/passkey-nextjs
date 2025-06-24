'use client';

import { useState, useEffect } from 'react';
import { registerPasskey, loginWithPasskey, logout, getSession } from '@/lib/webauthn';

interface User {
  username: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await getSession();
      setIsLoggedIn(session.isLoggedIn);
      setUser(session.user);
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const handleRegister = async () => {
    if (!userName.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await registerPasskey(userName);
      setMessage('パスキーの登録が完了しました！');
      setUserName('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'パスキーの登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await loginWithPasskey(userName);
      if (result.verified) {
        setIsLoggedIn(true);
        setUser(result.user);
        setMessage('ログインしました！');
        setUserName('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setIsLoggedIn(false);
      setUser(null);
      setMessage('ログアウトしました');
    } catch (error) {
      setError('ログアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔐 Passkey Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            パスキーを使用した安全な認証
          </p>
        </div>

        {isLoggedIn ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                こんにちは、{user?.username}さん！
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                パスキーでログイン中です
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="ユーザー名を入力"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRegister}
                disabled={loading || !userName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? '登録中...' : '🔑 パスキーを登録'}
              </button>

              <button
                onClick={handleLogin}
                disabled={loading || !userName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'ログイン中...' : '🚀 パスキーでログイン'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
            {message}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>パスキーは生体認証やPINを使用した</p>
          <p>安全で便利な認証方法です</p>
        </div>
      </div>
    </div>
  );
}
