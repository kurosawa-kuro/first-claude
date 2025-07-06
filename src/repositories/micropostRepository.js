import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

/**
 * Micropost Repository
 * lowdb を使用した マイクロポスト データアクセス層
 */
class MicropostRepository {
  constructor() {
    const adapter = new JSONFileSync('./db/db.json');
    this.db = new LowSync(adapter, { microposts: [] });
    this.db.read();

    // デフォルトデータがない場合の初期化
    if (!this.db.data) {
      this.db.data = { microposts: [] };
      this.db.write();
    }
    if (!this.db.data.microposts) {
      this.db.data.microposts = [];
      this.db.write();
    }
  }

  /**
   * 全てのマイクロポストを取得
   * @returns {Array} マイクロポスト配列
   */
  findAll() {
    this.db.read();
    return this.db.data.microposts || [];
  }

  /**
   * IDでマイクロポストを取得
   * @param {number} id - マイクロポストID
   * @returns {Object|null} マイクロポスト情報またはnull
   */
  findById(id) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    return microposts.find(post => post.id === parseInt(id, 10)) || null;
  }

  /**
   * ユーザーIDでマイクロポストを取得
   * @param {number} userId - ユーザーID
   * @returns {Array} マイクロポスト配列
   */
  findByUserId(userId) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    return microposts.filter(post => post.userId === parseInt(userId, 10));
  }

  /**
   * 新しいマイクロポストを作成
   * @param {Object} micropostData - マイクロポストデータ
   * @returns {Object} 作成されたマイクロポスト
   */
  create(micropostData) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    
    // 新しいIDを生成
    const maxId = microposts.length > 0 ? Math.max(...microposts.map(p => p.id)) : 0;
    const newId = maxId + 1;

    const newMicropost = {
      id: newId,
      userId: parseInt(micropostData.userId, 10),
      content: micropostData.content.trim(),
      createdAt: new Date().toISOString(),
      ...micropostData
    };

    microposts.push(newMicropost);
    this.db.data.microposts = microposts;
    this.db.write();

    return newMicropost;
  }

  /**
   * マイクロポストを更新
   * @param {number} id - マイクロポストID
   * @param {Object} updateData - 更新データ
   * @returns {Object|null} 更新されたマイクロポストまたはnull
   */
  update(id, updateData) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    const index = microposts.findIndex(post => post.id === parseInt(id, 10));

    if (index === -1) {
      return null;
    }

    microposts[index] = {
      ...microposts[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.db.data.microposts = microposts;
    this.db.write();

    return microposts[index];
  }

  /**
   * マイクロポストを削除
   * @param {number} id - マイクロポストID
   * @returns {boolean} 削除成功の可否
   */
  delete(id) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    const index = microposts.findIndex(post => post.id === parseInt(id, 10));

    if (index === -1) {
      return false;
    }

    microposts.splice(index, 1);
    this.db.data.microposts = microposts;
    this.db.write();

    return true;
  }

  /**
   * ユーザーIDでマイクロポスト数を取得
   * @param {number} userId - ユーザーID
   * @returns {number} マイクロポスト数
   */
  countByUserId(userId) {
    this.db.read();
    const microposts = this.db.data.microposts || [];
    return microposts.filter(post => post.userId === parseInt(userId, 10)).length;
  }

  /**
   * 検索条件でマイクロポストを取得
   * @param {Object} conditions - 検索条件
   * @returns {Array} マイクロポスト配列
   */
  findByConditions(conditions = {}) {
    this.db.read();
    let microposts = this.db.data.microposts || [];

    // ユーザーIDフィルタ
    if (conditions.userId) {
      microposts = microposts.filter(post => post.userId === parseInt(conditions.userId, 10));
    }

    // コンテンツ検索
    if (conditions.search) {
      const searchLower = conditions.search.toLowerCase();
      microposts = microposts.filter(post => 
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // 日付範囲フィルタ
    if (conditions.since) {
      microposts = microposts.filter(post => 
        new Date(post.createdAt) >= new Date(conditions.since)
      );
    }

    if (conditions.until) {
      microposts = microposts.filter(post => 
        new Date(post.createdAt) <= new Date(conditions.until)
      );
    }

    return microposts;
  }

  /**
   * ページネーション付きでマイクロポストを取得
   * @param {Object} options - ページネーションオプション
   * @returns {Object} ページネーション結果
   */
  findWithPagination(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...conditions
    } = options;

    let microposts = this.findByConditions(conditions);

    // ソート
    microposts.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortBy === 'createdAt') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // ページネーション
    const total = microposts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedMicroposts = microposts.slice(offset, offset + limit);

    return {
      data: paginatedMicroposts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}

// シングルトンインスタンス
const micropostRepository = new MicropostRepository();

export default micropostRepository;