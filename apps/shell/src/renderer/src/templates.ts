/**
 * UToOffice template library — display metadata for the home-screen template gallery.
 *
 * Each template pairs a preview thumbnail (inline SVG) with the matching preset
 * style. The name MUST match apps/slides/src/main/preset-styles.ts so that
 * "make the same" can pass the name straight into generate_deck's style_template.
 */

export interface TemplateMeta {
  id: string
  name: string
  category: string
  topic: string
  /** 会员专享 */
  pro: boolean
  /** 封面预览图（inline SVG 缩略图） */
  preview: string
}

export const TEMPLATE_CATEGORIES = ['全部', '商务', '公文', '学术', '科技'] as const

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'biz-blue',
    name: '商务提案 · 深蓝专业风',
    category: '商务',
    topic: '企业汇报 / 商务提案',
    pro: true,
    preview:
      '<svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#0f2a4a"/><rect x="32" y="52" width="72" height="5" rx="2.5" fill="#3fa9f5"/><rect x="32" y="68" width="210" height="16" rx="3" fill="#ffffff"/><rect x="32" y="92" width="150" height="8" rx="2" fill="#c9d8ea"/><rect x="32" y="124" width="64" height="5" rx="2.5" fill="#1f5fbf"/><circle cx="268" cy="140" r="22" fill="#1f5fbf" opacity="0.5"/><circle cx="286" cy="120" r="12" fill="#3fa9f5" opacity="0.6"/></svg>',
  },
  {
    id: 'gov-red',
    name: '党政公文 · 国标红头风',
    category: '公文',
    topic: '公文 / 汇报材料',
    pro: true,
    preview:
      '<svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#ffffff"/><rect width="320" height="10" fill="#c00000"/><rect x="104" y="52" width="112" height="15" rx="3" fill="#1a1a1a"/><rect x="76" y="78" width="168" height="4" rx="2" fill="#c00000"/><rect x="52" y="94" width="216" height="7" rx="2" fill="#b8b8b8"/><rect x="52" y="106" width="190" height="7" rx="2" fill="#d6d6d6"/><rect x="52" y="118" width="200" height="7" rx="2" fill="#d6d6d6"/><circle cx="52" cy="156" r="7" fill="#c00000"/><rect x="66" y="152" width="90" height="6" rx="3" fill="#c00000"/></svg>',
  },
  {
    id: 'academic',
    name: '学术报告 · 简洁学术风',
    category: '学术',
    topic: '学术汇报 / 论文答辩',
    pro: true,
    preview:
      '<svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#ffffff"/><rect x="32" y="34" width="6" height="56" fill="#23496e"/><rect x="48" y="40" width="200" height="15" rx="3" fill="#222222"/><rect x="48" y="64" width="130" height="9" rx="2" fill="#5b8db8"/><rect x="48" y="92" width="180" height="7" rx="2" fill="#9aa5ad"/><rect x="48" y="104" width="160" height="7" rx="2" fill="#c2c9ce"/><rect x="48" y="132" width="120" height="24" rx="3" fill="#f7f9fb" stroke="#dce4ea"/><rect x="176" y="132" width="92" height="24" rx="3" fill="#f7f9fb" stroke="#dce4ea"/></svg>',
  },
  {
    id: 'tech-dark',
    name: '科技产品 · 深色科技风',
    category: '科技',
    topic: '产品发布 / 技术分享',
    pro: true,
    preview:
      '<svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="#0d1117"/><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8ef7"/><stop offset="1" stop-color="#a371f7"/></linearGradient></defs><rect x="32" y="52" width="90" height="5" rx="2.5" fill="url(#tg)"/><rect x="32" y="68" width="220" height="16" rx="3" fill="#e6edf3"/><rect x="32" y="92" width="160" height="8" rx="2" fill="#6e7681"/><rect x="32" y="124" width="76" height="26" rx="6" fill="#1a2130" stroke="#30363d"/><rect x="116" y="124" width="76" height="26" rx="6" fill="#1a2130" stroke="#30363d"/><circle cx="276" cy="40" r="18" fill="url(#tg)" opacity="0.5"/></svg>',
  },
]
