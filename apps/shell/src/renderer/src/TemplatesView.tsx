/**
 * UToOffice template gallery (模块化独立组件 — Home 只引用它).
 *
 * Grid of preset templates with category tabs, SVG preview thumbnails, a
 * membership lock on pro templates, and a "一键做同款" preview flow that
 * opens the slides editor preloaded with the chosen template.
 */

import { useEffect, useState } from 'react'
import { useI18n } from './locale'
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateMeta } from './templates'

export function TemplatesView() {
  const { t } = useI18n()
  const [category, setCategory] = useState<string>('全部')
  const [isPro, setIsPro] = useState(false)
  const [preview, setPreview] = useState<TemplateMeta | null>(null)

  useEffect(() => {
    let alive = true
    void window.aiOffice.membershipStatus?.().then((m) => {
      if (alive) setIsPro(m?.isPro ?? false)
    })
    return () => {
      alive = false
    }
  }, [])

  const filtered = category === '全部' ? TEMPLATES : TEMPLATES.filter((x) => x.category === category)

  const makeSame = (tpl: TemplateMeta) => {
    if (tpl.pro && !isPro) {
      void window.aiOffice.membershipOpenPurchase?.()
      return
    }
    void window.aiOffice.openTemplate(tpl.name)
  }

  return (
    <div style={{ padding: '24px 32px', overflowY: 'auto', height: '100%' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 16px', fontWeight: 600 }}>{t('navTemplates')}</h1>

      {/* 分类标签 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '6px 16px',
              fontSize: 13,
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: category === c ? 'var(--accent)' : 'transparent',
              color: category === c ? '#fff' : 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 模板网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setPreview(tpl)}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--card)',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
            }}
          >
            <div
              style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: tpl.preview }}
            />
            <div style={{ padding: '10px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {tpl.pro && !isPro && <span aria-hidden>🔒</span>}
              {tpl.name}
            </div>
          </button>
        ))}
      </div>

      {/* 预览弹窗 + 一键做同款 */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              borderRadius: 12,
              padding: 20,
              width: 560,
              maxWidth: '90vw',
            }}
          >
            <div
              style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: preview.preview }}
            />
            <h3 style={{ margin: '14px 0 4px', fontSize: 16 }}>{preview.name}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>
              {preview.topic}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => makeSame(preview)}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {preview.pro && !isPro ? '解锁并做同款' : '一键做同款'}
              </button>
              <button
                onClick={() => setPreview(null)}
                style={{
                  padding: '10px 16px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
