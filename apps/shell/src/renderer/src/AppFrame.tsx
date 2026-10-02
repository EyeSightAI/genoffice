import { useEffect, useState } from 'react'
import { Home } from './Home'
import { Onboarding } from './Onboarding'
import { StarPromptCard } from './StarPromptCard'
import { TabBar } from './TabBar'
import type { TemplateImportStatus } from '../../shared/home-api'

interface AppFrameProps {
  /** resolved before first paint (main.tsx) so home never flashes under the overlay */
  initialOnboardingSeen: boolean
}

export function AppFrame({ initialOnboardingSeen }: AppFrameProps) {
  const [homeActive, setHomeActive] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(!initialOnboardingSeen)
  const [starPromptDocOpens, setStarPromptDocOpens] = useState<number | null>(null)
  const [templateImport, setTemplateImport] = useState<TemplateImportStatus | null>(null)

  useEffect(() => {
    const applyTabs = (tabs: Awaited<ReturnType<typeof window.aiOfficeTabs.list>>) => {
      const active = tabs.find((tab) => tab.active)
      setHomeActive(!active || active.kind === 'home')
    }
    void window.aiOfficeTabs.list().then(applyTabs)
    return window.aiOfficeTabs.onChanged(applyTabs)
  }, [])

  // The "star us" invitation is decided (and counted as shown) by the main
  // process; ask once per session, and never while onboarding is up — a
  // first-run user can't have met the value threshold anyway.
  useEffect(() => {
    if (showOnboarding) return
    let alive = true
    void window.aiOffice.starPromptShouldShow?.().then((result) => {
      if (alive && result.show) setStarPromptDocOpens(result.docOpens)
    })
    return () => {
      alive = false
    }
  }, [showOnboarding])

  // template download toast: shows "downloading…" then clears itself on done/failed
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = window.aiOffice.onTemplateImportStatus?.((ev) => {
      setTemplateImport(ev)
      if (ev.phase === 'done' || ev.phase === 'failed') {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => setTemplateImport(null), 2200)
      }
    })
    return () => {
      off?.()
      if (timer) clearTimeout(timer)
    }
  }, [])

  const finishOnboarding = async (): Promise<boolean> => {
    try {
      const persisted = await window.aiOffice.setOnboardingSeen()
      if (!persisted) return false
      setShowOnboarding(false)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="app-frame">
      <TabBar />
      {/* docs/sheets tabs render as WebContentsView children of this window, positioned
       * by the main process to cover this area — only Home paints its own content here. */}
      <div className="app-frame-content" style={{ visibility: homeActive ? 'visible' : 'hidden' }}>
        <Home />
      </div>
      {/* editor WebContentsViews paint above ALL shell DOM, so the overlay only
       * renders while the home tab is active — it comes back when home does */}
      {showOnboarding && homeActive && <Onboarding onDone={finishOnboarding} />}
      {starPromptDocOpens !== null && !showOnboarding && homeActive && (
        <StarPromptCard docOpens={starPromptDocOpens} onClose={() => setStarPromptDocOpens(null)} />
      )}
      {templateImport && (
        <div className={`template-import-toast template-import-${templateImport.phase}`}>
          {templateImport.phase === 'downloading' && `正在下载模板 ${templateImport.name ?? ''}…`}
          {templateImport.phase === 'done' && '模板已下载，正在打开…'}
          {templateImport.phase === 'failed' && (templateImport.message ?? '下载模板失败')}
        </div>
      )}
    </div>
  )
}
