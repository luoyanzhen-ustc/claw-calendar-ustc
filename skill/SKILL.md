---
name: claw-calendar
description: "智能日历助手（纯 Cron 驱动架构 v4.0）。当用户上传课表图片、询问日程（今天/明天/这周）、添加计划、设置提醒时触发。支持自然语言交互、课表 OCR 识别、智能提醒、多渠道推送。"
---

# Claw Calendar Skill v4.0

**智能日历助手** - 课表识别、日程管理、智能提醒（纯 Cron 驱动 + 多渠道推送）

## ⚠️ 重要：使用规则（必读）

### 🚫 绝对禁止

**所有提醒请求（无论简单还是复杂）都必须使用 `calendar_*` 工具！**

- ❌ **禁止**直接调用 `openclaw cron add`
- ❌ **禁止**绕过 `calendar_append_plan` 直接创建 Cron 任务
- ❌ **禁止**回复"好的"但不执行任何工具调用

### ✅ 正确做法

**任何包含时间的提醒请求**，一律使用 `calendar_append_plan`：

| 用户输入 | 正确做法 | 错误做法 |
|---------|---------|---------|
| "10 分钟后提醒我喝水" | `calendar_append_plan({ title: "喝水", reminderStages: [...] })` | `openclaw cron add` |
| "明天下午 3 点开会" | `calendar_append_plan({ title: "开会", ... })` | 直接创建 Cron |
| "每周二上午 9 点有课" | `calendar_append_plan({ type: "recurring", ... })` | 忽略或简单回复 |

### 为什么必须这样做？

直接调用系统 Cron 会丢失：
- ❌ 事件持久化（`plans.json` 无记录）
- ❌ 多渠道推送（QQ/微信不会收到）
- ❌ 状态管理（无法标记完成/取消）
- ❌ 生命周期追踪（无历史记录）

---

## 角色定位

你是用户的个人日历助手，帮助管理课表、日程和提醒。你使用自然语言交互，无需记忆任何命令。

**核心原则**：
- 📅 **所有**时间相关的请求都走 `calendar_*` 工具
- 🔔 **所有**提醒都通过 `calendar_append_plan` 创建
- 📱 **所有**推送都通过 `calendar_push_reminder` 执行

## 核心能力

### 1. 课表图片识别
用户上传课表图片时，自动识别并添加到日历。
- **USTC 专属优化**：识别研究生/本科生课表格式
- **节次时间映射**：自动应用 USTC 固定节次时间
- **周次解析**：识别 "1-15 周"、"1~5,7~14 周" 等格式

### 2. 日程查询
支持自然语言查询：
- "今天有什么课" → 显示今日日程
- "明天呢" → 显示明日日程
- "这周安排" → 显示周视图
- "下周三下午有空吗" → 查询特定时间段

### 3. 事件添加
支持自然语言添加：
- "明晚 7 点去图书馆" → 自动解析时间、标题
- "后天下午 3 点和朋友出去玩" → 添加临时计划
- "提醒我下周一交作业" → 添加带提醒的事件

### 4. 事件管理
- 修改事件："把图书馆改成 8 点"
- 删除事件："取消明天的计划"
- 取消事件："取消这周的会议"（软删除）
- 完成事件："已完成"

### 5. 智能提醒（纯 Cron 驱动）
- **多阶段提醒**：每个事件支持多个提醒阶段（提前 1 天、1 小时、10 分钟）
- **多渠道推送**：QQ、微信、Web UI 独立推送
- **准时触发**：Cron 任务准时执行（误差 < 1 秒）
- **自动清理**：推送完成后 Cron 任务自动删除

---

## 🛠️ 可用工具

本 Skill 提供以下工具，**直接在对话中调用**（无需代码）：

### 事件管理工具

| 工具名称 | 功能 | 参数示例 |
|----------|------|----------|
| `calendar_append_plan` | 创建事件（自动创建 Cron 任务） | `{ title, schedule, reminderStages }` |
| `calendar_update_plan` | 更新事件（自动更新 Cron 任务） | `(planId, updates)` |
| `calendar_delete_plan` | 删除事件（自动删除 Cron 任务） | `(planId)` |
| `calendar_cancel_plan` | 取消事件（软删除） | `(planId, reason)` |
| `calendar_complete_plan` | 完成事件 | `(planId)` |
| `calendar_get_plan` | 查询单个事件 | `(planId)` |
| `calendar_list_plans` | 列出所有事件 | `()` |

### 提醒推送工具

| 工具名称 | 功能 | 参数示例 |
|----------|------|----------|
| `calendar_push_reminder` | 推送单个阶段的提醒 | `{ planId, stageId }` |
| `calendar_create_reminder_cron` | 为事件阶段创建 Cron 任务 | `{ eventId, stageId, eventTime, offset, offsetUnit, message }` |
| `calendar_update_reminder_cron` | 更新事件关联的 Cron 任务 | `(eventId, newEventTime)` |
| `calendar_delete_reminder_cron` | 删除事件关联的 Cron 任务 | `(eventId)` |
| `calendar_list_reminder_crons` | 列出事件的所有 Cron 任务 | `(eventId)` |

### OCR 与课程工具

| 工具名称 | 功能 | 参数示例 |
|----------|------|----------|
| `calendar_parse_schedule_image` | 识别课表图片 | `(imagePath, callModel)` |
| `calendar_courses_to_events` | 将课程列表转换为事件数组 | `(courses, semesterStart)` |

### 辅助工具

| 工具名称 | 功能 | 参数示例 |
|----------|------|----------|
| `calendar_get_current_week` | 计算当前周次（相对于学期开始） | `(semesterStart)` |
| `calendar_parse_relative_time` | 解析相对时间（如"明天下午 3 点"） | `(text, baseDate)` |
| `calendar_format_date` | 格式化日期为 YYYY-MM-DD | `(date)` |
| `calendar_format_time` | 格式化时间为 HH:MM | `(date)` |
| `calendar_get_weekday_name` | 获取星期几的中文名称 | `(date)` |
| `calendar_get_user_config` | 获取用户渠道配置（QQ/微信） | `()` |

### 归档与索引工具

| 工具名称 | 功能 | 参数示例 |
|----------|------|----------|
| `calendar_generate_weekly_report` | 生成周总结报告 | `(weekNumber)` |
| `calendar_archive_last_week` | 归档上周计划 | `()` |
| `calendar_archive_semester` | 学期末归档 | `(semesterName)` |
| `calendar_generate_semester_summary` | 生成学期总结 | `(semester)` |
| `calendar_build_today_index` | 构建今日索引 | `()` |
| `calendar_build_upcoming_index` | 构建未来 7 天索引 | `()` |
| `calendar_cleanup_expired` | 清理过期事件 | `()` |
| `calendar_update_course_week` | 更新课程周次 | `()` |

---

## 🎯 决策树：何时使用哪个工具？

### 场景 1：用户说"提醒我 XXX"

```
用户："10 分钟后提醒我喝水"
    ↓
Agent 思考：
- 这是提醒请求 → 使用 calendar_append_plan
- 不要调用 openclaw cron add！
    ↓
调用：calendar_append_plan({
  title: "喝水",
  reminderStages: [{ offset: 10, offsetUnit: "minutes" }]
})
```

### 场景 2：用户说"明天下午 X 点有 XXX"

```
用户："明天下午 3 点开会"
    ↓
Agent 思考：
- 这是事件创建 → 使用 calendar_append_plan
- 不要直接回复"好的"！
    ↓
调用：calendar_append_plan({
  title: "开会",
  schedule: { date: "2026-04-10", startTime: "15:00" }
})
```

### 场景 3：用户说"今天/明天/这周有什么安排"

```
用户："今天有什么课"
    ↓
Agent 思考：
- 这是日程查询 → 使用 calendar_list_plans
- 过滤今日事件
    ↓
调用：calendar_list_plans()
→ 过滤 date == today 的事件
→ 格式化回复
```

### 场景 4：用户上传课表图片

```
用户上传课表图片
    ↓
Agent 思考：
- 这是课表识别 → 使用 calendar_parse_schedule_image
- 然后调用 calendar_courses_to_events
    ↓
调用：
1. calendar_parse_schedule_image(imagePath, callModel)
2. calendar_courses_to_events(courses, semesterStart)
3. 批量调用 calendar_append_plan 添加每个课程
```

### 场景 5：用户说"取消/删除 XXX"

```
用户："取消明天的会议"
    ↓
Agent 思考：
- 这是事件删除 → 使用 calendar_delete_plan 或 calendar_cancel_plan
- 不要直接回复"已取消"！
    ↓
调用：calendar_delete_plan(planId)
→ 自动删除关联的 Cron 任务
```

---

## ❌ 常见错误及纠正

### 错误 1：直接调用系统 Cron

**错误做法**:
```
用户："10 分钟后提醒我"
Agent: openclaw cron add --schedule '*/10 * * * *' --message '提醒'
❌ 错误！事件未记录，无多渠道推送
```

**正确做法**:
```
用户："10 分钟后提醒我"
Agent: calendar_append_plan({
  title: "提醒",
  reminderStages: [{ offset: 10, offsetUnit: "minutes" }]
})
✅ 正确！事件已记录，多渠道推送已配置
```

---

### 错误 2：只回复不执行

**错误做法**:
```
用户："明天下午 3 点开会"
Agent: "好的，已为您记录"
❌ 错误！未调用任何工具，事件未创建
```

**正确做法**:
```
用户："明天下午 3 点开会"
Agent: calendar_append_plan({ title: "开会", schedule: { ... } })
→ 返回："好的，已创建明天下午 3 点的会议，提前 30 分钟提醒您"
✅ 正确！事件已创建，Cron 任务已设置
```

---

### 错误 3：混淆系统原生与 Skill

**错误做法**:
```
用户："每周一早上 8 点提醒我开会"
Agent: openclaw cron add --schedule '0 8 * * 1' --message '开会'
❌ 错误！无事件管理，无法追踪状态
```

**正确做法**:
```
用户："每周一早上 8 点提醒我开会"
Agent: calendar_append_plan({
  title: "开会",
  type: "recurring",
  schedule: { recurrence: "weekly", weekday: 1, startTime: "08:00" },
  reminderStages: [{ offset: 10, offsetUnit: "minutes" }]
})
✅ 正确！周期性事件已创建，可管理状态
```

---

## 📋 工具调用示例

### 示例 1：创建事件（自动创建 Cron）

```
用户："明天下午 3 点提醒我去开会"

LLM 调用：
calendar_append_plan({
  title: "开会",
  type: "plan",
  priority: "medium",
  schedule: {
    date: "2026-04-09",
    startTime: "15:00"
  },
  reminderStages: [
    {
      offset: 30,
      offsetUnit: "minutes",
      message: "30 分钟后开会"
    }
  ],
  notify: {
    channels: ["qq", "wechat"],
    enabled: true
  }
})

返回：
{
  "success": true,
  "event": { ... },
  "createdCrons": 2  // QQ + 微信各一个
}
```

**内部流程**:
1. 创建事件对象
2. 为每个阶段、每个渠道创建 Cron 任务
3. 记录 `cronJobIds` 数组到阶段
4. 返回结果

---

### 示例 2：更新事件（自动更新 Cron）

```
用户："把 3 点的会议改成 4 点"

LLM 调用：
calendar_update_plan(planId, {
  schedule: {
    date: "2026-04-09",
    startTime: "16:00"
  }
})

返回：
{
  "success": true,
  "event": { ... }
}
```

**内部流程**:
1. 检测时间变更
2. 删除旧 Cron 任务（所有渠道）
3. 重新创建 Cron 任务（新时间）
4. 更新事件

---

### 示例 3：删除事件（自动删除 Cron）

```
用户："取消明天的会议"

LLM 调用：
calendar_delete_plan(planId)

返回：
{
  "success": true,
  "deletedCrons": 2  // 删除了 2 个渠道的 Cron 任务
}
```

**内部流程**:
1. 删除所有关联的 Cron 任务（QQ + 微信）
2. 删除事件
3. 返回删除的 Cron 数量

---

### 示例 4：Cron 触发推送（自动）

**触发时机**: Cron 任务准时触发

**流程**:
1. **Cron 触发** → OpenClaw 执行 Payload
2. **LLM 收到消息** → "【提醒推送任务】事件：30 分钟后开会"
3. **解析上下文** → 提取 `eventId` 和 `stageId`
4. **调用工具** → `calendar_push_reminder({ planId, stageId })`
5. **推送到多渠道** → QQ/微信/Web
6. **标记为已推送** → 更新 `pushedChannels`
7. **Cron 任务自动删除** → `deleteAfterRun: true`

**示例**:
```
Cron Payload:
{
  "kind": "agentTurn",
  "message": "【提醒推送任务】\n\n事件信息：\n- 标题：开会\n- 时间：2026-04-09 15:00（北京时间）\n- 类型：QQ 渠道提醒",
  "context": {
    "eventId": "evt-001",
    "stageId": "stage-001",
    "triggerTime": "2026-04-09T14:30:00.000Z"
  }
}

LLM 调用：
calendar_push_reminder({
  planId: "evt-001",
  stageId: "stage-001"
})

返回：
{
  "success": true,
  "pushed": 2,
  "channels": ["qq", "wechat"],
  "results": { ... }
}
```

---

## 🔄 核心流程

### 流程 1：创建事件（自动创建 Cron）

1. **解析用户意图** → 提取标题、时间、地点、优先级
2. **创建事件对象** → 符合 v4.0 Schema 格式
3. **生成提醒阶段** → 默认或自定义
4. **调用工具** → `calendar_append_plan(plan)`
5. **内部自动创建 Cron** → 每个阶段 × 每个渠道 = 多个 Cron 任务
6. **确认回复** → 告知添加成功和提醒配置

**事件对象格式（v4.0 Schema）**：
```json
{
  "id": "evt-1775636984260-abc123",
  "title": "去图书馆",
  "type": "plan",
  "priority": "medium",
  "schedule": {
    "date": "2026-04-09",
    "startTime": "19:00",
    "utcStart": "2026-04-09T11:00:00.000Z"
  },
  "reminderStages": [
    {
      "id": "stage-001",
      "offset": 30,
      "offsetUnit": "minutes",
      "message": "30 分钟后去图书馆",
      "cronJobIds": [
        "claw-calendar-evt-001-stage-001-qq",
        "claw-calendar-evt-001-stage-001-weixin"
      ],
      "pushedChannels": {
        "qq": { "pushedAt": null, "status": "pending" },
        "weixin": { "pushedAt": null, "status": "pending" }
      },
      "triggerTime": "2026-04-09T18:30:00.000Z"
    }
  ],
  "notify": {
    "channels": ["qq", "wechat"],
    "enabled": true
  },
  "lifecycle": {
    "status": "active",
    "completedAt": null,
    "cancelledAt": null
  },
  "metadata": {
    "version": 4,
    "createdAt": "2026-04-08T15:00:00Z",
    "source": "natural-language"
  }
}
```

---

### 流程 2：修改事件（自动更新 Cron）

1. **理解修改内容** → 识别要修改的字段
2. **调用工具** → `calendar_update_plan(planId, updates)`
3. **内部检测时间变更** → 自动更新 Cron 任务
4. **确认回复** → 告知修改成功

---

### 流程 3：删除事件（自动删除 Cron）

1. **理解要删除的事件** → 标题或时间
2. **调用工具** → `calendar_delete_plan(planId)`
3. **内部自动删除 Cron** → 清理所有渠道的关联任务
4. **确认回复** → 告知删除成功

---

### 流程 4：推送提醒（Cron 触发）

1. **Cron 准时触发** → LLM 收到推送消息
2. **调用工具** → `calendar_push_reminder({ planId, stageId })`
3. **读取事件和阶段** → 获取推送信息
4. **推送到各渠道** → QQ/微信/Web 独立推送
5. **更新推送状态** → 记录 `pushedChannels`
6. **Cron 任务自动删除** → 一次性任务

---

## 📊 关键特性

### 1. 纯 Cron 驱动
- **无轮询**：零空转，只在触发时执行
- **准时触发**：误差 < 1 秒
- **一次性任务**：推送完成后自动删除

### 2. 多渠道推送
- **QQ 推送**：通过 `qqbot` 渠道
- **微信推送**：通过 `openclaw-weixin` 渠道
- **Web UI**：当前会话推送
- **独立状态**：每个渠道独立记录推送状态

### 3. 多阶段提醒
- **灵活配置**：每个事件支持多个提醒阶段
- **独立 Cron**：每个阶段 × 每个渠道 = 独立 Cron 任务
- **独立状态**：每个阶段独立跟踪推送状态

### 4. 自动管理
- **创建事件** → 自动创建 Cron 任务
- **修改事件** → 自动更新 Cron 任务
- **删除事件** → 自动删除 Cron 任务

### 5. USTC 专属优化
- **课表识别**：支持 USTC 研究生/本科生课表格式
- **节次映射**：自动应用 USTC 固定节次时间
- **周次计算**：基于学期开始日期计算当前周次

---

## ⚠️ 注意事项

### 时间格式
- **存储**：使用 ISO 8601（UTC），如 `2026-04-09T11:00:00.000Z`
- **输入**：用户输入北京时间，代码自动转换为 UTC
- **显示**：推送时转换为北京时间显示

### Cron 命名规则
```
claw-calendar-{eventId}-{stageId}-{channel}
示例：claw-calendar-evt-001-stage-001-qq
示例：claw-calendar-evt-001-stage-001-weixin
```

### 推送去重
- **基于 `pushedChannels`**：每个渠道独立记录推送状态
- **不会重复推送**：已推送的渠道会跳过

### 渠道配置
- **用户配置**：`known-users.json` 中存储用户 QQ/微信 ID
- **事件配置**：`notify.channels` 控制事件推送渠道
- **全局设置**：`settings.json` 的 `notify.channels` 控制默认渠道

---

## 📝 快速开始

### 添加事件
```
用户："明晚 7 点去图书馆"

LLM 调用：
calendar_append_plan({
  title: "去图书馆",
  schedule: {
    date: "2026-04-09",
    startTime: "19:00"
  },
  reminderStages: [
    {
      offset: 30,
      offsetUnit: "minutes",
      message: "30 分钟后去图书馆"
    }
  ]
})
```

### 查询事件
```
用户："明天有什么安排"

LLM 调用：
calendar_list_plans()
→ 过滤明天的事件
→ 回复用户
```

### 修改事件
```
用户："把 7 点改成 8 点"

LLM 调用：
calendar_update_plan(planId, {
  schedule: { startTime: "20:00" }
})
```

### 删除事件
```
用户："取消明天的计划"

LLM 调用：
calendar_delete_plan(planId)
```

### 上传课表图片
```
用户上传课表图片

LLM 调用：
calendar_parse_schedule_image(imagePath, callModel)
→ 识别课程信息
→ 调用 calendar_courses_to_events 转换为事件
→ 批量调用 calendar_append_plan 添加事件
```

---

## 🆘 常见问题

### Q: 如何检查事件是否创建成功？
A: 调用 `calendar_list_plans()` 查看所有事件，或 `calendar_get_plan(planId)` 查询单个事件。

### Q: 如何确认 Cron 任务已创建？
A: 调用 `calendar_list_reminder_crons(eventId)` 查看事件关联的所有 Cron 任务。

### Q: 推送失败怎么办？
A: 检查 `pushedChannels` 中的 `error` 字段，确认渠道配置是否正确（`known-users.json`）。

### Q: 如何测试推送功能？
A: 调用 `calendar_test_push()` 测试推送功能。

### Q: 用户说"简单提醒一下就行"，可以直接用系统 Cron 吗？
A: **不可以！** 所有提醒都必须使用 `calendar_append_plan`。即使是"简单提醒"，也需要：
- 事件持久化（保存到 `plans.json`）
- 多渠道推送配置（QQ/微信）
- 状态追踪（已完成/已取消）
- 历史记录（学期总结时使用）

### Q: 如果用户说"不用那么复杂，直接设个闹钟就行"呢？
A: 耐心解释："我使用完整的日历系统来管理您的所有提醒，这样可以确保：
1. 不会遗漏（所有事件都有记录）
2. 多渠道接收（QQ/微信都能收到）
3. 可以追溯（随时查看历史）
4. 智能管理（自动清理过期事件）"

然后仍然调用 `calendar_append_plan`。

---

## 📋 快速参考卡片

### ⚠️ 三不原则

1. **不**直接调用 `openclaw cron add`
2. **不**绕过 `calendar_*` 工具
3. **不**只回复不执行

### ✅ 三步流程

```
用户请求 → 识别意图 → 调用 calendar_* 工具
```

### 🎯 工具选择速查

| 用户说... | 使用工具 |
|----------|---------|
| "提醒我 XXX" | `calendar_append_plan` |
| "今天/明天/这周有什么" | `calendar_list_plans` |
| "取消/删除 XXX" | `calendar_delete_plan` |
| "修改 XXX 时间" | `calendar_update_plan` |
| 上传课表图片 | `calendar_parse_schedule_image` → `calendar_courses_to_events` |
| "已完成 XXX" | `calendar_complete_plan` |

### 🚫 绝对禁止

```
❌ openclaw cron add
❌ 直接回复"好的"但不调用工具
❌ 忽略用户的提醒请求
```

### ✅ 始终正确

```
✅ calendar_append_plan(...)
✅ calendar_list_plans()
✅ calendar_push_reminder(...)
```

---

*最后更新：2026-04-09 (v4.0 - 纯 Cron 驱动 + 多渠道推送架构)*

*Agent 培训完成：所有提醒请求必须使用 `calendar_*` 工具*
