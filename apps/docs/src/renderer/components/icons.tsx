/** Small monochrome SVG icons approximating Word's ribbon glyphs. */

import type { ReactNode } from 'react'

interface IconProps {
  size?: number
}

/** Constant painted stroke instead of proportional scaling: ~1.5px lines on
 *  20px+ glyphs, ~1.25px on the 13-19px ones, ~1.1px below (a proportional
 *  1-unit stroke would paint 1.75px at 28px and hairlines at small sizes).
 *  stroke-width is in 16-canvas units: units = painted-px × 16 / rendered-px.
 *  `paint` overrides the painted px: diagonal-heavy letterform icons pass 1.4
 *  as optical compensation — a slanted stroke's anti-aliasing spreads its ink
 *  over a wider footprint, so at an equal nominal width it reads a touch
 *  fatter than the axis-aligned line icons (pixel-measured on the ribbon). */
function pinnedStroke(size: number, paint?: number): number {
  const painted = paint ?? (size >= 20 ? 1.5 : size >= 13 ? 1.25 : 1.1)
  return (painted * 16) / size
}

function Svg({ size = 20, paint, children }: IconProps & { paint?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={pinnedStroke(size, paint)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function IconBullets(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="3.66" cy="4.31" r="0.87" fill="currentColor" stroke="none" />
      <circle cx="3.66" cy="8.21" r="0.87" fill="currentColor" stroke="none" />
      <circle cx="3.66" cy="12.11" r="0.87" fill="currentColor" stroke="none" />
      <path d="M 6.42 4.31 h 6.32 M 6.42 8.21 h 6.32 M 6.42 12.11 h 6.32" />
    </Svg>
  )
}

export function IconNumbered(props: IconProps) {
  return (
    <Svg {...props}>
      <text
        x="1"
        y="5.4"
        fontSize="5.4"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        1
      </text>
      <text
        x="1"
        y="10.4"
        fontSize="5.4"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        2
      </text>
      <text
        x="1"
        y="15.4"
        fontSize="5.4"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        3
      </text>
      <path d="M6.5 3.5h8M6.5 8.5h8M6.5 13.5h8" />
    </Svg>
  )
}

export function IconMultilevel(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.61" y="3.62" width="1.39" height="1.39" fill="currentColor" stroke="none" />
      <path d="M 5.69 4.31 h 6.93" />
      <rect x="4.54" y="7.52" width="1.39" height="1.39" fill="currentColor" stroke="none" />
      <path d="M 7.62 8.21 h 5.01" />
      <rect x="6.46" y="11.42" width="1.39" height="1.39" fill="currentColor" stroke="none" />
      <path d="M 9.54 12.11 h 3.08" />
    </Svg>
  )
}

export function IconIndentDec(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 8 6.17 h 4.98 M 8 8.41 h 4.98 M 8 10.66 h 4.98 M 3.02 12.98 h 9.96" />
      <path d="M 5.68 6.17 3.19 8.41 l 2.49 2.24 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconIndentInc(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 8 6.17 h 4.98 M 8 8.41 h 4.98 M 8 10.66 h 4.98 M 3.02 12.98 h 9.96" />
      <path d="M 3.19 6.17 l 2.49 2.24 -2.49 2.24 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/* the whole "lines" family (align/indent/spacing/lists) shares the ink band
   y 3.44→12.98 so the row reads as one height */
export function IconAlignLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 3.02 6.62 h 6.64 M 3.02 9.8 h 9.96 M 3.02 12.98 h 6.64" />
    </Svg>
  )
}

export function IconAlignCenter(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 4.68 6.62 h 6.64 M 3.02 9.8 h 9.96 M 4.68 12.98 h 6.64" />
    </Svg>
  )
}

export function IconAlignRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 6.34 6.62 h 6.64 M 3.02 9.8 h 9.96 M 6.34 12.98 h 6.64" />
    </Svg>
  )
}

export function IconAlignJustify(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.44 h 9.96 M 3.02 6.62 h 9.96 M 3.02 9.8 h 9.96 M 3.02 12.98 h 9.96" />
    </Svg>
  )
}

export function IconDirLtr(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.85 h 9.96 M 3.02 6.34 h 6.64 M 3.02 11.32 h 7.1" />
      <path d="M 9.8 9.4 l 2.9 1.92 -2.9 1.92 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconDirRtl(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.85 h 9.96 M 6.34 6.34 h 6.64 M 5.88 11.32 h 7.1" />
      <path d="M 6.2 9.4 l -2.9 1.92 2.9 1.92 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconLineSpacing(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8 3.44 h 4.92 M 8 6.62 h 4.92 M 8 9.8 h 4.92 M 8 12.98 h 4.92" />
      <path d="M 4.31 3.75 v 8.9 M 2.92 5.39 l 1.39 -1.64 1.39 1.64 M 2.92 11.01 l 1.39 1.64 1.39 -1.64" />
    </Svg>
  )
}

export function IconClearFormat(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      {/* the shared letter A with a wiped-off stroke at its top left */}
      <LetterA dx={-0.45} />
      <path d="M 2.45 5.9 l 1.2 -1.2" />
      {/* compact diagonal eraser at the lower right, outline only, band facing the A;
          monochrome per the toolbar's uniform-ink rule. Kept high enough that its
          rotated corner doesn't sink the icon below the shared A baseline band */}
      <g transform="rotate(45 11.55 11.05)">
        <rect x="8.95" y="9.15" width="5.2" height="3.8" rx="0.55" />
        <path d="M 10.5 9.15 v 3.8" />
      </g>
    </Svg>
  )
}

/* THE letter A — one canonical path shared by grow/shrink font, clear
   formatting, change case and font color, so every A in the ribbon is
   literally the same glyph (apex y4 → baseline y12.5, cap ≈ the 15px letter
   glyphs' cap height). dx slides it horizontally to make room for the
   companion element (arrow, eraser, lowercase a, …). */
function LetterA({ dx = 0 }: { dx?: number }) {
  return <path d={`M${2.43 + dx} 12.5 ${5.67 + dx} 4l3.25 8.5M${3.55 + dx} 9.56h4.24`} />
}

export function IconGrowFont(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <LetterA />
      <path d="M12 12.1V4.6M9.93 6.67 12 4.6l2.07 2.07" />
    </Svg>
  )
}

export function IconShrinkFont(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <LetterA />
      <path d="M12 4.6v7.5M9.93 10.03 12 12.1l2.07-2.07" />
    </Svg>
  )
}

/** change case (Aa): the shared A + a stroke-drawn lowercase a on the same baseline */
export function IconChangeCase(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <LetterA dx={-0.9} />
      <circle cx="11.3" cy="10.55" r="1.95" fill="none" />
      <path d="M13.25 8.15v4.35" />
    </Svg>
  )
}

/** font color: the shared A alone, centered; the color bar is rendered by the button */
export function IconFontColorA(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <LetterA dx={2.33} />
    </Svg>
  )
}

/* Fluent-style sub/superscript: lowercase-x strokes + a stroked digit 2 in the
   corner (replaces the old HTML x<sub>2</sub> text glyphs that rendered smaller
   and thinner than the neighbouring 15px B/I/U letterforms) */
export function IconSuperscript(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <path d="M2.7 6.6 8.3 13M8.3 6.6 2.7 13" />
      <path d="M10.6 4.7a1.5 1.5 0 0 1 3 0c0 .9-.85 1.6-3 3.1h3.15" />
    </Svg>
  )
}

export function IconSubscript(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <path d="M2.7 4.6 8.3 11M8.3 4.6 2.7 11" />
      <path d="M10.6 9.9a1.5 1.5 0 0 1 3 0c0 .9-.85 1.6-3 3.1h3.15" />
    </Svg>
  )
}

export function IconHighlight(props: IconProps) {
  return (
    <Svg {...props} paint={1.4}>
      <path d="M3 10.5 9.5 4a1.4 1.4 0 0 1 2 0l0.5 0.5a1.4 1.4 0 0 1 0 2L5.5 13H3z" fill="none" />
      <path d="M2.2 13h4" />
    </Svg>
  )
}

/* ---------- shared shapes ---------- */

/** page outline used by many icons */
const PAGE = <path d="M4.92 3h4.62l1.93 1.93v8.09h-6.55z" />

function TextGlyph({
  x,
  y,
  s,
  children,
  bold,
}: {
  x: number
  y: number
  s: number
  children: string
  bold?: boolean
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={s}
      fill="currentColor"
      stroke="none"
      fontFamily="Segoe UI, sans-serif"
      fontWeight={bold ? 700 : 400}
    >
      {children}
    </text>
  )
}

/* ---------- clipboard (Home) ---------- */

export function IconPaste(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.43 12.11 H 3.93 C 3.23 12.11 2.67 11.54 2.67 10.84 V 4.53 C 2.67 3.83 3.23 3.26 3.93 3.26 H 4.88 M 11.51 5.16 V 4.53 C 11.51 3.83 10.94 3.26 10.25 3.26 H 9.3" />
      <rect x="5.19" y="2" width="3.79" height="1.89" rx="0.63" />
      <path d="M 12.14 5.16 H 6.46 C 5.76 5.16 5.19 5.72 5.19 6.42 V 12.74 C 5.19 13.43 5.76 14 6.46 14 H 10.32 L 13.4 10.68 V 6.42 C 13.4 5.72 12.84 5.16 12.14 5.16 Z" />
      <path d="M 7.09 7.37 H 11.51 M 7.09 9.58 H 9.61" />
      <path d="M 10.25 14 V 11.16 C 10.25 10.81 10.53 10.53 10.88 10.53 H 13.4" />
    </Svg>
  )
}

const PASTE_BOARD = (
  <>
    <path d="M 5.43 12.11 H 3.93 C 3.23 12.11 2.67 11.54 2.67 10.84 V 4.53 C 2.67 3.83 3.23 3.26 3.93 3.26 H 4.88 M 11.51 5.16 V 4.53 C 11.51 3.83 10.94 3.26 10.25 3.26 H 9.3" />
    <rect x="5.19" y="2" width="3.79" height="1.89" rx="0.63" />
    <path d="M 12.14 5.16 H 6.46 C 5.76 5.16 5.19 5.72 5.19 6.42 V 12.74 C 5.19 13.43 5.76 14 6.46 14 H 12.14 C 12.84 14 13.4 13.43 13.4 12.74 V 6.42 C 13.4 5.72 12.84 5.16 12.14 5.16 Z" />
  </>
)

/** Keep Source Formatting: clipboard with a paintbrush */
export function IconPasteSource(props: IconProps) {
  return (
    <Svg {...props}>
      {PASTE_BOARD}
      <path d="M 11.6 6.9 L 8.6 9.9 M 8.6 9.9 C 7.6 9.9 7.1 10.6 7.1 11.7 C 7.9 11.9 9 11.6 9.2 10.5" />
    </Svg>
  )
}

/** Merge Formatting: clipboard with two arrows joining */
export function IconPasteMerge(props: IconProps) {
  return (
    <Svg {...props}>
      {PASTE_BOARD}
      <path d="M 7 7.2 L 9.3 9.5 L 7 11.8 M 11.6 7.2 L 9.3 9.5 L 11.6 11.8" />
    </Svg>
  )
}

/** Keep Text Only: clipboard with a plain A */
export function IconPasteText(props: IconProps) {
  return (
    <Svg {...props}>
      {PASTE_BOARD}
      <path d="M 7.2 12 L 9.3 7 L 11.4 12 M 7.9 10.4 H 10.7" />
    </Svg>
  )
}

export function IconCut(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.27 12.85 L 5.94 11.71 L 11.32 2.4 M 4.68 2.33 L 10.05 11.65 L 10.73 12.85" />
      <circle cx="3.89" cy="12.08" r="1.58" />
      <circle cx="12.11" cy="12.08" r="1.58" />
    </Svg>
  )
}

export function IconCopy(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.67" y="4.67" width="9.33" height="9.33" rx="2" />
      <path d="M 9.67 2.67 H 4.67 C 3.56 2.67 2.67 3.56 2.67 4.67 V 9.67" />
    </Svg>
  )
}

export function IconFormatPainter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7.1" y="2.7" width="1.8" height="3.4" rx="0.9" />
      <rect x="3" y="6.1" width="10" height="7.2" rx="1" />
      <path d="M 3 8.9 H 13" />
      <path d="M 6.2 10.9 V 12.1 M 9.8 10.9 V 12.1" />
    </Svg>
  )
}

/* ---------- Insert ---------- */

export function IconTable(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.44" width="9.96" height="9.13" rx="0.66" />
      <path d="M 3.02 6.51 h 9.96 M 3.02 9.58 h 9.96 M 6.34 3.44 v 9.13 M 9.66 3.44 v 9.13" />
    </Svg>
  )
}

export function IconPicture(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.85" width="9.96" height="8.3" rx="0.66" />
      <circle cx="5.84" cy="6.51" r="0.91" />
      <path d="M 3.44 11.32 6.76 8 l 2.49 2.49 1.66 -1.66 1.66 1.66" />
    </Svg>
  )
}

export function IconRemoveBg(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.85" width="9.96" height="8.3" rx="0.66" strokeDasharray="2.2 1.6" />
      <circle cx="8" cy="6.92" r="1.41" />
      <path d="M 5.43 12.15 c 0.33 -1.91 1.41 -2.9 2.57 -2.9 s 2.24 1 2.57 2.91" />
    </Svg>
  )
}

export function IconCrop(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.33 3.17 v 7.5 h 7.5" />
      <path d="M 3.17 5.33 h 7.5 v 7.5" />
    </Svg>
  )
}

export function IconRotateRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12.4 6.2 a 4.6 4.6 0 1 0 0.6 3.3" />
      <path d="M 12.7 3.2 v 3 h -3" />
    </Svg>
  )
}

export function IconRotateLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.6 6.2 a 4.6 4.6 0 1 1 -0.6 3.3" />
      <path d="M 3.3 3.2 v 3 h 3" />
    </Svg>
  )
}

export function IconFlipH(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8 2.6 v 10.8" strokeDasharray="1.7 1.5" />
      <path d="M 6 5.2 L 2.6 8 L 6 10.8 Z" />
      <path d="M 10 5.2 L 13.4 8 L 10 10.8 Z" fill="currentColor" />
    </Svg>
  )
}

export function IconFlipV(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.6 8 h 10.8" strokeDasharray="1.7 1.5" />
      <path d="M 5.2 6 L 8 2.6 L 10.8 6 Z" />
      <path d="M 5.2 10 L 8 13.4 L 10.8 10 Z" fill="currentColor" />
    </Svg>
  )
}

export function IconReplacePicture(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.87" y="6.03" width="7.11" height="6.32" rx="0.63" />
      <circle cx="4.92" cy="8" r="0.71" />
      <path d="M 3.26 11.79 l 2.13 -2.13 1.5 1.5 1.11 -1.11 1.42 1.42" />
      <path d="M 9.19 3.73 h 3.63 m 0 0 -1.34 -1.26 m 1.34 1.26 -1.34 1.26" />
    </Svg>
  )
}

export function IconChart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 3.02 v 9.96 h 9.96" />
      <rect x="5.09" y="8" width="1.83" height="3.32" fill="currentColor" stroke="none" />
      <rect x="8" y="5.51" width="1.83" height="5.81" fill="currentColor" stroke="none" />
      <rect x="10.91" y="6.75" width="1.83" height="4.57" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconShapes(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6.28" cy="6.28" r="3.1" />
      <rect x="7.57" y="7.57" width="5.59" height="5.59" rx="0.69" fill="var(--surface, #fff)" />
    </Svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6.9" cy="6.9" r="4.2" />
      <path d="M 10 10 13.4 13.4" />
    </Svg>
  )
}

export function IconLink(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 6.91 9.09 9.09 6.91" />
      <path d="M 7.55 5.09 8.91 3.72 a 2.37 2.37 0 0 1 3.37 3.37 L 10.91 8.46" />
      <path d="M 8.46 10.91 7.09 12.28 a 2.37 2.37 0 0 1 -3.37 -3.37 l 1.37 -1.36" />
    </Svg>
  )
}

export function IconComment(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.99 3.91 h 10.01 v 6.83 h -5.46 L 4.81 13.46 v -2.73 h -1.82 z" />
      <path d="M 5.27 6.18 h 5.46 M 5.27 8.46 h 3.64" />
    </Svg>
  )
}

export function IconCommentPrev(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.99 3.91 h 10.01 v 6.83 h -5.46 L 4.81 13.46 v -2.73 h -1.82 z" />
      <path d="M 9 5.5 L 7 7.33 L 9 9.15" />
    </Svg>
  )
}

export function IconCommentNext(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.99 3.91 h 10.01 v 6.83 h -5.46 L 4.81 13.46 v -2.73 h -1.82 z" />
      <path d="M 7 5.5 L 9 7.33 L 7 9.15" />
    </Svg>
  )
}

export function IconComments(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.75 3.45 h 7.28 v 5.46 h -1.68" />
      <path d="M 2.99 5.75 h 8.19 v 5.46 h -4.1 L 4.81 13.5 v -2.29 h -1.82 z" />
      <path d="M 5.27 8.2 h 3.9" />
    </Svg>
  )
}

export function IconPageBreak(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.92 3 h 6.16 v 3.47 M 4.92 3 v 3.47 M 4.92 13.01 h 6.16 v -3.46 M 4.92 13.01 v -3.46" />
      <path
        d="M 3 8 h 1.54 M 5.69 8 h 1.54 M 8.39 8 h 1.54 M 11.08 8 h 1.93"
        strokeDasharray="none"
      />
    </Svg>
  )
}

export function IconHeader(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <path d="M 5.31 4.92 h 5.39 M 5.31 6.31 h 5.39" strokeWidth="1" opacity="0.9" />
    </Svg>
  )
}

export function IconFooter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <path d="M 5.31 9.69 h 5.39 M 5.31 11.08 h 5.39" strokeWidth="1" opacity="0.9" />
    </Svg>
  )
}

export function IconPageNumber(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <TextGlyph x={6.15} y={10.31} s={5.39}>
        #
      </TextGlyph>
    </Svg>
  )
}

export function IconSymbol(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={3.2} y={13} s={13}>
        Ω
      </TextGlyph>
    </Svg>
  )
}

export function IconEquation(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={4} y={12.5} s={12}>
        π
      </TextGlyph>
    </Svg>
  )
}

/* ---------- Table Design / Layout ---------- */

export function IconTableDelete(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.26" y="3.62" width="8.03" height="7.3" rx="0.58" />
      <path
        d="M 3.26 6.03 h 8.03 M 3.26 8.51 h 8.03 M 5.96 3.62 v 7.3 M 8.58 3.62 v 7.3"
        strokeWidth="1"
      />
      <path d="M 9.17 9.17 h 4.09 v 4.09 H 9.17 z" fill="var(--surface, #fff)" stroke="none" />
      <path d="m 9.97 9.97 2.63 2.63 M 12.6 9.97 l -2.63 2.63" strokeWidth="1" />
    </Svg>
  )
}

export function IconAutoFit(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.1" y="4" width="9.8" height="8" rx="0.65" />
      <path d="M 6.35 4 v 8 M 9.65 4 v 8 M 3.1 8 h 9.8" strokeWidth="1" />
      <path d="M 1.35 8 h 2.6 M 1.35 8 l 1 -1 M 1.35 8 l 1 1" />
      <path d="M 14.65 8 h -2.6 M 14.65 8 l -1 -1 M 14.65 8 l -1 1" />
    </Svg>
  )
}

export function IconRepeatHeader(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.45" width="8.8" height="9.1" rx="0.65" />
      <path d="M 3 6.2 h 8.8 M 3 9.35 h 8.8 M 7.4 3.45 v 9.1" strokeWidth="1" />
      <path d="M 3.6 4.8 h 7.6" strokeWidth="1.5" />
      <path d="M 11.35 10.15 a 2.15 2.15 0 1 1 -0.5 2.25" />
      <path d="m 10.2 10.15 1.3 -0.05 -0.35 1.22" />
    </Svg>
  )
}

export function IconTableProperties(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.85" y="3.2" width="7.7" height="9.6" rx="0.65" />
      <path d="M 2.85 6.4 h 7.7 M 2.85 9.6 h 7.7 M 6.7 3.2 v 9.6" strokeWidth="1" />
      <path d="M 11.7 5.15 h 2.15 M 11.7 8 h 2.15 M 11.7 10.85 h 2.15" />
      <circle cx="12.35" cy="5.15" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="13.15" cy="8" r="0.55" fill="currentColor" stroke="none" />
      <circle cx="12.65" cy="10.85" r="0.55" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconRowInsertAbove(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8 6.18 V 2.98 M 6.63 4.35 8 2.98 l 1.37 1.37" />
      <rect x="3.44" y="7.62" width="9.12" height="5.32" rx="0.61" />
      <path d="M 3.44 10.28 h 9.12 M 8 7.62 v 5.32" strokeWidth="1" />
    </Svg>
  )
}

export function IconRowInsertBelow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.44" y="3.06" width="9.12" height="5.32" rx="0.61" />
      <path d="M 3.44 5.72 h 9.12 M 8 3.06 v 5.32" strokeWidth="1" />
      <path d="M 8 9.82 v 3.19 M 6.63 11.65 8 13.02 l 1.37 -1.37" />
    </Svg>
  )
}

export function IconColInsertLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 6.18 8 H 2.98 M 4.35 6.63 2.98 8 l 1.37 1.37" />
      <rect x="7.62" y="3.44" width="5.32" height="9.12" rx="0.61" />
      <path d="M 10.28 3.44 v 9.12 M 7.62 8 h 5.32" strokeWidth="1" />
    </Svg>
  )
}

export function IconColInsertRight(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.06" y="3.44" width="5.32" height="9.12" rx="0.61" />
      <path d="M 5.72 3.44 v 9.12 M 3.06 8 h 5.32" strokeWidth="1" />
      <path d="M 9.82 8 h 3.19 M 11.65 6.63 13.02 8 l -1.37 1.37" />
    </Svg>
  )
}

export function IconMergeCells(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.15" width="10.01" height="7.7" rx="0.62" />
      <path d="M 8 4.15 v 1.54 M 8 10.31 v 1.54" strokeWidth="1" />
      <path d="M 4.46 8 h 2.31 M 5.77 7 6.77 8 5.77 9" />
      <path d="M 11.54 8 h -2.31 M 10.23 7 9.23 8 l 1 1" />
    </Svg>
  )
}

export function IconSplitCells(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.15" width="10.01" height="7.7" rx="0.62" />
      <path d="M 8 4.15 v 7.7" strokeWidth="1" />
      <path d="M 6.92 8 h -2.31 M 5.61 7 4.61 8 l 1 1" />
      <path d="M 9.08 8 h 2.31 M 10.39 7 11.39 8 l -1 1" />
    </Svg>
  )
}

export function IconRowDelete(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.44" width="9.96" height="9.13" rx="0.66" />
      <path d="M 3.02 6.51 h 9.96 M 3.02 9.49 h 9.96" strokeWidth="1" />
      <path d="m 6.01 6.92 3.98 2.16 M 9.99 6.92 6.01 9.08" />
    </Svg>
  )
}

export function IconColDelete(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.44" y="3.02" width="9.13" height="9.96" rx="0.66" />
      <path d="M 6.51 3.02 v 9.96 M 9.49 3.02 v 9.96" strokeWidth="1" />
      <path d="m 6.92 6.01 2.16 3.98 M 9.08 6.01 6.92 9.99" />
    </Svg>
  )
}

export function IconCellAlignTop(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.44" width="9.96" height="9.13" rx="0.66" />
      <path d="M 5.1 5.68 h 5.81 M 5.1 7.5 h 3.74" />
    </Svg>
  )
}

export function IconCellAlignMiddle(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.44" width="9.96" height="9.13" rx="0.66" />
      <path d="M 5.1 7.09 h 5.81 M 5.1 8.91 h 3.74" />
    </Svg>
  )
}

export function IconCellAlignBottom(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.44" width="9.96" height="9.13" rx="0.66" />
      <path d="M 5.1 8.5 h 5.81 M 5.1 10.32 h 3.74" />
    </Svg>
  )
}

export function IconBorderAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.42" />
      <path d="M 3.02 8 h 9.96 M 8 3.02 v 9.96" />
    </Svg>
  )
}

export function IconBorderOuter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.42" />
      <path
        d="M 3.02 8 h 9.96 M 8 3.02 v 9.96"
        strokeWidth="1"
        strokeDasharray="1.5 1.7"
        opacity="0.55"
      />
    </Svg>
  )
}

export function IconBorderInner(props: IconProps) {
  return (
    <Svg {...props}>
      <rect
        x="3.02"
        y="3.02"
        width="9.96"
        height="9.96"
        rx="0.42"
        strokeWidth="1"
        strokeDasharray="1.5 1.7"
        opacity="0.55"
      />
      <path d="M 3.02 8 h 9.96 M 8 3.02 v 9.96" />
    </Svg>
  )
}

export function IconBorderNone(props: IconProps) {
  return (
    <Svg {...props}>
      <rect
        x="3.02"
        y="3.02"
        width="9.96"
        height="9.96"
        rx="0.42"
        strokeWidth="1"
        strokeDasharray="1.5 1.7"
        opacity="0.55"
      />
      <path
        d="M 3.02 8 h 9.96 M 8 3.02 v 9.96"
        strokeWidth="1"
        strokeDasharray="1.5 1.7"
        opacity="0.55"
      />
    </Svg>
  )
}

function IconBorderDashedFrame() {
  return (
    <rect
      x="3.02"
      y="3.02"
      width="9.96"
      height="9.96"
      rx="0.42"
      strokeWidth="1"
      strokeDasharray="1.5 1.7"
      opacity="0.55"
    />
  )
}

export function IconBorderTop(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 3.02 3.02 h 9.96" />
    </Svg>
  )
}

export function IconBorderBottom(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 3.02 12.98 h 9.96" />
    </Svg>
  )
}

export function IconBorderLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 3.02 3.02 v 9.96" />
    </Svg>
  )
}

export function IconBorderRight(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 12.98 3.02 v 9.96" />
    </Svg>
  )
}

export function IconBorderInsideH(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 3.02 8 h 9.96" />
    </Svg>
  )
}

export function IconBorderInsideV(props: IconProps) {
  return (
    <Svg {...props}>
      <IconBorderDashedFrame />
      <path d="M 8 3.02 v 9.96" />
    </Svg>
  )
}

/* ---------- Design ---------- */

export function IconTheme(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.5} y={11.5} s={11}>
        A
      </TextGlyph>
      <TextGlyph x={8.5} y={11.5} s={8}>
        a
      </TextGlyph>
      <path d="M2.5 13.8h11" strokeWidth="1" />
    </Svg>
  )
}

export function IconThemeFonts(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2} y={12} s={11}>
        F
      </TextGlyph>
      <path d="M9.5 12 12 4.5 14.5 12M10.3 9.6h3.4" strokeWidth="1" />
    </Svg>
  )
}

export function IconThemeColors(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="4.89" cy="5.33" r="1.87" />
      <circle cx="11.11" cy="5.33" r="1.87" />
      <circle cx="4.89" cy="11.11" r="1.87" />
      <circle cx="11.11" cy="11.11" r="1.87" fill="currentColor" />
    </Svg>
  )
}

export function IconPageColor(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8.56 3.36 4.4 7.52 a 1.04 1.04 0 0 0 0 1.44 l 2.64 2.64 a 1.04 1.04 0 0 0 1.44 0 l 4.16 -4.16 z" />
      <path d="M 8.56 3.36 7.2 4.8" />
      <path
        d="M 12.48 10.08 s 1.12 1.36 1.12 2.16 a 1.12 1.12 0 0 1 -2.24 0 c 0 -0.8 1.12 -2.16 1.12 -2.16 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconWatermark(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M 5.84 10.7 10.16 5.69" strokeWidth="1" opacity="0.45" />
    </Svg>
  )
}

export function IconPageBorders(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.66" />
      <rect x="5.01" y="5.01" width="5.98" height="5.98" />
    </Svg>
  )
}

/* ---------- Layout ---------- */

export function IconMargins(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <rect x="5.84" y="4.69" width="4.31" height="6.62" strokeDasharray="1.6 1.4" />
    </Svg>
  )
}

export function IconOrientation(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.2" y="4.8" width="6" height="8" rx="0.64" />
      <rect x="6" y="7.6" width="7.2" height="5.2" rx="0.64" fill="var(--surface, #fff)" />
      <path d="M 10.4 3.36 a 4 4 0 0 1 2.4 2.08 M 12.8 3.6 v 2 h -2" strokeWidth="1" />
    </Svg>
  )
}

export function IconPageSize(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <path
        d="M 6.08 8 h 3.85 M 8 6.08 v 3.85 M 7 7 6.08 6.08 m 3.85 0 -0.92 0.92 m 0 2.01 0.92 0.92 m -3.85 0 0.92 -0.92"
        strokeWidth="1"
      />
    </Svg>
  )
}

export function IconColumns(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.99 3.45 h 4.1 M 2.99 5.73 h 4.1 M 2.99 8 h 4.1 M 2.99 10.27 h 4.1 M 2.99 12.55 h 4.1" />
      <path d="M 8.91 3.45 h 4.1 M 8.91 5.73 h 4.1 M 8.91 8 h 4.1 M 8.91 10.27 h 4.1 M 8.91 12.55 h 4.1" />
    </Svg>
  )
}

/* ---------- References ---------- */

export function IconToc(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M 6.08 5.69 h 3.85 M 7 7.46 h 2.93 M 7 9.23 h 2.93 M 6.08 11 h 3.85" />
    </Svg>
  )
}

export function IconRefresh(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12.68 6.65 a 4.86 4.86 0 0 0 -9 -1.08 M 3.32 9.35 a 4.86 4.86 0 0 0 9 1.08" />
      <path d="M 12.95 3.05 v 2.7 h -2.7 M 3.05 12.95 v -2.7 h 2.7" />
    </Svg>
  )
}

export function IconFootnote(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.5} y={12} s={9}>
        AB
      </TextGlyph>
      <TextGlyph x={11.5} y={8} s={7} bold>
        1
      </TextGlyph>
    </Svg>
  )
}

export function IconEndnote(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.5} y={12} s={9}>
        AB
      </TextGlyph>
      <TextGlyph x={11.3} y={8} s={7} bold>
        n
      </TextGlyph>
    </Svg>
  )
}

export function IconCitation(props: IconProps) {
  // drawn quote marks, not a font glyph: text quotes hug the ascender line, so
  // the old TextGlyph version floated small at the top of the canvas
  return (
    <Svg {...props}>
      <path
        d="M6.9 4.9c-2 .7-3.3 2.3-3.3 4.3 0 1.3.9 2.3 2.1 2.3s2.1-1 2.1-2.2c0-1.2-.8-2.1-1.9-2.1.3-.8 1-1.4 1.9-1.8z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M12.9 4.9c-2 .7-3.3 2.3-3.3 4.3 0 1.3.9 2.3 2.1 2.3s2.1-1 2.1-2.2c0-1.2-.8-2.1-1.9-2.1.3-.8 1-1.4 1.9-1.8z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8 4.09 C 6.96 3.3 5.22 2.95 3.22 3.13 v 9.05 c 2 -0.17 3.74 0.17 4.79 0.96 1.04 -0.78 2.78 -1.13 4.79 -0.96 V 3.13 c -2 -0.17 -3.74 0.17 -4.78 0.96 z" />
      <path d="M 8 4.09 v 9.05" />
    </Svg>
  )
}

export function IconCaption(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.02 5.1 h 7.06 L 12.98 8 l -2.9 2.91 H 3.02 z" />
      <circle cx="5.51" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconIndex(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.8} y={6.5} s={6.5}>
        A
      </TextGlyph>
      <TextGlyph x={1.8} y={13.5} s={6.5}>
        B
      </TextGlyph>
      <path d="M8 4.5h6M8 8h6M8 11.5h6" />
    </Svg>
  )
}

/* ---------- Review ---------- */

export function IconWordCount(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.6} y={8} s={8}>
        123
      </TextGlyph>
      <path d="M2 11h12M2 13.5h8" />
    </Svg>
  )
}

export function IconSpellcheck(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.4} y={8.5} s={7.5}>
        abc
      </TextGlyph>
      <path d="M6 11.5 8.5 13.5 13 7.5" strokeWidth="1" />
    </Svg>
  )
}

export function IconSparkle(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M 8 3.03 C 8 5.78 10.22 8 12.97 8 C 10.22 8 8 10.22 8 12.97 C 8 10.22 5.78 8 3.03 8 C 5.78 8 8 5.78 8 3.03 Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconWand(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.6 12.4 9.6 6.4" strokeWidth="1" />
      <path
        d="M 11.04 2.8 l 0.56 1.52 1.52 0.56 -1.52 0.56 -0.56 1.52 -0.56 -1.52 -1.52 -0.56 1.52 -0.56 z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M 12.4 8.4 l 0.32 0.88 0.88 0.32 -0.88 0.32 -0.32 0.88 -0.32 -0.88 -0.88 -0.32 0.88 -0.32 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconTranslate(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.2} y={9} s={8.5}>
        文
      </TextGlyph>
      <path d="M8.8 13.5 11.5 6.5 14.2 13.5M9.7 11.3h3.6" strokeWidth="1" />
    </Svg>
  )
}

export function IconTrackChanges(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M 6.08 6.08 h 3.85 M 6.08 8 h 2.31" />
      <path
        d="M 8.38 12 12.31 8.08 l 0.92 0.92 -3.93 3.93 -1.39 0.46 z"
        fill="var(--surface, #fff)"
      />
    </Svg>
  )
}

export function IconAccept(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.91 9.36 7.09 12.55 l 6.83 -7.28" />
    </Svg>
  )
}

export function IconReject(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4.5 4.5 9 9M13.5 4.5l-9 9" />
    </Svg>
  )
}

export function IconCompare(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.15" width="4.24" height="7.7" rx="0.62" />
      <rect x="8.77" y="4.15" width="4.24" height="7.7" rx="0.62" />
      <path d="M 6.46 8 h 3.08 M 8.46 6.92 9.54 8 l -1.08 1.08" strokeWidth="1" />
    </Svg>
  )
}

export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.27" y="7.17" width="7.47" height="6.23" rx="0.83" />
      <path d="M 5.93 7.17 V 5.51 a 2.07 2.07 0 0 1 4.15 0 v 1.66" />
      <circle cx="8" cy="10.07" r="0.83" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconKey(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5.4" cy="10.6" r="2.5" />
      <path d="M 7.3 8.7 L 12.9 3.1 M 10.4 5.6 l 1.7 1.7 M 12.1 3.9 l 1.4 1.4" />
    </Svg>
  )
}

export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 1.7 8 C 3.1 5.15 5.35 3.6 8 3.6 s 4.9 1.55 6.3 4.4 C 12.9 10.85 10.65 12.4 8 12.4 S 3.1 10.85 1.7 8 Z" />
      <circle cx="8" cy="8" r="1.95" />
    </Svg>
  )
}

export function IconEyeOff(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.5 4.65 C 2.78 5.5 2.18 6.62 1.7 8 c 1.4 2.85 3.65 4.4 6.3 4.4 c 1.02 0 1.97 -0.23 2.84 -0.68 M 6.4 3.82 C 6.91 3.67 7.44 3.6 8 3.6 c 2.65 0 4.9 1.55 6.3 4.4 c -0.4 0.82 -0.87 1.54 -1.4 2.15" />
      <path d="M 6.62 6.62 a 1.95 1.95 0 0 0 2.76 2.76" />
      <path d="M 2.7 2.7 l 10.6 10.6" />
    </Svg>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M 8 4.9 v 3.5" />
      <circle cx="8" cy="10.9" r="0.75" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/* ---------- View ---------- */

function Magnifier({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx="7.15" cy="7.15" r="4.08" />
      <path d="M 10.21 10.21 13.1 13.1" strokeWidth="1" />
      {children}
    </>
  )
}

export function IconZoom(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier />
    </Svg>
  )
}

export function IconZoomOut(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <path d="M 5.28 7.15 h 3.74" />
      </Magnifier>
    </Svg>
  )
}

export function IconZoomIn(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <path d="M 5.28 7.15 h 3.74 M 7.15 5.28 v 3.74" />
      </Magnifier>
    </Svg>
  )
}

export function IconZoom100(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <TextGlyph x={4.43} y={8.85} s={4.25} bold>
          1:1
        </TextGlyph>
      </Magnifier>
    </Svg>
  )
}

export function IconPageWidth(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.66" />
      <path
        d="M 4.68 8 h 6.64 M 6.17 6.51 4.68 8 l 1.49 1.49 M 9.83 6.51 11.32 8 l -1.49 1.49"
        strokeWidth="1"
      />
    </Svg>
  )
}

export function IconWholePage(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.15" y="3" width="7.7" height="10.01" rx="0.62" />
      <path d="M 6.08 8 h 3.85 M 8 6.08 v 3.85" strokeWidth="1" />
    </Svg>
  )
}

export function IconAiPanel(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.76" width="10.01" height="8.47" rx="0.62" />
      <path d="M 9.39 3.76 v 8.47" />
      <path
        d="M 10.31 6.61 l 0.39 1 1 0.39 -1 0.39 -0.38 1 -0.38 -1 -1 -0.38 1 -0.38 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12.52 9.57 A 5.05 5.05 0 0 1 6.43 3.48 a 5.05 5.05 0 1 0 6.09 6.09 z" />
    </Svg>
  )
}

export function IconReadMode(props: IconProps) {
  return <IconBook {...props} />
}

export function IconOutlineView(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="3.65" cy="4.09" r="0.87" fill="currentColor" stroke="none" />
      <path d="M 5.83 4.09 h 6.96" />
      <circle cx="5.83" cy="8" r="0.87" fill="currentColor" stroke="none" />
      <path d="M 8 8 h 4.79" />
      <circle cx="5.83" cy="11.92" r="0.87" fill="currentColor" stroke="none" />
      <path d="M 8 11.92 h 4.79" />
    </Svg>
  )
}

export function IconRuler(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6.08" width="10.01" height="3.85" rx="0.62" />
      <path
        d="M 5.31 6.08 v 1.54 M 7.23 6.08 v 2.31 M 9.16 6.08 v 1.54 M 11.08 6.08 v 2.31"
        strokeWidth="1"
      />
    </Svg>
  )
}

export function IconNavPane(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.76" width="10.01" height="8.47" rx="0.62" />
      <path d="M 6.46 3.76 v 8.47" />
      <path d="M 4 5.69 h 1.54 M 4 7.62 h 1.54 M 4 9.54 h 1.54" strokeWidth="1" />
    </Svg>
  )
}

export function IconSplit(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.66" />
      <path d="M 3.02 8 h 9.96" strokeWidth="1" />
    </Svg>
  )
}

export function IconPrintLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.54" y="3" width="6.93" height="10.01" rx="0.62" />
      <path
        d="M 6.08 5.31 h 3.85 M 6.08 7.23 h 3.85 M 6.08 9.16 h 3.85 M 6.08 11.08 h 2.31"
        strokeWidth="1"
      />
    </Svg>
  )
}

export function IconWebLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.76" width="10.01" height="8.47" rx="0.62" />
      <path d="M 3 5.69 h 10.01" />
      <path d="M 4.54 7.62 h 6.93 M 4.54 9.16 h 6.93 M 4.54 10.7 h 4.62" strokeWidth="1" />
    </Svg>
  )
}

export function IconGridlines(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.02" y="3.02" width="9.96" height="9.96" rx="0.66" />
      <path
        d="M 3.02 6.34 h 9.96 M 3.02 9.66 h 9.96 M 6.34 3.02 v 9.96 M 9.66 3.02 v 9.96"
        strokeWidth="1"
      />
    </Svg>
  )
}

export function IconNewWindow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5.31" width="7.7" height="7.7" rx="0.62" />
      <path d="M 5.31 5.31 v -1.54 a 0.77 0.77 0 0 1 0.77 -0.77 h 6.16 a 0.77 0.77 0 0 1 0.77 0.77 v 6.16 a 0.77 0.77 0 0 1 -0.77 0.77 h -1.54" />
      <path d="M 6.85 9.16 h 3.08 M 8.39 7.62 v 3.08" />
    </Svg>
  )
}

export function IconArrangeAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.38" width="10.01" height="4" rx="0.62" />
      <rect x="3" y="8.62" width="10.01" height="4" rx="0.62" />
    </Svg>
  )
}

export function IconSwitchWindows(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="6.08" width="6.93" height="6.16" rx="0.62" />
      <path d="M 5.69 6.08 v -1.54 a 0.77 0.77 0 0 1 0.77 -0.77 h 5.78 a 0.77 0.77 0 0 1 0.77 0.77 v 5.39 a 0.77 0.77 0 0 1 -0.77 0.77 h -2.31" />
    </Svg>
  )
}

export function IconPosition(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="10.01" height="10.01" rx="0.77" />
      <rect x="5.69" y="5.69" width="4.62" height="4.62" />
    </Svg>
  )
}

export function IconWrapText(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5.69" width="4.62" height="4.62" />
      <path d="M 9.16 3.38 h 3.85 M 9.16 5.69 h 3.85 M 9.16 8 h 3.85 M 9.16 10.31 h 3.85 M 3 12.62 h 10.01 M 3 3.38 h 4.62" />
    </Svg>
  )
}

export function IconDoc(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M 9.54 3 V 4.92 h 1.93" />
      <path d="M 6.08 6.84 h 3.85 M 6.08 8.77 h 3.85 M 6.08 10.7 h 2.7" />
    </Svg>
  )
}

/* ---------- AI panel ---------- */

export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.01 8 12.99 3.36 10.58 12.64 7.66 9.38 z" strokeLinejoin="round" />
      <path d="M 7.66 9.38 12.99 3.36" />
    </Svg>
  )
}

export function IconStop(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="10" height="10" rx="1.88" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="1.78" />
      <path d="M 8 2.98 v 1.62 M 8 11.4 v 1.62 M 13.02 8 h -1.62 M 4.6 8 h -1.62 M 11.56 4.44 l -1.13 1.13 M 5.57 10.43 l -1.13 1.13 M 11.56 11.56 10.43 10.43 M 5.57 5.57 4.44 4.44" />
    </Svg>
  )
}

/** collapse the left-docked AI panel: sheets-parity glyph (16-canvas, 1.2/1.3 stroke),
 *  self-contained so the shared Svg wrapper's pinned stroke doesn't alter its weight */
export function IconSidebarCollapse({ size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
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

export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="4.98" />
      <path d="M 8 5.34 V 8 l 1.91 1.33" />
    </Svg>
  )
}

export function IconPaperclip(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M 12.5 7.28 8.18 11.6 a 3.06 3.06 0 0 1 -4.32 -4.32 l 4.5 -4.5 a 2.07 2.07 0 0 1 2.88 2.88 l -4.5 4.5 a 0.99 0.99 0 0 1 -1.44 -1.44 l 4.14 -4.14"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function IconNewChat(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M 12.68 7.32 v -2.55 A 1.44 1.44 0 0 0 11.23 3.33 H 4.77 a 1.44 1.44 0 0 0 -1.44 1.44 v 5.19 a 1.44 1.44 0 0 0 1.44 1.44 h 0.94 v 1.7 l 2.21 -1.7 h 1.11"
        strokeLinejoin="round"
      />
      <path d="M 11.57 9.19 v 3.4 M 9.87 10.89 h 3.4" />
    </Svg>
  )
}

/* ---------- titlebar quick access ---------- */

/** Design-supplied glyphs on the 1:16 stroke:canvas ratio (24-canvas / 1.5 stroke):
 *  the stroke scales proportionally with size instead of the pinnedStroke policy. */
function SvgRatio({ size = 24, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function IconSave(props: IconProps) {
  return (
    <SvgRatio {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8V3" />
    </SvgRatio>
  )
}

export function IconUndo(props: IconProps) {
  return (
    <SvgRatio {...props}>
      <path d="M5.91026 4L2.5 7.14791L5.91026 10.8205" />
      <path d="M3.96154 7.41028H15.1636C18.5169 7.41028 21.3646 10.1484 21.4953 13.5C21.6334 17.0416 18.707 20.0769 15.1636 20.0769H6.88384" />
    </SvgRatio>
  )
}

export function IconRedo(props: IconProps) {
  return (
    <SvgRatio {...props}>
      <path d="M18.0897 4L21.5 7.14791L18.0897 10.8205" />
      <path d="M20.0385 7.41028H8.83636C5.4831 7.41028 2.63537 10.1484 2.5047 13.5C2.36657 17.0416 5.29296 20.0769 8.83636 20.0769H17.1162" />
    </SvgRatio>
  )
}

export function IconCursor(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 3.98 3.01 12.02 8.53 l -3.41 0.81 L 6.99 12.95 3.98 3.01 Z" />
    </Svg>
  )
}

export function IconPen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m3 13 .8-3L10.6 3.2a1.4 1.4 0 0 1 2 0l.2.2a1.4 1.4 0 0 1 0 2L6 12.2 3 13Z" />
      <path d="M9.6 4.2 11.8 6.4" />
    </Svg>
  )
}

export function IconHighlighterPen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.68 9.4 10.6 4.47 a 1.21 1.21 0 0 1 1.77 0 l -0.84 -0.84 0.84 0.84 a 1.21 1.21 0 0 1 0 1.77 L 7.44 11.16 l -2.42 0.65 0.65 -2.42 Z" />
      <path d="M 3.35 13.58 h 9.3" strokeWidth="1" opacity="0.5" />
    </Svg>
  )
}

export function IconEraser(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m8.3 3.6 4.1 4.1a1.2 1.2 0 0 1 0 1.7L9.6 12.2H6.8L3.6 9a1.2 1.2 0 0 1 0-1.7l3-3a1.2 1.2 0 0 1 1.7 0Z" />
      <path d="M5.5 5.8 10.2 10.5" />
      <path d="M6.8 12.2h6.4" />
    </Svg>
  )
}

export function IconTextBox(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.99" y="3.77" width="10.01" height="8.47" rx="0.77" />
      <path d="M 5.69 6.07 h 4.62 M 8 6.07 v 4.23" />
    </Svg>
  )
}

export function IconWordArt(props: IconProps) {
  return (
    <Svg {...props}>
      {/* stylized A with gradient effect hint */}
      <path d="M8 3 3.5 13h2.3l1-2.5h2.4l1 2.5h2.3L8 3Z" />
      <path d="M5.6 9.2h4.8" />
    </Svg>
  )
}

export function IconPencil(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.9 2.9a1.1 1.1 0 0 1 1.56 0l.64.64a1.1 1.1 0 0 1 0 1.56L6.2 12l-3.1.9.9-3.1 6.9-6.9Z" />
      <path d="M9.6 4.2l2.2 2.2" />
    </Svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.11 4.89h9.79M6.4 4.89V3.73a.62.62 0 0 1 .62-.62h1.96a.62.62 0 0 1 .62.62v1.16" />
      <path d="M4.44 4.89l.62 7.39a.89.89 0 0 0 .89.8h4.09a.89.89 0 0 0 .89-.8l.62-7.39" />
      <path d="M6.75 7.11v3.56M9.25 7.11v3.56" />
    </Svg>
  )
}

/** Thin dropdown chevron replacing the ▾ text glyph (same path as the slides ribbon's RbCaret);
 *  1.5 stroke on a 24 viewBox keeps the 1 : 16 stroke : canvas ratio. */
export function IconCaret({ size = 10 }: IconProps) {
  return (
    <svg
      className="rb-caret-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5.5 9.25 12 15.75l6.5-6.5" />
    </svg>
  )
}

export function IconPalette(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 12.98a4.98 4.98 0 1 1 4.98-4.98c0 2.44-1.74 2.49-2.74 2.49-.8 0-1.25.5-1.25 1.25 0 .7-.45 1.25-1 1.25Z" />
      <circle cx="8.83" cy="4.93" r="0.71" fill="currentColor" stroke="none" />
      <circle cx="11.07" cy="6.71" r="0.71" fill="currentColor" stroke="none" />
      <circle cx="6.09" cy="5.51" r="0.71" fill="currentColor" stroke="none" />
      <circle cx="4.93" cy="8.25" r="0.71" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconSort(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.5} y={7.2} s={7}>
        A
      </TextGlyph>
      <TextGlyph x={1.5} y={14.5} s={7}>
        Z
      </TextGlyph>
      <path d="M11.5 2.5V13M11.5 13 9.3 10.8M11.5 13l2.2-2.2" />
    </Svg>
  )
}

export function IconPilcrow(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12.1 2.99 H 7.45 a 2.73 2.73 0 0 0 0 5.46 h 1.91 M 9.36 2.99 v 10.01 M 12.1 2.99 v 10.01" />
    </Svg>
  )
}

export function IconShading(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.99" y="3.44" width="10.01" height="9.54" rx="0.46" />
      <path
        d="M 2.99 7.7 7.25 3.44 M 2.99 11.9 11.45 3.44 M 5.5 12.98 13 5.48 M 9.2 12.98 13 9.18"
        opacity="0.55"
      />
    </Svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.8 8.6 6.2 12l7-7.5" />
    </Svg>
  )
}

export function IconCheckbox(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.99" y="2.99" width="10.01" height="10.01" rx="1.37" />
    </Svg>
  )
}

export function IconCheckboxChecked(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.99" y="2.99" width="10.01" height="10.01" rx="1.37" />
      <path d="M 5.45 8.27 l 1.91 2 3.37 -4.19" />
    </Svg>
  )
}

/** Word's Styles Pane glyph: a pane with an "A" beside a list */
export function IconStylesPane(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="2.5" width="12" height="11" rx="1" />
      <path d="M 4 10.6 5.9 5.6 7.8 10.6 M 4.7 9 7.1 9" />
      <path d="M 9.6 6 12.2 6 M 9.6 8.2 12.2 8.2 M 9.6 10.4 12.2 10.4" />
    </Svg>
  )
}

export function IconClose(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </Svg>
  )
}

/**  brand mark (rounded-square sparkle badge), inline so it renders
 * crisply at device resolution instead of going through <img> rasterization */
export function GensparkMark({ size = 30 }: { size?: number }) {
  return (
    <img
      src="data:image/png;base64,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"
      width={size}
      height={size}
      alt=""
    />
  )
}

export function IconReplace(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 2.5 6 2.5 3.5 7 3.5" />
      <path d="M 5.3 1.9 7 3.5 5.3 5.1" />
      <path d="M 13.5 10 13.5 12.5 9 12.5" />
      <path d="M 10.7 14.1 9 12.5 10.7 10.9" />
      <rect x="8.5" y="2" width="5" height="5" rx="0.8" />
      <rect x="2.5" y="9" width="5" height="5" rx="0.8" />
    </Svg>
  )
}

export function IconSelectAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1" strokeDasharray="2 1.4" />
      <path d="M 5 8.2 7 10.2 11 6.2" />
    </Svg>
  )
}
