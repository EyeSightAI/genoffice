/** Small monochrome SVG icons approximating Word's ribbon glyphs. */

import type { ReactNode } from 'react'
import type { AnimEffectKind } from '../../shared/ipc'

interface IconProps {
  size?: number
}

/** Constant painted stroke instead of proportional scaling: ~1.5px lines on
 *  20px+ glyphs, ~1.25px on the 13-19px ones, ~1.1px below (a proportional
 *  1.5-unit stroke would paint 1.75px at 28px and hairlines at small sizes).
 *  stroke-width is in 24-canvas units: units = painted-px × 24 / rendered-px. */
function pinnedStroke(size: number): number {
  const painted = size >= 20 ? 1.5 : size >= 13 ? 1.25 : 1.1
  return (painted * 24) / size
}

function Svg({ size = 24, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={pinnedStroke(size)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Renders gallery glyph markup (inner SVG for a 24×24 viewBox, stroke=currentColor). */
export function IconGlyph({ body, size = 18 }: { body: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={pinnedStroke(size)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: body }}
    />
  )
}

export function IconFind(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10.13" cy="10.13" r="5.61" />
      <path d="M 14.41 14.41 L 19.48 19.48" />
    </Svg>
  )
}

export function IconBullets(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5.48" cy="6.67" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5.48" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5.48" cy="17.33" r="1.3" fill="currentColor" stroke="none" />
      <path d="M 9.63 6.67 h 9.48 M 9.63 12 h 9.48 M 9.63 17.33 h 9.48" />
    </Svg>
  )
}

export function IconNumbered(props: IconProps) {
  return (
    <Svg {...props}>
      <text
        x="1.5"
        y="8.1"
        fontSize="8.1"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        1
      </text>
      <text
        x="1.5"
        y="15.6"
        fontSize="8.1"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        2
      </text>
      <text
        x="1.5"
        y="23.1"
        fontSize="8.1"
        fill="currentColor"
        stroke="none"
        fontFamily="Segoe UI, sans-serif"
      >
        3
      </text>
      <path d="M9.75 5.25 h12 M9.75 12.75 h12 M9.75 20.25 h12" />
    </Svg>
  )
}

export function IconIndentDec(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.15 h 14.94 M 12 9.26 h 7.47 M 12 12.62 h 7.47 M 12 15.98 h 7.47 M 4.53 19.47 h 14.94" />
      <path d="M 8.51 9.26 4.78 12.62 l 3.74 3.36 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconIndentInc(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.15 h 14.94 M 12 9.26 h 7.47 M 12 12.62 h 7.47 M 12 15.98 h 7.47 M 4.53 19.47 h 14.94" />
      <path d="M 4.78 9.26 l 3.74 3.36 -3.73 3.36 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconAlignLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 4.53 9.51 h 9.96 M 4.53 13.25 h 14.94 M 4.53 16.98 h 9.96" />
    </Svg>
  )
}

export function IconDirLtr(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 4.53 9.51 h 9.96 M 4.53 16.98 h 10.65" />
      <path d="M 14.7 14.1 l 4.35 2.88 -4.35 2.88 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconDirRtl(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 9.51 9.51 h 9.96 M 8.82 16.98 h 10.65" />
      <path d="M 9.3 14.1 l -4.35 2.88 4.35 2.88 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconAlignCenter(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 7.02 9.51 h 9.96 M 4.53 13.25 h 14.94 M 7.02 16.98 h 9.96" />
    </Svg>
  )
}

export function IconAlignRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 9.51 9.51 h 9.96 M 4.53 13.25 h 14.94 M 9.51 16.98 h 9.96" />
    </Svg>
  )
}

export function IconAlignJustify(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94 M 4.53 9.51 h 14.94 M 4.53 13.25 h 14.94 M 4.53 16.98 h 14.94" />
    </Svg>
  )
}

export function IconLineSpacing(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 5.85 h 7.38 M 12 10.03 h 7.38 M 12 14.21 h 7.38 M 12 18.4 h 7.38" />
      <path d="M 6.47 6.1 v 11.81 M 4.37 8.56 l 2.09 -2.46 2.09 2.46 M 4.37 15.44 l 2.09 2.46 2.09 -2.46" />
    </Svg>
  )
}

export function IconClearFormat(props: IconProps) {
  return (
    <Svg {...props}>
      {/* letter A with a wiped-off stroke at its top left */}
      <path d="M3.75 18.75 8.25 6l4.5 12.75" />
      <path d="M5.55 14.25h5.4" />
      <path d="M4.35 8.85l1.8-1.8" />
      {/* compact diagonal eraser at the lower right (the old diamond's spot), outline only, band facing the A */}
      <g transform="rotate(45 17.4 17.4)">
        <rect x="13.05" y="14.25" width="8.7" height="6.3" rx="0.9" />
        <path d="M15.6 14.25v6.3" />
      </g>
    </Svg>
  )
}

export function IconGrowFont(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.25 19 8.5 5.25 13.75 19M5.1 14.25h6.8" />
      <path d="M18 17.5V6.75M14.9 9.85 18 6.75l3.1 3.1" />
    </Svg>
  )
}

export function IconShrinkFont(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.25 19 8.5 5.25 13.75 19M5.1 14.25h6.8" />
      <path d="M18 6.75V17.5M14.9 14.4l3.1 3.1 3.1-3.1" />
    </Svg>
  )
}

/* Fluent-style sub/superscript: lowercase-x strokes + a stroked digit 2 in the
   corner (replaces the old HTML x<sub>2</sub> text glyphs) */
export function IconSuperscript(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.05 9.9 12.45 19.5M12.45 9.9 4.05 19.5" />
      <path d="M15.9 7.05a2.25 2.25 0 0 1 4.5 0c0 1.35-1.28 2.4-4.5 4.65h4.73" />
    </Svg>
  )
}

export function IconSubscript(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.05 6.9 12.45 16.5M12.45 6.9 4.05 16.5" />
      <path d="M15.9 14.85a2.25 2.25 0 0 1 4.5 0c0 1.35-1.28 2.4-4.5 4.65h4.73" />
    </Svg>
  )
}

/** Character spacing (MS-style): AV above a double-headed arrow */
export function IconCharSpacing(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={4} y={13.5} s={13}>
        AV
      </TextGlyph>
      <path d="M4.5 18.75 h15 M7.2 16.05 4.5 18.75 l2.7 2.7 M16.8 16.05 19.5 18.75 l-2.7 2.7" />
    </Svg>
  )
}

/** MS-style text highlighter: marker nib only; the color bar is rendered by the button */
export function IconTextHighlight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 16.5 14.25 6.75 a2.1 2.1 0 0 1 3 0 l0.75 0.75 a2.1 2.1 0 0 1 0 3 L8.25 20.25 H4.5 z" />
    </Svg>
  )
}

export function IconHighlight(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M 4.95 15.38 14.5 5.83 a 2.06 2.06 0 0 1 2.94 0 l 0.73 0.73 a 2.06 2.06 0 0 1 0 2.94 L 8.62 19.05 H 4.95 z"
        fill="none"
      />
      <rect
        x="3.78"
        y="17.87"
        width="5.87"
        height="2.35"
        rx="1.17"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

/* ---------- shared shapes ---------- */

/** page outline used by many icons */
const PAGE = <path d="M6 2.25 h9 l3.75 3.75 v15.75 h-12.75 z" />

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
      <path d="M 8.14 18.16 H 5.89 C 4.85 18.16 4 17.31 4 16.26 V 6.79 C 4 5.74 4.85 4.89 5.89 4.89 H 7.32 M 17.26 7.74 V 6.79 C 17.26 5.74 16.41 4.89 15.37 4.89 H 13.95" />
      <rect x="7.79" y="3" width="5.68" height="2.84" rx="0.95" />
      <path d="M 18.21 7.74 H 9.68 C 8.64 7.74 7.79 8.59 7.79 9.63 V 19.11 C 7.79 20.15 8.64 21 9.68 21 H 15.49 L 20.11 16.03 V 9.63 C 20.11 8.59 19.26 7.74 18.21 7.74 Z" />
      <path d="M 10.63 11.05 H 17.26 M 10.63 14.37 H 14.42" />
      <path d="M 15.37 21 V 16.74 C 15.37 16.21 15.79 15.79 16.32 15.79 H 20.11" />
    </Svg>
  )
}

export function IconCut(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 7.91 19.27 L 8.92 17.57 L 16.98 3.59 M 7.02 3.5 L 15.08 17.47 L 16.09 19.27" />
      <circle cx="5.83" cy="18.13" r="2.37" />
      <circle cx="18.17" cy="18.13" r="2.37" />
    </Svg>
  )
}

export function IconCopy(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="7" y="7" width="14" height="14" rx="3" />
      <path d="M 14.5 4 H 7 C 5.34 4 4 5.34 4 7 V 14.5" />
    </Svg>
  )
}

/** Shape style gallery: two offset rounded rects (context-menu quick bar) */
export function IconShapeStyle(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="11" height="9" rx="1.5" />
      <rect x="9.5" y="10.5" width="10.5" height="8.5" rx="1.5" fill="var(--surface)" />
    </Svg>
  )
}

/** Paint bucket + drop (context-menu quick bar fill entry) */
export function IconFillColor(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 7.6 10.4 12.6 5.4 l 5.6 5.6 -6.3 6.3 a 1.4 1.4 0 0 1 -2 0 L 5.6 13 a 1.4 1.4 0 0 1 0 -2 z" />
      <path d="M 12.6 5.4 10.9 3.7" />
      <path
        d="M 19.7 15.4 c 0.9 1.2 1.5 2.2 1.5 3 a 1.5 1.5 0 0 1 -3 0 c 0 -0.8 0.6 -1.8 1.5 -3 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

/** Concentric squares suggesting an outline ring (context-menu quick bar outline entry) */
export function IconOutlineColor(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </Svg>
  )
}

export function IconFormatPainter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="10.65" y="4.05" width="2.7" height="5.1" rx="1.35" />
      <rect x="4.5" y="9.15" width="15" height="10.8" rx="1.5" />
      <path d="M 4.5 13.35 H 19.5" />
      <path d="M 9.3 16.35 V 18.15 M 14.7 16.35 V 18.15" />
    </Svg>
  )
}

/** Slide layout: slide frame + title line + two content placeholders */
export function IconSlideLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="5.15" width="14.94" height="13.69" rx="1" />
      <path d="M 7.64 8.89 h 8.72" />
      <rect x="7.64" y="11.38" width="3.74" height="4.36" rx="0.5" />
      <rect x="12.62" y="11.38" width="3.74" height="4.36" rx="0.5" />
    </Svg>
  )
}

/* ---------- Insert ---------- */

export function IconTable(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="5.15" width="14.94" height="13.69" rx="1" />
      <path d="M 4.53 9.76 h 14.94 M 4.53 14.37 h 14.94 M 9.51 5.15 v 13.69 M 14.49 5.15 v 13.69" />
    </Svg>
  )
}

export function IconPicture(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="5.78" width="14.94" height="12.45" rx="1" />
      <circle cx="8.76" cy="9.76" r="1.37" />
      <path d="M 5.15 16.98 10.13 12 l 3.74 3.74 2.49 -2.49 2.49 2.49" />
    </Svg>
  )
}

export function IconShapes(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9.42" cy="9.42" r="4.64" />
      <rect x="11.36" y="11.36" width="8.39" height="8.39" rx="1.03" fill="var(--surface, #fff)" />
    </Svg>
  )
}

export function IconLink(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 10.35 13.65 13.65 10.35" />
      <path d="M 11.31 7.59 13.38 5.52 a 3.59 3.59 0 0 1 5.1 5.1 L 16.41 12.69" />
      <path d="M 12.69 16.41 10.62 18.48 a 3.59 3.59 0 0 1 -5.1 -5.1 l 2.07 -2.07" />
    </Svg>
  )
}

export function IconComment(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.51 4.87 h 14.99 v 10.22 h -8.18 L 7.23 19.18 v -4.09 h -2.73 z" />
      <path d="M 7.91 8.28 h 8.18 M 7.91 11.68 h 5.45" />
    </Svg>
  )
}

export function IconPageBreak(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 7.38 4.49 h 9.24 v 5.2 M 7.38 4.49 v 5.2 M 7.38 19.51 h 9.24 v -5.2 M 7.38 19.51 v -5.2" />
      <path d="M 4.49 12 h 2.31 M 8.54 12 h 2.31 M 12.58 12 h 2.31 M 16.62 12 h 2.89" />
    </Svg>
  )
}

export function IconHeader(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.23" y="4.49" width="11.55" height="15.02" rx="0.92" />
      <path d="M 7.96 7.38 h 8.09 M 7.96 9.46 h 8.09" opacity="0.9" />
    </Svg>
  )
}

export function IconFooter(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.23" y="4.49" width="11.55" height="15.02" rx="0.92" />
      <path d="M 7.96 14.54 h 8.09 M 7.96 16.62 h 8.09" opacity="0.9" />
    </Svg>
  )
}

export function IconPageNumber(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.25" y="4.5" width="11.5" height="15" rx="0.95" />
      <TextGlyph x={9.2} y={15.5} s={8}>
        #
      </TextGlyph>
    </Svg>
  )
}

export function IconSymbol(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={3.4} y={20.4} s={24}>
        Ω
      </TextGlyph>
    </Svg>
  )
}

export function IconEquation(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={5.4} y={17.75} s={22}>
        π
      </TextGlyph>
    </Svg>
  )
}

/* ---------- Design ---------- */

export function IconSlideMaster(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.2" y="4.8" width="12" height="8.4" rx="1.2" />
      <path d="M 6.6 7.8 h 7.2 M 6.6 10.2 h 4.8" />
      <rect x="9.6" y="15" width="9.6" height="4.8" rx="0.96" />
    </Svg>
  )
}

export function IconTheme(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.25} y={17.25} s={16.5}>
        A
      </TextGlyph>
      <TextGlyph x={12.75} y={17.25} s={12}>
        a
      </TextGlyph>
      <rect
        x="3.75"
        y="19.35"
        width="16.5"
        height="2.7"
        rx="1.35"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconThemeFonts(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={3} y={18} s={16.5}>
        F
      </TextGlyph>
      <path d="M14.25 18 18 6.75 21.75 18 M15.45 14.4 h5.1" />
    </Svg>
  )
}

export function IconThemeColors(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7.32" cy="7.63" r="2.81" />
      <circle cx="16.68" cy="7.63" r="2.81" />
      <circle cx="7.32" cy="16.32" r="2.81" />
      <circle cx="16.68" cy="16.32" r="2.81" fill="currentColor" />
    </Svg>
  )
}

export function IconPageColor(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12.84 5.04 6.6 11.28 a 1.56 1.56 0 0 0 0 2.16 l 3.96 3.96 a 1.56 1.56 0 0 0 2.16 0 l 6.24 -6.24 z" />
      <path d="M 12.84 5.04 10.8 7.2" />
      <path
        d="M 18.72 15.12 s 1.68 2.04 1.68 3.24 a 1.68 1.68 0 0 1 -3.36 0 c 0 -1.2 1.68 -3.24 1.68 -3.24 z"
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
      <path d="M7.8 17.25 16.2 7.5" opacity="0.45" />
    </Svg>
  )
}

export function IconPageBorders(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="4.53" width="14.94" height="14.94" rx="1" />
      <rect x="7.52" y="7.52" width="8.96" height="8.96" />
    </Svg>
  )
}

/* ---------- Layout ---------- */

export function IconMargins(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.23" y="4.49" width="11.55" height="15.02" rx="0.92" />
      <rect x="8.77" y="7.03" width="6.47" height="9.93" strokeDasharray="2.4 2.1" />
    </Svg>
  )
}

export function IconOrientation(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.8" y="7.2" width="9" height="12" rx="0.96" />
      <rect x="9" y="11.4" width="10.8" height="7.8" rx="0.96" fill="var(--surface, #fff)" />
      <path d="M 15.6 5.04 a 6 6 0 0 1 3.6 3.12 M 19.2 5.4 v 3 h -3" />
    </Svg>
  )
}

/* landscape slide with a diagonal resize arrow — PowerPoint's Slide Size glyph */
export function IconPageSize(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.1" y="6.25" width="15.8" height="11.5" rx="0.92" />
      <path d="M 8.8 8.8 L 15.2 15.2 M 11.4 8.8 h -2.6 v 2.6 M 12.6 15.2 h 2.6 v -2.6" />
    </Svg>
  )
}

/* stacked slides with a check on the front one — applied across the deck */
export function IconApplyAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9.1" y="5.25" width="10.2" height="7" rx="0.92" />
      <rect x="4.7" y="9.15" width="12.2" height="9.6" rx="0.92" fill="var(--surface, #fff)" />
      <path d="M 8 14.15 l 2.3 2.3 l 4.6 -4.6" />
    </Svg>
  )
}

export function IconColumns(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.47 5.15 h 6.16 M 4.47 8.58 h 6.16 M 4.47 12 h 6.16 M 4.47 15.42 h 6.16 M 4.47 18.85 h 6.16" />
      <path d="M 13.37 5.15 h 6.16 M 13.37 8.58 h 6.16 M 13.37 12 h 6.16 M 13.37 15.42 h 6.16 M 13.37 18.85 h 6.16" />
    </Svg>
  )
}

/* ---------- References ---------- */

export function IconToc(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M8.25 7.5 h7.5 M10.05 10.95 h5.7 M10.05 14.4 h5.7 M8.25 17.85 h7.5" />
    </Svg>
  )
}

export function IconRefresh(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 19.02 9.98 a 7.29 7.29 0 0 0 -13.5 -1.62 M 4.98 14.03 a 7.29 7.29 0 0 0 13.5 1.62" />
      <path d="M 19.43 4.57 v 4.05 h -4.05 M 4.57 19.43 v -4.05 h 4.05" />
    </Svg>
  )
}

export function IconFootnote(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.25} y={18} s={13.5}>
        AB
      </TextGlyph>
      <TextGlyph x={17.25} y={12} s={10.5} bold>
        1
      </TextGlyph>
    </Svg>
  )
}

export function IconEndnote(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.25} y={18} s={13.5}>
        AB
      </TextGlyph>
      <TextGlyph x={16.95} y={12} s={10.5} bold>
        n
      </TextGlyph>
    </Svg>
  )
}

export function IconCitation(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={3} y={18.75} s={21} bold>
        “”
      </TextGlyph>
    </Svg>
  )
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 6.13 C 10.43 4.95 7.82 4.43 4.82 4.69 v 13.57 c 3 -0.26 5.61 0.26 7.18 1.44 1.57 -1.17 4.18 -1.7 7.18 -1.44 V 4.69 c -3 -0.26 -5.61 0.26 -7.18 1.44 z" />
      <path d="M 12 6.13 v 13.57" />
    </Svg>
  )
}

export function IconCaption(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 7.64 h 10.58 L 19.47 12 l -4.36 4.36 H 4.53 z" />
      <circle cx="8.27" cy="12" r="1.12" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconIndex(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.7} y={9.75} s={9.75}>
        A
      </TextGlyph>
      <TextGlyph x={2.7} y={20.25} s={9.75}>
        B
      </TextGlyph>
      <path d="M12 6.75 h9 M12 12 h9 M12 17.25 h9" />
    </Svg>
  )
}

/* ---------- Review ---------- */

export function IconWordCount(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.4} y={12} s={12}>
        123
      </TextGlyph>
      <path d="M3 16.5 h18 M3 20.25 h12" />
    </Svg>
  )
}

export function IconSpellcheck(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={2.1} y={12.75} s={11.25}>
        abc
      </TextGlyph>
      <path d="M9 17.25 12.75 20.25 19.5 11.25" />
    </Svg>
  )
}

export function IconSparkle(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M 12 4.55 C 12 8.67 15.33 12 19.45 12 C 15.33 12 12 15.33 12 19.45 C 12 15.33 8.67 12 4.55 12 C 8.67 12 12 8.67 12 4.55 Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

/** Remove Background: dashed marching-ants selection around a landscape photo
 * (sun + mountains), an AI sparkle in the top-right notch. */
export function IconRemoveBg(props: IconProps) {
  return (
    <Svg {...props}>
      {/* dashed selection frame, top-right corner open for the sparkle */}
      <path
        d="M 15.3 5.6 H 6.8 a 2.4 2.4 0 0 0 -2.4 2.4 v 8.6 a 2.4 2.4 0 0 0 2.4 2.4 h 10.4 a 2.4 2.4 0 0 0 2.4 -2.4 V 9.8"
        strokeDasharray="2.7 2.05"
      />
      {/* photo subject: sun + mountains */}
      <circle cx={9.4} cy={9.8} r={1.5} />
      <path d="M 6.3 16.4 l 3.1 -3.5 2.5 2.7 1.9 -2.1 3.4 2.9" />
      {/* sparkle */}
      <path
        d="M 18.9 3.4 l 0.78 2.12 2.12 0.78 -2.12 0.78 -0.78 2.12 -0.78 -2.12 -2.12 -0.78 2.12 -0.78 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconWand(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.4 18.6 14.4 9.6" />
      <path
        d="M 16.56 4.2 l 0.84 2.28 2.28 0.84 -2.28 0.84 -0.84 2.28 -0.84 -2.28 -2.28 -0.84 2.28 -0.84 z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M 18.6 12.6 l 0.48 1.32 1.32 0.48 -1.32 0.48 -0.48 1.32 -0.48 -1.32 -1.32 -0.48 1.32 -0.48 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconTranslate(props: IconProps) {
  return (
    <Svg {...props}>
      <TextGlyph x={1.8} y={13.5} s={12.75}>
        文
      </TextGlyph>
      <path d="M13.2 20.25 17.25 9.75 21.3 20.25 M14.55 16.95 h5.4" />
    </Svg>
  )
}

export function IconTrackChanges(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M8.25 8.25 h7.5 M8.25 12 h4.5" />
      <path d="M12.75 19.8 20.4 12.15 l1.8 1.8 -7.65 7.65 -2.7 0.9 z" fill="var(--surface, #fff)" />
    </Svg>
  )
}

export function IconAccept(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.75 12.75 9 18 l11.25 -12" />
    </Svg>
  )
}

export function IconReject(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.75 3.75 20.25 20.25 M20.25 3.75 l-16.5 16.5" />
    </Svg>
  )
}

export function IconCompare(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="6.23" width="6.35" height="11.55" rx="0.92" />
      <rect x="13.16" y="6.23" width="6.35" height="11.55" rx="0.92" />
      <path d="M 9.69 12 h 4.62 M 12.69 10.38 14.31 12 l -1.62 1.62" />
    </Svg>
  )
}

export function IconLock(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.4" y="10.76" width="11.21" height="9.34" rx="1.24" />
      <path d="M 8.89 10.76 V 8.27 a 3.11 3.11 0 0 1 6.23 0 v 2.49" />
      <circle cx="12" cy="15.11" r="1.24" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/* ---------- View ---------- */

function Magnifier({ children }: { children?: ReactNode }) {
  return (
    <>
      <circle cx="10.5" cy="10.5" r="7.2" />
      <path d="M15.9 15.9 21 21" />
      {children}
    </>
  )
}

export function IconZoomOut(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <path d="M7.2 10.5 h6.6" />
      </Magnifier>
    </Svg>
  )
}

export function IconZoomIn(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <path d="M7.2 10.5 h6.6 M10.5 7.2 v6.6" />
      </Magnifier>
    </Svg>
  )
}

export function IconZoom100(props: IconProps) {
  return (
    <Svg {...props}>
      <Magnifier>
        <TextGlyph x={5.7} y={13.5} s={7.5} bold>
          1:1
        </TextGlyph>
      </Magnifier>
    </Svg>
  )
}

export function IconPageWidth(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="4.53" width="14.94" height="14.94" rx="1" />
      <path d="M 7.02 12 h 9.96 M 9.26 9.76 7.02 12 l 2.24 2.24 M 14.74 9.76 16.98 12 l -2.24 2.24" />
    </Svg>
  )
}

/** View tab fit-to-window, mirroring Fluent's zoom-fit: a small content rect
 *  framed by four edge chevrons. Deliberately arrow-free — inward/outward
 *  arrows read as fullscreen, and the original page-with-plus as "new page". */
export function IconFitWindow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" />
      <path d="M5.2 9.3 3.4 12l1.8 2.7" />
      <path d="M18.8 9.3 20.6 12l-1.8 2.7" />
      <path d="M9.3 5.2 12 3.4l2.7 1.8" />
      <path d="M9.3 18.8 12 20.6l2.7-1.8" />
    </Svg>
  )
}

export function IconAiPanel(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="12.71" rx="0.92" />
      <path d="M 14.08 5.65 v 12.71" />
      <path
        d="M 15.47 9.92 l 0.58 1.5 1.5 0.58 -1.5 0.58 -0.58 1.5 -0.58 -1.5 -1.5 -0.58 1.5 -0.58 z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  )
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 18.79 14.35 A 7.57 7.57 0 0 1 9.65 5.21 a 7.57 7.57 0 1 0 9.14 9.14 z" />
    </Svg>
  )
}

export function IconReadMode(props: IconProps) {
  return <IconBook {...props} />
}

export function IconOutlineView(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5.48" cy="6.13" r="1.31" fill="currentColor" stroke="none" />
      <path d="M 8.74 6.13 h 10.44" />
      <circle cx="8.74" cy="12" r="1.31" fill="currentColor" stroke="none" />
      <path d="M 12 12 h 7.18" />
      <circle cx="8.74" cy="17.87" r="1.31" fill="currentColor" stroke="none" />
      <path d="M 12 17.87 h 7.18" />
    </Svg>
  )
}

export function IconRuler(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="9.11" width="15.02" height="5.78" rx="0.92" />
      <path d="M 7.96 9.11 v 2.31 M 10.85 9.11 v 3.47 M 13.73 9.11 v 2.31 M 16.62 9.11 v 3.47" />
    </Svg>
  )
}

export function IconNavPane(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="12.71" rx="0.92" />
      <path d="M 9.69 5.65 v 12.71" />
      <path d="M 5.99 8.54 h 2.31 M 5.99 11.42 h 2.31 M 5.99 14.31 h 2.31" />
    </Svg>
  )
}

export function IconSplit(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="4.53" width="14.94" height="14.94" rx="1" />
      <path d="M 4.53 12 h 14.94" />
    </Svg>
  )
}

export function IconPrintLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.8" y="4.49" width="10.4" height="15.02" rx="0.92" />
      <path d="M 9.11 7.96 h 5.78 M 9.11 10.85 h 5.78 M 9.11 13.73 h 5.78 M 9.11 16.62 h 3.47" />
    </Svg>
  )
}

export function IconWebLayout(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="12.71" rx="0.92" />
      <path d="M 4.49 8.54 h 15.02" />
      <path d="M 6.8 11.42 h 10.4 M 6.8 13.73 h 10.4 M 6.8 16.04 h 6.93" />
    </Svg>
  )
}

export function IconGridlines(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="4.53" width="14.94" height="14.94" rx="1" />
      <path d="M 4.53 9.51 h 14.94 M 4.53 14.49 h 14.94 M 9.51 4.53 v 14.94 M 14.49 4.53 v 14.94" />
    </Svg>
  )
}

export function IconNewWindow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="7.96" width="11.55" height="11.55" rx="0.92" />
      <path d="M 7.96 7.96 v -2.31 a 1.16 1.16 0 0 1 1.16 -1.15 h 9.24 a 1.16 1.16 0 0 1 1.16 1.16 v 9.24 a 1.16 1.16 0 0 1 -1.15 1.16 h -2.31" />
      <path d="M 10.27 13.73 h 4.62 M 12.58 11.42 v 4.62" />
    </Svg>
  )
}

export function IconArrangeAll(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.07" width="15.02" height="6.01" rx="0.92" />
      <rect x="4.49" y="12.92" width="15.02" height="6.01" rx="0.92" />
    </Svg>
  )
}

export function IconSwitchWindows(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="9.11" width="10.4" height="9.24" rx="0.92" />
      <path d="M 8.54 9.11 v -2.31 a 1.16 1.16 0 0 1 1.16 -1.15 h 8.66 a 1.16 1.16 0 0 1 1.16 1.16 v 8.09 a 1.16 1.16 0 0 1 -1.15 1.16 h -3.46" />
    </Svg>
  )
}

export function IconPosition(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="4.49" width="15.02" height="15.02" rx="1.16" />
      <rect x="8.54" y="8.54" width="6.93" height="6.93" />
    </Svg>
  )
}

export function IconWrapText(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="8.54" width="6.93" height="6.93" />
      <path d="M 13.73 5.07 h 5.78 M 13.73 8.54 h 5.78 M 13.73 12 h 5.78 M 13.73 15.47 h 5.78 M 4.49 18.93 h 15.02 M 4.49 5.07 h 6.93" />
    </Svg>
  )
}

export function IconDoc(props: IconProps) {
  return (
    <Svg {...props}>
      {PAGE}
      <path d="M15 2.25 V6 h3.75" />
      <path d="M8.25 9.75 h7.5 M8.25 13.5 h7.5 M8.25 17.25 h5.25" />
    </Svg>
  )
}

/* ---------- AI panel ---------- */

export function IconSend(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.52 12 19.48 5.03 15.87 18.97 11.48 14.06 z" />
      <path d="M 11.48 14.06 19.48 5.03" />
    </Svg>
  )
}

export function IconStop(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2.625" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="2.67" />
      <path d="M 12 4.47 v 2.43 M 12 17.1 v 2.43 M 19.53 12 h -2.43 M 6.9 12 h -2.43 M 17.35 6.65 l -1.7 1.7 M 8.36 15.65 l -1.7 1.7 M 17.35 17.35 15.65 15.65 M 8.36 8.36 6.65 6.65" />
    </Svg>
  )
}

/** collapse the right sidebar: panel outline + arrow pushing into it */
/** Collapse glyph for RIGHT-docked panes (Format/Animation/Comments) — exact mirror of
 *  IconSidebarCollapseLeft so both sides share the Sheets-parity look (16-canvas,
 *  1.2/1.3 stroke), self-contained for the same pinned-stroke reason. */
export function IconSidebarCollapse({ size = 24 }: IconProps) {
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
      <path d="M10.5 2.5v11" />
      <path d="M3.5 8h4.4M6.2 5.9 8.3 8l-2.1 2.1" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

/** Mirror of IconSidebarCollapse for the LEFT-docked AI panel.
 *  Sheets-parity glyph (16-canvas, 1.2/1.3 stroke), self-contained so the shared
 *  Svg wrapper's 24-canvas pinned stroke doesn't alter its weight. */
export function IconSidebarCollapseLeft({ size = 24 }: IconProps) {
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
      <circle cx="12" cy="12" r="7.47" />
      <path d="M 12 8.02 V 12 l 2.86 1.99" />
    </Svg>
  )
}

export function IconPaperclip(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 18.75 10.92 12.27 17.4 a 4.59 4.59 0 0 1 -6.48 -6.48 l 6.75 -6.75 a 3.11 3.11 0 0 1 4.32 4.32 l -6.75 6.75 a 1.49 1.49 0 0 1 -2.16 -2.16 l 6.21 -6.21" />
    </Svg>
  )
}

export function IconNewChat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 19.01 10.98 v -3.82 A 2.17 2.17 0 0 0 16.85 4.99 H 7.15 a 2.17 2.17 0 0 0 -2.17 2.17 v 7.78 a 2.17 2.17 0 0 0 2.17 2.17 h 1.4 v 2.55 l 3.32 -2.55 h 1.66" />
      <path d="M 17.36 13.79 v 5.1 M 14.81 16.34 h 5.1" />
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
      <path d="M 5.97 4.52 18.03 12.8 l -5.12 1.21 L 10.49 19.43 5.97 4.52 Z" />
    </Svg>
  )
}

export function IconPen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m 3.78 20.22 1.17 -4.41 L 14.94 5.83 a 2.06 2.06 0 0 1 2.94 0 l 0.29 0.29 a 2.06 2.06 0 0 1 0 2.94 L 8.18 19.05 3.78 20.22 Z" />
      <path d="M 13.47 7.3 16.7 10.53" />
    </Svg>
  )
}

export function IconHighlighterPen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 8.85 13.89 15.53 7.21 a 1.64 1.64 0 0 1 2.39 0 l -1.13 -1.13 1.13 1.13 a 1.64 1.64 0 0 1 0 2.39 L 11.24 16.28 l -3.28 0.88 0.88 -3.28 Z" />
      <rect
        x="5.7"
        y="18.05"
        width="12.6"
        height="3.02"
        rx="1.51"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />
    </Svg>
  )
}

export function IconEraser(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12.495 5.29 6.765 6.765 a1.98 1.98 0 0 1 0 2.805 L14.64 19.48 H10.02 L4.74 14.2 a1.98 1.98 0 0 1 0 -2.805 l4.95 -4.95 a1.98 1.98 0 0 1 2.805 0 Z" />
      <path d="M7.875 8.92 15.63 16.675" />
      <path d="M10.02 19.48 h10.56" />
    </Svg>
  )
}

export function IconTextBox(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="12.71" rx="1.16" />
      <path d="M 8.54 9.11 h 6.93 M 12 9.11 v 6.35" />
    </Svg>
  )
}

/** New slide (MS-style): slide frame with a title band and a split content area */
export function IconNewSlide(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="6.4" width="14.94" height="11.21" rx="0.62" />
      <path d="M 4.53 10.13 h 14.94" />
      <path d="M 13.25 10.13 V 17.6" />
    </Svg>
  )
}

/** Section: divider + disclosure triangle, slide thumbnails grouped beneath */
export function IconSection(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 5.78 h 14.94" />
      <path d="M 4.78 8.89 l 3.24 2.37 -3.24 2.37 z" fill="currentColor" stroke="none" />
      <rect x="10.13" y="8.89" width="9.34" height="4.36" rx="0.62" />
      <rect x="10.13" y="15.11" width="9.34" height="4.36" rx="0.62" />
    </Svg>
  )
}

export function IconRect(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="6.8" width="15.02" height="10.4" />
    </Svg>
  )
}

export function IconRoundRect(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="6.8" width="15.02" height="10.4" rx="2.89" />
    </Svg>
  )
}

export function IconEllipse(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse cx="12" cy="12" rx="7.51" ry="5.2" />
    </Svg>
  )
}

/** Slide show: from beginning (slide open at the bottom-right, its bottom edge
 * running out as an arrow into a play triangle — loop back to slide 1 and play) */
export function IconPlayFromStart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19.51 11.3 V6.57 a0.92 0.92 0 0 0 -0.92 -0.92 H5.41 a0.92 0.92 0 0 0 -0.92 0.92 v8.56 a0.92 0.92 0 0 0 0.92 0.92 h8.25" />
      <path d="M10.85 14.2 l1.89 1.85 -1.89 1.85" />
      <path d="M15.3 12.7 L20.9 16.05 L15.3 19.4 Z" />
    </Svg>
  )
}

/** Slide show: from current slide (screen + play triangle) */
export function IconPlayCurrent(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="10.4" rx="0.92" />
      <path d="M 10.27 8.3 v 5.08 l 4.39 -2.54 z" fill="currentColor" stroke="none" />
      <path d="M 12 16.04 v 2.31 M 9.11 18.35 h 5.78" />
    </Svg>
  )
}

/** Status-bar play: solid triangle in a rounded square. The frame is nearly
 *  the full viewBox — the monitor-and-stand ribbon glyph reads too small at
 *  status-bar sizes */
export function IconPlayBoxed(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2" />
      <path d="M 9.9 8.3 v 7.4 l 6.2 -3.7 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** Status-bar notes toggle: a note page with text lines (near-full viewBox,
 *  same rationale as IconPlayBoxed at status-bar sizes) */
export function IconNotes(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="2" />
      <path d="M8 9.3h8M8 12.3h8M8 15.3h5" />
    </Svg>
  )
}

/** Presenter view: main screen + small presenter screen */
export function IconPresenterView(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="10.4" height="8.09" rx="0.92" />
      <rect x="12.58" y="11.42" width="6.93" height="5.78" rx="0.92" fill="var(--surface, #fff)" />
      <circle cx="16.04" cy="13.4" r="1.15" fill="currentColor" stroke="none" />
      <path d="M 13.84 16.35 a 2.2 1.45 0 0 1 4.4 0 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** Custom show: screen + gear dots */
export function IconCustomShow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="10.4" rx="0.92" />
      <path d="M 7.96 9.11 h 8.09 M 7.96 12 h 4.62" />
      <path d="M 12 16.04 v 2.31 M 9.11 18.35 h 5.78" />
    </Svg>
  )
}

/** Set up slide show: screen + wrench slash */
export function IconSetupShow(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="10.4" rx="0.92" />
      <path d="M 8.54 13.73 13.73 8.54 M 13.16 8.54 h 1.73 v 1.73" />
      <path d="M 12 16.04 v 2.31 M 9.11 18.35 h 5.78" />
    </Svg>
  )
}

/** Hide slide: slide + slash */
export function IconHideSlide(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5.65" y="6.8" width="12.71" height="10.4" rx="0.92" />
      <path d="M 4.49 19.51 19.51 4.49" />
    </Svg>
  )
}

/** Rehearse timings: stopwatch */
export function IconRehearse(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13.25" r="6.23" />
      <path d="M 12 10.13 V 13.25 l 2.24 1.74" />
      <path d="M 10.13 4.53 h 3.74 M 12 4.53 v 2.24" />
    </Svg>
  )
}

/** Record slide show: recording dot */
export function IconRecord(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.48" />
      <circle cx="12" cy="12" r="3.1" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** Chart: bar chart */
export function IconChart(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.53 4.53 v 14.94 h 14.94" />
      <rect x="7.64" y="12" width="2.74" height="4.98" fill="currentColor" stroke="none" />
      <rect x="12" y="8.27" width="2.74" height="8.72" fill="currentColor" stroke="none" />
      <rect x="16.36" y="10.13" width="2.74" height="6.85" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** SmartArt: connected nodes */
export function IconSmartArt(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9.11" y="4.49" width="5.78" height="4.16" rx="0.92" />
      <rect x="4.49" y="14.89" width="5.78" height="4.16" rx="0.92" />
      <rect x="13.73" y="14.89" width="5.78" height="4.16" rx="0.92" />
      <path d="M 12 8.65 v 2.77 M 12 11.42 L 7.38 14.89 M 12 11.42 l 4.62 3.47" />
    </Svg>
  )
}

/** WordArt: outlined block-letter A (matches docs IconWordArt, scaled 16→24 canvas) */
export function IconWordArt(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 4.5 L 5.25 19.5 h 3.45 l 1.5 -3.75 h 3.6 l 1.5 3.75 h 3.45 L 12 4.5 Z" />
      <path d="M 8.4 13.8 h 7.2" />
    </Svg>
  )
}

/** Icon gallery: smiley */
export function IconIconLib(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.47" />
      <circle cx="9.26" cy="10.13" r="0.87" fill="currentColor" stroke="none" />
      <circle cx="14.74" cy="10.13" r="0.87" fill="currentColor" stroke="none" />
      <path d="M 8.64 13.99 a 4.23 4.23 0 0 0 6.72 0" />
    </Svg>
  )
}

/** Video: film play */
export function IconVideo(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="6.8" width="15.02" height="10.4" rx="1.62" />
      <path d="M 10.5 9.69 l 3.93 2.31 -3.93 2.31 z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** Audio: speaker */
export function IconAudio(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.15 9.76 h 2.99 L 12.62 5.78 v 12.45 L 8.14 14.24 H 5.15 z" />
      <path d="M 15.49 9.01 a 4.23 4.23 0 0 1 0 5.98 M 17.98 6.77 a 7.47 7.47 0 0 1 0 10.46" />
    </Svg>
  )
}

/** Screen recording: screen + record dot */
export function IconScreenRec(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.49" y="5.65" width="15.02" height="10.4" rx="1.39" />
      <path d="M 9.11 18.93 h 5.78" />
      <circle cx="12" cy="10.85" r="2.31" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/** 3D model: cube */
export function Icon3d(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 4.47 l 6.68 3.77 v 7.53 L 12 19.53 l -6.68 -3.77 V 8.23 z" />
      <path d="M 12 12 l 6.68 -3.77 M 12 12 L 5.32 8.23 M 12 12 v 7.53" />
    </Svg>
  )
}

/** Zoom link: jump arrow + page */
export function IconZoomJump(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.53" y="4.53" width="9.96" height="7.47" rx="1" />
      <rect x="9.51" y="12" width="9.96" height="7.47" rx="1" />
      <path d="M 14.49 8.27 l 3.74 0 M 18.22 8.27 l -1.74 -1.74 M 18.22 8.27 l -1.74 1.74" />
    </Svg>
  )
}

/** Date-time: calendar + hour hand */
export function IconDateTime(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.93" y="6.3" width="10.83" height="10.83" rx="1.37" />
      <path d="M 4.93 9.72 h 10.83 M 8.01 4.93 V 7.44 M 13.14 4.93 V 7.44" />
      <circle cx="16.56" cy="15.99" r="3.42" fill="var(--surface, #fff)" />
      <path d="M 16.56 14.28 v 1.71 l 1.25 1.03" />
    </Svg>
  )
}

/** Object align/distribute (distinct from paragraph text alignment IconAlign*): color blocks + alignment baseline */
export function IconObjAlignLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.65 4.49 v 15.02" />
      <rect x="7.96" y="6.23" width="10.4" height="4.16" rx="0.69" />
      <rect x="7.96" y="13.62" width="6.35" height="4.16" rx="0.69" />
    </Svg>
  )
}

export function IconObjAlignCenterH(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 4.49 v 15.02" />
      <rect x="6.23" y="6.23" width="11.55" height="4.16" rx="0.69" />
      <rect x="8.77" y="13.62" width="6.47" height="4.16" rx="0.69" />
    </Svg>
  )
}

export function IconObjAlignRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 18.35 4.49 v 15.02" />
      <rect x="5.65" y="6.23" width="10.4" height="4.16" rx="0.69" />
      <rect x="9.69" y="13.62" width="6.35" height="4.16" rx="0.69" />
    </Svg>
  )
}

export function IconObjAlignTop(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.49 5.65 h 15.02" />
      <rect x="6.23" y="7.96" width="4.16" height="10.4" rx="0.69" />
      <rect x="13.62" y="7.96" width="4.16" height="6.35" rx="0.69" />
    </Svg>
  )
}

export function IconObjAlignMiddle(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.23" y="6.23" width="4.16" height="11.55" rx="0.69" />
      <rect x="13.62" y="8.77" width="4.16" height="6.47" rx="0.69" />
      <path d="M 4.49 12 H 6.23 M 10.38 12 h 3.23 M 17.77 12 h 1.73" />
    </Svg>
  )
}

export function IconObjAlignBottom(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.49 18.35 h 15.02" />
      <rect x="6.23" y="5.65" width="4.16" height="10.4" rx="0.69" />
      <rect x="13.62" y="9.69" width="4.16" height="6.35" rx="0.69" />
    </Svg>
  )
}

export function IconObjDistributeH(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.65 4.49 v 15.02 M 18.35 4.49 v 15.02" />
      <rect x="9.92" y="6.4" width="4.16" height="11.21" rx="0.69" />
    </Svg>
  )
}

export function IconObjDistributeV(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.49 5.65 h 15.02 M 4.49 18.35 h 15.02" />
      <rect x="6.4" y="9.92" width="11.21" height="4.16" rx="0.69" />
    </Svg>
  )
}

export function IconObjFlipH(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 12 4.49 v 15.02" strokeDasharray="2.4 2.1" />
      <path d="M 9.1 6.9 v 10.2 h -4.4 z M 14.9 6.9 v 10.2 h 4.4 z" />
    </Svg>
  )
}

export function IconObjFlipV(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 4.49 12 h 15.02" strokeDasharray="2.4 2.1" />
      <path d="M 6.9 9.1 h 10.2 v -4.4 z M 6.9 14.9 h 10.2 v 4.4 z" />
    </Svg>
  )
}

export function IconSwitchRowCol(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 6.27 9.88 A 6.47 6.47 0 0 1 17.1 7.64" />
      <path d="M 17.73 4.53 v 3.36 H 14.37" />
      <path d="M 17.73 14.12 A 6.47 6.47 0 0 1 6.9 16.36" />
      <path d="M 6.27 19.47 v -3.36 h 3.36" />
    </Svg>
  )
}

export function IconEditChartData(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5.3" y="5.3" width="10.15" height="10.15" rx="0.86" />
      <path d="M 5.3 8.65 h 10.15 M 8.65 5.3 v 10.15" />
      <path d="M 17.62 13.19 l 1.84 1.84 -4.64 4.64 -2.48 0.65 0.65 -2.48 z" />
    </Svg>
  )
}

export function IconChangeChartType(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 6.79 8.8 A 5.81 5.81 0 0 1 16.74 6.9" />
      <path d="M 17.45 4.3 v 3.08 H 14.37" />
      <rect x="5.6" y="13.9" width="2.96" height="5.45" fill="currentColor" stroke="none" />
      <rect x="10.34" y="11.29" width="2.96" height="8.06" fill="currentColor" stroke="none" />
      <rect x="15.08" y="12.59" width="2.96" height="6.75" fill="currentColor" stroke="none" />
    </Svg>
  )
}

// ── Animation effect icons (Animations tab; color comes from .rb-anim-* via currentColor) ──

const ANIM_EFFECT_BODIES: Record<AnimEffectKind, ReactNode> = {
  // entrance
  appear: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" strokeDasharray="3 2.2" />
      <rect x="8.2" y="9.2" width="7.6" height="5.6" fill="currentColor" stroke="none" />
    </>
  ),
  fade: (
    <>
      <rect
        x="4.5"
        y="6.5"
        width="4.6"
        height="11"
        fill="currentColor"
        stroke="none"
        opacity="0.2"
      />
      <rect
        x="9.7"
        y="6.5"
        width="4.6"
        height="11"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />
      <rect x="14.9" y="6.5" width="4.6" height="11" fill="currentColor" stroke="none" />
    </>
  ),
  flyIn: (
    <>
      <rect x="5.5" y="3.5" width="13" height="8" rx="1" />
      <path d="M12 21 V14.5 M8.8 17.4 L12 14.2 l3.2 3.2" />
    </>
  ),
  wipe: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1" />
      <rect x="3.5" y="6" width="8.2" height="12" fill="currentColor" stroke="none" />
      <path d="M13.3 12 h4.8 M15.9 9.8 l2.2 2.2 -2.2 2.2" />
    </>
  ),
  wipeDown: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <rect x="3.5" y="4.5" width="17" height="6.4" fill="currentColor" stroke="none" />
      <path d="M12 12.6 V17.3 M9.9 15.3 L12 17.4 l2.1 -2.1" />
    </>
  ),
  splitIn: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1" />
      <path d="M5.8 12 h4.4 M8.3 9.9 l2.1 2.1 -2.1 2.1 M18.2 12 h-4.4 M15.7 9.9 l-2.1 2.1 2.1 2.1" />
    </>
  ),
  bounce: (
    <>
      <path d="M3.5 19.5 C6 7.5, 8.5 7.5, 11 19.5 C12.8 13, 14.6 13, 16.4 19.5" />
      <circle cx="19.3" cy="17.8" r="1.9" fill="currentColor" stroke="none" />
    </>
  ),
  flipIn: (
    <>
      <rect x="4" y="6" width="7" height="12" />
      <path d="M13.5 4.2 L20 6.4 V17.6 L13.5 19.8 Z" />
    </>
  ),
  zoom: (
    <>
      <rect x="9.2" y="9.2" width="5.6" height="5.6" fill="currentColor" stroke="none" />
      <path d="M8 8 L4.5 4.5 M4.5 8 V4.5 H8" />
      <path d="M16 16 L19.5 19.5 M19.5 16 V19.5 H16" />
    </>
  ),
  // emphasis
  pulse: (
    <>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="5.6" opacity="0.65" />
      <circle cx="12" cy="12" r="9" opacity="0.35" />
    </>
  ),
  spin: (
    <>
      <path d="M12 5.4 A 6.6 6.6 0 1 1 5.4 12" />
      <path d="M3.3 13.9 L5.4 11.5 7.7 13.8" />
    </>
  ),
  grow: (
    <>
      <rect x="7.5" y="7.5" width="9" height="9" />
      <path d="M4.5 19.5 L19.5 4.5 M4.5 15.2 V19.5 H8.8 M19.5 8.8 V4.5 H15.2" />
    </>
  ),
  teeter: (
    <>
      <rect x="5" y="9.5" width="14" height="9" rx="1" transform="rotate(-8 12 14)" />
      <path d="M6 6.6 A 7.5 4.5 0 0 1 18 6.6" />
      <path d="M5.2 4.2 L6 6.8 8.6 6.1 M18.8 4.2 L18 6.8 15.4 6.1" />
    </>
  ),
  // exit
  disappear: <rect x="4" y="5" width="16" height="14" rx="1.5" strokeDasharray="3 2.2" />,
  fadeOut: (
    <>
      <rect x="4.5" y="6.5" width="4.6" height="11" fill="currentColor" stroke="none" />
      <rect
        x="9.7"
        y="6.5"
        width="4.6"
        height="11"
        fill="currentColor"
        stroke="none"
        opacity="0.5"
      />
      <rect
        x="14.9"
        y="6.5"
        width="4.6"
        height="11"
        fill="currentColor"
        stroke="none"
        opacity="0.2"
      />
    </>
  ),
  flyOut: (
    <>
      <rect x="5.5" y="3.5" width="13" height="8" rx="1" />
      <path d="M12 14.2 V20.7 M8.8 17.5 L12 20.7 l3.2 -3.2" />
    </>
  ),
  wipeOut: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="1" />
      <rect x="12.3" y="6" width="8.2" height="12" fill="currentColor" stroke="none" />
      <path d="M10.7 12 H5.9 M8.1 9.8 L5.9 12 l2.2 2.2" />
    </>
  ),
  shrink: (
    <>
      <rect
        x="9.6"
        y="9.6"
        width="4.8"
        height="4.8"
        fill="currentColor"
        stroke="none"
        transform="rotate(15 12 12)"
      />
      <path d="M4.5 4.5 L8.3 8.3 M8.3 5.1 V8.3 H5.1" />
      <path d="M19.5 19.5 L15.7 15.7 M15.7 18.9 V15.7 H18.9" />
    </>
  ),
  zoomOut: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" strokeDasharray="2.6 2" />
      <path d="M5.6 5.6 L9.4 9.4 M9.4 6.2 V9.4 H6.2" />
      <path d="M18.4 18.4 L14.6 14.6 M14.6 17.8 V14.6 H17.8" />
    </>
  ),
  motionPath: (
    <>
      <path d="M4.5 6 C10 3, 14 9, 18.6 15.8" strokeDasharray="3 2.2" />
      <path d="M18.9 10.9 l0.5 5.4 -5.4 -0.6" />
    </>
  ),
}

export function AnimEffectIcon({ kind, size }: { kind: AnimEffectKind; size?: number }) {
  return <Svg size={size}>{ANIM_EFFECT_BODIES[kind]}</Svg>
}

/* ---------- transition gallery (drawn to the shared icon standard, replacing
   the old unicode text glyphs whose size and weight came from the font) ---- */

export function IconTransNone(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="6" width="14.5" height="12" rx="1.5" />
      <path d="M6.5 16.5 17.5 7.5" />
    </Svg>
  )
}

export function IconTransMorph(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.75 9h11.5M13.5 6.25 16.25 9l-2.75 2.75" />
      <path d="M19.25 15H7.75M10.5 17.75 7.75 15l2.75-2.75" />
    </Svg>
  )
}

export function IconTransFade(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="4.75" width="11" height="9.5" rx="1.4" strokeDasharray="2.4 2.2" />
      <rect x="8.25" y="9.75" width="11" height="9.5" rx="1.4" />
    </Svg>
  )
}

export function IconTransPush(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="6" width="14.5" height="12" rx="1.5" />
      <path d="M12 15.5v-6M9.25 12.25 12 9.5l2.75 2.75" />
    </Svg>
  )
}

export function IconTransWipe(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="6" width="14.5" height="12" rx="1.5" />
      <path d="M7.5 12h6M11.25 9.75 13.5 12l-2.25 2.25" />
    </Svg>
  )
}

export function IconTransSplit(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="6" width="14.5" height="12" rx="1.5" />
      <path d="M12 8.5v7" />
      <path d="M9.5 12H7M8.25 10.75 7 12l1.25 1.25M14.5 12H17M15.75 10.75 17 12l-1.25 1.25" />
    </Svg>
  )
}

export function IconTransCircle(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.25" />
      <circle cx="12" cy="12" r="3.25" />
    </Svg>
  )
}

export function IconTransCover(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.5 8.25V6.25a1.5 1.5 0 0 0-1.5-1.5H6.25a1.5 1.5 0 0 0-1.5 1.5V13a1.5 1.5 0 0 0 1.5 1.5h2" />
      <rect x="9.75" y="9.75" width="9.5" height="9.5" rx="1.5" />
    </Svg>
  )
}

export function IconTransPull(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="4.75" width="9.5" height="9.5" rx="1.5" />
      <path d="M9.5 15.75v2a1.5 1.5 0 0 0 1.5 1.5h6.75a1.5 1.5 0 0 0 1.5-1.5V11a1.5 1.5 0 0 0-1.5-1.5h-2" />
    </Svg>
  )
}

export function IconTransDissolve(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.75" y="6" width="14.5" height="12" rx="1.5" />
      <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13.75" cy="9.25" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.75" cy="13.25" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="8.25" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.75" r="0.8" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function IconTransZoom(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4.75h5.25V10M19 5 13.75 10.25" />
      <path d="M10 19.25H4.75V14M5 19 10.25 13.75" />
    </Svg>
  )
}

export function IconTransRandom(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="5" width="14" height="14" rx="2.5" />
      <circle cx="9.25" cy="9.25" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.75" cy="9.25" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.25" cy="14.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.75" cy="14.75" r="1" fill="currentColor" stroke="none" />
    </Svg>
  )
}

/* ---------- animation gallery chrome (star / none / motion paths) -------- */

export function IconAnimStar(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 4.5 2.15 4.9 5.35.5-4 3.6 1.15 5.25L12 16l-4.65 2.75 1.15-5.25-4-3.6 5.35-.5Z" />
    </Svg>
  )
}

export function IconAnimNone(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.25" />
      <path d="M6.9 17.1 17.1 6.9" />
    </Svg>
  )
}

export function IconPathRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.75 12H18M14.75 8.75 18 12l-3.25 3.25" />
    </Svg>
  )
}

export function IconPathDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.75V18M8.75 14.75 12 18l3.25-3.25" />
    </Svg>
  )
}

export function IconPathDiagonal(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5.5 5.5 18 18M18 13.4V18h-4.6" />
    </Svg>
  )
}

export function IconPathCircle(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="6.75" />
      <path d="M15.5 3.9 12.7 5.2l1.3 2.75" />
    </Svg>
  )
}

export function IconPathZigzag(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.75 15.5 8.75 9.5l3.75 5.5 4.25-6.25" />
      <path d="M17.5 12.9V8.25h-4.6" />
    </Svg>
  )
}

export function IconCrop(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4.75v11.25h11.25" />
      <path d="M4.75 8H16v11.25" />
    </Svg>
  )
}

export function IconNoneX(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Svg>
  )
}

/** AI feature glyphs shared by the ribbon Home tab and the canvas AI bar.
 * Fixed 1.5-unit stroke (not pinnedStroke) to keep the ribbon rendering,
 * where CSS sizes them; `size` is for other hosts. */
function AiFeatureSvg({ size, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Selection frame with a sparkle: annotate the selected element with an AI edit */
export function IconAiAskSelection(props: IconProps) {
  return (
    <AiFeatureSvg {...props}>
      <path d="M4 8.5V5.5A1.5 1.5 0 0 1 5.5 4h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3" />
      <path d="M12 8l.74 2.01c.24.65.36.98.6 1.22.24.24.57.36 1.22.6L16.5 12.5l-1.94.67c-.65.24-.98.36-1.22.6-.24.24-.36.57-.6 1.22L12 17l-.74-2.01c-.24-.65-.36-.98-.6-1.22-.24-.24-.57-.36-1.22-.6L7.5 12.5l1.94-.67c.65-.24.98-.36 1.22-.6.24-.24.36-.57.6-1.22L12 8z" />
    </AiFeatureSvg>
  )
}

export function IconAiBeautify(props: IconProps) {
  return (
    <AiFeatureSvg {...props}>
      <path d="M10.4948 15.0904C9.91037 14.5539 9.12711 14.5196 9.12711 14.5196C9.12711 14.5196 8.37299 14.4408 7.8691 14.7887C7.03613 15.3629 7.02071 16.5283 7.01385 16.7014C6.995 17.2293 7.03785 17.8652 6.71563 18.4239C6.24088 19.2466 5 19.5894 5 19.5894C5 19.5894 5.21081 19.8448 5.51246 19.9939C5.51246 19.9939 6.47226 20.5423 8.45012 20.0727C8.99 19.9442 9.58816 19.7796 10.0732 19.4763C10.6662 19.1061 11.105 18.5799 11.2232 18.3194C11.7374 17.2053 11.4752 15.9902 10.4948 15.0904Z" />
      <path d="M18.9872 4.57628C18.9772 4.39067 18.7726 4.29501 18.7726 4.29501C18.7726 4.29501 18.5538 4.25444 18.3736 4.34695C18.0654 4.50498 17.6181 4.70138 15.4274 7.19175C13.9033 8.92525 12.0146 11.2553 10.9207 12.5777C10.1021 13.5619 10.0281 14.2654 10.1806 14.6721C10.2108 14.7514 10.5825 15.0484 10.9207 15.2661C11.1663 15.4249 11.3406 15.5257 11.6199 15.5437C12.0717 15.5739 12.5127 15.2661 12.5127 15.2661C12.5127 15.2661 12.7483 15.0623 13.1086 14.587C13.8466 13.6144 15.1527 11.7581 16.2918 9.96583C17.7356 7.70256 18.8308 5.34067 18.8308 5.34067C18.8308 5.34067 19.0033 4.88149 18.9872 4.57628Z" />
      <path d="M7 4L7.22106 4.59745C7.51094 5.38087 7.65589 5.77259 7.94166 6.05833C8.22743 6.34409 8.61914 6.48903 9.40257 6.77893L10 7L9.40257 7.22107C8.61914 7.51097 8.22743 7.65592 7.94166 7.94167C7.65589 8.22741 7.51094 8.61913 7.22106 9.40255L7 10L6.77894 9.40255C6.48906 8.61913 6.34411 8.22741 6.05834 7.94167C5.77257 7.65592 5.38086 7.51097 4.59743 7.22107L4 7L4.59743 6.77893C5.38086 6.48903 5.77257 6.34409 6.05834 6.05833C6.34411 5.77259 6.48906 5.38087 6.77894 4.59745L7 4Z" />
      <path d="M18 16L18.1474 16.3983C18.3406 16.9206 18.4373 17.1817 18.6278 17.3722C18.8183 17.5627 19.0794 17.6594 19.6017 17.8526L20 18L19.6017 18.1474C19.0794 18.3406 18.8183 18.4373 18.6278 18.6278C18.4373 18.8183 18.3406 19.0794 18.1474 19.6017L18 20L17.8526 19.6017C17.6594 19.0794 17.5627 18.8183 17.3722 18.6278C17.1817 18.4373 16.9206 18.3406 16.3983 18.1474L16 18L16.3983 17.8526C16.9206 17.6594 17.1817 17.5627 17.3722 17.3722C17.5627 17.1817 17.6594 16.9206 17.8526 16.3983L18 16Z" />
    </AiFeatureSvg>
  )
}

export function IconAiFactCheck(props: IconProps) {
  return (
    <AiFeatureSvg {...props}>
      <circle cx="11.9997" cy="12.0004" r="9.53571" />
      <path
        d="M18.2407 8.20112C18.5754 7.86675 19.118 7.86668 19.4526 8.20112C19.7873 8.53587 19.7873 9.07931 19.4526 9.41402L14.0727 14.7929C13.9119 14.9535 13.6936 15.044 13.4663 15.0439C13.2392 15.0437 13.0213 14.9535 12.8608 14.7929L11.3921 13.3222C11.1247 13.0544 11.0714 12.6529 11.2319 12.332L8.70555 14.8593C8.37087 15.194 7.82741 15.1939 7.49266 14.8593L4.53563 11.9023C4.20123 11.5676 4.20121 11.025 4.53563 10.6904C4.87039 10.3559 5.41388 10.3557 5.74852 10.6904L8.0991 13.041L12.8725 8.26753C13.2072 7.93333 13.7498 7.93331 14.0845 8.26753C14.4189 8.60218 14.4188 9.14572 14.0845 9.48042L11.6147 11.9492C11.936 11.7883 12.3371 11.8423 12.605 12.1103L13.4673 12.9736L18.2407 8.20112Z"
        fill="currentColor"
        stroke="none"
      />
    </AiFeatureSvg>
  )
}

export function IconAiImage(props: IconProps) {
  return (
    <AiFeatureSvg {...props}>
      <path d="M7.55042 9.62398C8.33741 9.62398 8.97538 8.986 8.97538 8.19902C8.97538 7.41203 8.33741 6.77405 7.55042 6.77405C6.76343 6.77405 6.12545 7.41203 6.12545 8.19902C6.12545 8.986 6.76343 9.62398 7.55042 9.62398Z" />
      <path d="M20.8474 11.05C20.8496 11.4966 20.8496 11.9708 20.8496 12.475C20.8496 16.7293 20.8496 18.8565 19.528 20.1782C18.2063 21.4998 16.0791 21.4998 11.8248 21.4998C7.57047 21.4998 5.44331 21.4998 4.12165 20.1782C2.8 18.8565 2.8 16.7293 2.8 12.475C2.8 8.22066 2.8 6.0935 4.12165 4.77184C5.44331 3.4502 7.57047 3.4502 11.8248 3.4502C12.3289 3.4502 12.8032 3.4502 13.2498 3.45239" />
      <path d="M18.4756 2.49915L18.7206 3.16131C19.0419 4.02958 19.2026 4.46372 19.5193 4.78041C19.836 5.09712 20.2701 5.25776 21.1384 5.57905L21.8006 5.82407L21.1384 6.06909C20.2701 6.39038 19.836 6.55103 19.5193 6.86772C19.2026 7.18442 19.0419 7.61856 18.7206 8.48683L18.4756 9.14899L18.2306 8.48683C17.9093 7.61856 17.7487 7.18442 17.432 6.86772C17.1153 6.55103 16.6811 6.39038 15.8128 6.06909L15.1507 5.82407L15.8128 5.57905C16.6811 5.25776 17.1153 5.09712 17.432 4.78041C17.7487 4.46372 17.9093 4.02958 18.2306 3.16131L18.4756 2.49915Z" />
      <path d="M5.17599 21.0236C9.32974 16.06 13.9862 9.51375 20.8483 13.9391" />
    </AiFeatureSvg>
  )
}

/**  brand mark (rounded-square sparkle badge), inline so it renders
 * crisply at device resolution instead of going through <img> rasterization */
export function GensparkMark({ size = 30 }: { size?: number }) {
  return <img src="data:image/png;base64,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" width={size} height={size} alt="" />
}
