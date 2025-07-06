# User & Micropost API

OpenAPI仕様をシングルソースとしたExpress APIプロジェクト

## 構成

- `openapi/api.yaml`: OpenAPI 3.0.3仕様書
- `test/api.test.js`: OpenAPI仕様から自動生成されたテストコード
- `src/`: 実装コード（未実装）

## モデル関係

- User : Micropost = 1 : N
- ユーザー登録/認証機能なし
- 画像アップロード機能なし
- Update/Delete機能なし

## エンドポイント

- `GET /users/{userId}/microposts`: ユーザーの全マイクロポスト取得
- `POST /users/{userId}/microposts`: 新規マイクロポスト作成

## セットアップ

```bash
npm install
```

## テスト実行

```bash
npm test
```

## 開発方針

1. OpenAPI仕様書が単一ソース
2. テストコードはOpenAPI仕様から自動生成
3. 実装コードもOpenAPI仕様に従う
4. 仕様/テスト/実装の齟齬を防ぐ

## 使用方法

bash# カスタムコマンドの実行例
/generate-api "GET /users"
/validate-schema
/generate-vue-component "ProductList table"
/generate-tests
/docker-setup
/migration-postgres
/project-analysis