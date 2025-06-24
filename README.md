# Passkey Authentication with Next.js

パスキー（WebAuthn）を使用した安全で便利な認証システムのデモアプリケーションです。

## 特徴

- 🔐 **パスキー認証**: 生体認証やPINを使用した安全な認証
- 🚀 **Next.js 15**: 最新のNext.jsを使用
- 🗄️ **Supabase**: データベースとしてSupabaseを使用
- 🎨 **Tailwind CSS**: モダンなUIデザイン
- 🔒 **セッション管理**: iron-sessionを使用した安全なセッション管理

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要な値を設定してください：

```bash
cp .env.example .env.local
```

必要な環境変数：
- `SESSION_SECRET`: セッション暗号化用の秘密鍵（32文字以上）
- `SUPABASE_URL`: SupabaseプロジェクトのURL
- `SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `RP_ID`: WebAuthnのRelying Party ID（開発時は`localhost`）
- `EXPECTED_ORIGIN`: 期待されるオリジン（開発時は`http://localhost:3000`）

### 3. Supabaseデータベースのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `database/schema.sql`の内容をSupabaseのSQL Editorで実行
3. 環境変数にSupabaseの接続情報を設定

### 4. 開発サーバーの起動

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセスできます。

## 使用方法

1. **パスキーの登録**:
   - ユーザー名を入力
   - 「パスキーを登録」ボタンをクリック
   - ブラウザの指示に従って生体認証またはPINを設定

2. **パスキーでログイン**:
   - 登録済みのユーザー名を入力
   - 「パスキーでログイン」ボタンをクリック
   - 生体認証またはPINで認証

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **認証**: WebAuthn (Passkey)
- **セッション管理**: iron-session
- **WebAuthn ライブラリ**: @simplewebauthn/server, @simplewebauthn/browser

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
