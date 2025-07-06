import micropostRepository from '../repositories/micropostRepository.js';

/**
 * Micropost Service
 * マイクロポストのビジネスロジック層
 */

/**
 * ユーザーIDでマイクロポストを取得
 * @param {number} userId - ユーザーID
 * @returns {Array} マイクロポスト配列
 */
export const getMicropostsByUserId = (userId) => {
  return micropostRepository.findByUserId(userId);
};

/**
 * 新しいマイクロポストを作成
 * @param {number} userId - ユーザーID
 * @param {string} content - マイクロポスト内容
 * @returns {Object} 作成されたマイクロポスト
 */
export const createMicropost = (userId, content) => {
  const micropostData = {
    userId: parseInt(userId, 10),
    content: content.trim()
  };
  
  return micropostRepository.create(micropostData);
};

/**
 * 全てのマイクロポストを取得
 * @returns {Array} マイクロポスト配列
 */
export const getAllMicroposts = () => {
  return micropostRepository.findAll();
};

/**
 * IDでマイクロポストを取得
 * @param {number} id - マイクロポストID
 * @returns {Object|null} マイクロポスト情報またはnull
 */
export const getMicropostById = (id) => {
  return micropostRepository.findById(id);
};

/**
 * マイクロポストを更新
 * @param {number} id - マイクロポストID
 * @param {string} content - 新しい内容
 * @returns {Object|null} 更新されたマイクロポストまたはnull
 */
export const updateMicropost = (id, content) => {
  const updateData = {
    content: content.trim()
  };
  
  return micropostRepository.update(id, updateData);
};

/**
 * マイクロポストを削除
 * @param {number} id - マイクロポストID
 * @returns {boolean} 削除成功の可否
 */
export const deleteMicropost = (id) => {
  return micropostRepository.delete(id);
};

/**
 * ユーザーのマイクロポスト数を取得
 * @param {number} userId - ユーザーID
 * @returns {number} マイクロポスト数
 */
export const getMicropostCountByUserId = (userId) => {
  return micropostRepository.countByUserId(userId);
};

/**
 * 検索条件でマイクロポストを取得
 * @param {Object} conditions - 検索条件
 * @returns {Array} マイクロポスト配列
 */
export const getMicropostsByConditions = (conditions) => {
  return micropostRepository.findByConditions(conditions);
};

/**
 * ページネーション付きでマイクロポストを取得
 * @param {Object} options - ページネーションオプション
 * @returns {Object} ページネーション結果
 */
export const getMicropostsWithPagination = (options) => {
  return micropostRepository.findWithPagination(options);
};