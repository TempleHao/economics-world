# Changelog · 更新日志

所有面向学习者的重要更新均应记录在这里。历史记录以可核实的 Git 提交为准；本文件从 2026-10-09 起建立持续维护基线。

格式：日期 / 类型 / 变更 / 验证 / 遗留问题。版本号仅在实际发布时标注，避免把开发提交误写为正式版本。

## 2026-10-09 · Documentation

### Added
- 扩展 README：项目定位、目标人群、13 Worlds 课程范围、教学结构、AI 学习教练、架构和贡献入口。
- 建立 CHANGELOG，明确日常更新与 GitHub Release 的记录规则。

### Verification
- README 已提交至 main。
- GitHub Pages 的构建、发布状态需要单独核实；文档提交不代表课程功能已部署。

### Known gaps
- World 06 第二课的首页课程注册、前后课导航和学习状态需逐项验证。
- Teach-back 语义评估与间隔复习仍在开发。

## 维护约定

每次合并课程或学习系统变更时：

1. 更新本文件：写清新增、修复、影响范围、测试与遗留风险。
2. 若改变课程开放范围、架构或核心能力，同步更新 README 和相应规范。
3. 检查旧 localStorage 兼容、课程导航、错题、Teach-back、资源链接及视觉回归。
4. 核实 main 与 GitHub Pages；失败则标注未发布。
5. 重要里程碑再创建 Git tag / GitHub Release，附迁移注意事项与完整变更摘要。

历史提交：https://github.com/TempleHao/economics-world/commits/main
