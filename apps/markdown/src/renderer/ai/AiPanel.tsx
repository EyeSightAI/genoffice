import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from 'react'
import { AgentLoop, composeSkills } from '@genoffice/agent-core'
import type { AiSettings } from '@genoffice/ai-provider'
import { AiComposer, AiTypingIndicator, Markdown } from '@genoffice/ui'
import type { Editor } from '@tiptap/core'
import { aiLangDirective, t as tGlobal, useI18n } from '../i18n/locale'
import sendEnterOn from '../assets/send-enter-on.png'
import sendEnterOff from '../assets/send-enter-off.png'
import sendStop from '../assets/send-stop.png'
import { clearAiHighlights } from '../editor/aiHighlight'
import { createMarkdownSkill } from './markdown-skill'
import { createSearchSkill } from './search-skill'
import { createElectronTransport } from './transport'
import { EditQueueCard } from './EditQueueCard'
import {
  buildQueueInstruction,
  buildQueueSummary,
  liveItems,
  resolveQueue,
  type EditQueueItem,
} from './edit-queue'
import { DOC_NAV_SCHEME, navigateToBlock, parseDocNavHref } from './doc-nav'

// Word-parity count (docs word-count.ts): Asian chars one by one + non-Asian words
const ASIAN_RE =
  /[ᄀ-ᇿ⺀-⿟、-〿぀-ヿ㄀-ㄯ㄰-㆏㇀-ㇿ㐀-䶿一-鿿가-힯豈-﫿！-｠￠-￦]|[\uD840-\uD87F][\uDC00-\uDFFF]/g
const NON_ASIAN_WORD_RE = /[A-Za-z0-9À-ɏ]+(?:['-][A-Za-z0-9À-ɏ]+)*/g

function countWords(text: string): number {
  return (text.match(ASIAN_RE) ?? []).length + (text.match(NON_ASIAN_WORD_RE) ?? []).length
}

const PANEL_WIDTH_KEY = 'markdown-ai-panel-width'
const PANEL_WIDTH_DEFAULT = 360
const PANEL_WIDTH_MIN = 280
const MAX_SNAPSHOTS = 20
const TOOL_OUTPUT_MAX_CHARS = 2000

function clampPanelWidth(w: number): number {
  // The viewport can be transiently tiny (a WebContentsView is 0×0 until the
  // shell lays it out), so never let the ceiling drop below the minimum
  const max = Math.max(PANEL_WIDTH_MIN, Math.min(720, Math.round(window.innerWidth * 0.6)))
  return Math.min(Math.max(w, PANEL_WIDTH_MIN), max)
}

function loadPanelWidth(): number {
  const saved = Number(localStorage.getItem(PANEL_WIDTH_KEY))
  // static bounds only — clamping against the window here would bake a
  // transiently small viewport into the restored preference
  return Number.isFinite(saved) && saved > 0
    ? Math.min(Math.max(saved, PANEL_WIDTH_MIN), 720)
    : PANEL_WIDTH_DEFAULT
}

interface ToolActivity {
  name: string
  summary: string
  /** still executing: rendered as a spinner chip, replaced in place when the tool finishes */
  running?: boolean
  isError?: boolean
  output?: string
}

interface ChatEntry {
  role: 'user' | 'assistant'
  text: string
  streaming?: boolean
  isError?: boolean
  /** the run failed and this user message was rolled back out of the model context */
  undelivered?: boolean
  tools?: ToolActivity[]
}

/** structured, not the serialized file text: a body starting with `---` must
 *  never be re-parsed as a frontmatter block on rollback */
export interface DocSnapshot {
  /** document body as markdown */
  body: string
  /** raw frontmatter block (fences included), kept byte-for-byte */
  frontmatter: string
}

interface Snapshot {
  label: string
  time: string
  doc: DocSnapshot
}

/** Ribbon preset instruction; a new nonce triggers one auto-send */
export interface AiPreset {
  text: string
  nonce: number
}

export interface MarkdownAiDeps {
  getEditor(): Editor | null
  /** inner YAML of the properties block, read synchronously (write-then-read within one run) */
  getFrontmatter(): string
  /** replace the properties block; empty string removes it */
  setFrontmatter(inner: string): void
  /** document body + frontmatter, for pre-mutation snapshots */
  getSnapshot(): DocSnapshot
  /** rollback: replace the document (body and frontmatter) with a snapshot */
  restoreSnapshot(snapshot: DocSnapshot): void
  /** fired when a run with at least one mutation finishes (auto-save hook) */
  onRunDone(mutated: boolean): void
}

export function AiPanel({
  deps,
  filePath,
  preset,
  onCollapse,
  editQueue = [],
  onQueueEditInstruction,
  onQueueRemove,
  onQueueClear,
  onQueueFocus,
  onQueueConsume,
}: {
  deps: MarkdownAiDeps
  filePath: string | null
  preset?: AiPreset | null
  onCollapse: () => void
  /** queued selection-scoped edits (owned by App, which also owns the anchors) */
  editQueue?: EditQueueItem[]
  onQueueEditInstruction?: (qid: string, instruction: string) => void
  onQueueRemove?: (qid: string) => void
  onQueueClear?: () => void
  onQueueFocus?: (qid: string) => void
  onQueueConsume?: (qids: string[]) => void
}): ReactElement {
  const { lang, t } = useI18n()
  const [chat, setChat] = useState<ChatEntry[]>([])
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  // bumped on selection/doc changes so the scope chip & queue rows stay fresh
  const [, setScopeTick] = useState(0)
  /** the scope chip's expandable preview of the selected text */
  const [scopePreviewOpen, setScopePreviewOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const stickToBottomRef = useRef(true)
  // preferred = the user's chosen width (the only value persisted); panelWidth =
  // what fits the current window. Deriving the display width from the preference
  // means a transiently small window never permanently shrinks the panel.
  const preferredWidthRef = useRef(loadPanelWidth())
  const [panelWidth, setPanelWidth] = useState(() => clampPanelWidth(preferredWidthRef.current))
  const [resizing, setResizing] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const dock = asideRef.current?.closest('.ai-dock') as HTMLElement | null
    dock?.style.setProperty('--ai-panel-width', `${panelWidth}px`)
  }, [panelWidth])

  const settingsRef = useRef<AiSettings | null>(null)
  const langRef = useRef(lang)
  langRef.current = lang
  const depsRef = useRef(deps)
  depsRef.current = deps
  const filePathRef = useRef(filePath)
  /** instruction of the in-flight run, labels its rollback snapshot */
  const runInstructionRef = useRef('')
  /** what the user saw for that instruction (queue submissions show a summary) */
  const runDisplayRef = useRef('')
  const runMutatedRef = useRef(false)
  /** tool activity of the whole run, for transcript persistence */
  const runToolsRef = useRef<ToolActivity[]>([])
  const chatIdsRef = useRef<{ projectId: string; chatId: string } | null>(null)
  /** messages sent before resolveChat returned, flushed once the chat id is known */
  const pendingPersistRef = useRef<
    Array<{ role: 'user' | 'assistant'; text: string; tools?: ToolActivity[] }>
  >([])

  const patchLast = (patch: Partial<ChatEntry> | ((last: ChatEntry) => Partial<ChatEntry>)) => {
    setChat((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (!last || last.role !== 'assistant') return prev
      next[next.length - 1] = { ...last, ...(typeof patch === 'function' ? patch(last) : patch) }
      return next
    })
  }

  const persistMessage = (role: 'user' | 'assistant', text: string, tools?: ToolActivity[]) => {
    const ids = chatIdsRef.current
    if (!window.projectApi) return
    if (!ids) {
      pendingPersistRef.current.push({ role, text, tools })
      return
    }
    void window.projectApi
      .appendChat({
        projectId: ids.projectId,
        chatId: ids.chatId,
        role,
        text,
        ...(tools && tools.length > 0 ? { tools } : {}),
      })
      .catch(() => {
        /* persistence failures are silent */
      })
  }

  // The loop is built once; every mutable value goes through a ref getter
  const loopRef = useRef<AgentLoop<DocSnapshot> | null>(null)
  if (!loopRef.current) {
    loopRef.current = new AgentLoop<DocSnapshot>({
      transport: createElectronTransport(() => settingsRef.current!),
      skill: composeSkills('markdown+search', '', [
        createMarkdownSkill(() => depsRef.current.getEditor(), {
          read: () => depsRef.current.getFrontmatter(),
          write: (inner) => depsRef.current.setFrontmatter(inner),
        }),
        createSearchSkill(),
      ]),
      captureSnapshot: () => depsRef.current.getSnapshot(),
      systemSuffix: () => aiLangDirective(langRef.current),
      events: {
        onText: (text) => patchLast({ text }),
        onToolStart: (call) => {
          // Live "running" chip: replaced in place by onToolExecuted
          patchLast((last) => ({
            tools: [
              ...(last.tools ?? []),
              { name: call.name, summary: call.name.replace(/[_-]+/g, ' '), running: true },
            ],
          }))
        },
        onToolExecuted: ({ call, execution, snapshotBefore }) => {
          if (execution.mutated) runMutatedRef.current = true
          if (snapshotBefore !== undefined) {
            const label = runInstructionRef.current.slice(0, 40)
            const time = new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            setSnapshots((prev) =>
              [...prev, { label, time, doc: snapshotBefore }].slice(-MAX_SNAPSHOTS),
            )
          }
          const activity: ToolActivity = {
            name: call.name,
            summary: execution.summary,
            isError: execution.isError,
            output: execution.output?.slice(0, TOOL_OUTPUT_MAX_CHARS),
          }
          runToolsRef.current.push(activity)
          patchLast((last) => {
            // Swap out the running placeholder pushed by onToolStart (parse-fail calls have none)
            const tools = [...(last.tools ?? [])]
            if (tools.at(-1)?.running) tools.pop()
            return { tools: [...tools, activity] }
          })
        },
        onTurnEnd: () => {
          patchLast({ streaming: false })
          setChat((prev) => [...prev, { role: 'assistant', text: '', streaming: true }])
        },
        onDone: ({ text, cancelled, turnLimit, truncated }) => {
          const base = turnLimit
            ? [text, tGlobal('aiTurnLimit')].filter(Boolean).join('\n\n')
            : text || (cancelled ? tGlobal('aiStopped') : '')
          // A reasoning model can spend the entire output budget on thinking and close the
          // turn with finish_reason=length and no prose at all — the bare "(no reply)" read
          // as the assistant ignoring the user. Name the truncation, as docs already does.
          const final = truncated
            ? [base, tGlobal('aiTruncatedNote')].filter(Boolean).join('\n\n')
            : base
          patchLast((last) => ({
            streaming: false,
            text: final || (last.tools?.length ? last.text : tGlobal('aiNoReply')),
            // A stop mid-tool can leave a running placeholder behind — drop it
            tools: last.tools?.filter((tl) => !tl.running),
          }))
          persistMessage('assistant', final, runToolsRef.current)
          const editor = depsRef.current.getEditor()
          if (editor) clearAiHighlights(editor)
          depsRef.current.onRunDone(runMutatedRef.current)
          setBusy(false)
        },
        onError: (error) => {
          setChat((prev) => {
            const next = [...prev]
            for (let i = next.length - 1; i >= 0; i--) {
              const entry = next[i]!
              if (entry.role === 'user') {
                next[i] = { ...entry, undelivered: true }
                break
              }
            }
            const last = next.at(-1)
            if (last?.role === 'assistant') {
              next[next.length - 1] = {
                ...last,
                streaming: false,
                text: error,
                isError: true,
                tools: last.tools?.filter((tl) => !tl.running),
              }
            }
            return next
          })
          setBusy(false)
        },
      },
    })
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      loopRef.current?.cancel()
      const editor = depsRef.current.getEditor()
      if (editor) clearAiHighlights(editor)
    }
  }, [])

  // ── chat-history persistence: bind to the file, restore prior transcript ──
  useEffect(() => {
    const api = window.projectApi
    if (!api) return
    const tempChatId = `unsaved-${Date.now()}`
    void api
      .resolveChat({ filePath: filePathRef.current ?? null, tempChatId })
      .then((ids) => {
        chatIdsRef.current = ids
        for (const msg of pendingPersistRef.current.splice(0)) {
          persistMessage(msg.role, msg.text, msg.tools)
        }
        return api.loadChat({ projectId: ids.projectId, chatId: ids.chatId, limit: 200 })
      })
      .then((msgs) => {
        if (msgs.length === 0) return
        // the user may have sent a message while history was loading — never
        // replace a live transcript (and don't clobber the loop context)
        let applied = false
        setChat((prev) => {
          if (prev.length > 0) return prev
          applied = true
          return msgs.map((m) => ({
            role: m.role,
            text: m.text,
            tools: m.tools?.map((tool) => ({
              name: tool.name,
              summary: tool.summary,
              isError: tool.isError,
              output: tool.output ? tool.output.slice(0, TOOL_OUTPUT_MAX_CHARS) : undefined,
            })),
          }))
        })
        if (applied && !loopRef.current?.busy) {
          loopRef.current?.restore(msgs.map((m) => ({ role: m.role, text: m.text })))
        }
      })
      .catch(() => {
        /* history load failures are silent */
      })
  }, [])

  /** after an untitled document's first save, bind the unsaved-* history to the real path */
  useEffect(() => {
    filePathRef.current = filePath
    const ids = chatIdsRef.current
    if (!window.projectApi || !ids || !filePath || !ids.chatId.startsWith('unsaved-')) return
    void window.projectApi
      .rebindChat({ projectId: ids.projectId, tempChatId: ids.chatId, newFilePath: filePath })
      .then((r) => {
        if (r?.chatId) chatIdsRef.current = r
      })
      .catch(() => {
        /* silent */
      })
  }, [filePath])

  useEffect(() => {
    if (stickToBottomRef.current) {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight })
    }
  }, [chat, busy])

  const onChatScroll = (): void => {
    const el = chatRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  const send = (text: string, displayText?: string): void => {
    const instruction = text.trim()
    const loop = loopRef.current
    if (!instruction || !loop || loop.busy) return
    stickToBottomRef.current = true
    runInstructionRef.current = instruction
    runDisplayRef.current = displayText ?? instruction
    runMutatedRef.current = false
    runToolsRef.current = []
    setChat((prev) => [
      ...prev,
      { role: 'user', text: displayText ?? instruction },
      { role: 'assistant', text: '', streaming: true },
    ])
    setPrompt('')
    setBusy(true)
    // persist what the user saw — a restored transcript must not surface the
    // internal batch protocol text behind a queue submission
    persistMessage('user', displayText ?? instruction)
    void (async () => {
      try {
        settingsRef.current = await window.markdownApi.getAiSettings()
        if (!mountedRef.current) return
        await loop.run(instruction)
      } catch (err) {
        if (!mountedRef.current) return
        patchLast({
          streaming: false,
          text: err instanceof Error ? err.message : String(err),
          isError: true,
        })
        setBusy(false)
      }
    })()
  }

  const stop = (): void => loopRef.current?.cancel()

  const retry = (): void => send(runInstructionRef.current, runDisplayRef.current)

  // keep the scope chip & queue rows in sync with the editor selection/content
  useEffect(() => {
    const editor = depsRef.current.getEditor()
    if (!editor) return
    const bump = () => {
      if (editor.state.selection.empty) setScopePreviewOpen(false)
      setScopeTick((tick) => tick + 1)
    }
    editor.on('selectionUpdate', bump)
    editor.on('update', bump)
    return () => {
      editor.off('selectionUpdate', bump)
      editor.off('update', bump)
    }
  }, [])

  // scope chip data, recomputed per render (the scope tick above keeps it fresh)
  const editor = depsRef.current.getEditor()
  const liveSelection = editor?.state.selection
  const selectionText =
    !editor || !liveSelection || liveSelection.empty
      ? ''
      : editor.state.doc.textBetween(liveSelection.from, liveSelection.to, '\n', ' ').trim()
  const hasScopeSelection = selectionText.length > 0

  /** the × on the scope chip: collapse the selection so the run targets the whole document */
  const clearScopeSelection = (): void => {
    if (editor) editor.commands.setTextSelection(editor.state.selection.to)
  }

  /** [label](mdnav://block/N) links in replies select and scroll to that block */
  const docNav = {
    scheme: DOC_NAV_SCHEME,
    onNavigate: (href: string) => {
      const index = parseDocNavHref(href)
      const current = depsRef.current.getEditor()
      if (index !== null && current) navigateToBlock(current, index)
    },
  }

  /** submit every still-anchored queued edit as one batch run */
  const sendQueue = (): void => {
    const loop = loopRef.current
    const current = depsRef.current.getEditor()
    if (!loop || loop.busy || editQueue.length === 0 || !current) return
    const entries = liveItems(resolveQueue(current, editQueue))
    if (entries.length === 0) {
      onQueueClear?.()
      return
    }
    const instruction = buildQueueInstruction(entries)
    const display = buildQueueSummary(t('aiQueueSubmitted', { count: entries.length }), entries)
    // consumed at send: the run rewrites the anchored passages, which would
    // orphan the anchors anyway; a failed run is retried via the retry action
    onQueueConsume?.(editQueue.map((item) => item.qid))
    send(instruction, display)
  }

  // ribbon presets auto-send; while a run is active they land in the composer instead
  const presetNonceRef = useRef(0)
  useEffect(() => {
    if (!preset || preset.nonce === presetNonceRef.current) return
    presetNonceRef.current = preset.nonce
    if (loopRef.current?.busy) setPrompt(preset.text)
    else send(preset.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const copyMessage = (text: string, idx: number): void => {
    void navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    window.setTimeout(() => setCopiedIdx((cur) => (cur === idx ? null : cur)), 1200)
  }

  const rollback = (snapshot: Snapshot): void => {
    if (busy) return
    depsRef.current.restoreSnapshot(snapshot.doc)
    setSnapshots((prev) => prev.filter((s) => s !== snapshot))
  }

  // Re-derive the display width on window resize (max is 60% of the window);
  // growing the window back restores the preferred width
  useEffect(() => {
    const onResize = (): void => setPanelWidth(clampPanelWidth(preferredWidthRef.current))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const resizeCleanupRef = useRef<(() => void) | null>(null)
  useEffect(() => () => resizeCleanupRef.current?.(), [])

  /** Drag the right edge to resize: the panel is flush with the window's left edge, so width = clientX */
  const startResize = (e: ReactPointerEvent<HTMLDivElement>): void => {
    e.preventDefault()
    const resizer = e.currentTarget
    setResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const onMove = (ev: PointerEvent): void => {
      const w = clampPanelWidth(ev.clientX)
      preferredWidthRef.current = w
      setPanelWidth(w)
    }
    let done = false
    const cleanup = (): void => {
      if (done) return
      done = true
      resizeCleanupRef.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', cleanup)
      window.removeEventListener('pointercancel', cleanup)
      resizer.removeEventListener('lostpointercapture', cleanup)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setResizing(false)
      localStorage.setItem(PANEL_WIDTH_KEY, String(Math.round(preferredWidthRef.current)))
    }
    resizeCleanupRef.current = cleanup
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', cleanup)
    window.addEventListener('pointercancel', cleanup)
    resizer.addEventListener('lostpointercapture', cleanup)
    resizer.setPointerCapture(e.pointerId)
  }

  return (
    <aside
      ref={asideRef}
      className={`copilot${resizing ? ' ai-panel-resizing' : ''}`}
      style={{ width: '100%' }}
    >
      <div
        className="ai-panel-resizer"
        onPointerDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="AI 助手"
      />
      <header className="ai-panel-header">
        <span className="ai-panel-title">
          <GensparkMark size={26} />
          AI 助手
        </span>
        <div className="ai-panel-header-actions">
          {chat.length > 0 && (
            <button
              className="ai-header-btn"
              onClick={() => {
                stop()
                loopRef.current?.reset()
                setBusy(false)
                setChat([])
              }}
              data-tip={t('aiNewChat')}
              aria-label={t('aiNewChat')}
            >
              <IconNewChat />
            </button>
          )}
          <button
            className="ai-header-btn"
            onClick={onCollapse}
            data-tip={t('aiCollapsePanel')}
            aria-label={t('aiCollapsePanel')}
          >
            <IconCollapse />
          </button>
        </div>
      </header>

      <div className="ai-chat" ref={chatRef} onScroll={onChatScroll}>
        {chat.length === 0 && (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-title">{t('aiEmptyTitle')}</div>
            <div className="ai-chat-empty-body">{t('aiEmptyBody')}</div>
            <div className="ai-starter-list">
              <button
                className="ai-starter"
                onClick={() => {
                  setPrompt(t('aiQuickDraftPrompt'))
                  inputRef.current?.focus()
                }}
              >
                {t('aiQuickDraft')}
              </button>
              <button
                className="ai-starter"
                onClick={() => {
                  setPrompt(t('aiQuickPolishPrompt'))
                  inputRef.current?.focus()
                }}
              >
                {t('aiQuickPolish')}
              </button>
            </div>
          </div>
        )}
        {chat.map((entry, i) => {
          if (entry.role === 'user') {
            return (
              <div key={i} className="ai-msg ai-msg-user">
                {entry.text}
                {entry.undelivered && (
                  <div className="ai-msg-undelivered">
                    {t('aiUndelivered')}
                    {!busy && (
                      <button className="ai-retry-btn" onClick={() => send(entry.text)}>
                        {t('aiRetry')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          }
          const hasTools = (entry.tools?.length ?? 0) > 0
          if (!entry.text && !entry.streaming && !hasTools) return null
          const isLast = i === chat.length - 1
          // Action row appears once per completed reply: on the turn's final segment only
          // (mid-turn segments have a following assistant entry; the live turn ends when !busy)
          const nextEntry = chat[i + 1]
          const turnEnded = nextEntry ? nextEntry.role === 'user' : !busy
          const showToolbar = !entry.streaming && turnEnded && !!entry.text && !entry.isError
          return (
            <div
              key={i}
              className={`ai-msg ai-msg-assistant${entry.isError ? ' ai-msg-error' : ''}${entry.streaming ? ' ai-msg-streaming' : ''}`}
            >
              {!entry.text && entry.streaming ? (
                <span className="ai-typing-row">
                  <AiTypingIndicator label={hasTools ? t('aiWorking') : t('aiThinking')} />
                </span>
              ) : (
                entry.text && <Markdown text={entry.text} nav={docNav} />
              )}
              {hasTools && <ToolChipList tools={entry.tools!} />}
              {showToolbar && (
                <div className="ai-msg-toolbar">
                  <button
                    className="ai-msg-tool-btn"
                    onClick={() => copyMessage(entry.text, i)}
                    aria-label={t('aiCopyReplyTitle')}
                    data-tip={t('aiCopyReplyTitle')}
                  >
                    {copiedIdx === i ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M14.6113 5.34253C16.0608 5.3428 17.2363 6.518 17.2363 7.96753V15.5066C17.2361 16.956 16.0607 18.1313 14.6113 18.1316H7.07227C5.62267 18.1316 4.44751 16.9561 4.44727 15.5066V7.96753C4.44732 6.51783 5.62255 5.34253 7.07227 5.34253H14.6113ZM7.07227 6.59253C6.31291 6.59253 5.69732 7.20819 5.69727 7.96753V15.5066C5.69751 16.2658 6.31302 16.8816 7.07227 16.8816H14.6113C15.3703 16.8813 15.9861 16.2656 15.9863 15.5066V7.96753C15.9863 7.20835 15.3705 6.5928 14.6113 6.59253H7.07227ZM10.0176 2.8689C10.3626 2.86905 10.6426 3.14882 10.6426 3.4939C10.6425 3.83888 10.3626 4.11874 10.0176 4.1189H4.59961C3.84022 4.1189 3.22461 4.73451 3.22461 5.4939V11.324C3.22433 11.6689 2.94461 11.949 2.59961 11.949C2.25461 11.949 1.97489 11.6689 1.97461 11.324V5.4939C1.97461 4.04415 3.14987 2.8689 4.59961 2.8689H10.0176Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>
                  {isLast && !busy && runInstructionRef.current && (
                    <button
                      className="ai-msg-tool-btn"
                      onClick={retry}
                      aria-label={t('aiRegenerateTitle')}
                      data-tip={t('aiRegenerateTitle')}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M 12.68 6.65 a 4.86 4.86 0 0 0 -9 -1.08 M 3.32 9.35 a 4.86 4.86 0 0 0 9 1.08" />
                        <path d="M 12.95 3.05 v 2.7 h -2.7 M 3.05 12.95 v -2.7 h 2.7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {snapshots.length > 0 && (
        <div className="ai-versions">
          <div className="ai-versions-title">
            <IconClock />
            {t('aiSnapshotsTitle')}
          </div>
          {snapshots.map((s, i) => (
            <div key={i} className="ai-version-row">
              <span className="ai-version-label" data-tip={s.label}>
                <span className="ai-version-time">{s.time}</span>
                {s.label}
              </span>
              <button className="ai-version-rollback" disabled={busy} onClick={() => rollback(s)}>
                {t('aiRollback')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="ai-composer">
        {editor && editQueue.length > 0 && (
          <EditQueueCard
            items={editQueue}
            editor={editor}
            busy={busy}
            onEditInstruction={(qid, instruction) => onQueueEditInstruction?.(qid, instruction)}
            onRemove={(qid) => onQueueRemove?.(qid)}
            onDiscardAll={() => onQueueClear?.()}
            onSend={sendQueue}
            onFocus={(qid) => onQueueFocus?.(qid)}
          />
        )}
        <AiComposer
          value={prompt}
          busy={busy}
          header={
            hasScopeSelection && (
              <div className="ai-scope-row">
                <span className="ai-scope-hint">
                  <button
                    className="ai-scope-label"
                    onClick={() => setScopePreviewOpen((v) => !v)}
                    aria-expanded={scopePreviewOpen}
                    data-tip={t('aiScopeSelectionTip')}
                  >
                    {t('aiScopeSelection', { words: countWords(selectionText) })}
                  </button>
                  <button
                    className="ai-scope-clear"
                    onClick={clearScopeSelection}
                    data-tip={t('aiScopeClearTitle')}
                    aria-label={t('aiScopeClearTitle')}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden>
                      <path
                        d="M4 4l8 8M12 4l-8 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </span>
                {scopePreviewOpen && (
                  <div className="ai-scope-preview">
                    {selectionText.length > 400 ? `${selectionText.slice(0, 400)}…` : selectionText}
                  </div>
                )}
              </div>
            )
          }
          placeholder={t('aiComposerPlaceholder')}
          hintIdle={t('aiHintIdle')}
          hintBusy={t('aiHintBusy')}
          sendLabel={t('aiSend')}
          stopLabel={t('aiStop')}
          iconOnly
          sendIconEnabled={<img src={sendEnterOn} alt="" aria-hidden />}
          sendIconDisabled={<img src={sendEnterOff} alt="" aria-hidden />}
          stopIcon={<img src={sendStop} alt="" aria-hidden />}
          textareaRef={inputRef}
          onChange={setPrompt}
          onSend={() => send(prompt)}
          onStop={stop}
        />
      </div>
    </aside>
  )
}

/** Step-row status icons (timeline glyphs, unified with the other apps) */
function StepIcon({ status }: { status: 'running' | 'done' | 'error' }) {
  if (status === 'running') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6.5 3.5h11M6.5 20.5h11M8 3.5v3.2c0 2.6 4 4.2 4 5.3 0 1.1 4 2.7 4 5.3v3.2M16 3.5v3.2c0 2.6-4 4.2-4 5.3 0 1.1-4 2.7-4 5.3v3.2" />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.4 2.4 2.4 4.6-5" />
    </svg>
  )
}

/** Tool activity group (docs parity): auto-opens while tools run, auto-collapses into
 *  "Worked · N steps" when they finish; a manual toggle always wins */
function ToolChipList({ tools }: { tools: ToolActivity[] }) {
  const { t: tr } = useI18n()
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [userOpen, setUserOpen] = useState<boolean | null>(null)

  const toggle = (j: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(j)) next.delete(j)
      else next.add(j)
      return next
    })
  }

  const anyRunning = tools.some((tool) => tool.running)
  const open = userOpen ?? anyRunning
  const label = anyRunning ? tr('aiGroupWorking') : tr('aiWorkedSteps', { n: tools.length })

  return (
    <div className="ai-work-group">
      <button
        type="button"
        className={`ai-work-group-summary${anyRunning ? ' running' : ''}`}
        aria-expanded={open}
        onClick={() => setUserOpen(!open)}
      >
        {anyRunning && !open && <span className="ai-tool-chip-spinner" aria-hidden />}
        <span className="ai-work-group-label">{label}</span>
        <span className={`ai-tool-chip-caret${open ? ' open' : ''}`} aria-hidden>
          ›
        </span>
      </button>
      <div className={`ai-work-group-body${open ? ' open' : ''}`}>
        <div className="ai-work-group-body-inner">
          {tools.map((tool, j) => {
            const hasOutput = !tool.running && !!tool.output
            const isOpen = expanded.has(j)
            const stepStatus = tool.running ? 'running' : tool.isError ? 'error' : 'done'
            return (
              <div key={j} className="ai-step-row">
                <span className={`ai-step-icon ${stepStatus}`} aria-hidden>
                  <StepIcon status={stepStatus} />
                </span>
                <div className="ai-step-content">
                  {hasOutput ? (
                    <button
                      type="button"
                      className="ai-step-title clickable"
                      data-tip={tool.name}
                      aria-expanded={isOpen}
                      onClick={() => toggle(j)}
                    >
                      {tool.summary}
                    </button>
                  ) : (
                    <span className="ai-step-title" data-tip={tool.name}>
                      {tool.summary}
                    </span>
                  )}
                  {hasOutput && isOpen && (
                    <div className="ai-step-detail">
                      <div className="ai-tool-output">
                        <div className="ai-tool-output-pre">{tool.output}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Svg({ children }: { children: ReactNode }): ReactElement {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

function IconNewChat(): ReactElement {
  return (
    <Svg>
      <path
        d="M13.5 7.2v-3A1.7 1.7 0 0 0 11.8 2.5H4.2a1.7 1.7 0 0 0-1.7 1.7v6.1a1.7 1.7 0 0 0 1.7 1.7h1.1v2l2.6-2h1.3"
        strokeLinejoin="round"
      />
      <path d="M12.2 9.4v4M10.2 11.4h4" />
    </Svg>
  )
}

function IconCollapse(): ReactElement {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="1.5" y="2.5" width="13" height="11" rx="1" />
      <path d="M5.5 2.5v11" />
      <path d="M12.5 8H8.1M9.8 5.9 7.7 8l2.1 2.1" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock(): ReactElement {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.8V8l2.2 1.6" />
    </svg>
  )
}

/** Genspark brand mark, inline for crisp device-resolution rendering */
export function GensparkMark({ size = 18 }: { size?: number }): React.JSX.Element {
  return <img src="data:image/png;base64,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" width={size} height={size} alt="" />
}
