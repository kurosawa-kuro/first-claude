import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';
import config from '../config/index.js';
import { createUserSchema, updateUserSchema } from '../schemas/auth.js';

/**
 * ユーザーリポジトリ
 * lowdb を使用したユーザーデータのCRUD操作
 */
export class UserRepository {
  constructor(dbPath = null) {
    // データベースファイルパス
    this.dbPath = dbPath || config.database.path;
    
    // lowdb インスタンス初期化
    const adapter = new JSONFileSync(this.dbPath);
    this.db = new LowSync(adapter, {});
    
    // データベース初期化
    this._initializeDatabase();
  }

  /**
   * データベース初期化
   * @private
   */
  _initializeDatabase() {
    this.db.read();
    
    // データベースが空の場合、初期構造を作成
    if (!this.db.data) {
      this.db.data = {
        users: [],
        microposts: []
      };
    }
    
    // users テーブルが存在しない場合作成
    if (!this.db.data.users) {
      this.db.data.users = [];
    }
    
    this.db.write();
  }

  /**
   * ユーザー作成
   * @param {Object} userData - ユーザーデータ
   * @returns {Promise<Object>} 作成されたユーザー
   */
  async create(userData) {
    // バリデーション
    const validatedData = createUserSchema.parse(userData);
    
    // ID生成（最大ID + 1）
    this.db.read();
    const users = this.db.data.users || [];
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newId = maxId + 1;
    
    // ユーザーオブジェクト作成
    const newUser = {
      id: newId,
      ...validatedData,
      micropostCount: 0 // 初期値
    };
    
    // データベースに追加
    this.db.data.users.push(newUser);
    this.db.write();
    
    return newUser;
  }

  /**
   * ID でユーザー検索
   * @param {number} id - ユーザーID
   * @returns {Promise<Object|null>} ユーザーまたはnull
   */
  async findById(id) {
    this.db.read();
    const users = this.db.data.users || [];
    
    const user = users.find(u => u.id === parseInt(id));
    
    if (user) {
      // micropostCount を動的に計算
      const microposts = this.db.data.microposts || [];
      const micropostCount = microposts.filter(m => m.userId === user.id).length;
      
      return {
        ...user,
        micropostCount
      };
    }
    
    return null;
  }

  /**
   * メールアドレスでユーザー検索
   * @param {string} email - メールアドレス
   * @returns {Promise<Object|null>} ユーザーまたはnull
   */
  async findByEmail(email) {
    this.db.read();
    const users = this.db.data.users || [];
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // micropostCount を動的に計算
      const microposts = this.db.data.microposts || [];
      const micropostCount = microposts.filter(m => m.userId === user.id).length;
      
      return {
        ...user,
        micropostCount
      };
    }
    
    return null;
  }

  /**
   * ユーザー更新
   * @param {number} id - ユーザーID
   * @param {Object} updateData - 更新データ
   * @returns {Promise<Object|null>} 更新されたユーザーまたはnull
   */
  async update(id, updateData) {
    // バリデーション
    const validatedData = updateUserSchema.parse(updateData);
    
    this.db.read();
    const users = this.db.data.users || [];
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return null;
    }
    
    // ユーザー更新
    this.db.data.users[userIndex] = {
      ...this.db.data.users[userIndex],
      ...validatedData
    };
    
    this.db.write();
    
    return this.findById(id);
  }

  /**
   * ユーザー削除
   * @param {number} id - ユーザーID
   * @returns {Promise<boolean>} 削除成功かどうか
   */
  async delete(id) {
    this.db.read();
    const users = this.db.data.users || [];
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return false;
    }
    
    // ユーザー削除
    this.db.data.users.splice(userIndex, 1);
    
    // 関連するマイクロポストも削除
    const microposts = this.db.data.microposts || [];
    this.db.data.microposts = microposts.filter(m => m.userId !== parseInt(id));
    
    this.db.write();
    
    return true;
  }

  /**
   * 全ユーザー取得（ページネーション対応）
   * @param {Object} options - 検索オプション
   * @returns {Promise<Object>} ユーザー一覧と総数
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'created_desc',
      search = ''
    } = options;
    
    this.db.read();
    let users = this.db.data.users || [];
    
    // 検索フィルタ
    if (search) {
      const searchTerm = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // ソート
    users = this._sortUsers(users, sort);
    
    // micropostCount を動的に計算
    const microposts = this.db.data.microposts || [];
    users = users.map(user => ({
      ...user,
      micropostCount: microposts.filter(m => m.userId === user.id).length
    }));
    
    // ページネーション
    const total = users.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);
    
    return {
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    };
  }

  /**
   * ユーザー数取得
   * @returns {Promise<number>} ユーザー総数
   */
  async count() {
    this.db.read();
    const users = this.db.data.users || [];
    return users.length;
  }

  /**
   * メールアドレスの重複チェック
   * @param {string} email - メールアドレス
   * @param {number} excludeId - 除外するユーザーID（更新時用）
   * @returns {Promise<boolean>} 重複している場合true
   */
  async isEmailExists(email, excludeId = null) {
    this.db.read();
    const users = this.db.data.users || [];
    
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.id !== excludeId
    );
  }

  /**
   * ロール別ユーザー検索
   * @param {string} role - ロール名
   * @returns {Promise<Array>} 該当ユーザー一覧
   */
  async findByRole(role) {
    this.db.read();
    const users = this.db.data.users || [];
    
    return users.filter(user => 
      user.roles && user.roles.includes(role)
    );
  }

  /**
   * 最近登録されたユーザー取得
   * @param {number} limit - 取得件数
   * @returns {Promise<Array>} 最近のユーザー一覧
   */
  async findRecent(limit = 10) {
    this.db.read();
    const users = this.db.data.users || [];
    
    return users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * ユーザーソート
   * @private
   */
  _sortUsers(users, sort) {
    switch (sort) {
      case 'name_asc':
        return users.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return users.sort((a, b) => b.name.localeCompare(a.name));
      case 'created_asc':
        return users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'created_desc':
      default:
        return users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  /**
   * データベース状態取得（デバッグ用）
   * @returns {Object} データベース統計情報
   */
  getStats() {
    this.db.read();
    const users = this.db.data.users || [];
    const microposts = this.db.data.microposts || [];
    
    return {
      totalUsers: users.length,
      totalMicroposts: microposts.length,
      usersByRole: users.reduce((acc, user) => {
        user.roles?.forEach(role => {
          acc[role] = (acc[role] || 0) + 1;
        });
        return acc;
      }, {}),
      lastUpdated: new Date().toISOString()
    };
  }
}