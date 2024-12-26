# CloudPic クラウドピック

<div align="center">

[English](./README.en.md) | [简体中文](../../README.md) | [日本語](./README.ja.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAirlur%2FCloudPic)

</div>

Backblaze B2、Cloudflare R2などの複数のクラウドストレージサービスを接続・管理するためのWebアプリケーション。

## 特徴

- 複数のクラウドストレージサービス対応（B2、R2、S3互換）
- ファイルのアップロード、削除、プレビュー
- シンプルなパスワード認証
- ダーク/ライトテーマ切り替え
- 多言語対応

## クイックスタート

1. 依存関係のインストール
```bash
npm install
```

2. 開発モード
```bash
npm run dev
```

3. ビルド
```bash
npm run build
```

## 開発ガイド

- 詳細は[設計ドキュメント](../design.md)をご覧ください
- ローカル開発については設計ドキュメントの「ローカル開発」セクションを参照してください

## デプロイ

### Vercelでのワンクリックデプロイ

1. 上部の「Deploy with Vercel」ボタンをクリック
2. Vercelアカウントをお持ちでない場合は作成
3. GitHubの認証とリポジトリの選択
4. 環境変数の設定：
   - `ACCESS_PASSWORD`: アクセスパスワード
5. 「Deploy」をクリックしてデプロイを開始

### 手動デプロイ

1. このリポジトリをフォーク
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## 技術スタック

- React 18
- TypeScript
- Tailwind CSS
- Express
- Vercel 