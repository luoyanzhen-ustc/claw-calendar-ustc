# 路径适配说明

## 概述

Claw Calendar Skill 已完全适配不同的 OpenClaw 安装环境，支持动态工作区配置。

## 修改内容

### 1. 新增路径工具模块

**文件**: `path-utils.js`

提供统一的路径解析函数：

```javascript
const {
  getWorkspace,        // 工作区根目录
  getCalendarDir,      // 日历目录
  getDataDir,          // 数据目录
  getActiveDir,        // 活跃数据目录
  getArchiveDir,       // 归档目录
  getIndexDir,         // 索引目录
  getSettingsFile,     // settings.json 路径
  getPlansFile,        // plans.json 路径
  getCoursesFile,      // courses.json 路径
  getRecurringFile,    // recurring.json 路径
  getKnownUsersPath,   // known-users.json 路径
  getMetadataFile      // metadata.json 路径
} = require('./path-utils.js');
```

### 2. 路径优先级

所有路径解析遵循以下优先级：

1. **环境变量**: `OPENCLAW_WORKSPACE`
2. **默认路径**: `~/.openclaw/workspace` (使用 `os.homedir()`)

### 3. 修改的文件

| 文件 | 修改内容 | 状态 |
|------|---------|------|
| `path-utils.js` | 新建，提供统一路径函数 | ✅ 完成 |
| `cron-manager.js` | 移除硬编码路径，使用 `path-utils` | ✅ 完成 |
| `file-ops.js` | 移除重复路径函数，使用 `path-utils` | ✅ 完成 |
| `push-reminders.js` | 移除重复路径函数，使用 `path-utils` | ✅ 完成 |
| `setup-cron.js` | 使用 `getWorkspace()` 统一逻辑 | ✅ 完成 |

### 4. 适配的场景

#### ✅ 已适配

- **不同用户主目录**: `/root/`, `/home/user/`, `/Users/username/`
- **自定义工作区**: 通过 `OPENCLAW_WORKSPACE` 环境变量
- **多用户环境**: 每个用户独立的 `~/.openclaw/workspace`
- **跨平台**: Linux, macOS, Windows WSL

#### 示例场景

**场景 1: 默认安装**
```bash
# 工作区：/root/.openclaw/workspace
# 数据目录：/root/.openclaw/workspace/claw-calendar/data
```

**场景 2: 普通用户安装**
```bash
# 工作区：/home/zhangsan/.openclaw/workspace
# 数据目录：/home/zhangsan/.openclaw/workspace/claw-calendar/data
```

**场景 3: 自定义工作区**
```bash
export OPENCLAW_WORKSPACE=/opt/openclaw-data
# 工作区：/opt/openclaw-data
# 数据目录：/opt/openclaw-data/claw-calendar/data
```

**场景 4: 多用户共享**
```bash
# 用户 A: /home/alice/.openclaw/workspace
# 用户 B: /home/bob/.openclaw/workspace
# 每个用户独立的数据和配置
```

## 使用方法

### 环境变量配置（可选）

如果需要自定义工作区路径：

```bash
# Bash/Zsh
export OPENCLAW_WORKSPACE=/path/to/your/workspace

# 或添加到 ~/.bashrc / ~/.zshrc
echo 'export OPENCLAW_WORKSPACE=/opt/openclaw-data' >> ~/.bashrc
```

### 验证配置

```bash
# 检查当前工作区路径
node -e "console.log(require('./path-utils.js').getWorkspace())"

# 检查数据目录
node -e "console.log(require('./path-utils.js').getDataDir())"
```

## 向后兼容性

- ✅ 所有现有功能保持不变
- ✅ 默认行为与修改前一致
- ✅ 环境变量可选，不影响未配置用户

## 测试建议

1. **默认路径测试**: 未设置环境变量，验证使用 `~/.openclaw/workspace`
2. **自定义路径测试**: 设置 `OPENCLAW_WORKSPACE`，验证使用自定义路径
3. **多用户测试**: 不同用户运行，验证数据隔离
4. **跨平台测试**: 在 Linux/macOS/WSL 上验证

## 故障排查

### 问题：找不到数据文件

**检查**:
```bash
# 1. 查看当前工作区路径
node -e "console.log(require('./path-utils.js').getWorkspace())"

# 2. 检查环境变量
echo $OPENCLAW_WORKSPACE

# 3. 检查文件是否存在
ls -la $(node -e "console.log(require('./path-utils.js').getKnownUsersPath())")
```

### 问题：权限错误

**解决**:
```bash
# 确保工作区目录有写权限
chmod -R u+w $OPENCLAW_WORKSPACE/claw-calendar
```

---

*最后更新：2026-04-09*
*版本：v4.0 - 路径适配完成*
