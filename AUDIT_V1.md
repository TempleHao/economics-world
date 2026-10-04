# Economics World V1 — 全项目审计与重构记录

## 审计结论
旧版本已经验证了学习闭环方向，但随着课程扩展到 13 个 World，原型期结构开始成为瓶颈。V1 不推翻已完成内容，而是保留有效设计、修正结构性问题并建立可长期扩展的课程与产品架构。

## 保留的正确方向
1. 曼昆作为完整性骨架，而不是唯一权威。
2. 中文优先，中英术语并行。
3. 现实情境 → 先判断 → 机制 → 现实边界 → 变式题 → Teach-back。
4. 错题记录思维错误，而非只记录题号。
5. 不制造虚假精度；现实题使用区间、敏感性、切换阈值与信息价值。
6. 货币、银行、汇率、跨境支付显著强化。
7. ChatGPT Project 作为无需额外 API 计费的自由助教。
8. 用户主要负责学习与反馈，工程按路线自动推进。

## 旧版本主要缺口
### 1. 产品状态过于原型化
- 学习状态仍保存在 ew-state-v02。
- mastery 基本按“完成课程数 × 常数”计算，不等于掌握度。
- completed / weak / due review / teach-back incomplete 没有形成统一状态模型。

### 2. 复习系统还不是真正的间隔复习
- 错题能记录，但没有 due date、复习次数、连续正确次数。
- 没有“今日该复习什么”的明确调度。
- 没有概念层面的掌握变化。

### 3. 自动学习路径没有真正落地
- 首页展示课程，但不能稳定计算“下一节最应该学什么”。
- 课程解锁、复习优先级和薄弱点没有合并成统一的 Today Queue。

### 4. Teach-back 仍是启发式关键词检查
- 原型阶段可接受，但不能被描述为真正语义理解。
- V1 必须明确其局限，并把 ChatGPT Project 语义复核作为高质量路径。

### 5. 代码结构开始失控
- index.html 同时承载样式、课程内容、产品状态和全部 JS，已经超过 60 KB。
- app.html 停留在 V0.2，与 index.html 分叉。
- 新课程继续以手工 section 追加，长期维护成本越来越高。

### 6. 导航仍有“看起来能点、实际没功能”的原型残留
- 今日学习 / 错题与复习 / 延伸探索 / 金融强化没有真正导航语义。
- V1 改为真实定位入口。

### 7. 课程架构此前对未来金融权重不足
- Stablecoin / Tokenised Deposits 只有点状出现。
- 缺少数字货币前史、Bitcoin、Ethereum、ICO、Libra/Diem、DeFi、Terra/Luna、机构化与监管转向的完整历史线。
- 缺少面向商业机会的固定分析框架。

### 8. “现实更新”和“稳定知识”尚未严格分层
V1 将内容分成：
- Canon：稳定基础知识
- Frontier：快速变化的现代金融
- Case Library：现实案例
- Opportunity Map：商业机会

## V1 状态模型
每节课至少具备：
- not_started
- in_progress
- completed
- review_due
- weak
- mastered

每个概念记录：
- mistake_count
- review_count
- correct_streak
- last_seen
- next_review
- misconception_type

## V1 复习节奏
基础间隔：1 天 → 3 天 → 7 天 → 14 天 → 30 天。
再次答错时降低间隔并回到 weak。
连续答对才提升，而不是“做完一次 = 掌握”。

## V1 内容层
- Core Economics：World 01–08, 11
- Money & Global Finance：World 09–10
- Future Finance：World 12
- Cross-border Industry：World 13

## V1 Future Finance 原则
数字货币/Web3/DeFi 不作为“炒币课”，而作为货币、账本、所有权、清算结算与金融中介演化课程。
所有未来机会都标注：
- 已商业化
- 真实试点
- 早期探索
- 高度不确定/投机

每个机会必须回答：
客户、痛点、现有方案、技术真正改变的环节、价值链、收入模式、牌照、资本/流动性、竞争壁垒、失败原因。

## 代码重构路线
V1-alpha：状态迁移、自动下一课、复习 due date、真实导航、删除双应用分叉。
V1-beta：课程内容从 HTML 中抽离为数据层。
V1.0：课程引擎、概念图谱、复习引擎和内容数据完全分离。
