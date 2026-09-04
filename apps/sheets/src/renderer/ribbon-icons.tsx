import type { ReactElement, ReactNode } from 'react'

/// Ribbon icon set drawn to the shared icon standard: 24×24 canvas with
/// 1.5-unit strokes, round caps and round joins. The rendered size comes
/// from CSS, which also pins the PAINTED stroke to ~1.5px (20px+ glyphs) /
/// ~1.25px (13-16px glyphs) via stroke-width overrides in styles.css —
/// proportional scaling would leave small glyphs hairline and big ones fat.
function Icon({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

/// Thin dropdown chevron, copied from the slides ribbon's
/// RbCaret (replaces the ▾ text glyph).
export function CaretIcon(): ReactElement {
  return (
    <svg className="chev" width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5.5 9.25 12 15.75l6.5-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/// Quick-access save button — standard floppy glyph shared across all apps.
export function SaveIcon(): ReactElement {
  return (
    <Icon>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8V3" />
    </Icon>
  )
}

/// Save As keeps the floppy silhouette and adds the familiar pencil overlay.
export function SaveAsIcon(): ReactElement {
  return (
    <Icon>
      <path d="M12.25 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v1.25" />
      <path d="M7 21v-8h5" />
      <path d="M7 3v5h8V3" />
      <path d="m13.25 19.5.75-3.25 5.75-5.75 2.5 2.5-5.75 5.75-3.25.75Z" />
      <path d="m18.75 11.5 2.5 2.5" />
    </Icon>
  )
}

/// Quick-access undo/redo — design-supplied geometry shared with the docs
/// and slides ribbons, so the three apps' tab-row arrows read identically.
export function UndoIcon(): ReactElement {
  return (
    <Icon>
      <path d="M5.91026 4L2.5 7.14791L5.91026 10.8205" />
      <path d="M3.96154 7.41028H15.1636C18.5169 7.41028 21.3646 10.1484 21.4953 13.5C21.6334 17.0416 18.707 20.0769 15.1636 20.0769H6.88384" />
    </Icon>
  )
}

export function RedoIcon(): ReactElement {
  return (
    <Icon>
      <path d="M18.0897 4L21.5 7.14791L18.0897 10.8205" />
      <path d="M20.0385 7.41028H8.83636C5.4831 7.41028 2.63537 10.1484 2.5047 13.5C2.36657 17.0416 5.29296 20.0769 8.83636 20.0769H17.1162" />
    </Icon>
  )
}

// drawings shared by several glyph keys
const SPARKLE_ICON = (
  <Icon>
    <path d="M12 4.75 13.9 10.1 19.25 12l-5.35 1.9L12 19.25l-1.9-5.35L4.75 12l5.35-1.9L12 4.75Z" />
  </Icon>
)
const CLOCK_ICON = (
  <Icon>
    <circle cx="12" cy="12" r="7.5" />
    <path d="M12 7.75V12l3 2.25" />
  </Icon>
)
const REFRESH_ICON = (
  <Icon>
    <path d="M18.74 12A6.74 6.74 0 1 1 16.65 7.12" />
    <path d="M16.88 4.1v3.25h-3.25" />
  </Icon>
)

/// Icons keyed by the legacy glyph strings, so ribbon call sites stay
/// unchanged; symbols without an entry render as plain text (letterforms
/// such as $, ?, θ, ƒx are typography, not drawn icons).
export const RIBBON_GLYPH_ICONS: Record<string, ReactElement> = {
  // ---- alignment / rows / columns ----
  '≡': (
    <Icon>
      <path d="M4.75 4.75h14.5M4.75 9.5h9.5M4.75 14.25h14.5M4.75 19h9.5" />
    </Icon>
  ),
  '≣': (
    <Icon>
      <path d="M4.75 4.75h14.5M7.25 9.5h9.5M4.75 14.25h14.5M7.25 19h9.5" />
    </Icon>
  ),
  '☰': (
    <Icon>
      <path d="M4.75 4.75h14.5M9.75 9.5h9.5M4.75 14.25h14.5M9.75 19h9.5" />
    </Icon>
  ),
  '⤒': (
    <Icon>
      <path d="M5 4.75h14" />
      <path d="M12 19.25V9.5M8.5 13 12 9.5l3.5 3.5" />
    </Icon>
  ),
  '⤓': (
    <Icon>
      <path d="M5 19.25h14" />
      <path d="M12 4.75v9.75M8.5 11l3.5 3.5 3.5-3.5" />
    </Icon>
  ),
  '↩': (
    <Icon>
      <path d="M4.75 5.75h14.5" />
      <path d="M4.75 11.25h10.25a3 3 0 0 1 0 6h-3.25" />
      <path d="M14 15 11.75 17.25 14 19.5" />
    </Icon>
  ),
  '⇤': (
    <Icon>
      <path d="M5 5v14" />
      <path d="M19 12H9.5M13 8.5 9.5 12l3.5 3.5" />
    </Icon>
  ),
  '⇥': (
    <Icon>
      <path d="M19 5v14" />
      <path d="M5 12h9.5M11 8.5 14.5 12 11 15.5" />
    </Icon>
  ),
  // ---- mini chart-type grid ----
  '▮▬': (
    <Icon>
      <path d="M4.5 19.5h15" />
      <path d="M8 19.5V12M12.5 19.5V8.5M17 19.5V15" />
    </Icon>
  ),
  '📈': (
    <Icon>
      <path d="M4.5 4.5v15h15" />
      <path d="m7.5 15.5 3.5-4 2.7 2.5 4.3-5.5" />
    </Icon>
  ),
  '◪': (
    <Icon>
      <path d="M4.75 19.25V13.5l5.5-6 4 5.5 5-4.25v10.5H4.75Z" />
    </Icon>
  ),
  '◔': (
    <Icon>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 12V4.5M12 12l6.75 3.25" />
    </Icon>
  ),
  '∴': (
    <Icon>
      <path d="M4.5 4.5v15h15" />
      <circle cx="9" cy="15" r="0.5" fill="currentColor" />
      <circle cx="12" cy="9.5" r="0.5" fill="currentColor" />
      <circle cx="16" cy="12.5" r="0.5" fill="currentColor" />
      <circle cx="18" cy="7" r="0.5" fill="currentColor" />
    </Icon>
  ),
  '✳': (
    <Icon>
      <path d="M12 4.25 18.75 8.1v7.8L12 19.75 5.25 15.9V8.1L12 4.25Z" />
      <path d="M12 12V4.25M12 12l6.75 3.9M12 12l-6.75 3.9" />
    </Icon>
  ),
  '◍': (
    <Icon>
      <circle cx="12" cy="12" r="7.25" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  ),
  '𝄜': (
    <Icon>
      <path d="M4.5 19.5h15" />
      <path d="M7 19.5v-5.5M11 19.5V10" />
      <path d="m5 8.5 4.5-3.25L14 8l5-3.75" />
    </Icon>
  ),
  // ---- clipboard ----
  // paste shares the docs ribbon's clipboard geometry (docs 16-canvas × 1.5);
  // paste special swaps the text lines for option sliders on the same board
  '📋': (
    <Icon>
      <path d="M 8.14 18.16 H 5.89 C 4.85 18.16 4 17.31 4 16.26 V 6.79 C 4 5.74 4.85 4.89 5.89 4.89 H 7.32 M 17.26 7.74 V 6.79 C 17.26 5.74 16.41 4.89 15.37 4.89 H 13.95" />
      <rect x="7.79" y="3" width="5.68" height="2.84" rx="0.95" />
      <path d="M 18.21 7.74 H 9.68 C 8.64 7.74 7.79 8.59 7.79 9.63 V 19.11 C 7.79 20.15 8.64 21 9.68 21 H 15.49 L 20.11 16.03 V 9.63 C 20.11 8.59 19.26 7.74 18.21 7.74 Z" />
      <path d="M 10.63 11.05 H 17.26 M 10.63 14.37 H 14.42" />
      <path d="M 15.37 21 V 16.74 C 15.37 16.21 15.79 15.79 16.32 15.79 H 20.11" />
    </Icon>
  ),
  '📑': (
    <Icon>
      <path d="M 14.99 5.02 H 16.98 C 18.09 5.02 18.98 5.92 18.98 7.04 L 18.88 19.02 C 18.87 20.11 17.98 21 16.88 21 H 6.88 C 5.77 21 4.87 20.09 4.88 18.98 L 4.98 7 C 4.98 5.91 5.88 5.02 6.98 5.02 H 8.99" />
      <rect x="9.16" y="3.5" width="5.68" height="2.84" rx="0.95" />
      <path d="M 8 10 H 16 M 8 13.5 H 16 M 8 17 H 13" />
    </Icon>
  ),
  // cut / copy / format painter share one 24-canvas design across all three
  // apps (the docs ribbon carries the same geometry × 2/3 on its 16 canvas)
  '✂': (
    <Icon>
      <path d="M 7.91 19.27 L 8.92 17.57 L 16.98 3.59 M 7.02 3.5 L 15.08 17.47 L 16.09 19.27" />
      <circle cx="5.83" cy="18.13" r="2.37" />
      <circle cx="18.17" cy="18.13" r="2.37" />
    </Icon>
  ),
  '⧉': (
    <Icon>
      <rect x="7" y="7" width="14" height="14" rx="3" />
      <path d="M 14.5 4 H 7 C 5.34 4 4 5.34 4 7 V 14.5" />
    </Icon>
  ),
  '🖌': (
    <Icon>
      <rect x="10.65" y="4.05" width="2.7" height="5.1" rx="1.35" />
      <rect x="4.5" y="9.15" width="15" height="10.8" rx="1.5" />
      <path d="M 4.5 13.35 H 19.5" />
      <path d="M 9.3 16.35 V 18.15 M 14.7 16.35 V 18.15" />
    </Icon>
  ),
  // ---- find / filter ----
  '🔍': (
    <Icon>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 4.5 4.5" />
    </Icon>
  ),
  '▽': (
    <Icon>
      <path d="M 4.17 4.71 h 15.66 l -5.94 6.8 v 7.45 l -3.78 -2.38 v -5.08 l -5.94 -6.8 Z" />
    </Icon>
  ),
  '⊘': (
    <Icon>
      <path d="M4 5.25h11.5l-4.35 5v5.4l-2.8-1.75v-3.65L4 5.25Z" />
      <path d="m15.75 14.75 4.5 4.5m0-4.5-4.5 4.5" />
    </Icon>
  ),
  '⌖': (
    <Icon>
      <circle cx="12" cy="12" r="5.75" />
      <path d="M12 4.5v2.5M12 17v2.5M4.5 12H7M17 12h2.5" />
    </Icon>
  ),
  // ---- comments / review ----
  '🗨': (
    // Square-corner comment bubble with text lines, shared with docs/slides IconComment
    <Icon>
      <path d="M 4.51 4.87 h 14.99 v 10.22 h -8.18 L 7.23 19.18 v -4.09 h -2.73 z" />
      <path d="M 7.91 8.28 h 8.18 M 7.91 11.68 h 5.45" />
    </Icon>
  ),
  '🗑': (
    <Icon>
      <path d="M 5.48 7.05 h 13.05" />
      <path d="M 9.75 7.05 v -0.9 a 1.35 1.35 0 0 1 1.35 -1.35 h 1.8 a 1.35 1.35 0 0 1 1.35 1.35 v 0.9" />
      <path d="m 6.82 7.05 0.81 11.03 a 1.8 1.8 0 0 0 1.8 1.67 h 5.13 a 1.8 1.8 0 0 0 1.8 -1.66 l 0.81 -11.02" />
      <path d="M 10.2 10.65 v 5.4 M 13.8 10.65 v 5.4" />
    </Icon>
  ),
  '✓': (
    <Icon>
      <path d="m4.75 13.75 4.75 5L19.25 5.75" />
    </Icon>
  ),
  '☑': (
    <Icon>
      <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2" />
      <path d="m8.5 12.5 2.5 2.5 4.75-5.5" />
    </Icon>
  ),
  '⚠': (
    <Icon>
      <path d="M10.7 5.75 4.6 16.5a1.5 1.5 0 0 0 1.3 2.25h12.2a1.5 1.5 0 0 0 1.3-2.25L13.3 5.75a1.5 1.5 0 0 0-2.6 0Z" />
      <path d="M12 9.75v3.75" />
      <circle cx="12" cy="16.15" r="0.4" fill="currentColor" stroke="none" />
    </Icon>
  ),
  '❔': (
    <Icon>
      <path d="M 9.36 9.27 A 2.64 2.64 0 0 1 12 6.72 c 1.46 0 2.64 1.1 2.64 2.55 0 0.97 -0.53 1.58 -1.32 2.2 -0.79 0.62 -1.32 1.1 -1.32 2.11 v 0.4" />
      <circle cx="12" cy="16.84" r="0.44" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="7.26" />
    </Icon>
  ),
  '💡': (
    <Icon>
      <path d="M12 4.25a5.75 5.75 0 0 0-3.25 10.5c.62.43 1 1.05 1 1.78v.72h4.5v-.72c0-.73.38-1.35 1-1.78A5.75 5.75 0 0 0 12 4.25Z" />
      <path d="M10 19.75h4" />
    </Icon>
  ),
  '👓': (
    <Icon>
      <circle cx="7.25" cy="14.25" r="3.25" />
      <circle cx="16.75" cy="14.25" r="3.25" />
      <path d="M10.5 13.75a1.5 1.5 0 0 1 3 0" />
      <path d="M4 14.25c0-2.1.5-4.5 1.5-6.5M20 14.25c0-2.1-.5-4.5-1.5-6.5" />
    </Icon>
  ),
  '✒': (
    <Icon>
      <path d="M13.75 5.5 18.5 10.25 9.5 19.25H4.75V14.5l9-9Z" />
      <path d="m12 7.25 4.75 4.75" />
    </Icon>
  ),
  // ---- charts / analysis ----
  '📊': (
    <Icon>
      <path d="M4.5 19.5h15" />
      <path d="M8 19.5V9.5M12.5 19.5V4.75M17 19.5V12.5" />
    </Icon>
  ),
  '🗠': (
    <Icon>
      <path d="M4.5 4.5v15h15" />
      <path d="m7.5 15.5 3.5-4 2.7 2.5 4.3-5.5" />
    </Icon>
  ),
  '〜': (
    <Icon>
      <path d="m4.5 19 5-7.5 3.5 3.5 6.5-9" />
      <path d="M15.25 6h4.25v4.25" />
    </Icon>
  ),
  '✦': SPARKLE_ICON,
  '✧': SPARKLE_ICON,
  '∑': (
    <Icon>
      <path d="M17.75 7.5V4.75H6.25L12.25 12l-6 7.25h11.5V16.5" />
    </Icon>
  ),
  Σ: (
    <Icon>
      <path d="M17.75 7.5V4.75H6.25L12.25 12l-6 7.25h11.5V16.5" />
    </Icon>
  ),
  '🧮': (
    <Icon>
      <rect x="6.08" y="4.49" width="11.83" height="15.02" rx="1.82" />
      <path d="M 8.59 7.22 h 6.83 v 2.73 h -6.82 z" />
      <circle cx="9.04" cy="13.14" r="0.36" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13.14" r="0.36" fill="currentColor" stroke="none" />
      <circle cx="14.96" cy="13.14" r="0.36" fill="currentColor" stroke="none" />
      <circle cx="9.04" cy="16.32" r="0.36" fill="currentColor" stroke="none" />
      <circle cx="12" cy="16.32" r="0.36" fill="currentColor" stroke="none" />
      <circle cx="14.96" cy="16.32" r="0.36" fill="currentColor" stroke="none" />
    </Icon>
  ),
  // ---- grids / tables / layout ----
  '▦': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M4.5 9.5h15M4.5 14.5h15M9.5 4.5v15M14.5 4.5v15" />
    </Icon>
  ),
  '⊞': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M4.5 9.5h15M10.5 9.5v10" />
    </Icon>
  ),
  '▤': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M4.5 9.5h15M4.5 14.5h15" />
    </Icon>
  ),
  '⊟': (
    <Icon>
      <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2" />
      <path d="M8.75 12h6.5" />
    </Icon>
  ),
  '⊕': (
    <Icon>
      <circle cx="12" cy="12" r="7.25" />
      <path d="M12 8.5v7M8.5 12h7" />
    </Icon>
  ),
  '⊙': (
    <Icon>
      <circle cx="12" cy="12" r="7.25" />
      <circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" />
    </Icon>
  ),
  '⿴': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <rect x="8.25" y="8.25" width="7.5" height="7.5" rx="0.75" />
    </Icon>
  ),
  '⤢': (
    <Icon>
      <rect x="4.75" y="4.75" width="8.75" height="12" rx="1.5" />
      <rect x="9" y="13.5" width="10.25" height="5.75" rx="1.5" />
    </Icon>
  ),
  '▭': (
    <Icon>
      <rect x="6.75" y="4.5" width="10.5" height="15" rx="1.5" />
    </Icon>
  ),
  '⬚': (
    <Icon>
      <rect x="5" y="5" width="14" height="14" rx="1" strokeDasharray="3 2.7" />
    </Icon>
  ),
  '┆': (
    <Icon>
      <path d="M6.5 8.75v-2.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5v2.5" />
      <path d="M6.5 15.25v2.5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
      <path d="M4.75 12h14.5" strokeDasharray="2.5 2.5" />
    </Icon>
  ),
  '❄': (
    <Icon>
      <path d="M 12 4.64 v 14.72 M 5.62 8.32 l 12.75 7.36 M 18.38 8.32 5.62 15.68" />
      <path d="m 9.7 6.39 2.3 1.84 2.3 -1.84 M 9.7 17.61 l 2.3 -1.84 2.3 1.84" />
    </Icon>
  ),
  // ---- media / objects ----
  '🎨': (
    <Icon>
      <path d="M12 4.5c-4.7 0-8.5 3.4-8.5 7.5s3.8 7.5 8.5 7.5c1.05 0 1.9-.85 1.9-1.9 0-.5-.2-.95-.5-1.3-.3-.35-.5-.8-.5-1.25 0-1.05.85-1.9 1.9-1.9h2.2c2 0 3.5-1.5 3.5-3.4C20.5 7.2 16.7 4.5 12 4.5Z" />
      <circle cx="8.1" cy="10.1" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.6" cy="8.1" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy="9.3" r="0.5" fill="currentColor" stroke="none" />
    </Icon>
  ),
  '🖼': (
    <Icon>
      <rect x="3.9" y="4.98" width="16.2" height="14.04" rx="2.16" />
      <circle cx="8.76" cy="9.57" r="1.51" />
      <path d="m 4.44 16.86 4.21 -4.21 3.51 3.51 3.62 -3.62 3.78 3.78" />
    </Icon>
  ),
  '◇': (
    <Icon>
      <rect x="4.75" y="4.75" width="9.5" height="9.5" rx="1.5" />
      <circle cx="15" cy="15" r="4.25" />
    </Icon>
  ),
  '🔗': (
    <Icon>
      <path d="M 9.6 16 H 8 A 4 4 0 0 1 8 8 h 1.6" />
      <path d="M 14.4 8 h 1.6 a 4 4 0 1 1 0 8 h -1.6" />
      <path d="M 9 12 h 6" />
    </Icon>
  ),
  '🗎': (
    <Icon>
      <path d="M 13.37 4.49 H 7.68 c -0.76 0 -1.36 0.61 -1.36 1.37 v 12.29 c 0 0.76 0.61 1.37 1.37 1.37 h 8.65 c 0.76 0 1.37 -0.61 1.37 -1.36 V 8.82 L 13.37 4.49 Z" />
      <path d="M 13.37 4.49 V 8.82 h 4.32" />
    </Icon>
  ),
  '🗒': (
    <Icon>
      <path d="M 13.37 4.49 H 7.68 c -0.76 0 -1.36 0.61 -1.36 1.37 v 12.29 c 0 0.76 0.61 1.37 1.37 1.37 h 8.65 c 0.76 0 1.37 -0.61 1.37 -1.36 V 8.82 L 13.37 4.49 Z" />
      <path d="M 13.37 4.49 V 8.82 h 4.32" />
      <path d="M 9.27 12.46 h 5.46 M 9.27 15.19 h 3.64" />
    </Icon>
  ),
  '🕮': (
    <Icon>
      <path d="M12 6.25c-1.8-1.3-4-1.9-7.25-1.75V17.75c3.25-.15 5.45.45 7.25 1.75 1.8-1.3 4-1.9 7.25-1.75V4.5C16 4.35 13.8 4.95 12 6.25Z" />
      <path d="M12 6.25V19.5" />
    </Icon>
  ),
  '🛢': (
    <Icon>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.5" />
      <path d="M 5.49 6.89 v 10.23 c 0 1.3 2.91 2.33 6.51 2.33 s 6.51 -1.02 6.51 -2.33 v -10.23" />
      <path d="M 5.49 12 c 0 1.3 2.91 2.33 6.51 2.33 s 6.51 -1.02 6.51 -2.33" />
    </Icon>
  ),
  '🌐': (
    <Icon>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5c2.5 2 3.75 4.5 3.75 7.5S14.5 17.5 12 19.5c-2.5-2-3.75-4.5-3.75-7.5S9.5 6.5 12 4.5Z" />
      <path d="M4.75 12h14.5" />
    </Icon>
  ),
  '🏷': (
    <Icon>
      <path d="M12.6 4.75H7a2.25 2.25 0 0 0-2.25 2.25v5.6c0 .6.24 1.17.66 1.59l5.9 5.9a2.25 2.25 0 0 0 3.18 0l4.86-4.86a2.25 2.25 0 0 0 0-3.18l-5.9-5.9a2.25 2.25 0 0 0-1.59-.66Z" />
      <circle cx="9" cy="9" r="1.2" />
    </Icon>
  ),
  '🔒': (
    <Icon>
      <rect x="5.75" y="10.5" width="12.5" height="9" rx="2" />
      <path d="M8.75 10.5V8a3.25 3.25 0 0 1 6.5 0v2.5" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </Icon>
  ),
  '🔐': (
    <Icon>
      <rect x="5.75" y="10.5" width="12.5" height="9" rx="2" />
      <path d="M8.75 10.5V8a3.25 3.25 0 0 1 6.5 0v2.5" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </Icon>
  ),
  '▶': (
    <Icon>
      <path d="M 7.8 4.5 v 15 L 20.1 12 7.8 4.5 Z" />
    </Icon>
  ),
  '⚡': (
    <Icon>
      <path d="M13 4.25 6.5 13.25h4.5L11 19.75l6.5-9h-4.5L13 4.25Z" />
    </Icon>
  ),
  '♿': (
    <Icon>
      <circle cx="12" cy="6.15" r="1.8" />
      <path d="M 5.48 9.75 c 4.32 1.17 8.73 1.17 13.05 0" />
      <path d="M 12 10.65 v 3.38 l -3.06 4.95 M 12 14.03 l 3.06 4.95" />
    </Icon>
  ),
  '🕘': CLOCK_ICON,
  '🕐': CLOCK_ICON,
  '🕒': CLOCK_ICON,
  '⟳': REFRESH_ICON,
  '↻': REFRESH_ICON,
  '✕': (
    <Icon>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  ),
  // ---- sort / move ----
  '↓': (
    <Icon>
      <path d="M8 5v13.5M4.75 15.25 8 18.5l3.25-3.25" />
      <path d="M13.5 6.5h6M13.5 10.5h4.5M13.5 14.5h3" />
    </Icon>
  ),
  '↑': (
    <Icon>
      <path d="M8 19V5.5M4.75 8.75 8 5.5l3.25 3.25" />
      <path d="M13.5 9.5h3M13.5 13.5h4.5M13.5 17.5h6" />
    </Icon>
  ),
  '⇄': (
    <Icon>
      <path d="M4.75 8.25h14.5M16 5l3.25 3.25L16 11.5" />
      <path d="M19.25 15.75H4.75M8 12.5l-3.25 3.25L8 19" />
    </Icon>
  ),
  '⇅': (
    <Icon>
      <path d="M8.5 19V5.5M5.25 8.75 8.5 5.5l3.25 3.25" />
      <path d="M15.5 5v13.5M12.25 15.25l3.25 3.25L18.75 15.25" />
    </Icon>
  ),
  '⇶': (
    <Icon>
      <path d="M 5.48 7.05 h 10.35 M 13.35 4.57 l 2.93 2.48 -2.92 2.48" />
      <path d="M 5.48 12 h 10.35 M 13.35 9.53 16.28 12 l -2.92 2.48" />
      <path d="M 5.48 16.95 h 10.35 M 13.35 14.48 l 2.93 2.48 -2.92 2.48" />
    </Icon>
  ),
  // ---- text ----
  A: (
    <Icon>
      <path d="M5.75 7V4.75h12.5V7M12 4.75v14.5M9.5 19.25h5" />
    </Icon>
  ),
  // ---- windows / panes ----
  '🗔': (
    <Icon>
      <rect x="5.17" y="5.63" width="13.65" height="12.74" rx="1.37" />
      <path d="M 5.17 9.27 h 13.65" />
    </Icon>
  ),
  '◫': (
    <Icon>
      <rect x="4.5" y="5" width="15" height="14" rx="1.5" />
      <path d="M12 5v14" />
    </Icon>
  ),
  '▥': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
      <path d="M9.5 4.5v15M14.5 4.5v15" />
    </Icon>
  ),
  '⬡': (
    <Icon>
      <path d="M12 4.25 18.75 8.1v7.8L12 19.75 5.25 15.9V8.1L12 4.25Z" />
    </Icon>
  ),
  // ---- editing arrows ----
  '⌫': (
    <Icon>
      <path d="M9.25 5.5h9a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-9L4.25 12l5-6.5Z" />
      <path d="m11.75 9.75 4.5 4.5m0-4.5-4.5 4.5" />
    </Icon>
  ),
  '⇢': (
    <Icon>
      <path d="M4.75 12h11.5" strokeDasharray="2.5 2.5" />
      <path d="M15.5 8.25 19.25 12l-3.75 3.75" />
    </Icon>
  ),
  '⇠': (
    <Icon>
      <path d="M19.25 12H7.75" strokeDasharray="2.5 2.5" />
      <path d="M8.5 8.25 4.75 12l3.75 3.75" />
    </Icon>
  ),
  '→': (
    <Icon>
      <path d="M4.75 12h14.5M15.5 8.25 19.25 12l-3.75 3.75" />
    </Icon>
  ),
  '←': (
    <Icon>
      <path d="M19.25 12H4.75M8.5 8.25 4.75 12l3.75 3.75" />
    </Icon>
  ),
  '↔': (
    <Icon>
      <path d="M4.75 12h14.5M8 8.75 4.75 12 8 15.25M16 8.75 19.25 12 16 15.25" />
    </Icon>
  ),
  '↕': (
    <Icon>
      <path d="M12 4.75v14.5M8.75 8 12 4.75 15.25 8M8.75 16 12 19.25 15.25 16" />
    </Icon>
  ),
  'A↑': (
    <Icon>
      <path d="M3.25 19 8.5 5.25 13.75 19M5.1 14.25h6.8" />
      <path d="M18 17.5V6.75M14.9 9.85 18 6.75l3.1 3.1" />
    </Icon>
  ),
  'A↓': (
    <Icon>
      <path d="M3.25 19 8.5 5.25 13.75 19M5.1 14.25h6.8" />
      <path d="M18 6.75V17.5M14.9 14.4l3.1 3.1 3.1-3.1" />
    </Icon>
  ),
  // ---- home formatting (borders / fill / merge / orientation) ----
  '⊡': (
    <Icon>
      <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" strokeDasharray="2.6 2.3" />
      <path d="M12 4.5v15M4.5 12h15" />
    </Icon>
  ),
  '◧': (
    <Icon>
      <path d="M11.25 4.75 4.6 11.4a1.5 1.5 0 0 0 0 2.1l4.9 4.9a1.5 1.5 0 0 0 2.1 0l6.65-6.65z" />
      <path d="M19.4 13.9c.75 1 1.15 1.85 1.15 2.5a1.45 1.45 0 0 1-2.9 0c0-.65.4-1.5 1.15-2.5Z" />
    </Icon>
  ),
  '∅': (
    <Icon>
      <rect x="4.75" y="4.75" width="14.5" height="14.5" rx="2" />
      <path d="m6.5 17.5 11-11" />
    </Icon>
  ),
  '⇔': (
    <Icon>
      <rect x="4.5" y="4.75" width="15" height="14.5" rx="1.5" />
      <path d="M8 12h8" />
      <path d="M10.25 9.75 8 12l2.25 2.25M13.75 9.75 16 12l-2.25 2.25" />
    </Icon>
  ),
  '⤴': (
    <Icon>
      <text
        x="2.5"
        y="17.5"
        fontSize="12"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        ab
      </text>
      <path d="m15.75 11.75 5.25-5.25" />
      <path d="M17.25 6.5H21v3.75" />
    </Icon>
  ),
}

/** Genspark brand mark (rounded-square sparkle badge), inline so it renders
 * crisply at device resolution instead of going through <img> rasterization */
export function GensparkMark({ size = 18 }: { readonly size?: number }): ReactElement {
  return <img src="data:image/png;base64,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" width={size} height={size} alt="" />
}
