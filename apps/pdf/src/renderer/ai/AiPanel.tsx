import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactElement } from 'react'
import { AgentLoop } from '@genoffice/agent-core'
import type { AiSettings } from '@genoffice/ai-provider'
import { AiComposer, AiTypingIndicator } from '@genoffice/ui'
import { aiLangDirective, t as tGlobal, useI18n } from '../i18n/locale'
import { Markdown } from '@genoffice/ui'
import sendEnterOn from '../assets/send-enter-on.png'
import sendEnterOff from '../assets/send-enter-off.png'
import sendStop from '../assets/send-stop.png'
import { createPdfSkill } from './pdf-skill'
import { createElectronTransport } from './transport'
import { PDF_NAV_SCHEME, parsePdfNavHref } from './pdf-nav'
import type { PdfAiDeps } from './tools'

// Word-parity count (same as docs/markdown): Asian chars one by one + non-Asian words
const ASIAN_RE =
  /[ᄀ-ᇿ⺀-⿟、-〿぀-ヿ㄀-ㄯ㄰-㆏㇀-ㇿ㐀-䶿一-鿿가-힯豈-﫿！-｠￠-￦]|[\uD840-\uD87F][\uDC00-\uDFFF]/g
const NON_ASIAN_WORD_RE = /[A-Za-z0-9À-ɏ]+(?:['-][A-Za-z0-9À-ɏ]+)*/g

function countWords(text: string): number {
  return (text.match(ASIAN_RE) ?? []).length + (text.match(NON_ASIAN_WORD_RE) ?? []).length
}

const PANEL_WIDTH_KEY = 'pdf-ai-panel-width'
const PANEL_WIDTH_DEFAULT = 360
const PANEL_WIDTH_MIN = 280

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

type Phase = 'thinking' | 'replying' | 'working'

export function AiPanel({
  api,
  filePath,
  onCollapse,
  preset,
  onRunDone,
  onClearSelection,
}: {
  api: PdfAiDeps
  /** Absolute path of the open PDF (chat history is keyed to it) */
  filePath?: string
  onCollapse: () => void
  /** Ribbon AI buttons push a one-shot prompt; a new nonce triggers an auto-run */
  preset?: { text: string; nonce: number } | null
  /** Fired when a run that mutated the document finishes (drives the untitled-blank auto-save) */
  onRunDone?: () => void
  /** The × on the scope chip: drop the cached selection so runs target the whole document */
  onClearSelection?: () => void
}): ReactElement {
  const { lang, t } = useI18n()
  const [chat, setChat] = useState<ChatEntry[]>([])
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState<Phase>('thinking')
  /** the scope chip's expandable preview of the selected text */
  const [scopePreviewOpen, setScopePreviewOpen] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)

  // ── Chat-history persistence (r142): same shared store Docs/Sheets use ──
  const chatIdsRef = useRef<{ projectId: string; chatId: string } | null>(null)
  /** current turn's streamed text; completed turns collect into runTextsRef */
  const segTextRef = useRef('')
  /** whole-run accumulation: one stored assistant message per run (consecutive
      assistant rows would break restore() on strict-alternation providers) */
  const runTextsRef = useRef<string[]>([])
  const runToolsRef = useRef<ToolActivity[]>([])
  const chatStore = () =>
    (
      window as Window & {
        projectApi?: {
          resolveChat(args: {
            filePath: string | null
            tempChatId?: string
          }): Promise<{ projectId: string; chatId: string }>
          appendChat(args: {
            projectId: string
            chatId: string
            role: 'user' | 'assistant'
            text: string
            tools?: Array<{ name: string; summary: string; isError?: boolean; output?: string }>
          }): Promise<void>
          loadChat(args: { projectId: string; chatId: string; limit?: number }): Promise<
            Array<{
              role: 'user' | 'assistant'
              text: string
              tools?: Array<{ name: string; summary: string; isError?: boolean; output?: string }>
            }>
          >
          rebindChat(args: {
            projectId: string
            tempChatId: string
            newFilePath: string
          }): Promise<{ projectId: string; chatId: string } | null>
        }
      }
    ).projectApi
  const persistMessage = (
    role: 'user' | 'assistant',
    text: string,
    tools?: ToolActivity[],
  ): void => {
    const ids = chatIdsRef.current
    const store = chatStore()
    if (!ids || !store || (!text && !tools?.length)) return
    void store
      .appendChat({
        projectId: ids.projectId,
        chatId: ids.chatId,
        role,
        text,
        ...(tools && tools.length > 0
          ? {
              tools: tools.map((tool) => ({
                name: tool.name,
                summary: tool.summary,
                isError: tool.isError,
                output: tool.output,
              })),
            }
          : {}),
      })
      .catch(() => {
        /* silent */
      })
  }
  /** persist the whole run as ONE assistant message (docs parity: restore()
      feeds these back verbatim, and providers require user/assistant
      alternation; cancelled runs persist nothing — the unanswered user
      message is filtered out by restore()) */
  const persistRun = (): void => {
    const texts = [...runTextsRef.current, segTextRef.current].filter(Boolean)
    const tools = runToolsRef.current
    segTextRef.current = ''
    runTextsRef.current = []
    runToolsRef.current = []
    if (texts.length > 0 || tools.length > 0) {
      persistMessage('assistant', texts.join('\n\n'), tools)
    }
  }
  useEffect(() => {
    const store = chatStore()
    if (!store) return
    const tempChatId = `unsaved-${Date.now()}`
    void store
      .resolveChat({ filePath: filePath || null, tempChatId })
      .then((ids) => {
        chatIdsRef.current = ids
        return store.loadChat({ projectId: ids.projectId, chatId: ids.chatId, limit: 200 })
      })
      .then((msgs) => {
        if (msgs.length === 0) return
        setChat((prev) => [
          ...msgs.map((m) => ({
            role: m.role,
            text: m.text,
            tools: m.tools?.map((tool) => ({
              name: tool.name,
              summary: tool.summary,
              isError: tool.isError,
              output: tool.output,
            })),
          })),
          ...prev,
        ])
        // follow-ups after reopening continue the previous conversation
        loopRef.current?.restore(msgs.map((m) => ({ role: m.role, text: m.text })))
      })
      .catch(() => {
        /* history load failures are silent */
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only, like Docs
  }, [])
  /** blank/generated PDFs get a path on first save: bind the unsaved-* history to it */
  useEffect(() => {
    const ids = chatIdsRef.current
    const store = chatStore()
    if (!store || !ids || !filePath || !ids.chatId.startsWith('unsaved-')) return
    void store
      .rebindChat({ projectId: ids.projectId, tempChatId: ids.chatId, newFilePath: filePath })
      .then((rebound) => {
        if (rebound?.chatId) chatIdsRef.current = rebound
      })
      .catch(() => {
        /* silent */
      })
  }, [filePath])
  // preferred = the user's chosen width (the only value persisted); panelWidth =
  // what fits the current window. Deriving the display width from the preference
  // means a transiently small window never permanently shrinks the panel.
  const preferredWidthRef = useRef(loadPanelWidth())
  const [panelWidth, setPanelWidth] = useState(() => clampPanelWidth(preferredWidthRef.current))
  const [resizing, setResizing] = useState(false)
  const asideRef = useRef<HTMLElement>(null)

  // The .ai-dock wrapper owns the animated width (docs-style 180ms slide);
  // it tracks the resizable panel width through this variable
  useEffect(() => {
    const dock = asideRef.current?.closest('.ai-dock') as HTMLElement | null
    dock?.style.setProperty('--ai-panel-width', `${panelWidth}px`)
  }, [panelWidth])
  const settingsRef = useRef<AiSettings | null>(null)

  /** gsk login state for the cloud-tools gate (refreshed on mount and window focus) */
  const gskLoggedInRef = useRef(false)
  useEffect(() => {
    let alive = true
    const refresh = () => {
      void window.pdfApi
        ?.gskStatus()
        .then((s) => {
          if (alive) gskLoggedInRef.current = !!s?.loggedIn
        })
        .catch(() => {})
    }
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      alive = false
      window.removeEventListener('focus', refresh)
    }
  }, [])
  const langRef = useRef(lang)
  langRef.current = lang
  const apiRef = useRef(api)
  apiRef.current = api
  const onRunDoneRef = useRef(onRunDone)
  onRunDoneRef.current = onRunDone
  /** Any tool in the current run reported mutated: true */
  const runMutatedRef = useRef(false)

  const patchLast = (patch: Partial<ChatEntry> | ((last: ChatEntry) => Partial<ChatEntry>)) => {
    setChat((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (!last || last.role !== 'assistant') return prev
      next[next.length - 1] = { ...last, ...(typeof patch === 'function' ? patch(last) : patch) }
      return next
    })
  }

  // The loop is built once; every mutable value goes through a ref getter
  const loopRef = useRef<AgentLoop | null>(null)
  if (!loopRef.current) {
    const deps: PdfAiDeps = {
      doc: () => apiRef.current.doc(),
      fileName: () => apiRef.current.fileName(),
      pageCount: () => apiRef.current.pageCount(),
      currentPage: () => apiRef.current.currentPage(),
      readOnly: () => apiRef.current.readOnly(),
      ocrText: (idx) => apiRef.current.ocrText(idx),
      selection: () => apiRef.current.selection(),
      pendingSummary: () => apiRef.current.pendingSummary(),
      outline: () => apiRef.current.outline(),
      searchIndex: () => apiRef.current.searchIndex(),
      isDeleted: (i) => apiRef.current.isDeleted(i),
      gotoPage: (p) => apiRef.current.gotoPage(p),
      addMarkup: (type, idx, rects, color) => apiRef.current.addMarkup(type, idx, rects, color),
      annotationSummary: () => apiRef.current.annotationSummary(),
      createDocument: (request) => apiRef.current.createDocument(request),
      annotationsOn: (idx) => apiRef.current.annotationsOn(idx),
      addNote: (idx, at, contents) => apiRef.current.addNote(idx, at, contents),
      findNoteRoot: (idx, key) => apiRef.current.findNoteRoot(idx, key),
      replyToThread: (idx, root, contents) => apiRef.current.replyToThread(idx, root, contents),
      editText: (input) => apiRef.current.editText(input),
      insertText: (input) => apiRef.current.insertText(input),
      editFonts: () => apiRef.current.editFonts(),
      formEdits: () => apiRef.current.formEdits(),
      applyFormEdit: (v) => apiRef.current.applyFormEdit(v),
      rotatePage: (idx, dir) => apiRef.current.rotatePage(idx, dir),
      deletePage: (idx) => apiRef.current.deletePage(idx),
      pageGeom: (idx) => apiRef.current.pageGeom(idx),
      listImages: () => apiRef.current.listImages(),
      isImageClaimed: (ref) => apiRef.current.isImageClaimed(ref),
      insertImage: (idx, png, rect, layer) => apiRef.current.insertImage(idx, png, rect, layer),
      transformImage: (ref, rect, layer, quarterTurns) =>
        apiRef.current.transformImage(ref, rect, layer, quarterTurns),
      replaceImage: (ref, png) => apiRef.current.replaceImage(ref, png),
      deleteImage: (ref) => apiRef.current.deleteImage(ref),
      searchImages: (query, max) => apiRef.current.searchImages(query, max),
      generateImage: (op) => apiRef.current.generateImage(op),
      gskTools: () => gskLoggedInRef.current && settingsRef.current?.gskToolsEnabled !== false,
      fetchImage: (url) => apiRef.current.fetchImage(url),
    }
    loopRef.current = new AgentLoop({
      transport: createElectronTransport(() => settingsRef.current!),
      skill: createPdfSkill(deps),
      systemSuffix: () => aiLangDirective(langRef.current),
      events: {
        onText: (text) => {
          setPhase('replying')
          segTextRef.current = text
          patchLast({ text })
        },
        onToolExecuted: ({ call, execution }) => {
          setPhase('working')
          if (execution.mutated) runMutatedRef.current = true
          runToolsRef.current.push({
            name: call.name,
            summary: execution.summary,
            isError: execution.isError,
            output: execution.output?.slice(0, 2000),
          })
          patchLast((last) => ({
            tools: [
              ...(last.tools ?? []),
              {
                name: call.name,
                summary: execution.summary,
                isError: execution.isError,
                output: execution.output?.slice(0, 2000),
              },
            ],
          }))
        },
        onTurnEnd: () => {
          setPhase('thinking')
          runTextsRef.current.push(segTextRef.current)
          segTextRef.current = ''
          patchLast({ streaming: false })
          setChat((prev) => [...prev, { role: 'assistant', text: '', streaming: true }])
        },
        onDone: ({ text, cancelled, turnLimit, truncated }) => {
          const base = turnLimit
            ? [text, tGlobal('aiTurnLimit')].filter(Boolean).join('\n\n')
            : text || (cancelled ? tGlobal('aiStopped') : '')
          // finish_reason=length with no prose (a reasoning model that spent the whole
          // output budget thinking) must say so instead of showing the bare "(no reply)",
          // which reads like the assistant ignored the user — same handling as docs
          const final = truncated
            ? [base, tGlobal('aiTruncatedNote')].filter(Boolean).join('\n\n')
            : base
          if (cancelled) {
            segTextRef.current = ''
            runTextsRef.current = []
            runToolsRef.current = []
          } else {
            segTextRef.current = final || segTextRef.current
            persistRun()
          }
          patchLast((last) => ({
            streaming: false,
            text: final || (last.tools?.length ? last.text : tGlobal('aiNoReply')),
          }))
          setBusy(false)
          if (runMutatedRef.current) {
            runMutatedRef.current = false
            onRunDoneRef.current?.()
          }
        },
        onError: (error) => {
          setChat((prev) => {
            const next = [...prev]
            // the loop rolled this run's user message out of the model context — surface that
            for (let i = next.length - 1; i >= 0; i--) {
              const entry = next[i]!
              if (entry.role === 'user') {
                next[i] = { ...entry, undelivered: true }
                break
              }
            }
            const last = next.at(-1)
            if (last?.role === 'assistant') {
              next[next.length - 1] = { ...last, streaming: false, text: error, isError: true }
            }
            return next
          })
          setBusy(false)
        },
      },
    })
  }

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

  const send = (text: string): void => {
    const instruction = text.trim()
    const loop = loopRef.current
    if (!instruction || !loop || loop.busy) return
    stickToBottomRef.current = true
    persistMessage('user', instruction)
    segTextRef.current = ''
    runTextsRef.current = []
    runToolsRef.current = []
    setChat((prev) => [
      ...prev,
      { role: 'user', text: instruction },
      { role: 'assistant', text: '', streaming: true },
    ])
    setPrompt('')
    setBusy(true)
    setPhase('thinking')
    runMutatedRef.current = false
    void (async () => {
      try {
        settingsRef.current = await window.pdfApi.getAiSettings()
        await loop.run(instruction)
      } catch (err) {
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

  // One-click AI actions from the ribbon / Ask popover; while a run is active the
  // preset lands in the composer instead of being dropped silently (markdown parity)
  useEffect(() => {
    if (!preset) return
    if (loopRef.current?.busy) setPrompt(preset.text)
    else send(preset.text)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per nonce
  }, [preset?.nonce])

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
    // lostpointercapture also fires if the resizer is unmounted mid-drag (panel collapse)
    resizer.addEventListener('lostpointercapture', cleanup)
    resizer.setPointerCapture(e.pointerId)
  }

  const typingLabel =
    phase === 'replying' ? t('aiReplying') : phase === 'working' ? t('aiWorking') : t('aiThinking')

  // scope chip data, read per render (App re-renders on every selection change)
  const scopeSel = api.selection()
  const hasScopeSelection = !!scopeSel && scopeSel.text.trim().length > 0

  // the selection can vanish without the × (click-away, another file): close the preview too
  useEffect(() => {
    if (!hasScopeSelection) setScopePreviewOpen(false)
  }, [hasScopeSelection])

  /** [p.N](pdfnav://page/N) links in replies scroll the reading view to that page */
  const pdfNav = {
    scheme: PDF_NAV_SCHEME,
    onNavigate: (href: string) => {
      const page = parsePdfNavHref(href)
      if (page !== null) apiRef.current.gotoPage(page)
    },
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
          <GensparkMark size={22} />
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
            <div className="ai-quick-actions">
              <button
                className="ai-quick-btn"
                onClick={() =>
                  send(t(hasScopeSelection ? 'aiQuickSummarySelPrompt' : 'aiQuickSummaryPrompt'))
                }
              >
                {t('aiQuickSummary')}
              </button>
              <button
                className="ai-quick-btn"
                onClick={() =>
                  send(
                    t(hasScopeSelection ? 'aiQuickKeyPointsSelPrompt' : 'aiQuickKeyPointsPrompt'),
                  )
                }
              >
                {t('aiQuickKeyPoints')}
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
          if (!entry.text && !hasTools) return null
          return (
            <div
              key={i}
              className={`ai-msg ai-msg-assistant${entry.isError ? ' ai-msg-error' : ''}`}
            >
              {hasTools && <ToolChipList tools={entry.tools!} />}
              {entry.text && <Markdown text={entry.text} nav={pdfNav} />}
            </div>
          )
        })}
        {/* In-progress state: a standalone three-dot row at the end of the stream, kept until done */}
        {busy && <AiTypingIndicator label={typingLabel} />}
      </div>

      <div className="ai-composer">
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
                    {t('aiScopeSelection', {
                      page:
                        scopeSel!.lastPage > scopeSel!.page
                          ? `${scopeSel!.page}-${scopeSel!.lastPage}`
                          : scopeSel!.page,
                      words: countWords(scopeSel!.text),
                    })}
                  </button>
                  <button
                    className="ai-scope-clear"
                    onClick={() => {
                      setScopePreviewOpen(false)
                      onClearSelection?.()
                    }}
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
                    {scopeSel!.text.length > 400
                      ? `${scopeSel!.text.slice(0, 400)}…`
                      : scopeSel!.text}
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
          onChange={setPrompt}
          onSend={() => send(prompt)}
          onStop={stop}
        />
      </div>
    </aside>
  )
}

/** Tool row list (unified with docs/slides/sheets): dot + summary, expandable details when there's output */
/** Step-row status icons (timeline glyphs: 14px in a 20px slot, 1.6 stroke) */
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

/** Tool activity group: a single quiet summary row
 *  that auto-opens while tools run, auto-collapses into "Worked · N steps" when they finish,
 *  and a manual toggle that always wins. Rows inside are step rows with 1px connectors. */
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

  const open = userOpen ?? false
  const label = tr('aiWorkedSteps', { n: tools.length })

  return (
    <div className="ai-work-group">
      <button
        type="button"
        className={`ai-work-group-summary`}
        aria-expanded={open}
        onClick={() => setUserOpen(!open)}
      >
        <span className="ai-work-group-label">{label}</span>
        <span className={`ai-tool-chip-caret${open ? ' open' : ''}`} aria-hidden>
          ›
        </span>
      </button>
      <div className={`ai-work-group-body${open ? ' open' : ''}`}>
        <div className="ai-work-group-body-inner">
          {tools.map((tool, j) => {
            const hasOutput = !!tool.output
            const isOpen = expanded.has(j)
            const stepStatus = tool.isError ? 'error' : 'done'
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

function Svg({ children }: { children: React.ReactNode }): ReactElement {
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

/* Same glyph as the sheets IconCollapse (16×16 viewBox, 1.2/1.3 stroke), rendered at 15px */
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
      {/* Mirrored: the AI panel docks on the LEFT, so the divider and arrow point left */}
      <rect x="1.5" y="2.5" width="13" height="11" rx="1" />
      <path d="M5.5 2.5v11" />
      <path d="M12.5 8H8.1M9.8 5.9 7.7 8l2.1 2.1" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

/** Genspark brand mark (rounded-square sparkle badge), inline so it renders
 * crisply at device resolution instead of going through <img> rasterization */
export function GensparkMark({ size = 18 }: { size?: number }): React.JSX.Element {
  return <img src="data:image/png;base64,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" width={size} height={size} alt="" />
}
