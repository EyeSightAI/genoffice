import { aiPanelWidthAtPointer, AiPanelSideButton } from '@genoffice/ui'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactElement } from 'react'
import { AgentLoop } from '@genoffice/agent-core'
import { imageGenerationAvailable, type AiSettings } from '@genoffice/ai-provider/browser'
import { AiComposer, AiScopeQuote, AiTypingIndicator, type AiScopeQuoteData } from '@genoffice/ui'
import { aiLangDirective, t as tGlobal, useI18n } from '../i18n/locale'
import { Markdown } from '@genoffice/ui'
import sendEnterOn from '../assets/send-enter-on.png'
import sendEnterOff from '../assets/send-enter-off.png'
import sendStop from '../assets/send-stop.png'
import { createPdfSkill } from './pdf-skill'
import { createElectronTransport } from './transport'
import { PDF_NAV_SCHEME, parsePdfNavHref } from './pdf-nav'
import type { FileOpConfirm, PdfAiDeps, PdfAppDeps } from './tools'

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
  /** the passage this user message targeted, frozen at send */
  scope?: AiScopeQuoteData
}

/** longest selection excerpt echoed on a user bubble */
const SCOPE_TEXT_MAX = 200

type Phase = 'thinking' | 'replying' | 'working'

interface PendingConfirm {
  req: FileOpConfirm
  settle: (ok: boolean) => void
}

export function AiPanel({
  api,
  filePath,
  onCollapse,
  preset,
  onRunDone,
  onClearSelection,
}: {
  api: PdfAppDeps
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
            scope?: AiScopeQuoteData
          }): Promise<void>
          loadChat(args: { projectId: string; chatId: string; limit?: number }): Promise<
            Array<{
              role: 'user' | 'assistant'
              text: string
              tools?: Array<{ name: string; summary: string; isError?: boolean; output?: string }>
              scope?: AiScopeQuoteData
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
    scope?: AiScopeQuoteData,
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
        ...(scope ? { scope } : {}),
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
            ...(m.scope ? { scope: m.scope } : {}),
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

  /** Confirmation card for irreversible file operations; one at a time, a second request is refused */
  const [fileOpConfirm, setFileOpConfirm] = useState<FileOpConfirm | null>(null)
  const confirmRef = useRef<PendingConfirm | null>(null)
  const requestFileOpConfirm = (req: FileOpConfirm, signal?: AbortSignal): Promise<boolean> =>
    new Promise((resolve) => {
      if (confirmRef.current || signal?.aborted) {
        resolve(false)
        return
      }
      const pending: PendingConfirm = {
        req,
        settle: (ok) => {
          if (confirmRef.current !== pending) return
          confirmRef.current = null
          setFileOpConfirm(null)
          resolve(ok)
        },
      }
      confirmRef.current = pending
      setFileOpConfirm(req)
      signal?.addEventListener('abort', () => pending.settle(false), { once: true })
    })
  // another document or the panel going away answers a pending card with "no"
  useEffect(() => () => confirmRef.current?.settle(false), [filePath])

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
      confirmFileOp: requestFileOpConfirm,
      insertBlankPage: (afterVis) => apiRef.current.insertBlankPage(afterVis),
      setPageSize: (w, h) => apiRef.current.setPageSize(w, h),
      cropPages: (vis, rect) => apiRef.current.cropPages(vis, rect),
      replacePages: (vis) => apiRef.current.replacePages(vis),
      extractPages: (vis) => apiRef.current.extractPages(vis),
      splitPdf: (n) => apiRef.current.splitPdf(n),
      splitPages: (n) => apiRef.current.splitPages(n),
      mergePages: (n, direction, separator) => apiRef.current.mergePages(n, direction, separator),
      stamps: () => apiRef.current.stamps(),
      setStamps: (cfg) => apiRef.current.setStamps(cfg),
      annotationsOn: (idx) => apiRef.current.annotationsOn(idx),
      addNote: (idx, at, contents, color) => apiRef.current.addNote(idx, at, contents, color),
      findNoteRoot: (idx, key) => apiRef.current.findNoteRoot(idx, key),
      replyToThread: (idx, root, contents) => apiRef.current.replyToThread(idx, root, contents),
      editNote: (idx, item, contents) => apiRef.current.editNote(idx, item, contents),
      deleteMarkups: (idx, keys) => apiRef.current.deleteMarkups(idx, keys),
      deleteNoteThread: (idx, root) => apiRef.current.deleteNoteThread(idx, root),
      editText: (input) => apiRef.current.editText(input),
      moveTextBlock: (idx, block, d) => apiRef.current.moveTextBlock(idx, block, d),
      insertText: (input) => apiRef.current.insertText(input),
      addFormMark: (idx, kind, rect) => apiRef.current.addFormMark(idx, kind, rect),
      textInserts: () => apiRef.current.textInserts(),
      updateTextInsert: (id, edit) => apiRef.current.updateTextInsert(id, edit),
      moveTextInsert: (id, origin) => apiRef.current.moveTextInsert(id, origin),
      deleteTextInsert: (id) => apiRef.current.deleteTextInsert(id),
      editFonts: () => apiRef.current.editFonts(),
      formEdits: () => apiRef.current.formEdits(),
      applyOps: (ops, opts) => apiRef.current.applyOps(ops, opts),
      metadata: () => apiRef.current.metadata(),
      pageOrder: () => apiRef.current.pageOrder(),
      pageGeom: (idx) => apiRef.current.pageGeom(idx),
      listImages: () => apiRef.current.listImages(),
      isImageClaimed: (ref) => apiRef.current.isImageClaimed(ref),
      insertImage: (idx, png, rect, layer) => apiRef.current.insertImage(idx, png, rect, layer),
      transformImage: (ref, rect, layer, quarterTurns) =>
        apiRef.current.transformImage(ref, rect, layer, quarterTurns),
      replaceImage: (ref, png) => apiRef.current.replaceImage(ref, png),
      bakeImage: (ref, op, signal) => apiRef.current.bakeImage(ref, op, signal),
      deleteImage: (ref) => apiRef.current.deleteImage(ref),
      searchImages: (query, max) => apiRef.current.searchImages(query, max),
      generateImage: (op) => apiRef.current.generateImage(op),
      imageGenAvailable: () =>
        imageGenerationAvailable(settingsRef.current, gskLoggedInRef.current),
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
  }, [chat, busy, fileOpConfirm])

  const onChatScroll = (): void => {
    const el = chatRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48
  }

  /** retryScope: null = a retry that had no scope; undefined = capture the live selection */
  const send = (text: string, retryScope?: AiScopeQuoteData | null): void => {
    const instruction = text.trim()
    const loop = loopRef.current
    if (!instruction || !loop || loop.busy) return
    stickToBottomRef.current = true
    const scope = retryScope !== undefined ? (retryScope ?? undefined) : selectionScopeQuote()
    persistMessage('user', instruction, undefined, scope)
    segTextRef.current = ''
    runTextsRef.current = []
    runToolsRef.current = []
    setChat((prev) => [
      ...prev,
      { role: 'user', text: instruction, ...(scope ? { scope } : {}) },
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

  /** Drag the inner panel edge to resize from the selected window side. */
  const startResize = (e: ReactPointerEvent<HTMLDivElement>): void => {
    e.preventDefault()
    const resizer = e.currentTarget
    setResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const onMove = (ev: PointerEvent): void => {
      const w = clampPanelWidth(aiPanelWidthAtPointer(ev.clientX))
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

  const selectionScopeQuote = (): AiScopeQuoteData | undefined => {
    const sel = api.selection()
    const text = sel?.text.replace(/\s+/g, ' ').trim() ?? ''
    if (!sel || !text) return undefined
    return {
      label: t('aiScopeSelection', {
        page: sel.lastPage > sel.page ? `${sel.page}-${sel.lastPage}` : sel.page,
        words: countWords(text),
      }),
      text: text.length > SCOPE_TEXT_MAX ? `${text.slice(0, SCOPE_TEXT_MAX)}…` : text,
    }
  }

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
      dir={lang === 'ar' || lang === 'he' ? 'rtl' : undefined}
    >
      <div
        className="ai-panel-resizer"
        onPointerDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label={t('ribbonAiAssistant')}
      />
      <header className="ai-panel-header">
        <span className="ai-panel-title">
          <GensparkMark size={22} />
        </span>
        <div className="ai-panel-header-actions">
          <AiPanelSideButton
            lang={lang}
            onMove={(side) => window.pdfApi.setAiPanelPrefs({ side })}
          />
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
            className="ai-header-btn ai-panel-collapse"
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
                {entry.scope && <AiScopeQuote scope={entry.scope} />}
                <span dir="auto">{entry.text}</span>
                {entry.undelivered && (
                  <div className="ai-msg-undelivered">
                    {t('aiUndelivered')}
                    {!busy && (
                      <button
                        className="ai-retry-btn"
                        onClick={() => send(entry.text, entry.scope ?? null)}
                      >
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
              {entry.text && (
                <div dir="auto">
                  <Markdown text={entry.text} nav={pdfNav} />
                </div>
              )}
            </div>
          )
        })}
        {fileOpConfirm && (
          <div className="ai-confirm-card" role="group" aria-label={t('aiFileOpConfirmTitle')}>
            <div className="ai-confirm-title">{t('aiFileOpConfirmTitle')}</div>
            <div className="ai-confirm-summary">{fileOpConfirm.summary}</div>
            {fileOpConfirm.detail && (
              <div className="ai-confirm-detail">{fileOpConfirm.detail}</div>
            )}
            <div className="ai-confirm-warning">{t('aiFileOpConfirmWarning')}</div>
            <div className="ai-confirm-actions">
              <button
                type="button"
                className="pdf-modal-btn"
                onClick={() => confirmRef.current?.settle(false)}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                className="pdf-modal-btn primary"
                onClick={() => confirmRef.current?.settle(true)}
              >
                {t('aiFileOpConfirm')}
              </button>
            </div>
          </div>
        )}
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

/**  brand mark (rounded-square sparkle badge), inline so it renders
 * crisply at device resolution instead of going through <img> rasterization */
export function GensparkMark({ size = 18 }: { size?: number }): React.JSX.Element {
  return (
    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAACzPUlEQVR4nO39CbwlV1UojK+qOufevrendHcGZkgCJMzzFAit8EBlEEVRFJ7yf49BQARRnyIKAqLiA0QQR0R5CoioiML3GBQIQ5hRZEqEJMyQpOfu2933nlNV329Ne6+9a+86dc69HfD3/Xdy+p5Tw57XuNdQwHddeX4J+99XwmWXNQCAH1d23f6+e5fWR+c3bXvHohzdtmjhVi1+imYvlO1Z0MIOKGBctsUY2rKElt+TP64U0W+9XxQFQBs/bZ4pWn4Zn2kLKEqurW26dbez2kpco+tYZ1PQA21Z8zV8oC2hwLbwv7Khay31pYCioY4AlA3dh+B5/hcvtvhS2UKBL9Inar/ieuNe03v+R9h3vIf9ja/bMRXhwHWKi2jGwpkv+b2yhqZtoMA5pgdoggAqbg+HUbSlTga0RWOu0yRKY3XTFO0EWphAASfKpjjctuXhooAvt0Xz5bYoriwK+MJktHHVsc9/5FC0bCXs31/CZd/TALwg2JPf6RLvr+9UKQAeUwK82S0TlnNuuf9Gzai9dwGj+wE0926L5nZQNOcWRVUVuJC0cLxo+NGdEW9QAjKzPXipdcO1cwMwvcc7hG60tHnMdbPp9Vpb6PPmuq1b6qc+pACYxiuQUOJYFRgK3sD0YB6A6fogAO5uiU0DMP3GPmJvzHxL/+LrKQAupb803qKFtpLpHAzAuEcUcxRQ0nVdTB5H29RNC+21ZVteCQAfb8vi8qJsPnrgig98KxjOYx5TwpvDvfr/VQAuAR5TALyZdyoAnH3xg2/bTupHFi08HKC9R1FVuxBYW8DNWdNfQsG0VkwCeXPSWGg89DUgdfyD/pWNhhvKUSaphdZTgSQohYdrWXPdSAov2pTWG25H7VqIvGNqjZusQBKMAI8NUp+kX40CJAN2EQEw9Y9JtfzF625KuD4ZZzA/dM20p63oxta5MXNnCwGFUG1u3j8RzwvXrchWn2MAo+vaPxy/XEcAVuB2iEfnBRIAjMiNphnb8uOnXULtcqdpBrgO/QcfJ6xRQkXrgHPSNtPjTdF+qgB4ewvF2w598f1f8KN/TAXwZny/+f8YAD+/BPi8A9wb33b/2ZOmeFRRFI8HaC8pytFSi7iwaRAr1jTZJc56UToSQayj0tCeQdEaCqDKBkgCMC68boa4RkNltUrPmqYBOGQJ+wHYcQgxAFO/eLMysuLruElJPiDAMwBsqCzVqhsb38nND10w7SnLy5PhKbfOeQ91pqWRNdkyAKY5wXcYiXkA5rlUStsSx2EAmPqKN2MA5j7SZdN3g6hwSMzKUAVlhew6jaJuJm3RXl4AvGHUNm/59pc+eL0H5Nu33wn2uvhOUty9t3ng7YqmeAoU7WNHxeg83ms1tE1b6+y1yFVST5kqBBg/B8CWFe4B4IB1w4Wnx7cWgPktFcf9+irTHbK4AwG4qGlSihwAK/uubOIsAE7JrDIaBlCV/bcCgGtZwxCAaW5cv2cDMM4B4OMl7wMC4GI4APOtJADHYgTRYexxCcWoKJB3B2ia+jqA4m+advqnh6/60Oe+UxT5hgLgAmB/BXDZFH+cc5v9d4Wm+CWA4kegLJbbdgpF0yKvhLNVBnNImNUAMH6nTeIBiB7rALBeJTTAm1E2l99QBvO7d6UtZT9JrtQ2tZjNqH2TDRMApANhASRaV0UURRqAUbgj9tzLbQScbkN6WddJB3SPhUKqXYBf1D3SVgjEiqZ8+3axtF9C5egFBKSQRe4CcElzHCO2zpxZiu4AjAGYl60U5Iy6A7yOgIfMl6xe2YJsF1DO1wG26geaGIBFBjZIxlJhS/1ThVayQVgmYIaiLCtAYG7qDSiKvwNoXnbgqg98ygDyDSIj3wAATIMhinv2+Q+4LVSj5xZt8ZNFWY3aZooUd9oWUBH+VAVPYcBqUQCmiwJAuum3AIA71KQPgF09WwTAdjMOAOCYZxgCwCFnkABg4QQ8C2sAuKmo6RxnErDQ/LJwEaJ8ojUWFlfmjQFYFXPyPNZBqv+W1PblDQDAbpm9qNG20NRQlKOyGKGsjHv8DW1Tv/jgly+/Mt77/xUBWDXL9b6LLtkJ0+VfLAB+vijLnU09xUWucfZbXkHpiCwsKRCiTioAG0VJKOt6tjMGYK49ZF/5WgGlLCAiV73JyinuA7Flpi8lUXdkiYWq0/tMIbw8J+wa8d7+Om84pByikKJ9KX0TVlUVT0RVRLvObHJiM+LXWlhrqlO00OEiuJJmo0Pg9gDsJPPwBcdG4xh1TKorjLTh7lWvDdZ5YSlH2V/PqheljF0UUQzAim08MncsdCFaeAPACu+uXYtsVCKQAwFGGpVDOSxC2WJFkgCABcfTBkGUUBXVGMXkE23dvqJcan734JWXHz/T1Dju7RYV7DR2+M31ngsf/P3FZPmjVVk9r23bnc10IhgJ+Y+hCGTGY7qxpdCG8L8cCC9U3M7umX+Fq9TFnuf7G8zfTTGoetchrwVLO7NhU79Bpp2iervUbYdfce8LJCnDZdX9fQUBt/DHQEG3cu06lbO0a0fbNxZ9JDpilLkuChSMkYA0k7ooYEc1Gv9aMR197OwLLn24UOBWYOK/AgXeP0JZF6luMV16CRTVU1kNMJ0CaQAEicrTemoTq6MsyDErZNi5mAKnqC89F054yNIJpaNjFUT4Sv09NXEUmG6wAqQk7sAzoI7Fa7oUmKgMsWsDKDDK6cqJEKVR9lEosLLcNCZpk6iPcgTC8sYaZTt+o9zrY69VOOmezWKxSjqvY/AUGK8K1dT69PhHKbADYDyPlfZV0YjVoTigCsocBTbGLIWy9aqF1nZ17g0FpjUlemj2i+H4ugjQaOFJlWWRk3wxSAelc4C2RhGR1rCFP2mr9V9iasywAd+lFBhZZlJU7b31/e9b1MuXF+XoqXQ43ta4m0cx8A5H20aWVOAdQmkyz+gaiHpZZDzW+NIiK8ukMpIzAFBiwRJoKOfa+iMZ0MnTcl0ogENS0g63x6wy7deAzVNKpR9RCKhxhiKgjCFKPMvhbEDGyCX1ZgCZZm282MLnp6K7lb+W2vLYWxZH9INwpt91rhXJyjxbrXGSVSjssAx1NrJ6PK7OOB117lJcrRY1366fzihGkRQeJBejtm1o3xdl9ZSiWfowwgQDL1Hi4rsNgGUF31yffeH+J5XF6H1FAXdspxtTNg5ko8OtaMSVxOT2WVLJA7YCrwQbsOn9W3o800VHeF2tLRUoOy93BjK8pDaUI0+OlbQAFjU0xzgHl4CVyvVREe4Cpyv+1HDrShspWCLuLduU4mHftZ5Ce75s641pAcUdynL0vj23eeCThaXuYfLnK1sBWMpPNvtu/cBXQlX9adu0y009JQ0dP4LYU44DiH9RmV4oR3BdPu5531DfhPWxzu6Zvvc9kRXCrJRELgiFLpB1K2sondaU2d9Cjqq8DjY+ejLLVnpjC26bNaNEoJAdJNPEng4LxSKGRKl9i6w2Knawb9Iv6VsgJ5bRtc7EpKms39o6UYr8oqoq3zdSSOFpS0nkFYqqZBtmvB4YSEtVDjgUoHCum97uUXG/Y4Q5e3szZy7rofMlZ+/KkdmHiRGi9UFkPQB8ChihMRK07XJVVn+y79YPfJXXKKBB0+bKJiugDjTn3H7/jrMv+N5/LMvxM9p6MmVhjuTdwSUttaWhdrOKGqkk344YSejHQbV7Nt5FOWgbRvFim61ZTzvxKyVsKOLpILF8zYsQ5lnINFQwecup9AszFHeprnuxeq7C2gRFR/YgMi5GdOpWwk/EE5cVEEnN3bbNZFqMRj979q33/yPCDFtubQ6IN/EyNvyCZtfN7ru33SjfUYxGj2rrKXp6jHiOIi1fp8RqK73Ww13ohPVQWLd53MWwLr1nlV7Mesv5IDEAord2poi6Yo42ODnOXTdAnRyZ1eLaOs0bXK/8jRkKOQMlS62A2yj8PaJ4LJ/Rd9WsBl0xDKDj9zsTbciNvCPHa4EcqvW5S/GYu1TWNa1WVSJDEzWj+WfrMraak3mdU/RoBTg9Z6JyuEymKJ8C6pqoQwbhrzkfEFXUWXv1SE4nhVlwBIkzOGqnk0lRVT/YbhTvvMnF99q3WSAuNwO8511wv3PHK0vvLsry/u0UKW8xngWDXIzcuEDrQwmGO04KzoVT/ZAOB1BjgEM2EhsppEpuE2cmIonb+t4zLLVV9Igm1z3rlEJ2TNFQ4yayC9CHgL24kL43o1hvqBipxQgnQHZtpo023649phq0cYbsSEVw8t3NYxpZRdWPG5SLy9Elk8mOd597/n3O2wwQl5uhvNOqekdZVncnthkpL3XYLoyOLbPtI1bVayEHg6j5m1ghO6kZNiyoJqpbj0sM6Q37nqqrr8yBrebScsTTYK8FmyuhVMscOfHtTA8ivDd3ofey2DDgoLIMQuelNvlQwMo78cLXHIgbirRtFVbfFe3VPO7zCJU4ovjJohi19foUyupudbnyDoSlRYF43umn3px33kNWpjtPvbuoRvdr6+m0gHLUNlXnfJAHKawQTP241NqIFAUyZrquBvvM9jDpk7M/nRudSJp8tQlhdsi7mxlPGjvIhPODnniqgoYthdhJnrRzYkivZ4h49FE0I7GGqv3zaAJZIw4TKyE512VlB57z4xllHTpV4Pmtw+JioYQSSINmkcii1dCoAb6aVxInxs/TOGo+U7ajct/0fFavO5PPkLVuO0dI4nOraxmYcUpf236fW/yXz3jDEvTBrIl3afSWcIpcgkAEuoaqaGq7/smubelXg+uEapk2ZTGmY1fTSzk3Fo7LHe9lSooP6Th4qIbenlHTWMppUY1GTTv58Oj40kOuvfbdp2awPp1Szm8aCU29c/KGshrfjylvMeowNil2Yg7FU+zHyWAm8mWWKPRgRFNmzsxWKMiGtXTGy6ZHkmQLxQe6GMTGLFCUPdXNvvn1KGJuKdNuYCY5oN5Njxg11PV0WlbV/epdp9/Ixy8EY8UZAGD0JnpzffYFD3xVWY5/sKmnE6S83BE2VUea5WgcYUI2OieBPyB7XoZiEUU2Bfn/ih2t+OfqkZOn7lwfWU4pjEu1flOpoYP5GGeEcBLZ6oltj72dr4vhIoYbZG0s0SdIHm7UIsuwe3TEJEb/xi83tx6OIzGsOrlTFlOZO4+Mwxo8S0/HV3o0RJ+UYk6oEQYFwPfInyZxTCKIk2bZGV4otyMUqWu3Yntllng+wPNLx66BgdzL1Ir/yjg9/miH1W8UfKme6yzj/nOnnNIfu3/i97i/Or/iiKFHgU7EbztzQvPOx6SjdlpPoBw9ct8Fl7yKz4kR1rYSgPezCdjZF176xLJa+tlmOpmQwsoWozgx3TSH992JtkceoUo+lo8ySgtlAYODeUO9M6Jxp9sRePAaz9oYqXOMaAwLlQGdnqcq990jIy4R9suWGfKou9lz7BL0KYPM7BrGwxcJYbMz0ooScN5jyN52U0sVyNKRpVq6jAmmyvHP7jn/kieSxRbB3JYA8PMxwBzaNt8TiurV5DalCqugqAFGrtpY85FSg5pri66W2tQKF2AEn+Rs69P9gMMsfOTnndiwxeIbW8e9KMeom8YBae6TeDGYJ5X7wuAA+mwaZw1dLKtl7q5xDFhG1zSY0g4qxoQzC8vx+FNL654b1mzvNJHBx7QuitGr951/v3shzA1Ras16gLp23p0fsr2tq7+GEpZkCR2z6X2zxY7YhRYStOlmSCRbjlQmbCsqvjymomvx2evcJdqQys6aTcznmcYX1QGxZ/Wtbta78vmDf38maimHPCNyu7Kp6qyenFyurHt+7Xph71kWLH6U50ydHQINupmTrghhLcN0boRN1XuqWFLFkb4a2RvbviRXT50y3Pr2bz+nQda2jRIo8wZkS2wxpnPurMLcDbF0ExFDx5xYPx6C3mt7NFyhx5W9bfqj4LHUFtVfnXfeQ7bPHtRMAEaB+gXN5OSpl1ej0UUtOvKKYtwNoNPpFD+xSJkTgMWwwk2lMfVjmW9zrQwipBo0bTNkdJHpciZ9KXlZQu8ET5hvPREohmlyuu8XM63CvntKa4F5DtY6GFGGCtN+jMXEPnGuKEoMcFGWSxdNVk+/nI+WSKmVLT03OZrA3ltf+tCyHD25cWe96R7Y2EkcF0KVVMJ+kuEuR5vgwaEaylj6tKVTV3FRKiIa5o7dqWHJ0R0sKWao2SEe46BegFVtrJBRr5jgcRN6FHuAFnAjwQES7UIpKi5Gzd425HEjR0ZGG2NYRt85xdqofHJAZc8nY4kiBgLn3mif03vezTAEGo7YQVE7ggADEaKLVWUZicA9Lwo9p+TB8IPuZZ6XgBM19tkuVI5TvuFHjt96SrheRXCtoDbxaE0CItYUFDHwocgq1xxL7bmKAC6NwjIgEK5flkMR238XgEXJCs6R6mVDh1lW0JG9eNW2kynC3N5bXfpQVmrlfYlzAFxglD0k4wVUrxay6p7tSH6Gg1iI9kTa3AEv2GUL/w4glbMwbZZguM3u4zsPKcVmqVFsXNDxchJ23f2+YSme53ry82rHbnFtSJny6u1Z89YGSC5CRFs1HzOrYbEgMqHsVuPOt8M33VeWQduirF6N4itHvExPTtnHOjer679SFdWtyZtCXQKNci3hCutteVUhE+09Xisry1j2xRxrCOUm9k/sT/VAz8tGXjZNSV3uUEh9fB1wWwnXWlzpAGUO3X3LXmm8TPkQ9Vf509vuOnterdWa8wkC4GACUfxnN3ciI6o8FpA+/Wp1BZ7ae/NKGYHxrvIUJTxm4tCsCiyiYEoEgmHjDaNz075H8jEzRrJ2dKrSHX/8Qc8v5ork+BE/eKyTMYUs7KZLAUwvIlcjlYjN1T6QX35cbzdgsJuUGIl0hRXT67aHEDErjaxDORrferp26pf7WOkUVJMB0rm3ecD57aT6DFSwrcHQBgINNog2W954QGYDdQYsHxNKLWJMxzEqBUWRMAHrdEh4VkkWMuKmRxc5HDQqFCjSRdIKSK2ozOB6Diw5MLtiHM+2Mxfs3cUQ8PgYEgPYcX9KssTCPtQmygNbXLESC68jzuNJK9GyqmmoDs8o4ACYM3JzRVymzIthi72VmcbJ8kjOBQsIjojChQ2Z6XD5rbWaD0ov7K6IRC48reuLWW9+IJh7H1BeKQ0DS1V3vX+sU4kFDh6i7jMvq3r1qRmbWFnJlGjFgZjPZ8BR9A7BUNwHja1VEiuvZ/+ArpBGhGPLvEgZ6JxddL+rHYSZ6UCMQk9bGUtiDumphjFiWzanKmjufN0XP3iN3Ao2eQKqMW4ztNNJ+cKirFYxssBg6Z6hMb4QFTssh5J70Gu+Ktkeg7qW60G+jaifMU80b7MdTiVRZ0KGH14WYRO9XD1vXTO5UssS01bMGVF0RZqkDnsR2axI9cn+zrC6Ri0QeJ3Z+4n3FlGG9RSKz1OWo+3TBl5ILT6GYDN6KCgcQW/PBQ+8Y9nCp8q2wBQyRVt5w9kUBXaVqTUKt23sgQWD0S3Gbu54RjG7vK/hXOj9SmaJqJvExSJMFbcnib0C5+vENlDbWAw+7aJ3IEJLRVO00Q5lnIT/xO6Z+s220IStaYyjkALLGMkWukUKjEp8qZ41YjoQf9xAySdwroSVdFFxK9dfyzW7mMgzgrd3GTWjjBE7Y+J+hKWn4xMH34ZK6FEbBVL3eocuZ+T9qDWcr+eo0iwvD0NTv5DhuVz3nEByXK3nClQWd5QJFYx2VQNtp85lRIGFs3KKJ5plTV/j9wiN3+UBiDkDYcPjdukdk7/JUmC1oyDQoudxYMTQN21x98NXv/+zGulV603x1W3RTn+trEYjNeeGOYqX4ewE2NnuNGdfds93CXAkUAfvy/FRpCjpKsgiOdCVTiJE0/DcU5DuP503mk0fjSGI0JgpySOJTelntoRS9Jd2Pst1ezYbev50n28jBVWe+m12nIkolna/pU6RVFfjOzcXdZa6C+aAMUBe/Vymwp1mXCFHhX0XXXIR1KPPFG05UmRgMYMChMfUVvZhe1sGYEz/wZ46qiyhKohSoopdY8LgoGxwdQXU2lFgli9NlEZFX0oNCXux/TDPlaZQUoquMaUVcwpgOo8XvW7Ua53sfshRhBSYvY4kxFHnOiphGPPydck2SAHmlcoUXa8Y2qwclZfmSrE32TOHFJj/4BGZyHQxLtQjGVVQ9VBhhyDVki2Qs9PZD73Czzi4E/MgqU6YPAZjU/lQ18PKrirnuv5RChSRysUR3zFZWgdYZK1KO+NBJC9o1FHVJWiMLk14xt2yFDh0pvBzELLUGC4oiZKD47mIi7HcSoYC03ETc6e6aydl297pwDUf/E+TdMNQYOWv6+LpZVWhnbMG37K9gq0oRc8Vv3yxqV2G5+o8Z9/IUe2oF0HMPVnguMXAT9mg3IFzYo2WPEXxY/WYOSX/8Ya0/tO+W/OtSZoBMBEuFybps/uRiauc/d2tf0YbrTmiiYbS8TuXKheRVwOENKsM6PaMCnBx6rKslloofpaveVnY7pp2950esGd0qv1SUYz2ot7fedXqUYELg2IocGRaxx462CxSmzZBgTk2MnuceGquWA1lDRcBWpJ4MTZHqqQUuDVUT3xwUb50sZ1Zu+fDkjJm6x4TKkVgbMySO29mBlfTP6dVR4MI7ilTKtEs0/jYUIWveepZtpUQE8Hsoj12MyfB+5i9V/NSQ4EVg1v/WOm/N3BJUGDzXDB2vwNDkcOeBsSyYUyBBdEF6yfjcLoMQQrJfnmpxvTFrI1qdOOY38agBWIKTKGQ0nPAQzDafDfvbHDSuDmWuYxEQNZLqL7G9yc46TD9YzDxVHhuCuz8pCmYVlMgqW/h4HTa3uboVz94WGGWR7Kf3ZfGJ4sfKaqlvW3ToE0NDyEyjFAJ1S27uqupVQ6NQ9hN33sH7GqZ5euKMJpj53QdrVsgW1EJo2SWKkWdNCODWnTF9shpWcmeyyafkLNaRawWIBjZJfpEGycML8BHRdJfPeIg2S/RqJtHg9EdgPVQTTdv5pJ91OgDeN9G7pfu0DeEQBVBkknM5H17VtxblIlyQ0nFDMvOSKd0qGI0B87JxfY9krvDCoV1tx/nmhj11+xTazk4zFPdthlptCuSCfFceN94qXi0hVlu5bLL2OCrgJ+OtSiKSAJ/AD872R5E4DXfAGYMbkvLljnwU2X+X0EWTNtz/XaKhcXbGwQkWz1pN3zZoqMZKSFRinEF6VCC3/kjsM7KpaKYbrJ4ctEiM/LTFmbVMLY5+4IH3qaA4t5Qo5FFURZkx+otVaiowziJx0JRKjzuYepm6KbHcEa17++FahSiUMSa4BET102ha4J3wswDXnXG9bGDvQw3Ms1EasdWXa30dejUIfUm41qj7fZ9dBhYilhaB3BJBj3GmYDZONN3O2+W8igCwN+YwCzpUB7OtbJi7ORvPnHOJMc2pL2kmBswAQmc/oz7QlyRRu7UB6L+0L/0XKrLhsInavDddNZDibvegd5fEjZe9qSL9xyEFrLWZ5jGtOIjG+mP7hXkisqqpFQ6rtts0RNEL+U2o/HjXlblbs5ZJM0A8h8VUcDPedGUZTulJHr3OefC/bfW888S9u+nHtZN/SgoyqWmaeq2xVSf4bGMy94nLfHUWivxPqTjBTBlILO9j0YZP6k5hc506SiLol4MC/+W6ah5mOzv1WzvO1HsZvluL6k5KraiYmPbcMZnY751DtSmLSqzRksNwA/Rxf37S3TWZw6vgEfIRjTSlVGYk8rfa+/InMwRSEkTmRA/9IsLydIZh1gjBy9rKB7PtzNx8kqxGClbe2XjVMj3rKmisRfm/rTdfrjjiLi71nvZ5/jxz3j72lCOM/bWCflOWaSQg9GbCTvjVCE5J0NR3TzI/LiBGYWk03fwWmtuI81rZLQexrvKpKcxJeSxBkqAxDnE0GN3YSxqeLku1JN0uRgnlzsqK7XROmm6UzXTVJ84q2SMxmjW1UxupPzqji+9Nom6EjPGnAir7dq2fThdvOwyUoE159xy/42ggHuS4ThNY7SBtApLZfs6E8sUnQ7F7HSXosmZQAAy8TBTNSYt8M3iMwDnajCfGUoUxygaCuaZx7jOfM+NP0a2nZy/aaquwfJuAC1mw2uKm8BQZDNy+uzil0QAKnAISH2PfrfRp1M01HHqaLJ/XDN1acFyq7J2yMOLlKJk5w6457nnP+g8TbcOdTW9H9pcogeEiVu/CVk857gs2zugAMmO+nuRYXyyLfO3q4JbjDv1ljezcu4OjR6yCcYsQbEdpY9byU5TCqmlH+uKLf7fXMlbyvW0qm3l/Tdn1FbkHxuEcxRZWy5qwPuBhmtGE5qlMVVX3FiAhJJYCYXvuhyNdtRlfT+8oIe295OUlsKrGk5E3PlK9Mow9q1up1AUPr94Ls1lYm65Oo/1c2NiCbsKFAj8lh4J+fZcdD/O9CULwuokF23S1GKNO1zM6tgcz/WFgwBwMAL/US+qLl+h7oG5zRwiLo5uKefOESZ36TCJ9QuVWBq4aG7tciTDWNFCu0VHJFHf+3kfK2d0hYCYDXVPqIJJN7jTk/h7dAiolmBiWeeLjyTqE7YZ22Sas8hAp1NwtcR6TtwYo9vmu7mn1NyMK1k0DzFbM4ePalwIjcQap2Nt0FaCvfKcXwGH+GnRQrEo6kt4Fqih9t5BuHoxYKALC1qr+I6Gm3kINXRJsyOpMGD4AjkkJXMMaCf34CaPLLY+hMxi9WmQc1vSs5Zh7wOkklPoJSrPoufet7knaUXJGWLgW/m3WJyz6ukYv63GLlZGjivIVJJZFgSipijujT9Gu2/xgD1QtBdrwBjPrEoS5lB9IVV0t0Ug9hMF1PhQHKGADCoCbsW+wWyqoYOEfbTV3DgYjaknDlpiacg9UrebyVGhQBNhMzZXSyE7Crv1lJsI91Rf5EhpS/06BSdaS7NAs+7SqlqrnHiYKv+q5Zf6cg0rrPwwY3RBGJTiyeqqmBhwSb59R/UjlpPb8H3y82/2g1Ivp1RCizV5WbyeAg8ft7YuFk+QwUHJV2snIXdcY5SSqqAyk+D8vYPxWqWi3CelLVJ6st03iJG6Y1bEfhWjD+6DtfeX2oWJUtLpukEcRLTIvDA4p2WLgm7bXoSwW45G1YVFWZzjKXCIo2Nq0vGP7MCyTgyzPV2MOkv+1cWUOFpp3awZrGfWWBPt19i3FqOl8Fq3A31oVZFAJ8Jy3DH/c4YIPbNsjiHwdThmqO2pX4SYMrI40uey2EPA1bTjNfWB1OObIdxgI0MmRI8ccaS6m5n7KcnhOhnTv+bkfKvxt0ypv2DY52STnb5qBJlkOlITbIChz0RvVViyTeNhECuyzhmP4YKyrZo7FMWISaaEhkl2Oh540Iv4UmzYoRTQZs7TuuwnrLebYoURBKf+dJJkUktriYgh+mHbxrwseVShR1dWEy/PcP2Z/psd6+oNKL09OHLoOsTiSRxiFjTopG/Pv2vW0nSxs4kS5pZxe52Z7FC7HjbQtRFXacbdtw20/gRsJ0sH6PRihP47WDfqh17vGVa22Dk143ZHzfSxoYQymkMCbrXBth1G2+iqaur2DqOiLm+LWdM5bnkYnlRr0n1OCI/YD8f4mr/C41v3PDPrCnTKvuhpnE/MZTe4p6LKeDDc80WHAyz7qQywte5x54Th5PIThp2SHvrnDNIwnuIOYbjHZORu/n1+X2WfvSucZw/VTcR1XjgWvC6p0iTBVwQrKeoXbxQ2lbP8cHQskyjaiPST51XHLHGunfW96YfZd34a+fk2Q+3cFlDRIjgXN38t6QxIkHVugHAYxk4+5tZiFBxPhe+v748menPcm9p/y/4NtotZ99CmQXokwim7kkZMXsymmUAJDkY0kqr2npfitrhrzveZ8dgO1L/ItKmJowsocCbZGzPRcCZL2490DRB2bjmPlESIVtU6L9ST+NeZnYGtZ7dnvazcSk5syL+2lYo9p1gtNilbdLjB+FtIrEN2PMOlLlgWmZ8WivNH0Ba35F9lwWp3jrRIRwyKWcSChe1jBTD1urJ1IuzTLzrRQbW5HO04OUhZT8W+0hOKXigxfXWLUOpQbwvLNXAkEc+AKqBJWJuAHdVOcrgdukV/tJOqJVBkhY7xmrBMKXs8qbx1neJBetPZwSa2sYYC0jlDGuupsokgEnsrKb/l2E/pJ9k52DbzC49raGmFej75sDhuIzjCq7ZV3DqrMNH23Tapa+K5B6VO0lfynXQsW9wr3gfOjdHsDRpvxZRUghjqCNkbEO/pnKJiy84Yz60XbzRvbQiYnoPX67U7krLxzN1MkK2rVuXpsSVgHOhP50OPNb1Y5NolzyLhAqOUrMxkWA5E6kA7eLdKeItSzxb0ftXeEs289/q3gtX35D9N4pIlRdNSb1tbjpSj+qzm2Dc0ZPktUHl2w2gZnb/n/IUBQSIThkamtlOJa54d9X3dGmpULHg/G9Zn3taj5YpZ02E7Jt2X755S+NEFPpKZPhZnui/+SwGwb1QUzVkOF4qDcsD8BusUd9yoY1QYdL6d4eqqbMxillATJ+gy1gwdJvo3vOYAYkof2l1b32J9lhEEL4A/wJL+a0oUA2T01RlPhDJNuFHNPe1/9vwwlZuzg9rC0aZktayWNC4ixzoXt0jOCqiTWVs3oRZ5s7zK8pvhugRBYkJtFcyIy1A/WmsZGQzIrEMwBKW3se5BQuW4Z/x7KlfbGoLwSipD2skUEc+46hlRVmRzec8h4YhI8D0rMoYys01wbw0//HDD/ngqHPsG2OmRPcztnoWpUnZI5VG9Wnk/1onFdc/t9Z2X2nhDGpPIPx9Ejegtc1KzFNfphl7M5/OV6U2nfn0nGUxgM5RGz8AHPr5pY5xoPpxKlf9ynEVtywClEq+gL3boofVT94iyi+DSgy4Szw0pfRTVAnHqmcS1joJAnjIc5+z+9BEBeYjb2YGobhyzPqk6U9aB4c8FhHAXlzexwQdWN2RbkuFjzBX4XkTnelvPvgWbckCHh4JaF0/kWONESpcZHozDZsG21yeLSxA5hb1NT3Ek7UHumTmRVgfLDMB7nfGcYfbfSbZE75cxxcDYHbHSP2oTathMsknuKiR831X1gfabTuXg2BB22M8NDVmwYjbb6PofseaqNA8uJjhbjWlEt4xVjCgfRLXDqjGXJaAOFBG5/g0qnfP15EOyBikv+AjbB8nejKKkU6O+my9e+eNtxeMsD9khZ73SGHE4Aw3cQ5LoyynNiLJ5pSG/qWINc2es8PNzR/HR3B5tMyMWtplfMDaFcR/NOxphVU8XJb61FTKSTTliYzhVdwylo42JQ5KJFpHNuzbyXeZQGQY7WU/IgENDWaSLm7tNsGC9Fee33eIlRIthlK340XLBPs56zb/TjYaRRkabKcWcRxJbcQozd+ltL6MY/P+XvlJgSEfHwTJCQYOsBJ/TmXxPzbgY7GIoOn/NYctEjzrf0hjeWmnb4pUP+AvjM7OyxXkr4W0JM8NdCwGYMb46U2hGAC/rKUVZ5NxutlOI53KCMLNqHKNHXK5vFgFoLM8EqyM+gmzPy5QIFYYdqdHaJPeumKH3NLV2nnpeca9ZDiPWDSDVZdthJzyriSEZiajNQspRg41YmL/ScdCCJ9qaUSidbJtti4oLmyMtacxrAwsuPA4d6XmO1cNParl8e+SR5/SNGv3Ti4MUwikposWBdfMjTV4dgty9p1MPz5xtzltRJR+P2er4hiGsHlSEZQkQznChrW/MeSqc63iqtiHcgIkW1nE6ELeKDKBtiv5tKTVv52uqTd3dEmF7WIk7ZPfWAgxctrJERT74a3Rv08NPh7FMdG4xquW4BKu9tvddVoLgT0g5El2L/Y27Zes2hjt1yraTv9t7K4hpnF7YZCy7fsjo2pxvZnM6ubbrf5x9Jdto4WXk4Fq/RV13uP3Akrw2YzuQ34GxYsy+n2V4PSfoDKFMPzlPpsZB5pA6UgOfNflp0etylhtYO0UD68SRzvVcn8kxKVEaC1e3N/fsNO00cur8H/aH6jT2rt3+2QWUHFI0aTxOol6doMfajvXJyw48mgOvLLTUNwgykOlpeP5ouqTyUMeQOox4aKOOhGMP33EvShfdU7ShnHXujBLYhGmiVscCpj2X244iyvdMRBpVslKgBav0ikdhbBQSI3Q5kRO90LjQahfg6iNpSxLlpXpuwpuYaXdj8jfVQCgSIW0Sg07h6Kaa9DQ8lNb3s7uwZ6GzzyS6sEjW+j7E4XZwT325oGNzlDb3a8s4ts2z7J1n6eGesWcq0w08d4myJfY2Mn/l2TvFQq+lg/OlXk89RQZIW8ytD1HoISiMKIau/kodYUjYFz4KQixUEdYMkmkHp9QdkTxQJHBM5ZDadN9JsSpcRxgv0FApR1V9qs7AGMyZH5v0Fsae2ovWHuv7PocKH0aKhgKL7a+G4+lMvckZwnREj1gqh6m5SlbeUB8pfIowmHiaRQ9gqhmjyJBxM+HXjAoht+H/8uEZ9zr2vAq5CU1hwgmuLafjz9OFH3Gm2p0VE90GKcuoT2IHTDbv3iOMR6570OXqNAgalXZ8LMTm8ro+vs9efRelcXGilXJNwmE6CzvDYTqLqvi4Sa3yJD2q7DFNWq4z6B8X7onWRf18ZRyOWFkuLw2ozPSpstZOied6/A6dUYZita500kftZlDKTZWw3pRPQlZ8c6vun+huzjm6ovUlFEpaVajfilJ2zGzPhsFtB8iGCQOOOP/QFhUb6ld7E37pXshF2N7qUpgWUzxVjlDY94PUpwGUhXXN3yf5TabNhkvtPNDCiFXziQ66Q2zuJFeCR0xCjanTgo3E1th3QyQUkk2cxOA64Q/4/fMz4VmDzQmGCyWqUN4LE675qXGypsO2JpAZnTIZoUEUBqHnjl12XWbXge4yZGQjP35dGJVJQwCSMIMmfrUIcSbwgpXHPMVKCV3a77xM7dbRrKfjDrU+nUL9gs2RN44mbLNHK/yOeqDZG5Z2OTRjQ6lEvVbbd09NwzWfXczaE9myWSNsDHBFIZbDlH4G/ZIfMjYyMIm4PnfbysGCcOP8YGp/3RFOLVx07DFbVGL5DsasUDDlArgB2yrX4w6zE3hYb9hbDiOibB/vx8bpjPIlZvdSorDfIBJyM7iuPz2zxlMpRjC6OzvPpzbVvMUjsJD5s0iy26AHe983S1lT7ySQSVZMia6nqHg0FfwjDFKfDitbRH0OdrKpP05PMqufqfFlSoBcZRa90UP3cXVs8S9ni/P5CGzEk6yol8hcu9mNlRhAvEZeX8p0x9xPym9BZUb5RGkZRQ6KlFEcLcQsjAnSrtjdDkNjIzmNX6e00SeOh6SbJTMh4h3j6axpYz7//blK9yxWrmdMS8OtFr6T6mzoOTYgg0PYi55ncvOYe65PXBpSNvt+ojjWIZrLHC7r/pi7R9bCLcZT85fZAoUcIxk4t8og0ynPMAqbpooYJ6cpm03ktRODOGJQjY2o3YCGo6ZUoqFBBf0mOIwsuwz746rssJEayZD7rFwFlkaUAl04Hrp8+pyn+U5kSMyB3nOzIaKJTx3Dz3O6GkaSlrEOYFZcQNU2OAf2caHgBarYUdbd88rCTqtbnVodxaFWfaK4QWaQemava+xEMW89xdWp3a/YPbsjF7MvRfYsUkyDHb3Ns0sRMEMlVsBam7ed7bFdR3dkh31CDaMfP1F1UWy5fe1cW3VMmDfa5xQOOfKI96V54iiYfrwy07hfhMtN7tncYmQteFwbORnGvq+APnvBN69QsQHbopi8ffKT2ciD2tiSZ4LGg++hhDAvUkn9ShQTwjWJ9ztxq/qa3lpKGsrQySdAMILvwlwtDNiLcz7ffWeOIohg1jRi/SM6dnAO3/aWDy8y65iLbTfVA6Q1ni2CcVJrKiw2K3vt8UH00MwSyYBy6O8dqW10FR8gTGUvPvg3IljEfeglYu+ZdHYMT6ySL5hCwsI6tkR0E3MmrfWxjOaGIv2Ojzbs3Md25r7/yjGVStlNCB8+6lCZXKhwAKTCpYi9r5832+/wiMNqbp0XUoyPgrSi/njK91qO9pDz0I3nlGa8x2iuqMutm0unn6HNX0AZHEnRQNgsKpCB/T07Dr9OISkLgh7QBVaEkfJJj4pwNgWmQkHFEC/xzvMcaGSXbzSHLsmBeuzxovAjDY5zTmyZfD4hZ5sX4gtztRe+l3o3FDiUuuMkcp4sE3fKKVTMK+5+t+6+4BnD5PTMyz39z5bEcYwD04D1zlaQ6Gtfu1Gc5/htdy3xQB/pGaI57qW4mQ5Bd36CZmlJDP/eeTJX74ySjZzR7xWmjiPJOTYiIbPrsaWa3zOjjvZPpfxAfoxLNPCA5ZwTQFXeC/q9eL5cvzQ27L3vtZmbsM82tGrEjnkk6XGpr8bLcQP41ASLjNesT2y8mrM2lb6fvuO/DfMIa+dRiCWPcyyF0rbbro12p+pMHZ37WUoBwXOWytL0xgAwh0gwCEEqqxblRgjqME1aPO89EjLt2+8cbkc5nRGxhrZeG8Tctilsotcgi0jtHle3K6V2vkuhDGcvqF2ynrnaxRelicX0ilw6rIz9opsliukbnFXLsyatBsOtB2jVd/jHDcssr2P9FJWrwOfTDm7OOkvyETtb7eg5P6dsHRwH+AtGbOJZeWVLhEDFIV3rdufZsTQXBK0Pu+Rt4cN+ujm1rLSJdUbf1PrK1uHiS3ugdyy9aSmex1Dp42XDQt+kpozCzSEfVYaxKOf1IZYSh3miw5YkHpakf2F3yQQllO3h4sOpDpcXUiz/uJ9un7v9JgnNDJPlxSw5jrX+/RHF76DuWYxEMj1EXxmoiNp03ODeTudfSr82f0zrTfZ+vvqHzFUvhdu6wgYci1DMM6CwHFD6erVVM1TESQF7p8Cjq5RytxOtNSqjJJWkNxPRAi3ldF9Dc4mo9ay04ruZm0qDehzWjp9XjKt/zW1M2UgO0ZhIa8LxdIkKCWbDu/Fpl1ZCcUrsjdjp3xsfOKaAilqipPhpY0/ckcEcbUnMl3A2+q4c+WgtoWM+K2OI2lIXxe7ccTi2Wk8d/Woaio32yq5Ny/OZoAnq0E4/pQ4Jm8Nprbzt8EzZN0Gd0SWUqLwzFrGsuOxbDRVsWf6Ipacq0Y7ZRNb0NvHmaClaNmZ05F6nDcPpuelT76FEqfHYTpPe6b7mA0JzYmVs+tPRUnUttS+zuO9wjgc8M7OOKAuhvb54Sck3BZRlASfXJ/CQu2yHi86r4NSk4fSLfZgtMsRKN3em6e0ZKB3uPmYH8y9GTHfv0/50dv4SvHWDx/uB2eK1+53wohtkQBOXfurKTfm2Ut57ElLHY9ZYlZCqvns9Pj7ojsnKain6FNav0fWj69bF0UKZlSf0lgBo3TZwu5uM4eR6DdOvioyir2QdraUNk1Q7vN09ZssGS3cyHlLHJj+TocjrF8lE1FH5mY/TlYtI+f66niXql2suEILhhcgnXB4mCmqPECPhKvBTFRnRyGzdjSMeOnLc5ObReH+56K0Bt7cVGm0IVVY2TG5CL6APutOJ4GV8LSbV0udE36zCyVaici4rQJV76U5eIE8nykwjwkGU2bGGifedfa/vmGLp7PQ7Nyx7rVON+S4jDOaUp62qWjhnZwm7VzXVh+vYDEqqSo+MViBouzPqbK0hGzv7+e6go9VUUcfdTrDuKYhKuWiZv8Wgfkhx7oEz2DRFNLM2VYCcB0EydH/3vWfuzepPDiEF1zIVdES+GSXVlyxC5EfFmSHX+SGTOFuB4Qw2LGbpqdG/2o+JHQW18rERCpq2gG3jEm60u4Ab7cK8OkIRXZdn8QJ9JdrIgSNC7ulQlsyMakCb9nFd3VAwaVNfVBAOHk/NgfYxHlPqOW98MBPW7IYfhLxuuFJYboCvhDNj3Pn4j240857WETynnGmMIgcUmX7rO+DdXLkW740kXkFDeXm3tEGaD1usf2q6611bYXnTAlnMmioHqBZRcRsOUbQwndZwzs4C9uwcwY3PGsMYnfgx9G+AGU27weTMwOKORfL9tDxFnCbG4y9jL5sAPmcVRSKHj1ZtajF1Gqsmw12ElmKCPDHPrM/S5etzDieGXRQ3S3/0Fm1uZ7Hv62kBgxP4yBYBq6wXdKsFijfTl5RLnVFidUoR5NQJ72URRKauxHo5kc1thy6SZKWT1qFO/Co2Rf0xgJ2DMr81i3AddQOZuaBl7RlDonbtQT+LaLejdgVcJqMsuR8k9oT97dal/r8YbWnaANxsbwU7xhO4yd4RnLVSwJTyMOVYnk1Qg5mGq2ajdl8ehpVnsfwsuHrOJ/toKJuk0cO8ZevDynynSxH8GDA7CSAb3BYBuCLr4e+P5m8lXbxeQLEieXrzNfonQ32pv+qh4xry24/U+6JSj+ROFybV0iihXFTDtIXb3WSFbp67u4Rb7FuBz3yjgdGS3eI9+FCPSYg6BL13XAsrXrS2rsjhEnWbYAZmQoM//ivauuJzeCzB8x6E/xH5vQ3mwlLDBKuricnKnLzlw+SEHLfaQvt/mUtgjxi/aOhR5RFodg9nppp67RLIK3c+32aer6Q74pWR3Akdt9PlmD3KzAmHylElLRn3pHJBOdhhrziXXpTG7UPtoKLTZ2Ew3ExqGtDGBLaw+DOw7uQEzHKCkoQWQTE7ZJUO8hRpmYXRUNcyI2PVUMD2UQn3uKCA9Q2A7csAdzt/BNN6wsGyU/2PaeGM/aOscOeRGNhT37eCWjl+q2e+ZL51k1jWOlsUGcs/YeIWr/zrSk2c4VIjXc01lAB5n8HSGv5wLmHUCaSDHteTgqAEm8WKjKmXhxVvhdEx3Ej0/4wUs1tCzs58smjboyAKBsCH+nhgc3oD4DY3L+D2N1qGyaSBejqBSy5ehh0rFUwbE3J2kf5asW3mPMWDGlC//XTsjD3nQqFsgqp7JSv+M9Mk2uYiSve3e9U/u2mLuqgrQfDsBGMB8zS3YNdCPYvqCoRCuyNEf89HAOXifirXswCLnes/Jz6nOEGhbOgooh6ldIL9RCxxJODP1S/jNqYstf9Iv5KCWhGKfmRaxRewzh++6yoslzUUbQOT0zVcdF4BD7htBWunW9bpdIpRrWSRGRuT81l1ZPCfmCu2leGB2XjUAUWzf8Vp3L/na0LXQXIf1HY1JnNmDN1x8AYiahwo6iIe3rlbGhEo5kyCRqK/8j3nD9FVYGUoU1B3RJkcvLQdQE5qUxJ9SdoaJMPhqvWbKun4SNLGwPLupPyMwpLPyigWXc6d0smcZrSJaDGd8epguP9nMJjM0JJCq8NLuElaqMoC1k5P4ZILSrj04m1w8vQUKmK3K6gnNTzufjth3/YaJpw2qVvfrN6GlvSz+7dZ1sV68MR96efdB1zXiubrUv7xlOi0QOUWGNVgZUv6F5YzxlTmBCfHbEbEL/g+X6/I4ncuiqlKBkohxJ4Us3h2ust5ELPIm38IhYjO47rDlbyi5hl04B6XFZyYtnDjXQ089aG7oIYpNGUlDvktbEwbuOU5I3jig/bAxvqEYvq507zsEASD6lhxxsiuNlU4rxJKgSUl/BLFhMbiUufsvjkgLIxKDrX4CTkLr2HK9df12rDbnucftNakDU33NVnHUK0+ngAIxezl+PV1tWRrrVM+O/MnoMIVbkM++jw+otEo9TnsN8ZFJ+5TdCkZ+/2UkwG3BT2lEXt0vy/Q+y/IB4ZUtGSz3xITz5EoGLWtDBEp9YQfkte/CyhwWLo2yglgMWyHWgTiBJxYb+Cc5QZ++dHnwE32bMD6RCIfaAjXsiTq/PC7VvCkB63CydMnYYJriJMq9XWnZDZGzIliC5vzBj6Oi9axqMAHZ66cSf1UcQO1o8VImJlbZ6jN0N5gVCRTd/tC1wNNSUgd+dPMaDN+Jz1EKwa5Qw0nKgoQihGA17uVMJm2cGIyhbvdooCf+4G9cMG+Gk6cHsEIHZDagvx18TkF9PVTE3jc/XfCvl2r8Jp/PQDfXith+1IJYwn0xlH3I/mrp3StEoMYPZnIlDqK+GW57ljnNul1lc8lJEcaFFEmFVcpxP5+U2h0CKSS6JOMJ+m1T9Wp/rSijwjoVN/02Il0jiw+yfcgRCMnDoEnWXQfDFULucr8frP+317noz0L+PhomPJb9TXxOPMDCfQF/pBKdrvsuz78Y43php8D91nDaBnCiw/WvhmllvxGKkkDJiVASTLs+nQK43YDbnr2MjzybsvwiLuuwnhUwNo6MPAKz+4pJH9rqyU4dQrgYXdZgjvfYh+88cPH4bIv1HD0xBSqagyjpRYo9bkJaazWWyxBhHGMY3VUd2IWxMmqvAte725Ih2QdpxwqRhZqOqHc0uO6tjJsqX2Omku05zn4GTJU4p4bSpdVHlRm7slIW2ZMIQfXoYxbno71V6aIcYGSAODFF31YGVq3H+j6RgunJjUFZ6uKEnYsN3DTXRXc5sbb4F633g73vGAE+7YXcPpUDRuTEkZVXnWkwceKqoK1k+twzk6AZz9iNzz6XgAfvWIDPvWVCXz54BQOrTWwXqNbMVO07ctLUJXs7zv/7IRzOo/eIfZlyQzKEtP+fgQbdFhPnFijyCtgqAxLF0g+XZnREakhADFz0ANncW4lj3l1jvdCoW8mSzL8+oz+F2dfcCmFuGWuzbN1ylKwrWcZOiyzMQn6+gh7JUcauo56XKIO06YzidxpvjNhTBFi4tbrGi66yRjud+E22LWthXN2jeHsHSM4d1cJ27eh1UoNk8kGTOsSqnJEMgGq8xvKbG7G46I3okubJmVEmyI+mhlXFVRlBU1dwvHTLXz72AZ8+9g6HDxewsGjBfzLFzbgxOkaKtSjBKlhpFYitDJnZNCgN8XJXo4n9PiJ+6BO3Z5Ks4N6JXPN1k0Ec9QIsRU+UqHOm7jpsQ1zms2mZzStGoaYUSpr19bMj7o/4rPMoY68Yz+5MCpPo/Ope0DaNMoju7aB5VwkWVlCHcuYaolGR2nGl7mg+MzcvsbG5jGoKIJDNHbi7hjHHMMlMnFappO+RyGVUMFIsVjF38/mllJzYW+ppu1ZJsnPPVvpJfoucOikF4xaqUofef7MKLFyLnhzFOcnifulLOncdjTCTwEV7m+ytZJNhBs7oz1k4OUa9bdtRbXEmhVCnRAQmKsRytEjKLDx2BQ0qmXocDuPzUXOB8hYPSz74COKDsse/R5SzVY75Gfl+c2X7HCykSUN8p4Z43zzfQzsJKLeendCJ1zb5FhxTV5YRwxE6noxtmgohqvJ1JZ4v6scyPRY2C3EMeOlEj739dPwiatOQoXZ2MoSVpdaOG/3GC6+0Qrc88IS7nbBNjh7O8Cp01OoEUuVHBguTAZlsZpEtm8Lkpmr5WX4yrVT+MgVJ+Dfrmnhq4c24PCpBk5t1FCjUqMsYMfyssjhkgFBYv+qKRtNsoT7oPkmzaBkl4tnwaWNTBrNzpicdGEliJ3eWOUyR30SfkaXi09kGgrcp43oEU+BXkjiCYVHdR5PWt7PaiDiktts2mvxx6LHLPvWx1diP/ToLdecb9dbABsxx3BRMYCGlr3hKUkXzft9F97y/ulRmr5EdxWmdFwyk5QfuNPgJkgEPjoXTe8XdhjhtOTTuzoW9rEFqJsCvn6ogKuvPwXv+swG3OzcJfjRe67AQ++0E0ZVDesoL0f98D7JXOoWYPu2VfjmoQ1408ePwL9+/jScOF5DWW2DqkLKW8POVZ/qMziONMNVREH148rS/A5VuMTKus2U2ZH8Z5e+jshWlc3jHTfME0Il2aUupUhrb0BdC5de6hjMfSyzh1yEikE3SHH8u7afjijqcyMZbNs70pSGLmi4v1+D9qohmo4hbAGmDluyWmepAlgaIzVdgq8fruGlbz8OH/rCKXjWw8+BG+9o4fh0gxReseqTLNrqAnZtW4L3XbkGr3rn9fDNYyXsWipg++qKACtJxs5ML+y3TelpIuaT2Mf+xmTK6c7jMxM7p0XX8AlMFatoiC73wVR2P6TH5JRU8/bNheeZg8XvYVRa6YjTS6iXU1K9nGQV/V33SuzwP38J65s1v6Z/HVzoK8HsUd0QNp2AlJG1lWKnAEOpe5VFuKndFjWUaoeomRKoMM6SAg/ZtjQFNE0Dy8jiro7gI9fU8MuvPwRXH2lgezWGWj1wpO/4Tl0j5S3gHz+1Di/6uwNw+NQY9qxWxCbX7ZSVWtSWigc6N7IBormy/s1etyJKCVePPC9WXBQh0c3hvEDss0kGJw998qFZLz27ZEWbtznn7x18lympBzxFJvHC8fT6fMaA0M5xpo3wVqzraIN7bgs5Fz1WqNFvtRp01DVOf2JbMNr/eE565OKcnoHuiq6FY7HHo4qex8RuRAjMGrk5UyWainCD9Rn5lXWZylO9CTo53451sNPzBAFm08DOlQq+cnQKL/q7Q3DdOgBy3axi54JHQtuWS/jglevwyv97EMrxMiyXANPaTrvJBRR2PPfTXyfAYHO4wJpMNc6bKYOAKkaONxDLJ+2He3w+t7iAPTWhczNNmffAZ8UU9j7ifoMfTMCK72hsal9mr5HPV5V6FDUpekTBfsmZh73QrNEK48aTxFa1485mOujaIEDVzO8YVxc/wYCC9wuYTgvYuVTBl65v4M/+9SgdDSlA4tiWSoCDhwFe/c6jAKMxjIqGdNlM2X3O47SsoxRGfI8RiwpcMlVDTTipx43urGdx9DxNeG2WGxXWma7zcY6yHny0Y72UOp5GOeRow9TUvNAk0eqaEJuJCda92KBVdgOUCxp27FY8Q+lNae3h6aSMXGl6MX1iLKZjUhfoOVugsLTP6vduWyzTa4f83CryIUcBMQvvMIux7BHY5ncLVRWFJSrwTFLmIOSscQ9OXeAEczrm2itsCLgk2Y9lpVnFTGIM+1VVQjWqoBSs6s8E+6rL3M30RfcWhszZuTKG935+HT56zQRWlvloCI3Kl8cj+NuPn4CvHythecxO/8rcBV5GAwlHYABvNnlZoSVYReP2HZwj1IoAh2flewaeriAvd5v97ZO6qZzoFZzuGRuBVneNHvDKb2bkLLu8+ZJz65vxEqTL0D55RWcch5lOWQaUWSJuLuH74OJkS36T/TNS8lPg05rpqRtsOOAAgRYFHD22BocPHyXLJzRV9MKykW2Fr/fykHpfih9t1Dir1iPqJWgKx9M0Jbz139agaMd0fWlUwVeub+E9n9+AHcslp4DU/joMK4oy6ZCzVY0nIGJreB9z2xWaaZ6cwIFDR+DwkRNE1Ox0pGRV5SpitFYE8nTb40qp/qEymQHAa0gfkflEltKR8hNIDexcJiy23JrJXOukOb1EmIvKyt2xjMuKyL7SpR4hUTDZEMCLLnGsLze/wVm/rc2Pp8tRSC6wZN/m8MiKn7R6kr7nXD9lXp3fs/G0mtsbqY9N8ClNTXdK8sF90mN/AF79kl+EBz7gznD94SNQT5Eq87GQVypYpBBqjzvcvJn4APHLoDGY+7alCj53TQ1fPHAalsYFVOMxfPhL63DkxARKMbV0B+TJuRyGGxV4kdqiS+PBg0fhbne8EF714mfCM//Ho2HUcHjbReiSGgxxQ5Gaxf0Mz0adkoQMlEK50nXY8YYC2FZRp+lEHDD6CTJuJP663ZA9irRFg1DMLKWmcbEXu0n2wv2Vo4LWfVG4oE6DmxyIYWDmrtnJ+X220Anuq5hheO2xtn8Yj3CQ8j7m0Q+EV/3vX4T10yfhx37we+AvX/9/4WV/+Hdw4Ohh2LlrB0C9EYrHjmezPlJpGabTddf3AqqyhCOnavjUVydw0bljOLEB8PFr1qFFcy5ih0oyg+MIF9HYU01F8juZ5NGGb+jc+PjxU7AyruA5T/8JeMbPPBp27lqGbSvbYWO6Dn/4l++As8/aSaF8bCE4Iw8oaYDaRzkf+xUCFclolOcJqYlqyGu6hs+zmV3Fa1Gi/MSH/mRw0+AzKJ+jBhzfYTNSvA4tWpqxeSJxQISkR4JHp2y2iNdr1NRX0hVrKFFBSe1ilkaW81D7bynIkKLZL80MkwUcqSjVQIQor5hNBj61JWtsG29oQ0Y2xnyUtP+6kDpOMnPlUwFdZJaLZR1IbkWPLBUZbJ6oAWPKjD1IQN/ztn3Dc1a2+QLTi3IcKY0+6J/wlix2GVz3Y+su51MrpSygmdZw+4tuBevrp+H6Q0dgebwMT/ufPwzf84D7wG++7M/hn/71A7C6sgrL4wpqVK441llCk0hyJ5fAWlsn2IkOaDuTUcMYKrji6xsA916FQyfW4WsHN2CZHPyF9xTMoUopxk1+YmXPsOWUsrkESNxLpOR1W8DhQ8fgvne/GH7jOU+F+93rdnD86Bpcf+AYnL2vgNtddGsJhaNLyjbHaFt8cmMKk1Mbsvn5+ArrR4BgMQc7N6W9htS9xeu0LngPr6MUL8ioGQHgh1jFGppig54pEEDrMQE3IasKgXIqSAiRmQL2hOYUAb1o8HncwxvQVFgHPrvEz6Pir5pw3XgKWY9ITEF4booJjJcrWFkai8xodk2wiVS41qDwPr4oIrSqHBNimDYbUE8mMJ1OoG5rAVDsM0CNNtogjvhUv3J0OHY5SRAk4zUd3u6cbc7xxMCKIdyHqhhBWY1gvFSRY0xV8Ny1DSMKfrrOAN1AyZ10iTHMQRcGHfCKpR/+JLmMrfwy7oReJptHkeDZFvmLiuMaoxCghxBvLpQNL7j5Xnjdq58Lr//7d8Bvv/Kv4Zvfvh52795N7AFbKIrRuugF51ZmYGkKqEYFXH0dejIBfO1QA4fWClgeu/Gb4fJINdiIvyULb6ignneXoxGcWDsBy8slPOdZj4dnPunHSUl2+OARKEe48CPajBhcnqFXrGkoOkgBp9ZOwq1udnO4w20vhLZFYOMNRvU3CBSIUBCpNbzPySsKAVuAmKjvhKgnUdcaKeES1d/ABNpqnTYy1lUiQDYj3sDlBrTllMaC1/FdbAcBmJ8f8/NIdwiAJ8RtlM02KLB+qKEt1xngoYKqWaa6EWDLpQau+uo18PkvfhlWVnb6ZI2ziuSWRsUfBiA8ceIEIawdqytw4xudA+eeuwt27doB42qJA4XQ+SjuD8z7y0iHuA/CBRx9XKKWcaB4l7RAZHfn88t5jVkjzoCN67B+agMOHzwO37r+CFx35AicPrUG4/EYVld20Lo29WTG0CINdfKJXFSX1MMhR6PyOtbRAWB+JNa8WP5b7tlwo8RrqFeF9WX3kfr5/QJGozGsrU+hXJ/AT//4w+EBl9wDfucVfwFvfut7YHlpBbYtb4NpTYc7XsRSVjLIaCALb2U7I2jhEiJzcd3xKRw6CfD1QwjIFSwv4TPiFhgn1nLd5gkqyb45FJIRcFEBduTQAbjvPS+G5//qk+CSe94Bjh85CcfXp7BULRN1wiACzLppOktO7TLCmF0n1+Ged70Y/urVL4B9Z+3msCsFUw6iargZHauI97ySjCiqkA0EIqYESAnxHVzOQqgzUkmmNAyQWt8UaqKeCJRIadmRtSknPD4EeKqnhWmxDm1VCwAvc/1EgRkJcN14nSlUU9SwvnEKnvLs34K3vfffYNfqduasqGKfR9h7anG38ITi1MnTsH76BNz8pjeCSx5yCXzvve8Jt7v4lnDeTfbAzh1jWBqNiDI6jTfNb+0QboFsP+5BYpXtuY8ePTJnRweHqqQje3QGfN7QvC9w/506XcOhw2vwta9/Az712S/Aez/wafjEp6+AQ8eOws6dZ5HY1ExxnWMIYhHHseIxHAU/s+xjp7hTDhqKKNIKHHUWX2QqTerGc7ikm5eNsAY5GxRw8PBRuPE5O+CPXvpL8H3fcx940cv+Eq758gHYfdYqTW7TsLzmGo6AtGe4tFgIwKfWG7juCMD1x3CDShb30Oq/tx6V+RFmRhhz6+gJWNm2DM955k/Bzz75h4hdPHTwMIzLZRiN2IlCkr4EE8YRKbHpCtbXJ/CoH7gUbnLeXvj2tw9AhdEDxJ3PUwYNRlBHmmkGUnbdY/mMgFHdEKkgRcXNrQhhLD1iio6bWIHVZwieSrVSP4MwATu6dRYNstjs5ojATm6GKP82G4IEWpjUG3DuObvgh37wIfDWf/nYzNnFcU8mNZw4ehxuf/tbwhN+/AfgYQ++D9zkRudACUuwPtmgOqeTCWxsYPscnJD3AO4NCS7PtZm4IhaA1Q1RuBYce2uAAF1ihYUmZCnpZLCdc8/eCTe/8R3ge+5/Z3jKE34Y/uPzV8Ob/v698I9vez8cProGu3avQttME3sysUeHqwPstjE/va7fs8YIwJEsmW0n0Iia69kUndKgC7oeYhv8NR5XsLHewOnTR+DRP3gp3Peed4Hf/v3Xw9+85R1QlUuwslrBZMryWrczcacSXcZz4SnAwRMtrK3jOXSsAjRZHyKtpVN4oEw0amE6ATh45DA88B53hhf8ypPh3ve6LRw5egyOT07AGFM9KLBbYKP50bkWDS8hgxbGRQXTjSnJWuUIKYFlytRKIZxLvcfeTJLgWQDd+fYqU0HAj4o6PaMTmVB1b8Q2CjDQ+CXTrCqDxPOlLFnmpETpglxK0iOwQgk3OhucIAXG9UIf5oYigSrOpf7YIbR43FbC8WOnYd9Zq/Ccn3siPO7Hvg/2nrWTRIujx0/QMyX6IJcsF7O9AyvN+Jv2W4v2T3dwm7gXK3F5PPwoIjc/5/jcpMYAERvQrk3JE+2ud7wA7nv3O8MTfuJh8JI/+Et4+798BFZXtsO4RGLDybota+y4OkUYKqMF6zpQSAzmzx8plc4ROYMeUplzdC6d9ZJVvVtVNw2A5UarOfNGOKgIQh/fJThy+ATs2b0Cr/ztZ8BfvfLX4YKbngOHDp7kxVOLHcdPm7HEyjrPENEHidvnv7UO3z7WwAhDwYi8pVg3sEnWHtIpDB/FjJYqOHr8NMWHet4vPgH+5q9eBHe78y3h0IFjpBIpy+Vgw6iqjetR5Y2Pb01P2hy8BFP2rXjV4ntGlJC59CygJjLTOfZslzd1DZFp3Cp3156Zek0uvU3HrUq9pH1tlwIQMFXTs16HwM0GLEcFHDy0Bve/1x3gn//6f8OzfuYxsFSWcOjQEdiYSlijaomjNMasp2urOy/MoqdIkHHdQ411UKkqtcSbzM0rIpCSjjtxfxblCE6d3IBDhw7BxRfeHF73B78Bv/+CZ8K4bMiNtUT7Bpvcze6GrL13T4m5xDa06Va4m+McuJ/S9l42lJvnTimhH9FohNi7hqNHjsHDH3w/+Oc3vgye+v/7QZisn4JTp04zEOf2eaJxBpQGVpaX4J2fPA1XfKOGbUtIXTychyaCYcHNg6c+hw8dhUvvfXt46+tfAr/0jJ+EYmMCJ9bWoViSI5vOoI0ThF4lhZw/rlLDEzcVyWLZwHgyQ7l8yHyE785+lmHXByF3SiCH/ER9mwidw4gjQrRSKc7r8YPH4Uk/+X3wt3/xG3Dhrc6FA9cfobN73APxnCat3bLjaAfPiLNbV6BL9BkTAtiCnAfK6ydPo+vpEfgfj3sE/N1rfxtudqPdcGLtJMnFw/vT3cjZp3v2fDn7Bc9MBpfsOaW+5FgzViYQU+GuaVBoVhilOouxlFFJdPD4MVhZHcFLfuNp8IY/+U24zS3Pg/XT654d1E6QnSp7oLjjv6DXqNAh6Y4VRZGyKhiwKOHY+qaFejqFlfEIfvO5PwNveu1vwx0uuhUcPHgIamQZK9xoCqce6/NZKteneiemaKyYQlvukFGXM0oX7idVYuDtx2Ce/5iF6ZRida0KSJMr3AKZv9JAfTIu6rnsAR+7Wlu31NbK7hjlZAQnjhyFZ//MY+EVv/VsqDc2YO3UhIxsushQzn87c5DIJQQyaqsviWbET0c4n/GsW0TRVbfI2Cu0XBvD9QcPwT3vclt40+t+C25zqxvBiZOnYFyMDFfaYQ/Nz0hHEjcVNRsiMD3iHeCNFI0ucSnGkIY9UxNHy1bPKGjRh5gYNYEIMA/9nrvAX/zBb8CundthOg1jUVlRp9h0dgTD9JQlTNbX4cW/+mT4xWc8BjbWTsPJk+swQiMQ0v7OZgOcnsRtEy8fqYPAXEcJMMSsOg2QXLpIYh7z7LlKh+/lNT16+Cg88b8/Cp73qz8FR44cpcAMbC+eYoHyHTtjVl3ZfZ24j1zjeAQHjx2DW97sbHjdH/4G3OScPRTFBbmMvjKs+wb5UX1pJxuTY2AAK+x3XyCo63WVm6yNvARfmYvhU4wzGhdw/aE1uMmNz4Wb3eQcmKzj8YdqdIXyRnl3bYC4vPKrf6B1XcPq9mW4y51uDUcOnKA20LKLahAjjlBZElIhl/5TjERoHkwOGO+jnJr7FFs+X3GGCd07Pe2k5sZcC7wcwidCz8HQogoLzt3R42vwoEvvAS967hPh6NHjLEJIiKKIvva49SUldhg+RzGbHO5j4qCCdYneFhts/vC6jkcjOH50HS668Cbw6pf8ApRVTdZbPATPaprpieTh2RSYdU22vz65WiLZSV9FmXV317xMycR4Xo8SXgxLMfFwn6xw6DRlmEdIf/1DpMCWznonGxNRTmweqPKpSra+3BAUKmwwfwtx+sZkCjfetwd+5wVPo2MXjPxpYfSGSg/SWqWrk+W7wKTfZq2WqgWXlio4eOQYPOiBd4Fn/syPkE0Ani6EDw9gFWPlp4OnuCf+dzmkq9k2O/VaxU36en/RQRqWXOyFBzQ+oMMD+qQZ36Jjr4VKlqiJDOPcL0PXNefChkcTPaJH8p2Fw74IcpMMiGG9+TkNcw7jmDyrTiHCihGsnTwJv/Czj4WLz78prJ2cmFBHfr1Njd0gchppA11j0TmEPg2NFS3A6GN/03f/QY4KP+0UzSH5fl2j00tNuSdQR0LvkHZXTBwdFzUr1hjvzfGogkNHTsDTn/BjcO+7XwQn1tbo6MlpKnvq6HAccyzhyKfu1HOqWOgX9k/7Yc6g6FHxKHbZhfSMUszS6BApqQzQiyEL1Kt+kYpcWk/Ll+gY9E+Xx/cUXE0iMe2KysiBcbx81/ZMLOm5hFaXO9b3i7lbPH7CTwVTd85t2X7biB5/WIRiZSLlSkSeLLoB/HQaWGll2X5GJBjNhOuzZ9FagU+ZyfPMHu5unYyypm5Q/muhqFCRg2fBJRw7fhLuc7c7wON+5PvhyNETMB4jZWL77TS7rIiEx0nAhnG7RxUsk481G5qQ1VrB/WPLOV5TMl5RoBF2ntPBct/Ruo5bUEMZng9VXqL99WSDkQSy/pxy2iMk18sO7ikJSezYsQS/8Myfgsc/6fl0ng5qjJRNZ5vgUgMFVz9zPSy1SuJFBXhP7nVJdbPGGsQ5WfWe35st+Z6wbI2Lp+fUs94Y3phsgqYlhc673vMx+MkffQScc/ZekpnIHoM849jowMc/UqDScKK6UdX4HjNWYED6FtbW1pxp5NCCT+/YtVO08002lY5HYKjE81Zj5OlETgbsYDFtW3jHv37Y+efW9QY85acfBcvbSji5jmfxsxhm3keIXNEMc3X7ClTLJRw6chy+ee0xWD95mjkNl/2xlefVFlrtnRGQhdLTCR7eVe26UlVxdqBH0Kusgr27tsO5Z++B5W1LsHb8JEwmUzq3HrILEYEeO3oCHnzJ3eCB9707vPdDn4ZdO7fBtEFz1BiIbZ19+or+dsVvzGRVcPMonjoSPEuld7aASXiX0DtKscQNQRwS+BUFbqXO0lpgrmL6oHvIOQIEPLl3MNDmg+wRZhronpw5qxKJ0ndqbOZ4kvzADIMrXIg+31dCJZo7RtOWmxa2b1+F93zoP+CHfuKX4Ha3vzVMmlMMqORKKJZN9KI1o1REKSFgyNEBkxy3ZI54tztdBI9/9Pd5ry7iX2UswR6IlH5FBX/yF/8En77iizAaSQgXMi/0Iow7EqG1YgcCcsFDayl0SWxKYl+rcQFf+srX4OOf+hzs3LEdjq+dgDtefAE8eP99Ye34GqV/9dZqVulo1gtt0rCuFmDPrh3w8c9eCa9/yzvgY5/4HBy4/iicPl0zi298mkEAmMfD19nrS42IdKy8NuSIRn99HHM9Gdi1fRXOv+DG8IiHXAo/+sgHwVk7V0kB54FY6+Lek1upUypxy0ujAn7yx74P3vuBT8maogmnBI4gjyKBBQl8GGd96AfssAygwBnsE3N6GR6YGLBABTenWksMz9PWN0P6HnfMTI5jGiz7bLlxVa+ahRNb2VlttpnzPmbrGljetgyf+NzV8KFPfx4KdO8jqoHAoPbM7LvLgfYpn4tB4eoTrJSwhNe/+d1w+wsugAfc8/Zw9CQaFRh073WLrjC7twM+9OHPwi+94FVQjjFyyTr1jb17WNHEaWT4TXWwIAZaXD19kCvGliOM4b26jb6vnzoND/tv94OzzlqBowdPkXeY1OS7FuJ+klmJSpfb4IUv/0v4o//z93B0bR22bxvDeIRWb957vyC7aOUFPALH7w3ZP6u1pbLJ0g45VojPtTsPZ3b7uiNr8PUPfxbe84F/h9e98Z/gRb/2NLj0krvAiSMniEJ3YmEFBQM7tHQefOl97woXXnAj+NrXj8DSNmXl4zdy8BA+1QcxaM0eVjREF9Q3BjWzcyKqJKgcDLddKdhLor2PdarpKn3j7eOvBa1JmtHFSlcBY7XqrgdtCysrS7CKtsYuwF1FjgOsX/ChdGijEaYPEQ0jm4YMJI4dOwGHjh6BYjxUp4syXgVHjhyH5eUl2LV7OzTNNkeZ0NGf6SOyooZCkN2zZ181MJzqPpClr5sp1Bjqd/t2+N4H3gM2JqfogL97ZBmthKTRARjDM37x9+BN//xO2LtvF5y9Z4kcWyxzw95ewMpOJ8KFMiPrNrzCTKlsoCuROvQwazwqYWm0k3JgXXnVt+GxT3wevPqlvww/+rBL4eihY1CMLSXuAjBeQY7ovH174P73vgu89kvvhG2rqygKp7ZHpujZuM980oFT96TGS8KIDhTVwUQmVD9Z3z+nwLLxielWkHBK3pAwRU4B0qGIfqq7xT+vrJyTtRPtS8MGpft+ah0xs+ZlqMjIQfIkxb1Ml27facPrGTBFhjBPmS+kIW0wfYtoResGpvWUZKZpM+F7tWhNSXOKv6fmg8+h4gXPHhH7q2tcX1EEwBOKGn5k61GZhsYzDfaB2uPf1C72g/qk97hNuocO9O2UNbqoya1ROVfC+voGXHjhzeDi296S/Gttqgy1WAsNSVjTvLq6A174ktfCm976Ljjv3LNpPDQH5vTdwSuogKMVo5aZxRQXm9qxvMYC0OEPXhiHGymiCGquMWEe2gJsI4Xcz//Ky+ETn74SVncu01r0Uw/dsy3c9x53hqKKxL/QUSqzPFYGtMjaZmzgvs8U6npPcn1iQleh79gmFD8RULmgefNUMWfzRmoNsfjcbLt9L3rVqRJYoeKN77kHDmWowb7pGden+gM1jtGzZd78uPHmGbAeAenJQnh0JCBjs06GA+Q/aqQil8gWmizZpnDHi8+H3bu2e//uXFcwYk/dws6d2+F9H/gUvPaNb4d95+yByWRildy+49H+KmYNVHU3fc+4YfmgfYgg0Zz22KnT8Lzf/mMKWzxkP6DybH1jHe5wu1vBWTtWocagDkFbA3dyb1Nch/cvM6yqyhmsvDHHSFohB3OijwIXojHnsI14wZnC2anrUuHuMsRpSkXVlBm3U1LQ2R1i4JigppUltr1OzyhSpZF1k2k5/Luzrjk9nZwzuvY1IJvKmUGoRX3XzBAea5B8KCtXohLJchso+ym1SWmiLXvpM5jzSuvZr3LuGjNK3zTREFUEVqMIahQBXutm7uI2t7opmcZSNBGnB8vYfaNvc9vCa/7qrTBp1M83ISO6sKpqCy8urSnkJXJ5sPoWGzRhPayQkhcpxFJBfTlr53b46Ce/AB/8yL+TkouP3SQooMrU6vFF3k4cWeTG5+6Dc8/eBxsT5HQSiojIRtHDnxG+NE1r9J6WQGBaVOpzSgIBOgeyUcql+cXKfpmpUxYcwOLj3soWTCTOGcMMDO7lH48wVS83i2voz3OVRE1WZDKsXlIAKgu40Y32dExGQ6N8raulIAlfuuZb8LF/uwJWKZLHsFUp5rze/6RFoMr9McKaThp4x79+lCys/Hl6upAnW93CyuoS7Nmzk8SdRRjSWTwn3iWfoUC5E7nCOVlaMyTYuLTWMEDeo5pcDpooEVhi4Ikgl+FEknJEd2VIVVz6Dq03Eh2sABEisGE7l4OO9XkKpd+Lr7PsFSKhIvcizbe3hAoEP3uNjAQM3+BJTFfWT3ZLj4k0prbpAL1iEmAnet6rIUB5vCxh185VZsXFIskCrgVklFnHS2P4z6u+DoeOrgHaetCZtBm/S1QWGl6HJckkRZxDpg4dcuoe/hwtLcFnr7gG1k6te//0SLQxb5AyD2OR79i+zEnvvMZMjmGjLBhDdpmVj+WPD+GQmwA3MKPzCbQJ3eIng4fCwncmBvPgUtww5DOYU8efLlxdDK6hHNltu3MzaF41Nx0NkEHBw3MSMaWWb5GsbjK1ZTqb7ThThrKEpfGyZD+JiELndaTMJYUmamp0WDEbzH3Ni1GpYqfMmQx4dUOinhSLq5cwQCIGdjgmvumiic8WvovRLNGCLIxRvaBOJfHtjNiR57umEzTbxrdTHGZM38q9Mqh0mA0mmRpXOa5s8wmwwtaiLgSdypkZBj8VpuOODumBKqwMa6uZ8+YJRZ/VBCRE2HxBAw49zJlnjovk9wxjPGcJz/x95BmZoZ694GJXud60Z0zwkjbECkeBZcaRtbtIipgQg8fMIlllmYTpcXysbguqyJJg4Y5PSEFwVzE2o9eDCrNaLttY4ok52WqX0tNQeeHQ2VA/OiLohDqKxkgGCyw6tBRZQll+iV2sgQ6GdFEjhDhKaRU9akPtyVeg18hoZTlETY5o+nd8dBJ+KhKSTPCHzLq2AwbZE0O9k8FBW1IMJGw3h2UmzeGMfeX3tlobdhRNJF6K2KnhzwL/59mmsO0iFHjxDOXzv+e3rZExtoz6zWqbmMCtqIgKJVebZw4CeTYgsdmGFkoGpq3EOYCKzVM/J8MPqCvUUoQv9DGcRTKk0ax+pt8fNHuaBGCWSLApOOrjzML7YHdppFpyDvou104uLEH0GiUeFvtpMhyX0Cx8lBB3PD8JVqnSDURmatgqmCZuQio0wc2G7ubuU0I38BgMx66Whw4gvVnk/LVbYY6YT9lUoRfSTHbfBbvjowo9EuKTHglgEDzvNy8qcrzXj/SGnBo4TaeykPmtarU3ec17LP4HP9r0s97BJhpurP1205B43im8TN+M88TgIi6eNuOH71DUHlFk316acwmvOgDOTrTu4YQWceYLUc0uS1ziKKG/9PtTfjcXHw0yJ4ZsfmB2xudhkmy0yK4aquedLF7ji4uNKE3N+Wf3t4+xOW9ZZP8tUFzg0y3auJJIIe71aCsqphLUzJgq2BxIlcvv8hATXviJjgeGU+E01hyox1hM15HgFIaxrt1q5pAtk7dDzsB1baHNZCl0ipzq39g+sqfednPTPQ/tDcnWAiV+yVr2GRE5jvvR6URv453R49OSCiTRgSCj3IBC7YsioNug1QbNW8zI9CDa8mrunC5k5btUIsHDGfLk4oHJta7s44PBq804H2nHLOWMJN9ubaVdZ9XVv3WspjisXpQrVAXX43kIMymdNWYbYCc2ZVn/gGcwr0fab7NnO33XYPbgl8sBenJf6j1zIh/Y2Kfnx0kJGihBJyuMipx8m6cuBQwqXmVEB6vkbbt9ZZzVzk+B7Qb0oeqsvJh4XkNiLoaHunATKGsWrHMgHvH5cId0MFGpRjQc2M2+gGr92DTWUcxHJ4bPojcF9QEHwrp8FySYn0s1OrBItM5EN4P24v1UxMZHZ6DYpGL5MisEzwLtmrE64yW5VPoUj7F6nNNvtrV+UqptIxOnW/aSikNl844ukqk1RHEnusGAIva9lGtXj7dUQab9k6Me8n/p7D1JSdrpX8INjIgXe8U4xxhS/CgajQ9M4r7mZyN8QMQVNz/z757uGw7ti2ulXpWtmzy640x/gQki9ktTYva1iH7NdExjj1z61F+ZcLyl9YAbKvbkn7QMSUB4KaDComLdABiwRlPSPsbyIhiMNPt5qXTTWCQM8LrpcgMdIXkZmBcp1f8+GLGWePmT9KykHNwefGxHeEVZ3bzGvltmJZmOn04zxrOuzByH6+8QdmXOPhcLKxZCTi+KnNHXvzOuIDNzVDpn7Y7p3IL6B63LuduqQUEKnFVWtBX4RfTLGiuT4mgafZ2SONbO6ITDwaisxo+pLOWpPWWzS9VY9CCrhH0tWzmJLTkRXQ3Po1Nl5yA16T3spCml2tsG6zhDsaNWWCbKRe4tv0ahVsCRJhdokHPyupBHRLIGUsNgWS3ytIAd7hYqes5uKJcLRJcZT5800vntOLS5ZAH5Oz/yoH2jLDKFRYk5Fv/V2EKHQcLmL0lpXGMqmmvtgFft4L3ywQG87eaQrjpMYByYAzIaKRMMi9hN46EVzlLQRNeHHP7bIG3Juu1gElcxIN/cAtjs511+8yHvBggpdKqPemtq6Yb/z7t/6gNy35qru+2SHtNidNGsqxW1ZpXsUdXWCsgZJVYCy+U4kRkcytyIK1uPE8S8Iksy4Nk+9/ZtBkEyDfgKor7njAQynQ4DiXcatKxjfC2uy5owdiddJeHhyizfZi9r2OnSDPZfKXKIc/uLIgiH67yuIMSfXoFEfxvfUAfP2o23OBctr+usb2IjO7yuBjD9dbEzX9cc1nImFDwheMn967dJvgXbsRTV4Q8lx3KdiHLz2nqCCuWKhVlZBL9UOa8bZYct6yPXA0wdvk8xnZzJI0aQwBjCLAt3EamOydzQvdJ2F4Hk6U4ioj56FoeD4Wt9e1CHm0scFyKmCPjdsY+bjPRr0SZW224VCehfCfdKsb0C+I/EC3VPjZClO3qRNKZsCYhrYINE2DWEzihd+h+b0XIw3jXjkwpZ84tqTR9sYlZlDjUr50V94XF0jwlj6DHeZnaPmigo+p1iYuUBtQeE+9hBE1eYTcgWx1waeJ7/eFO+2dY0iXsDZDF3zmcmbLNcj6NwGcwbXrEHjO0cHjN6mhCdaXc0xtqiPsRKr0CG7LRgv1OYu94e+QAuw3PiuhxSW8CuFcZqsJt0b66a6F8XdYZmYpYzwxaWBPUNPhrQJdFnjyUCDWFP7QFl5KfRe8NRz4RM420NutTX1uqOojRJc/cBb+nljphMexLSxdpi50HDAw+6PXZjnId99QRKszGGi45cnnNGNzF2bTC3tIgbH3BkOCNhqfgUsIlOp9hLKa81lxaU4gX3ci+FVFAVlV0Z1edD7vLhRUYMMNcCrGFY4U4f27B3EbB6drM7b7nRpcUy5hjcXA6AYU8MJAijzoNVkGpASeFIkjbT0l+daiXMwkKLy1Q0CcS62CyEkW/kTB5emT6VZWbmmDE1B2y1DJvyC0fMWLRv8hvVSYjDSqaj8x4P6PiDfRz0iWodKKtm7gpbyYSXXQnmKgOHlJKTe1UKc0zVmT922UxRwNNoKEPnNx2BJveoF5nSyk68gpE9dB3Y+kxSqyRlfLGg0aMJJSJzFVEyUf2B6ji/+ioX6b+KtTBRFMYxrkjuYoMJZ7Jns0eIrKhEWFm+tGtbYoLFTzNQCA1VxijLap0+Eq050z+ZozSlGsBGx8EIXVC2nvF1K+nKkpsRGYy0MA9gBjhbNhtdizI5ODGkV/HWmh/p/TY7QL+twvMGm5SmMksT5eYaLncgAKtdi1FE0BdhhTUCZaz06TRn8vW6SVbDkb4OhcoVNk2WJFWU3gP/NrB24jQcX5vAtC1gAyMQun2PbKNkM7BnoCQfbMDS0jKluqD8Q6m23ZgU8CQioVvgmEIqNU8YeZhJcXIYRYiUzehEEpVz01SNQxCJVZeD58jhX/9G3Qvd7fu2m+RYVrbeyXk+D1KgcGcsLKfGkT203HNikVlzDyM5DOFFCneU7CKF6FA9sGnEEDS5h9T4lNMz66BHa6l96JOUeVt1l3sqXiOnzjEH1m4StD8OTbvUQPauZ6O1diWUZv5V0WXm2a2oe4b3qxwjad4bCZVpY+jrwkRybJeiqQwYLXpacsuUOFs7I4VyVMMj738TuNO5R2BldRslzHIiOgJvW8neRrkLs/1xLcePtfDJr56Cbx8tYNuyZjyw1afkDQkRuoiiwsUc8FSUxXZlpX2I+26rutt9mpB5sL3T3g52lVO5bDC+T9WQfRfvcbrO2ZQuTFHq38fC285nYZiXBrZzPBv0M94bwbwqoPa513lAdlXM24cBZWTdsYLpoR9CedEW2ozLsklug1qk71CpLoDYFWsKvix4RAG4Ja1IARX8ws8/Da5+1x9DffIbsLR9J0ynE2KhS6yzUWWZhpoBylgwLkr4+tHt8Pv/fBQuv7qGlWXBeUVCz2JXa4DmXEdBbTpSERbsX0Xsl8RXVqVPGY+Wk5U5jh3foZjMnGlQKXhB9ug2sVwR9EWPkbolPxZGxJYLiljWZFFEZDaoaiRdIjHuP8ZaRgrYzSAQJqHDnBKcQUYD2+uxnijzKOa3pDV1zFLhKFi+p4uxvbr97X7kUAWD5SlJa2rnyfSEOAlPXgOexJuTdfsVIWjJjZRqXYfhfkTDS10PK9DjiU3JDUUB08kEitEe2HnPJ8AzfunX4avfOgDbtyMlFuCgSBAulIQYW5Rw6xvV8OT9++DZj1yFq19zHK5bb2GZ8mE5qTHRnJWXjciwCEHW87osyfXeWqEMFPbHwQgxKAq0wvairoIkiATLN6yXtkNbUJRRtCs/bNO70D6Gne9WnVCGtv3V982KTyIws3s015q3OGSXhxjy9D89eOWijZh1J8w25gB72EZpVLEiB/79oO+jUdn7GGN4MjkJ5930ZvCcX3se/PiTfxW+eM1hWN2GaSuUQVcbY+45Kq0/9WU0yDgCv/KovXDHW5yGd35uHZZXEYJdc2Hr6hqscfrMZDEwzhptNGvk1YQmDUpFDMHS7R377XbZoLCDTn6KrH2JasdHT/H3UDxhbG77Ht7rDM1Ih+E9F/za6ybIE0vl+VT7cRUNrK6uhgHqHUsiuvXYwAQSMmp8+OaSeAfouNu+rn1UJYtmLMotbVuCpTHSPA1dZNfO/hX9Ah4jOllYb7sUFUZfFDJxHXVHbs56mfgtQMg4cSdPnjLc3mygz/W5Go0pgfV97nIB/P2fvxDO27cL2mYDdqxUsG2pgG1LJayMC1heKmF5qYCVEcD2bSP4z29PYTIBWF0RqpVs0QxW4cEC3eDSxQgnTp40OoVAKbAYczfXugySumDTxcyZQjDmFcL1GsK5INBOpzXc8ubnwerSmGTnsHu6RsWM+Qb/NyfcO+WJ/MxtCVPQmnA6mcItb3oj2LGyDabTXNRIT54K4RxPrZ2iI9BePlS3mVGkZUt0f/4gNwPXm2WVEg4ePMJsnmt/cYYaM9sfOnoc7nGnC+GvXv0C2LG6AidPbVCgbczEoQkh2GaCfSdbqKAWlpoksRn9bzuWQel0ILML6w8OXHdAZCEzB1F0I2/pMwyk089IruDB3VTWLqBXs1/raYBEE6GMaARz8OBBn8O3Z92Rw9o4NYHb3fYWcOH5N4H19dOSS8hyGfp3wf1TbEJUKEpKj/LA+9yV8i7rPssVPK/FoH/rp9fhyJFjNL7N7HvuQ7rrWQDOygQ55Y7KcYoxW4BxNYKvfPVaOL0xCdJR9HWIlVHd3uNREm7S0aiEQ0eOwX3ucRH8n1c/H1ZXRnB6fUITay2xUInSojGKyMYcITMy6nEWMWyTpgYsTVHA8vKIWDrMFp/yCnaqnqQOhe1eJ3UDX/3KtXSGzVlQmDfXCCWBjbgEvHd9S7RpWUDnhuiiJ3I9VuYKbc+7egyv1Y0Tb8dhaqN3gxQdcQ+VDpfw5W9c74Pj294n9hYqJfft2QE//PAHwamTuJ6VCaSOCj7NxGjmmEoqpU5UgvfMqOTovA+0EJFgqtRb3HQv/MD33R9OnD5N65mqz/8uiNgcPXISDhw+AWPcm7IuCNwhj64eVbF4oH0X3s0czZGuQJ5ZkIXmxetVYaHMMB7BNV/9Flx/+BiMRqPNYyFpG+tCzPaAe98B/uKVz4WlcQEbE0YSPj2mfx61war08dXkBtjCdFLD3n07Yfee7ZQ312/C4QUX8NjxNfjiV74BS0sVhVzV+s9MCRNxDy66QbL3o98OYaU3Me2MtoFqPIbPfPGrcPo0pyKhe97dqNNMOyrh2ImT8NM/9v1wx9vdgrLcjzm1oSCUfOyMYo7hpt7tk+6qcQnHjp+AJz7hR+GmNz0X1tfx9KO/ReQ4l5aW4Iprvg4HDh+FMe59bS8mZIlxOAVlD8Oj+7xMSZ65AYk83600gRix8vHSCL517SH44lVfhpXlMaXszJeUfBMrCHwZjcZw8PBx+J5L7wF/8arnEZabbDQwKkVppGfSEtZGj0v6MTQmpy5g4/QE7naH28Lu3ZjbdpoGjM4lwxI3DSwtj+DLX/sGfP2b18Py0jbOmhCJ2n7eU8jQrImmv3T21PqEHQ2mFu2yNWk79HgorkLvxWXmprNhlZtwBlEC0hIkAWXYbduW4MorroGvfPPbtJnDeGpd/MlyZg1796zAy1/887BtqYK1UxNYGo2JmtOqZlyB2mC8sfG6Zb+V4om8ZWzk1VxS8zejHf94NIZrv30YfvRRD4In/9Sj4NiRI1ARUolFj7jUxBF+9OP/AevTKZsld4C3K6h3Y4Fx6kHN2hDo8ITxmJFetJuZLxlxP8MK48KfWp/AZR/5DFTjJWcRExLiYfizezSLlLiCQ4eOwkP33x1e+4rnUC7ajUntMH7Yl3goXSzEsmgJZTWFhz34vsR+L3J8hKzwtqVluPzjn4Njx0/BqBqbjsxRkTmGsJ94UzpDiKRs1i83Bt0R8SdkwzPPpm465A1Eda47eAQ+/PErYGV1RXLqhscqcTdHZQXHTqzBfe5xMbzuD58PZ+9bgYOHjtHYcA7xg4AxqioSpUYj/DuCUTnia2VJ91HmLCv+FCP+i2a45aikJGX0jHzoGcm7XOK90ZhSiKJYduj66+Enf/hB8KoX/xzAxoYBF6u9N0OgsRVQVi0cP34KPvCRT8M2VMoRgjC8eiL6zawSvNo9RpqFoQfUnsD0yO+vrCzDu9/3MXjWk38URmPUMGpP7JM5lWHnwU7DmP0NF/n7v/c+8Oev+FX4n896EUwmNSyjut9QqpyXB8uxfK8cARxfW4e73+kieOAl94ATx9dEdk/JXgkZlTi+FoqqgpOnT8P/8+7LYTQeQdNMnc4/DcO2DfNEjJCdtJpmgRZnJdPthbWb34aYBe8HzzQECG971wfgsT/y4DD1T2oMNAUtVNUYjh49Ad973zvB21//e/CyV/8d/N93fwQOHT4CbVlDUU74MEsDFEKY0BxD+JaYbF5bcr7KPn+19sF9N9Flsd6lqoCLbnlTeOJPPwl+4rEPhXpjHdbrloE97HA4JtG+79yxCh/66BfgP668BravLHufhjh88VCEzh1zRDEBwCF7l9qvMXx2dHreOj8YHpo+XvGf18B7L/sU/NAjL4Ujh4+RgiLs/DzAaxZAFgeBGGWNh/23+8Cf/d5z4InPeglsbGAwAVSE1FCKG5gaFzhlAP0jchb5ZRVQ1Ovw80/5KVjdvg2OHTtOzhPd9q1Jph8Iboi6qWHnrh3w3o98Aj7x75+H7Ss7oUELKuMY4bW/GdbFOXKHnE6Xkw8tsl3WhBnz5v52YCjeJDG11D4nKEiwnsxG79y+Ah/66Kfh45+6Eu5999vAibVTTgEUn6s732ECYkzleRJufO4e+P3ffSY89cofgcs/8lm48kvXwNraUWkaWWr2zSXrLTKO5uRuCNgqMbOlltgIODZObO11/sQ+HanzOefshbvd8WK45F53gbP37YKjx4+yxV+BtmKpOfVcpSoFq3IbvPEt74TTp9cpcXldi5ky9iGwXAzP1UN4ViwpV6Up5n79U+TM0FfCu2HY1NSTFsE4FrAawZ+84Z/g+x5yb0DY3eqCa4KU7sDhI/CIh1wCr3n5r8CTn/07gPonZKuoKyk/bDGIwCgSqHQ5/K0D8PSnPBp+4CH3gWNHjxAlnZfVIb1328Cf/uU/8PnzsmZINkH0upKqo9C6WGqimlMVpsWC0Jl9q4r3nsqRjPg66yCQezl+qoY//z//BPe713MA2jUymsw35OX6qhrB+kYNp9ePwm1vcR7c6bbnQ10ikKJTihhYtiUhZ+4B5ofS1LCSRIC6pZp9pbiKSM3JgAGhqihhWjewtnYKjh49BOVolGWZw/EDNHULu1e2w79/9kp42zsvpwTnNZm/ppSgM9YoYMS6uhu1MWcKHLPnqTbcAkaY2ygx7Ms++3oDu1dX4MMf/wz87Vv+Ff7n4x4G1x84Ruz0vMARdszteNcvosSHDsPDv+9+8Ge//6vwuKf9DmxMMTbxmLyYyL2xRqrsaykrPDoawcHrD8CPP/oh8Gv/62dgbe04Y9zOHJuoxY4lYVUCmYxPJ7D7rD3wtne/H97zvk/Azl07ocZDf00gZpGfHbocYTkKR15YIUKMWTeiIeqMRN4rbPXVcb/rKSEDmBINtE8i93R0CGHveF5Zb4Jfp00Du3Zvh7e963J492Ufhf+2/65w7OhJYpNV1u7OMXODOD6UUZHGnJ40cGr9KDQFWtbZ9kvTjzrRb70nJra6Vh0G2K8Nj6EkPUo50j3aHWtcsCcbaPNfjeD3//RNpEXftQu5r+60co3KLagbbLeEfTS/HHF2WuitLfEQka1Es8eX/dGb4eqvHSC5AJM5wwCl2fBWsLQwHo/g4KHD8IiH3hv+9Pd+EUZlTe2jwoO9tJAyiAJjVMDJU+tw4shxePoTHg2v/N1nAUzWgbwV55wZlO3HY9SMH4MX/95fAoyWgCoyABAshgv54i0k05xvSNnS160MPBwpej8W3cDdM9t+qjvgGiKWqoTfevnrYO1EQXNk2fTZR4uIgBHRVjCqRoECqhr8wfdGTrGlyit/XxVbohQbVZJ9keOZDeFoJpMG9u7ZAX//jg/AP7/jg7Br5w7ad9nD1kB8iK+nNkO6njJHfa3Oh7G8DCZK5p2sXNORimcJShtL2yr46revhee86A9htLTMjvmdxZuH9UsNkjcgLsKBg0fhh37gEnjZ7/wvWJ+WUE82YGNjAuvrJ+HEiZNw5NAJOHXiNNzlDufDn7/6OfBbz38yNJMpsTw4xm5YeiOdBJMscnXbwvbtO+HXXvzH8Ln//BpsW12ClmQfzxa6dJXBlBmsamNSSeQVxxJbTsdsC6lZWMfQwyfsb3f+nGY7eTYYdDLkAWgfGNfJhDjMUSNbkv+3b1+Ff/vc1fDC3/0j2L1zDxSI7QwCT0ftNC0HxjQhp1DEgSKy/e+71q03XVL9LIjl3r5jFa764rfgN178GhgvrYhjhlnrOAezu2E5Be1H+smwn1xG3e4mBCu9br1mOo/IhY6syZsEOcndu3fA29/1YXjh7/45vODXnwSHDx6DkoKsJ1/cRCmITTt+9Bjc6W73hdPnbId9n/oLuM0tjsDuHauwd/ceuONtLoD9978r3Oc+t4fV7az5rMoxFGVlwMMGmMtgxBZlpnU4+5xz4aW//zfwhn94N+zZswvq6XoUnym/MYI9yLk7uuvafSsYL6/PMNY5WebGnT1RMcyQ8VilmU5hz1k74c/e+M9w/i1vAs/6mcfD9QeuZw3/oHbbBa4X0e9FxbX+ggh/2/IyrJ08DU/9hZfCN68/DDt3LMG0mXaTp3XY6M2XhDdS766Z0bLgnFixQtdwIWs4a/cueOVr3gyr25fgl5/103D06DGoG9TyKbDMUhjMLuoSiCzR+qlTsHzexfDcF/4G/PIUNdZjWNm2CivblmA6XYfjJ9fg2LENeraTANrJ/f6vfYYd1ms4++yz4Y9f+1b4zZe/FnbuZicLH4hvdgY8x4mYpmIFVRAjOCJ66jivmH7wPFlW1hm79Ex+LkldanyGw+CorC3s3rkbfv1/vwZWVrfDU376h+HAgW9TMAbieJIUSmpIiolnBiBnFZewD0qYTGvYsXMbrJ1eh//xjBfBRz57BREH3Fd+MJHeQ9VFm+uF+zY7O6HdWxiWxpxl8aR6zTSzTZIOwm4kk1cGNYk7du+E33nFX8Oxo2vw/Oc8BZp6HU6ePE2H6F6RYF7fBESjFhqx4XiErmBskrdxeh1OnzpFLCrKw2gUMFTmUF/i6XQDlpcq2La6A176yjfCi1/xV7CyfZXsoYjhoymxxzyeKQ+tZ0wYW8Mmk/O6YENkWa1paOd1xyTkvGT6i/MfN7GxHGuuuTtcs9I/Ey+NB2YHYVlD7iQ59ZcFrK5uh19+wSvh6KHD8PNP/wlYP30K1k5vQDVCaQ7XXoM+2PH2r39Bkkkf4bFcUL8yyrUabMLwPZqmegL7ztoJX/7m9fDUZ/8WfOiTX4A9u88iryW1d+c94I0/fF3RqFxcNHtVtegJTsvsmbSqxk3GYomi1bvGWd2obEcyEV/bedZZ8Ad//lb47095HnzzumOwb9859CKGy4kBuGuJlLZQ6uQmakOKjIfseMSDGJ8UF2LiFr+TMymmIUw5S9yes3bBsVOn4Gf/10vhhf/7dbB9ZTuJ/rhRvXlhV57pTGdGRxWPv7dE7+WzQWQG5TS0CnAc+SLRkQHubskuiSE/O3OsrOyAF7z0dXRef/2xU7Bn727CPdOa45bl1nPR0g6dCxc9Nf0s9h9t45dH22D33n3w9vd9An7w8c+Gj/zblcRZ1lOvCe8P6DIMieQl30RupDDTgHkxeT3BL0Vyb6crTkxj2+R6OoXde3fAOy77ODzysb8Ar/3rt0I1rmDPWXtgVBZ0n7R4bvK9hjq/sGH/LGGgUdgQr8o1WA8lFw7G1IiA37RsE93iscgKbFtZgX/458vgUT/xS/CGt7wHdu/ZydwJ2dYyFnVhdLJzlqIYdp5j2TvseVwo7C6Oh0zdCoNIvYdSiFTx7wY0LcYQS8iiURBDO8f0fmPrspMcPhuMFp+nFJkN7N6zF978z++HH/zxZ8Eb/u4dMF5ahj27dwGeHLWTKR1BMTLUD7sOWWeVVhCNJxh2b4R7JSYq3Q+nOA3fZWtCdCVsmhqWlkZw1t498K0DR+EXfu0V8ISn/yZ86/qjsGPXMiEfZyTiNMBxuKLuXHbXu49L6NYVsdBGa5YC+QWCinXr9xsDMdbunTvg+iMn4VnP/X342394N/yPxz0SHrj/HnD22XsBJlNY39iAyXRC58nMvvb1wcqpGCsL59Rmv8JSQUHHO2x+p/Gm1FqLahGjfIQJPJZaXlqCcbUMh4+swdve9SH4yzf8X3jv5Z+GpfEY9u7aBZN6Ei2ARnXExUwcjWWncDa7mLuNUTdH5TLZAeOG80pBRiYy465xVL6UxQ4oiyXiTOYqglTnDpYkjxMlrjfgrN074OvXHYGn/fLL4XV/+0544mMfBQ++9F6w95zdZH66sT6ByQSBp/FH0bSeoT1u4QybeHxeeWi9oOJ1sGKT3tdaS7IDQC5tPF6CpeUxUd4rr/oy/MM/fRD+5h/eA1//9iE4a/cq+q4RV+b7ozBkuFjb15kJwvNTlwTJfRc+gD0NnTxLU+xsSNVcTWfKS3Lqkyqq0+jYqaOAcePpdh49P5CCnDx1Gqb1Btz2gpvDf3vgfeAB9707XHzhjcmkbXUFDdkR3/iE011NLPed04VwwmlUMrWlkQ2bijxbeLhTjqVFQ0OjNLa8Qqueup3A6dMbcODgcfjS1d+Ej3z88/Avl30c/uOKL9Lz23fs4GMbDRtjuoPymDPl0+MSFWk4zqlHRJ158wGFwjSk6jhm0pNqBoxyBMdPnITH/9CD4RUveaYLkIcB/wh4Ra7EcbFJH79bT8fwc89+Kbzx7f8C23etQkOA7NeV1q2S/jt3XO0HBxDgLWnZGLmuObG036WncFwPW2SRorZCG/RT0E4ncPGF58P3XnoPuP8ld4DbXXhzOGffHti+sg1GpRh/FDU0sp4ltVuJNVYLtVA7G4qHAYaBXveuWnGp/obWkay8JKRxDTDdADhy/CR87VvXwSc/ewW85/KPweUf+xwcOXgMtq/sgvHSEtTNuoQ/ljWn8Ma4PwVRimI2nDduL4QfHw7Kz6W9budNr3cA2GMP7gA/HJifuXPGLgB3uKgIgGMTsBQbjN4iyEOtnzoNp0+uw9J4GfaetQtueuO9cKPz9sCOHdtpIRHgqTdESXVD2vTTAkAEHLJAKPvShQoKTGVBX2uoiykDAQJ2U5Ez/6SZwImTx+C66w7DN759FA4cOEbUAJ38l/F8lzLKq2yvZpICmBLIj9uy8ZOj53Q+7Ly5hQ4RogdgfBgRkq6jav3Z2AAjWdzzrhfAhbe4OUXlJB9aRGSCZJTjwHdwHr90zdfhk/9+JYxXlqFB4HbsP1MvWifZ2B6Axbw0uRENAKN+gVhJoYJYj8NlHGmU40Yh8HAEC2wPXTlPnz4Fo6UR6Rluct4+uMm5+0iDjR5HiIToo5E7WwUa7By7frJnFroEVqg1FS4L+8yGFRSZhd5FKzxRL0qscQTEU2vrcPjQCfjGdUfgmwcOwtqJw9S/bSvbYWm05PQ4PFZPfTkmGRIHJYAJBCfr4K8LEjEKyOKGB+CooR4AttesQoohWHP04PJi6JIWNqYNTDcmJIMSKyWYk9/BSVdqlLCYUY7dsk+tpcA1NIBUGKnViD78GprEoWlVQQu2PFoipEHyUNCmaGLNBAfKiyC2kw+BGiiLO4Y0CsChBewsAFbqfvLUSYrFRKMgr5wQQzgTTQq4sAKrq2MGIuxUBMBctQVgvb7FAKyhZAm00AqKwx+tT9fJEwgDF04pf5C06SawCB39SZT3HEZDQKpzzAEPHHutMrVQSk6iJ0EViwpGUMISuisulVCMeU3Ykw5FM4ETzMRIRASyFLUXgM18LgrAI8u3dzZgCAcBEx4otxaIBMF7VdqlvSPaW8JuEtMKQ5OUFYy34VmhhrLnuFZMARETa4fY7ZtpjWVdmDFRbxACBFVW4aaieMP4OmJyAWDaVIzlEYkg4iDkodZlfsm8pkw8WvyGSRf1kZkxM/2ysBOtOIODA/S2ge2r26CotjmxjsflXwwszHADN96R3e8x/wytTadvfnO6rrqHFHrkpximcOhfz0PrGnGYIZRx2UUQrfbIGg69g6oCxtu3CTcj1I2gyHN8BXVHgIQAnz3LdHw+CYawEKrIpFg6AjyIrOX0ikZFyAKJBCJ4ObnQrDmBMBqvY2bNnPeZnTcjdvWYCszaLZwbyclu6QrmKrNalOLc+gK1vS6wGR/9bbxRuPHqcY7sBD9KlWVzCJkirbeyBLhRgthCHCyc5TW8Z5RRGmjdIIiw/z1zk5L19dw0Mzdzz3OmcERHPZv1AdC1Yy4Yg3piBQ4B2pm4n7rLMv3vBMdLlVmbQuswyUuJimqkQhv7K8rT24reg24jUtbJYCrn94U9c0dCIA/WLJ87IFWRA/eOZG00UXNtwzM2/OYBKllzkdRCe7KdrqBHd5ZZP68N7L7JCiZDDSK2Wo98nBbXsYyBZOgoGrNrsmNVIWBYju6IhPpLxEnnz9nacDGyUSTmctBXl6C6C9ypebCt9m/lxFxlruvzoaeTIDfHLJgjPgU0va5UlpSMOeQiuoRwqUxf7dijh3LHfY578HPHTEyY2LzTJesQ7xArMKDG9/W37BLHJCXZVOkW4w/pmnIJsYijw7ZtzUrEY7FNfC2+3pmo3mtb740UzrjIKdEjdkMp0Y2AwP8S1qczi77+wPNC7+j6xOy9DSNJwSPlB7LohsXLFse6uQbghittBrD1aMVQGPonIFP5ruZ8GVxNZ2CMKe7T2oDHTabY1kI+pMcSRB5GCZC/CuCJuqMj8H5p0MiyW2FksgXTumUAnO/LogNNovyBffEbl+3JLdpW/pEOiTlmsyWLxdCRxVTPU74AxZiwoJsY0oxiOAPZZD50TFSUozC3OycCM/uYha4FilDJeecmJvaQfnmmO18KkcAMojJruNnADfMXy2ikCqcXDXQzeb7eKzqEJRHZI1fcGWhvF3yr7kmKSBG9a7V6eHQgvzs0KTIy4OMktrPlNC8GuPVfBWYBcLXxJfaaxmw4BVHqOGVQIDqmxmhSbiey8Pm5jlh084vvdu8FJrR6LyC0bA0WAGhl+u1YWbaO49mIZf3YIiuc30VKwHizxtJbMTlWOraJ5lbdhpZbrU5IzuvBTa98cYjUzG5Agi1XJ9yN9fGkV0Kb83ANcvboguCtyzXux16wyGEZKWjL3/f6kKrzHU6XPhtRF4e/w55sYrMYOWXhuga+kpJeh7yaToDmL2SnLNi9qb7MP9b8G5b/vKFFh8VLMaCfvaK6/REzcj2tzrqc02sMm1X/FB8j6VkdYWzFuJ66cuAOdPnzDXqHCHOQbXBzqiP9Bt753RNOpGqZ/ZGAR6jY/8gs0HhCsZwrxiSB94yGvYnk6YD99e6OfSFQaPqUS1eETffUEiiMRhFw79HZuM3umJo6J9dZVtK85zpvd6iQbSZKooGWxHM+tqH3+7YafxdhIBs5ZRZdTo+EWrI8tAZ+o/X0VoFWAupW0spi+3P0YPxyCpjtn7OOs/2TPok2219LhZ7WefHPeMpsOu1MQsV+Xe3SOzOkYXj1aNQyGqpk1UzSiQlNyzk92Newh33ysKWui+PxOQQmy17SPzHTbZ32A6HKmLT1VJ3R/lh22rJYgY7Fps1w94fPiAX83ieSt33ElKwCYMD5fiwl5rMj/tco7RY+1X1n6+dGTrlSjc1RxVBQjAgBW17ZnEpxGUKyhwBz9EwsOM7z7tBXovfjIDjuawIvOsC21QSveQbMHrt1SxyKJzF0F0yg2Py4FynZtZ/VHfOSypNqw+04KWtXPEdR3UBAF+33ziA82UtS+b53Z4CPIlm7R6Q7OM5RN4qhYmXbE/7NhhP5zuW4m84byOaZ7Alqs9x9OSW3+pE6O1QxKUwycEnzMrtpPUsso3Qzxay6jk3rsMYhYd+UfY3byro/pkxMIx2AstXWi8W349k5NjLy7nZhlEujpwjWNLVgyvdblsEmYnOzkGFn4wd186cRDMv/Ue6quN4U8BJrWct36aNYbMUZptFow9ss9xcXt6zDnWjHYmu8MFpKd6UzHFrwwwRGsLXQUARB24oFWVGAxuxI5kK+Q7FczzMSvK376UFOsMk+FovU0188KjDNzAwYl6nLZKGLSyCCZc8kPdJJr1FaFOrvlMELM89CbwAK/l1QFGFagx1zN7Mr5EqfmDJg+kbq6seWRUb8Do5trFgujZIht3rWhC3RW31Bz3jUXQrkPK7UbE+wKdnKhlY6XIfFlHqs1VPIbDIgdZ71kbbZKV9ZMUPT9WiDeZdEsZwB/2vTQQaxskVd6JwdDJbSdJeh3MwXYy+uDu8UHfeQWaF531HjmHtwQNldMz4KtA4OkczsPStCps3dt3vJFIqGMgN1ypFgP2fXeg5KOSqxizS8keco3fpnDP8xTxIdKRolpKPqUleHofAiTdw1dz8G1BRTQtMbUSyMbJodeZ2jwEMZgTlLscWvD5WdhtZLIrkNqjdE6WCTf3uN7zy0JwA86zFjn+kZa7qtSEacUTAjAfmLuGTmKfYx5uVs5cMWl3MwdxOta87kVMl2vzCy/Sxz1mCd+p4z/TGf5ENWgBwctmcxMMjVPAoMvZ38Y1sJsbpD5uix0bnvcWUKazpvjyGKC7cvwvqsQj3wrMlF68jIaS4KFAU4NuF66KeRA92UmNjE1mCA/qoro1tOZ0cda5dTKSRTOWMZhlXmUoocysI5v+rwfbX75X6z4YpSLN2oSqD1ua4/csz9hEo55aYy82+/FxnqZwm8Y6R6AGIu063Wy9hzS3oxn2MZ4rzFm8x88EZwN0DaBhHFFVHwAvV684/r28o4JgKZ22LvWYD5r1e8XG0E4Jjgmc3vL0AwB8EV+iFQFk9LgnOKepTrqGOtE9yafJ2xBnZsWp/4XLsaTDvhXKTqbnuoKn8G9WfR+5sq7fzPbyHb2S7aJUV4GTg0LHTY2wRNiH4vFsI0FEIXGMyWzKoAcQ9LFWLQIa1ajCpOEuLVQncj2dV9l0gUc3Y/eN8hGyXYM8blYpd0kE188tB5MeEMIl/oceEmLNLQ5wawuZ1mY6TShxzbeQF0RlnAxz1RyRlX5I3IUV59Z1HwD1glYaxLdaZmpQiHhunvdpfFE5bDB8KMxlYAaPwlU4tj1Bw1UuswjSAxT0GfYZ98Sy2sFJgDexhlVwzes0dMVgFE4XoYcoIJoM0swQpCei5+0KlN3cfZaAAEOzcuPnPsaqmdy7B4Si11GKQ9kyRgDo49C+7EHlF6YhwqPoEME8xxVyRCCF1SUwOO2BkYupkZcS0SlyDrTCGArDQnR3iD5a95StE5CnS7Icq+u+k2A8s487fHsNm7WvI+9Cw0RXzLUEV+UxZPs9UvSgEXoDR9tQVydE7WGFY0ZrEPLzpHXOWhpWBjStdm7jG4YUpadk7J4obNXqgEIT1ml14OwnAxwuUUKSVTf/VzPekZiVmDUPTpEfsCjXZLAgGbpWtHLYaYL4pl36hiZqGyCV1DADc6eURpGJM6pEzPCCvp7GgVt3ttr9tMRICjRnspfSpE52JAZ1RDRmkRsUD0M1G/bnCnLArZSujj/GLNCh5jmXUbrjk1dI0Ib9N/5ijpTvx6VHSEQrck8J2r3CqVVAE2dFN2/Lf5mE4DMJBajkh6gm2l4IPi+uk4DVU8huPBMDgppETxufV8VuOMBVxhZr+Q7gi5DFFGuvWMG5B9MusIs6e4HUeK4W5WE2YII40Hx3qbjiSOzHL4RvjdbTJ3YK1tmCMPkvm8/OOyvc+LfuJzsL5H9Xw1wJfK7KZmO6ENzBR/dsrPpS3FIoohEz2g48EYrFsgWQIppzNIZkwIhvr+cCVtyIQF+NOE0rG4LW67Y2M+o8lOdJUBfeurudB/UmtcDOc27HWDxzk8b8hL++e7QStgoZhoiX4GIm3n2XVETyccj+BYBSPLaVtidMBAIx4SesAdybIuLKlLOL1FJXH0oDIT21STcOdtC2Y2PWPWlcNw9WUq1Mgi9IwGT3PZt51M2NsPx6piY5xo7YZip4N+xLyfchGR/3UgDJgokVZh2i+FDN3xOaQbpWo1yreuRZQ8sKBE5AwWexU/wwhPnzHyHEVc19sTo6KFI1AUNwpPgpWPN1TUohhyzRJ2i5CS0L8Y87cLymCOkvHZK02/i8Gs2euFG3BwbSBWAUf62r+JZi2Kd+6nhjA1SFSFU6vEbCB9FWWMIEDPKcgDHUC1mGfzMvhwHNY9NgnjgHUFjFyLzoNRFF3soppyw/S1hHRJ15Et/kJLQN+dlgLrM0veua/9DOz3jSVZcCogbpt0Jm84JNlcetbLiBjvcQAI23Gvk1FqnKbw3LFoHlRcTc5mjvEjAnoESeShdK22/rScyYCVfs1FjMxswnR/N79h+4uRE2c9mTWQsHKur9Zm9oubtHWFmzTfD525vhmZgX7mpOBD5l7ARJDp3ByCskaJpoZE+ND9ZvMjUYnYWhuNpSsRyr0+RZlyT86byd8LbAg6kUdnrGluj9i2ZxZ23hbacnBUFKOvtEV5CbS1X53gaCBx3khaW3GcV9NTe1+up4LN9RYXWEDpFCbDCj1LgsH2xl8eUvJoZKbUZBCwew812H5aXEjcwDwyDuouMq+mQnM9cAo9U8QzRRYx33urhIrHgFUH3ID2XWzAgxd7uCS6bfZJTF1tkEDj0udDFEmmCvQUokMOzLqg4oevn0MYSahYl7gt5cdcSFYE7/3VpcfCuXUQ9EwBR7gIGTOJO5h4j5JM+eDsnTrnRKEqrlhOLYib7ThOvIhz9xWUzK9eRNaK39nqc/R8S+bOmSbYc5ecjDzw9RY38SBBKkyDGXNk9nuclrWv3p4JVW1s3FLaxXT+kpUNBzEGbfg7kNe7VLGL+pRFHgIJ83KV8duzSc5QAaotiqsxpM4XZXG7GiJjC8xvGIwa3bNj59q6RgRD8r2GPH8bYXLBhIrUJVSKbk0xSw5H3xt0PH3dTSAZYBh5KNgrPiZ1Uuh3U8qcSUgVImorRzok4XcoYGdGvH14YTya6FFpz9mc6z1fj+9HqNcIIoh0toNnzsKJypsbBsuvwdlTABKKksG4Od2JzI8zhgm0NMAjqXzibUedLZiG65P2G4+3gzFoSdltB1XPEnbMq5Rypp+d9jtWuZY4TXwpDEHzRcwZ9zlokQ9Qhzo74FQ/zzzZK2JHZ51cd0P6oMZYwfzFQLSJIpOcx7c2RWV2FGZ7xiyWBz6iZJp+IjbUp7Gb7ejCwsak1wBzsOk0h5IH/FSvO6/NHJfKiz0TnfBT77aaf9nmBvLtBxmpgC3scnRL5jJwL4wpsu61TjOQxzj2gTk2mlvLefneoI2ybZq6hOpz5XRaXwUtHOC8QmZHOTygWN0nWnbpOaRDbJYX2dHOAzzu2KXHgDyB5DS4V0z+KUuKU3IsKCBskp0Knsgp+kx7uokCzBzAu4+24TXrGQ7CuES6750karpp1RF9YKhY7V8HF3FoWveR6/w3we7HgN9B0vEcaF+9p1XhgC41Yb2D6DYkY9Lk5x2iYIgHNznAn7kzBoNP9Ag0JkoDaiNteAHXT6bNVeXRr37wcAFwBSeG0sMOrFdy7MpZLkfHw2eYXdHilVc+4xtZ0DSSGW5WIZ9wYZU1gRlVabPQmQ1ikAf5lZaYRpLPWp2FCSlkpO8xtk0CpnGOU88amdxuXGR9Aw0jfcLs/PDsOakMuG/hxZyTFFE0H54XZcKsLGWsIY0QWXwdP5V4DMnHeRDhp1IZQftouqQMBCEOnV+Dfuiebny5L4AcpFLVPUJaO11zzUHFvzv+FLrmDhsYL61CXSE1KwUmKeuwZDqtZv6lN8YMk1wCpC3mhlBxJHmaCjWxRcUVZlmUMS6iDtF5ojmYwwy0iIz3Aa48+pXL8BiJtKcfUyar+9accZ87V0z2vKF1LHzm3hN/KvP8mXjUUkCfHm+OSp28Yi7ZYxN/0TYKmy1pp/qIzddsFkae3FyY93wJ19Js9ggHFgE1Thc/PQahRMd7Hpi8nK0JBhy3l+1f3J72t9upTdnZE44jrPVRl9ysLavLSUXdloU3lVTFgx0YplmMLCMo5AdndmUlTLjRAltfoURqkEGLgvWRDWjs8hFqPYnCKqse1KrOzj4DvJ8kXWtOSh1uh0xhlKtdMOKrDa+Tm1vTduf8UFhASltpxRNdzNCzk9lQceDX4xoT3CBXgsB6GphAWXOJ/9wB0VkyrIvNFcp8pHiTcEz51CZW7FMOKwIcN2iJkewweMQJWD2YSBKFSxPK3BhTS4l354IWSlgg5WZcjO9QKk7DI9cvJkSRb276cf4r+9spMCOETMngIwtnY9Gm+0fgkpKTK5qh/VQWH8b7tDOqpvpw00zXAErJWWI3V7gYvpdKZYZhfsXXPTd97VkRNFRdhC9Lf7PvhdrgbD8jC53oZva9+Ai8pwXuTY/zeyAyLUraOi/OcybvoSTBDMgdZRS640it3UzOSPdmrwlpisMqumJSR1Sye2TRElLn8I6XzZ017JASGfnknrG/irKsmmZ6omrAAXB53TXvuRag/QTKlJhBKKOlkN5abYNipFCJ1FFIDZ03JwAJVm236gw4LReZ2tKX+2yq3XXWFQyKjx00b/szdKIsloi186od6Ws8ncmx08acsZTnE1sS3Yq/d5oOKT9vUeEknMY+EvXUNt5xdiaD41YWZysve4D2bewfMLtYfjHTkDieU7aKTzDMouZq/37CF2XRvo1V7ZST3jKEorARl66At1d21tBXjVgpChgWTcL6Oh1z55UiX9FH9mOSb5XhCrAz55WfMdf/1KQEVbtIWf66KukcSxfes3NBir8YkJUbDzSbOR48hd1Tj/n5TX76igt43v8Yz4aZ1wCoU1CX7nVCAgxe4QTcUr/EO+amjBgT1GYMU1rdJKzw1F3ofITMNlULrT5pPYdGQ/PNUJSySlynWHRB5uWxWdykG6sNRm8fcyJZy1Fk67fRvf37yxIuu0x2dvmPbVNvFMRGp0cZpguZQR1nrbG9uUmkmPXVTDQ1+5kum6YsWeezQF/tJgqiWYq81ImGmGQFM2xtYLgxsD9zK/5Sa0/YbK468nVbItFf2sjKzMnSsunxekkRMK1SUaWpbtTJXJt9TE2I4OTimSktQFU19XSjhNFb6cpll6n2CMrrr7rsSwDFR8tyLKHwuuScNHIW6xmqhsc+Vunm3WmtwsaXYLidGfJnbdQcNiu2oFn/186eQuofUV3L6Xc4avPDqfrNe4Rp5agqEHhFs+IooihInJN/3IbYQ9uNJ0dXzAFZCs4UveNAoRyjOaLJlmhT0tEUHtdg++hZRUc9yl3aVYnrNhxZYBSRKoKQ0C3SAjYpLEMlGh4h+mOkho8UXV8LKCpWToVRP6OmWgz3BGzOL1uUTfutBVMo5tFRHRo0ufDjQvndNHixqHBHejxRgbOiOypTOohwJsdZYpzjD2dpVOavUG5aZ6Sbeiu1Dk1TVER9P8KwSp2T2LDCRhdF8bq+84giwU5sTcnUM4jEhSE3zxj+m6dEGD51f7NlEcrp3k1pRfsUdN3G888mNVjahoYrgjNaWmM0Qm2egfnsPhkROwsfwa1IZ5QoDsQ7EhHGZSpfx99F9KXvl11GNnyTlek/NPXkoLDRglJSiaI8dvJxpPxBuPbT2eLShrYxliONtrH15AfkmMkIG4QFXbrLiJSa+EjdqfBHVpqqUaYio5wy4VGNXihIf6kLpFZHemykn07dsXSl3kR6zKB2yTJGx1WIKaGz2klIlKJe0P50OJIOIc0rqRxgz5DZOvWJbOouCUDwqka6DzmiZCMPNdQwgO3mtMs9OSpMXRG9Q0LE0KTuzO2IQVGK1RNOi/vi148C/Jk66dWYSCj35JLzMRV2Y5uJC5RV9Tomt8QOkbj1aIqiqtq6PljXzVv4HsOsMf1/THX0Mx88DG37BhGD9QQ7IPfauI90L404pUIOMGaMSIV1K2MFXE9aQePlHrvBE4qyIPXlDBKYP8cyHVKlVDR2174IEAms7sfn5zTA1p14fT39CfqgCL5HmSVZ7dIbLAK2XOmdGusFnrZi8/2O5s+OIRZhWDjOd1mKn2/dGSmxyzwr8+F3x5zsUWwO6fo/8HWH/BKipsONRVOUaLJRvgEtJ+Exj3F6KiOg3F5wVPMHTT2dABQdZVauT86wXsYyu+/REykus/OIUlEvP3qNoAWW3AJE2vLMc0NEg66hRvxAmhOYNTOLspaBRVEg3njZLA6VmirD1XLDN3lgmhq/G1XT0W449mIx2ahwwJVjtzZRouiZi7pVRoJMaqDIyuDZ70bRTv+ArryZYTUC4Bc0CNkHrvngf0Jbv6WsxmiVVadkGuZ0MJwJs9POUohuSizkjsLesK4VUwg1fabrSjkcDg+3E7NXfD4c2qyy3Sor2LA3ei4bAkQQioc2hbLWCfZK69PLth6ykfVA6pUjBoPLUQJZ0RSiyCELLO4XMkx0VEbPWLZVx4Kn8RKGh2UTY19qFjmLq1rDmuoncQwi1TluCvtnjkBs9V6mN+edqaZTUElKvlARRbPllDvKdEcdoz0mVkuyzt0t34oCFQeCscRwnhmgmDG1Io72Wz/of81ntjwvSdbRHW/aGelE+7D99gOP5sQeR2rvrehBgzVn1jTeuiirom2atxBsAlLfFzj5IlyFN3MrVVH8ZtvU006i1QEl2ChW+5aQxbw5ZQZDusFGUnNGOdQNZtat0G9E4xHSMxbLVeYpc8qxHUe3eKjRPEWN50pzJNuWE+NYsMxDt6yLY5eaWu4n+3L3XTevs3tSzNHX4IUt4Hx0Lw2OU52SyZO0skDXwWlbFL+ZeiJCo2+uAR5TXnf1+z/TtpM3obtP29Y1e/uEo3XmY04WRisusUl1ESlFlDbeM0pJGWMKRlXDD9dntYM24UzFc4UP7cWDRp5nuwSkzEL5HNww8HOvQssux2xTXWFAG7Z2kf4TNUwEeg+Sm6l2Q/uHGQU85QvCyApb66xgg6MbwzKG/Id8+j28wjHYr0zN7FFIctc6DzATZTIOlUTdSesY6JYSaKes8h44AW1KnLV3f8l+clZ54hFnlZFgxWae88CIws1fqh1BEDNVIhlnCZpWOYrT+5J7yiawt4Kx13/4wAPKGbikev69uqjGZdPWf3P46ss+i7DJMOpLgg96M9VajYpfb5rJmvBMc+ComEJY9iHGOJHGUw/UfSCGRFWWzU480BE/4wraucdAb6grnS5oDn3HVkKZ2v2bIttHYxlCTfpHktht5nvKIEU5jlgP0NGA91AYX2fMNoZrZnvTCUQXeQmlR6YINEZ0/YX31GYyTaQqTF226z8UfOyephCZZdtM18aj9nl8kWAzKClBpkFIv/Y/P3ANtO3Ly3KMeLvubzTerDG1yr0T912OiZysGsK/fhGNfWbw3VF5CUuRiGHnkr6LoWzCBupM9dGyJ0YaKfzukU+fAqUPYL3fa3KMqar0efU6yogZ/tlYe28QScLcki8l1jux9D4heJH4dEftOKLBJTevGY8hJvsyRSZUUm8JZfT8UwZp66NGfAwoePL80tbvDEHrslxCk5uXESwS9e3u+p6d9fzivPMuX6m3T/69KMsL27YmyzS+qZnq+QyLrqGSRiCHIvZx8GhhpysXX0rPU1WrjP81qIQQVtglxKIVLTh1k4skWEBJ97B2bMMMmly+hJqhRQ+2j6y6OQdmbzJhE0XutluI05Goe5reE6sayTyhbI6oR/yEKZtXYr/MRBr5PsCvMocaC8O5CroYwzgOoYoU+9i/mWRkhNW13rnUttVDYL1q8BNFteQNKOtnKzeWUcyJhBwQp0jhVCfIorsxCsvLvsN8xulNHu1McAIz127QXVQyyVbIUOUimAmui4QNmS9VaKaAkBVY0fyYupzjvSAu5Q7YHtnx7b4+y6ToXJKFme8Bu5PKewQ/MedBDzdlWRVN01xV7Rjf9dr/uOQUwAuSWCRnwNoCfL649tp3rxVN/XTZUV2NTA4pOe4mZU44oDhM1cXybhTz1mnrHnQzxW5bQ3rfn34iaTeIkft7ORQPSIbxMI/njFbkrgmT0+nNovPmlqWfTiY13YogZpRNdK1bYmwQFUa/W9NiaLueeCBqJgwF1OFEeZOg+qFtnnbtf7x7DWExN5geC3RSaFXXf/kD72qb6Z9COcI8SlOlJU7rRvau6EZsct2odwYd7TDFo+1kjjXwPzc2SkylSdD0eIUVUnmljd3ejm/zaUcTPFkU501AlG1Rg7qovx5fqW2tTQbmqzGny51oiHGPhZknq7La/Q7YuZEurnIhdCygziiiJMTV5ev4ITtesgVuOHOE1VMpGy/hhyjUDY1F7aCFws/JwIYDk3HREsh+oGojIHHIS/pk/vivfPTGo0VuBqU3/HjEh8dGjpMqTJ0Dh+B64GQxtXFuTJu2wohyW11IJYEmnPIK1wbnmu3m3amVGZ9SoKBWb31VF1U5aqYbf3LdNe9/Nx8bhYorW2a4kLy5AXh+WZ1YenZTb1xRlNWI9YqJSbGLFclEdLYZax1VFuhFgokVSRpabJFCYs4S6t+M00H2qb5a+uUsTZzN8BjNm8NlUlfkoUMbKkHK1Xxxljvm4LJFJLT/yGmxRtpeAx2V1weWgQowVebN0eOmqKpRW0+uqE6u/ALCHsNgvszqNbVNrDQU/71t2g3RD2NxQBv4CndYz77uh9i4NYosr8xSytzvQKHZA1nm1h3dwyS5G0oJMmd42bUy7znn8fhxI9tara9i7KAvKWQVWUXaAIJWsHJfnAbLsBsK1Glq4qHf2+TSR4/AOu/E7L+TUqM6+tZddSMh8vIoR5/SI0nh6ExSPZa9i+jYsqsgc0dLqf44y70Uh5ry8068b5VXwZzYoflUMLEIZtpCN6aWYKxoH48wZ2rIlgFo5wUN7N8/Onj1ZZ9o2vrpZTlCjZSQdGVBnJpoDlrY7Vdn8xMfpvqEHrvaTi12E2yFZnPAawOoqA/jGmPxYtjypLon2UgSGyLXyZ7SRh9jDj+4zJiDoH9DuBOLsIoZn0X7o8+lSqJ+uw9Dr9qwSGRLT4Dy3WnbYloQbNVPP3DVBz+JMGctrnJlGN9w2WVTgP2jw9d84DXNdPIHxWhpBC3lFY67EcojnY06v0KJqbxoumcsuGe8NsPLzfuul41Z42oXO91f5TRS+tTQdzRdh/P8ksB3KGv29M7+mLvkOJ78Ssj4Z7KZKQQeIzXETvXsegpBNoPjLG2e11ea7bX+CYVhwOj1iFctTMpqPG7qjVcduOYDr0FYY5ibXeZg/NF96THVwS+//xltPXlrUY3GAI1rxLFd2GUXcxgFfJTBRMklztl0lqpynLoaimM3m+R6pYgdaD7boSphTPgfQnvh8ALrH5EZ2ZaE0aiyjYx3+AhCYyd35VuV95XFJ8WhKGDU5pZdGElNRXvMp1EJldClt+HWuNAm0gMr9my/NTaz6YeRca0owI9wfaFpK1M1tVPLbQWFDYcISASwTvYJTaHMCUt/qY3rWfVssWFwRKsdsNjGCKXVfdcXEizZxhAuyPq/p63B6KlY72PY89g7kJt2bPkUYamtJ/908Jr3/xwrrdhVcEiZJw5KKwJ1Wa0tPa5tppeX1Zg000NeHhzA2r+xwDv+3fRlPWhXeSkOus7vsthi5fPFneed5jFSpMyuLxzDzJmI69MQvk5Um6P/TiY32SCiQhrmHmuzgb0OYpDNc6yz6M6wpdv/Bdc41p0ECsN4XQKkNi2rpVFbTy+vTi79JMMjwdjgjswbyKgFeD4ptSbT5hFtM/23ohwjOz31Vj1mDJJH1nvTRP4egbBvgtnRMZLQVU0Q3dsrVXJEihrRAPEdOSqgowcNDJBjD70ChD2Tut1N9YEphkRMVA0kte+ps/NPFXbbfQIgs07u6qHS5yQeGnd4BVSCrUs49IuexSi/DHVRLs95fkk8aGUQnGiPFGWU1GMEuhHhfHx/TD/NnFg/dJxLNgcK32tVMWSSBzB4qL+6ZBdR537TK9+L7nVI6Zec6xwDJe0nMl7RMEu+Eu9F5p/nupyVFc7jtCiLUVNP/m2ysfFIVlo9P9uNXFkgEhkK1s+nlCxlO/1+aOtPliOmxGFKEiOnRd5JMylrZwh9z/fJnDmtQXTdeDEp4tHnUlQhRioR2oj6ZtsPlS6d95yLovyrtsmWehMSXOD4zd3pU/jovZSWRUl5bn2GKKVmlVw9iXp7EDAMVnBF13P7UoE4UToZG4Ll9vsranNaVqNRU9efqpqNHzj29Y8c4iOj2UqruCwYSpCB+NqrP3zdxumNh7ZN86FqtDxCYdx1MUsBkKh5zVxQbKxjfzH6O6uo76Z9X9nlmJY7JULcy8T7+tN4nQS3DFJwWCBmzwYg1+z4+15IlXkQ+bzJb2zbHg0NazGtvAvvp96J7yQE3k4wuBwCzzTd191cKN7BDC9zoi00EwLetv7QZGPjIddd89FrFwVe2FwsUAZixB7FEnx/W0//saiWxsRONw2eZ6VfCxzx/dGQ406Smz+n45PS2fDGpld5vDgTQtunqdVp0XhVht1ySF3qDPxYdTW9ksZLd8rWxiybsJgmjKxGqOwMD23AySgmTkMzvHQlvjmO/iIxT89HHYeQWLO0+JNDkGlEYm0OeA08y80lFgnkP2P5R3VHXk9+itsZ4X8k1rN71lhjWc7E9i14X/jqop0WVTVu6slbimPN92+G8m6lLsB5SZx96we9sizLZzT1Om5YzDlcOb9aRwX9QjAcUHom8aGVe7U9pGdzOc1m450DbO5YPtjX/EzenFTuoWaYFFiNO3Lhevg+d0/ktSBIm0sn7vPqkJigQxJZUM+ptUYMHmjBwxoMJNK7sHQnzhQYrYSng3UBwZwx0HgFnA0SJDl0pLRy/OJjQsmcmSXnKzxnFo157bGapxokS21o8mvjKCDyqx+5lTHxI+aPjrPs9pVzEJW+HmWTJT9QqxNfSp6glv24nRMNmkHKnNhkudl1oWdCQuD7HmZXMDvNk12nBRfujkLJ6tKo3I3joPzbVVGOoa2nrzp49Qd+jmvbHPD6Od58cat09vmXPhHK4g+gLJbbZoqH0yO/sRArqheRTmHlfCWItdYK3SKHyZk9gDEVcjQtAdh6nY+xcHHjw3cfUZCPgXSD6sRHVFAqKEv0oJIYYDZIQM3KKvxfN0pp4/3KHPC/fns75I39EExfBOLA1IypSAKwev90kKSdR6Ps0jWR9GkR0FkA7noYsTIwBmCcUFHSRUhaFVV+Pjn9q2utA8BKE/RsV5ATAbG1fy6M0s0DsF+vaItSv2zIIAM7AXUWANb+RcEIFKG7k72YIdDZa1E1hFS3GLVtvV5A84wDV33wz4IF2WTZmnD6rjMYU+sDr2nqZn/bNJ+pxstIXlWN2l9BPJRseBIheUkme9h8sC6wb+gJX9ocyx1WLCHBGDyjOB8LFB9SNh+qRdnKRdrqzoHfwluyvwaW1BrHyoAhfWnDWl0ML77XJ3lvRQnrZH09KXjb9rNt2exn4HURJbdkcrcKgPWcuEYrkkNf/uBHy+Xykqad/lFRlmVRVohWp0khI9Cupkv6jC21CFE41ZxcEhx5qYxkqHgUKjRkBQMvZFkKluctLdN76WiFoZysRgJW+WboSDd0qec7/N9OI+a+arc7MmzX+DUca8huu16pkUgsmzrp01tFiWAivreenbdxtoMwM5L5gI/e7Dg0NrfGULN97jroO7ncram5E9hvey0F1eVOUopM3ikRrTr5iwxzRceqVYmlnU7/uD2yccmhL37wo2RhxZ5FW4YZtxKApaAJ2GOq6z9/2YkDV77/aTBtv79t4fNs9EEjj6xMTFb3QfVHT3Veipa9y0tF71lkGMpDg7uhqVKiR/r1stouZ7vnT/cZH+Q9rm/+PRAOyTicd1rVlCL2jdz37tspVRm/E0cz6Xu/nZNit5k2u6sS3k8MTcddZvqUMw7nvV3QXm/hC20zffiBa9771IMHLz8uFlaDjJ6+wwCMhbBMQYB81fveCePpfab15AXQFseKalyZwVrNj2Ob1ZnfHtZ3WSq+VpIBgbjaOUcBy4Kbx6N1CM737cK5LvkwKM4YQJ8xmSiG2D/HJXDK7+WAu5Rl1gYPJfeYqltkFV7h7339D0mN92eOn0nXkUUByaHMyz7PqKPtq6fIRiLNv+WusmIHa6nGqLQ93jT1i4pjcO8DV7///xGWGeNZDTaPnKecCVEgKt4h+ewLHngbKOC5LbSPw7OwFiPXkhdGVWmsGtIikhLZT6RXmAhGFZbX2cIaFtMpMTTUizj4O+0jxWpW6xlWVKmCuUiYWPJPjIwoSIVC/BhrJLF1ZkrpNzjpO13/I+lILLX0e5jOxdvOurdo6FKftaMWxYtMnGdjnSIH+41hafA3KngkU32gYTUhX0wIItb+e6EHI5Pq86TwEyRL8r7YcLMSShSGHcMxOSEwDvhWweZZ6jDMsH9eNNGqNZd1AJeWhtc6rMfsGUo/asUbo4CLuBveI5XE5UHlqhFonNKspvRweIxSliNUYKKm+fXQTl/M8ZvDvX+myg0AwNrOfsdCnHOb/Xdtof3FAuBHymJpGwaJh3aKISpwfkra33F+mSINwPLFjQQPnJxsJ/GzSPNto2W0uDj4WuguV1CutwQAS7Bz2qeFAWD6ynGbStVw8t1AbxenEY0LXRUAdnl5bO50AUg8AiOHjIiT4zGpBlpVaBEAF1OjmTaMl81Z1QFgf+SVB2BuiUPXzgJgecMdJ8VIJw/Aup6zABgk82IagP0a2JMRq2nXflE8LuoTj0XmWQR8igFWYQqiFjMmlOXfQdO87MBVH/iUAdwzkE38OwfAWkqAxzh2Yt9t919ctuXPFAA/BmV5Y7Q7rtE3ooVpQVoChlq2KQ7VDiEVUyrt1SkuJE1wfGGOQjQZlYZYtR45smnoWAvvEVB5pQZ7vugRjT860TBBlonUfvpjJd2YDvlHyhRIArBuPs1oQKy71f3oBlZRINjYmgRbUZh4SilldmfjzO0xAmjy7K/TKzAAuyAOMh8cAsfbpnNAOwUYA8DOe0uMLhyFrORcXym2tKIIgq5L4MQI4G26D6LYaFPgkLHFfGpUqvYHZn6xHdx6RIFrsojHSSraYsR2C+gSv3FtC+2b2qL9k0Nf+uDnDeDyxrqByg0NwOAPsD/vAHnnxQ/et9w2j4K6eXzTNPevRuMln96kqYu2aFtc09Yk6NDogCY+UQDAZsOE0QJ1A7OmdCYABxskdcYaA7APbgD2kD8FwEGf5gBgZ8RvxAUFOhtI0BmQqBZVKH2zWQDWX7UNAR9SQrHQci/3ArC6BOp1XGx8X40/POtb4NkqzR9yFD4iageACW49ALMaJQJgmmNjQKSrio0WZVvgxOJBvoQSbibTSdHCh6Cp3jgaTd7y7S998HoPuJivaHNGGf+FADhNkbGcff4DbtuW5SMLgIdB096zqEa7kH3DSW58gmhjq6nR4MkMgr4PA2Avj4UA7I8LEIA7lkwBq4c1io9MRIFDnsz/tGfDJLsTvlD5WY9XPAKQTod6UwPAXi6TRlWcCMLqiKwvQYEta6l+3NwMHxRwTf0AzP3xIXTjgOwBAAcjNxZZ4jHEVlxKgXFMeE0oeRR6lZEMG3+0AQDLelP2DlkfytKB3JbU7aaJ87ay1NK0lEWDzexK9qpCMQDXFZHb9HhbwCdbKN7eQvv2Q198/xf8mG54ivvdBsBaCnjMY0p4cyg3nHv+g86rq+m9y6a4LxTtfRqA2xdFe04JGFxPX+TCkSliUz3eEDEA8wLJJqB32KU+BlKi8oHjttaVo8ymT2b3Bu0jgDmvLE99SE1Xls7kNl6YDgC78RgzTocoRJmgrDJt9lrkbAFgbEjNV90coOWQSqp5AHbUWwExoPj6iJk36i+FLBCzWI0CKcBiAdjF7EYAahIikDHMKJSiMgDTipNszAo/XsaRR9Zk6sj9KtsRS9OVRKJkF0yE/muLFq6EtvhYWzaXFxP42IGvfuBb4VRQipMbRMb9rwLAtpSwf38Jl13WiTa06/b33bu0Pr5VC+UdoG0uKqC4Vds255dFsactYE/TtjsLKJYKwJ1IkdgTgJUG4LRCxWJ3kZmJUs4HwJYCJwFYlF5FyulCilcae605lSBwez8Ac8dYo07USQBYOYoQgBWY5B3bCxVdOHxxehNp4vJNAbDO+ZYAcIvOBC3ABrTF8bIdHS4BDrdFfU0DzZfbovnPoqm+MJlsXMVOBqk9+T3Nd4JN7iv/L20XVy1G1QhHAAAAAElFTkSuQmCC"
      width={size}
      height={size}
      alt=""
    />
  )
}
