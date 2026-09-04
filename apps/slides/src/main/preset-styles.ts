/**
 * UToOffice preset style library — the paid "pro" content.
 *
 * Each entry is a complete Style Skill (the same format the AI produces via
 * generateStyleSkill): concrete hex colors, fonts, per-page-type layout
 * variants, and a one-line overall design language. Preset styles are
 * pro-only: free users see their own saved templates but not these.
 */

export interface PresetStyle {
  name: string
  topic: string
  styleSkill: string
}

export const PRESET_STYLES: PresetStyle[] = [
  {
    name: '商务提案 · 深蓝专业风',
    topic: '企业汇报 / 商务提案 / 融资路演',
    styleSkill: `Color rules
  Main background: #ffffff
  Per-page-type backgrounds:
    cover: #0f2a4a
    content: #ffffff
    data: #f5f7fa
    closing: #0f2a4a
  Main text color: #1a1a2e
  Primary accent: #1f5fbf
  Secondary accent: #3fa9f5
  Card background: #f7f9fc
  Border color: #d8e1ec

Fonts
  CJK title font: 微软雅黑
  Latin title font: Segoe UI Semibold
  Body font: 微软雅黑
  Title size: 32-44px
  Body size: 14-18px

Layout variants per page type
  cover variants:
    cover_dark_minimal: 深蓝背景 + 居中白色大标题 + 蓝色点缀线
    cover_split_color: 深蓝与白色 60/40 分块，左标题右副标题
  content variants:
    three_column_cards: 三列卡片并列，每卡一个要点
    hero_big_number: 大数字突出核心指标
    two_column_comparison: 左右两栏对比方案
    left_text_right_image: 左文右图
  data variants:
    kpi_cards_row: 横向 KPI 指标卡
    chart_with_insight: 左图右洞察
  closing variants:
    closing_cta: 居中标题 + 联系信息
    closing_thank_you: 深蓝全幅致谢页

Overall style: 深蓝主色的专业商务风，简洁克制、强调数据与结论，适合企业汇报与提案。`,
  },
  {
    name: '党政公文 · 国标红头风',
    topic: '党政机关公文 / 汇报材料 / 年度总结',
    styleSkill: `Color rules
  Main background: #ffffff
  Per-page-type backgrounds:
    cover: #ffffff
    content: #ffffff
    data: #fbf7f5
    closing: #ffffff
  Main text color: #1a1a1a
  Primary accent: #c00000
  Secondary accent: #8c1f1f
  Card background: #fdfafa
  Border color: #e0d5d5

Fonts
  CJK title font: 方正小标宋简体（回退：宋体）
  Latin title font: Times New Roman
  Body font: 仿宋_GB2312（回退：宋体）
  Title size: 36-48px
  Body size: 16-20px

Layout variants per page type
  cover variants:
    cover_dark_minimal: 白底 + 顶部红色分隔线 + 居中大标题（方正小标宋）
    cover_typography_hero: 纯排版，标题居中，红色党徽/单位名点缀
  content variants:
    three_column_cards: 三列要点卡片，红色小标题
    hero_big_number: 大数字突出核心数据
    two_column_comparison: 左右对比
    left_text_right_image: 左文右图
  data variants:
    kpi_cards_row: 横向数据指标卡
    chart_with_insight: 图表 + 文字说明
  closing variants:
    closing_cta: 居中总结 + 落款（单位、日期）
    closing_thank_you: 白底致谢页

Overall style: 庄重正式的党政公文风，白底红头、仿宋正文、红色点缀，符合 GB/T 9704 公文格式规范。`,
  },
  {
    name: '学术报告 · 简洁学术风',
    topic: '学术汇报 / 论文答辩 / 课题结题',
    styleSkill: `Color rules
  Main background: #ffffff
  Per-page-type backgrounds:
    cover: #ffffff
    content: #ffffff
    data: #f6f8fa
    closing: #ffffff
  Main text color: #222222
  Primary accent: #23496e
  Secondary accent: #5b8db8
  Card background: #f7f9fb
  Border color: #dce4ea

Fonts
  CJK title font: 微软雅黑
  Latin title font: Georgia
  Body font: 宋体
  Title size: 30-40px
  Body size: 15-18px

Layout variants per page type
  cover variants:
    cover_typography_hero: 纯排版，标题 + 作者 + 单位 + 日期，简洁居中
    cover_split_color: 左侧深蓝窄条 + 右侧标题区
  content variants:
    three_column_cards: 三列要点
    hero_big_number: 大数字突出结论
    two_column_comparison: 左右对比（实验组/对照组）
    left_text_right_image: 左文右图（配图、示意图）
  data variants:
    chart_with_insight: 图表 + 结论
    two_by_two_grid: 2×2 象限/分类
  closing variants:
    closing_cta: 结论 + 致谢 + 参考文献
    closing_thank_you: 致谢页

Overall style: 简洁克制的学术风，白底深蓝点缀、宋体正文，强调逻辑与图表，适合学术汇报与答辩。`,
  },
  {
    name: '科技产品 · 深色科技风',
    topic: '产品发布 / 技术分享 / 互联网路演',
    styleSkill: `Color rules
  Main background: #0d1117
  Per-page-type backgrounds:
    cover: #0d1117
    content: #0d1117
    data: #161b22
    closing: #0d1117
  Main text color: #e6edf3
  Primary accent: #4f8ef7
  Secondary accent: #a371f7
  Card background: #1a2130
  Border color: #30363d

Fonts
  CJK title font: 微软雅黑
  Latin title font: Segoe UI Semibold
  Body font: 微软雅黑
  Title size: 34-46px
  Body size: 14-18px

Layout variants per page type
  cover variants:
    cover_dark_minimal: 深色背景 + 居中大字标题 + 蓝色渐变点缀
    cover_full_image_overlay: 深色科技感背景 + 半透明遮罩 + 白色标题
  content variants:
    three_column_cards: 三列卡片，深色卡片
    hero_big_number: 大数字 + 渐变强调
    two_column_comparison: 左右对比
    left_text_right_image: 左文右图
  data variants:
    kpi_cards_row: 横向指标卡
    chart_with_insight: 图表 + 洞察
  closing variants:
    closing_cta: 居中标题 + 二维码/链接
    closing_thank_you: 深色致谢页

Overall style: 深色底、蓝紫渐变点缀的科技感风格，适合产品发布与技术分享。`,
  },
]
