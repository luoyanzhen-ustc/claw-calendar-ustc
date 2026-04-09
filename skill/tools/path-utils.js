#!/usr/bin/env node

/**
 * 路径工具模块
 * 
 * 提供统一的路径解析功能，支持动态工作区配置
 * 适配不同 OpenClaw 安装环境
 */

const path = require('path');
const os = require('os');

/**
 * 获取 OpenClaw 工作区根目录
 * 
 * 优先级：
 * 1. 环境变量 OPENCLAW_WORKSPACE
 * 2. 默认路径：~/.openclaw/workspace
 * 
 * @returns {string} 工作区路径
 */
function getWorkspace() {
  return process.env.OPENCLAW_WORKSPACE || 
         path.join(os.homedir(), '.openclaw', 'workspace');
}

/**
 * 获取 Claw Calendar 根目录
 * @returns {string} 日历目录路径
 */
function getCalendarDir() {
  return path.join(getWorkspace(), 'claw-calendar');
}

/**
 * 获取 Claw Calendar 数据目录
 * @returns {string} 数据目录路径
 */
function getDataDir() {
  return path.join(getCalendarDir(), 'data');
}

/**
 * 获取活跃数据目录
 * @returns {string} 活跃数据目录路径
 */
function getActiveDir() {
  return path.join(getDataDir(), 'active');
}

/**
 * 获取归档目录
 * @param {string} semester - 学期名称（可选）
 * @returns {string} 归档目录路径
 */
function getArchiveDir(semester = null) {
  const base = path.join(getDataDir(), 'archive');
  return semester ? path.join(base, semester) : base;
}

/**
 * 获取索引目录
 * @returns {string} 索引目录路径
 */
function getIndexDir() {
  return path.join(getDataDir(), 'index');
}

/**
 * 获取 settings.json 文件路径
 * @returns {string} 文件路径
 */
function getSettingsFile() {
  return path.join(getDataDir(), 'settings.json');
}

/**
 * 获取 plans.json 文件路径
 * @returns {string} 文件路径
 */
function getPlansFile() {
  return path.join(getActiveDir(), 'plans.json');
}

/**
 * 获取 courses.json 文件路径
 * @returns {string} 文件路径
 */
function getCoursesFile() {
  return path.join(getActiveDir(), 'courses.json');
}

/**
 * 获取 recurring.json 文件路径
 * @returns {string} 文件路径
 */
function getRecurringFile() {
  return path.join(getActiveDir(), 'recurring.json');
}

/**
 * 获取 known-users.json 文件路径
 * @returns {string} 文件路径
 */
function getKnownUsersPath() {
  return path.join(getDataDir(), 'known-users.json');
}

/**
 * 获取 metadata.json 文件路径
 * @returns {string} 文件路径
 */
function getMetadataFile() {
  return path.join(getDataDir(), 'metadata.json');
}

module.exports = {
  // 基础路径
  getWorkspace,
  getCalendarDir,
  getDataDir,
  
  // 子目录
  getActiveDir,
  getArchiveDir,
  getIndexDir,
  
  // 文件路径
  getSettingsFile,
  getPlansFile,
  getCoursesFile,
  getRecurringFile,
  getKnownUsersPath,
  getMetadataFile
};
