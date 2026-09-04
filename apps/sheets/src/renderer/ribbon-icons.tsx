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
