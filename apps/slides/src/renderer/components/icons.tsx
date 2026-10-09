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
  // media
  mediaPlay: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 8.5 L15.5 12 L10 15.5 Z" fill="currentColor" stroke="none" />
    </>
  ),
  mediaPause: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 8.5 V15.5 M14.4 8.5 V15.5" strokeWidth="2.2" />
    </>
  ),
  mediaStop: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <rect x="9" y="9" width="6" height="6" rx="0.8" fill="currentColor" stroke="none" />
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
  return (
    <img
      src="data:image/png;base64,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"
      width={size}
      height={size}
      alt=""
    />
  )
}

export function IconRotateRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 18.6 9.3 a 6.9 6.9 0 1 0 0.9 4.95" />
      <path d="M 19.05 4.8 v 4.5 h -4.5" />
    </Svg>
  )
}

export function IconRotateLeft(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M 5.4 9.3 a 6.9 6.9 0 1 1 -0.9 4.95" />
      <path d="M 4.95 4.8 v 4.5 h 4.5" />
    </Svg>
  )
}

export function IconReplacePicture(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.3" y="9.05" width="10.67" height="9.48" rx="0.95" />
      <circle cx="7.38" cy="12" r="1.07" />
      <path d="M 4.89 17.69 l 3.2 -3.2 2.25 2.25 1.67 -1.67 2.13 2.13" />
      <path d="M 13.79 5.6 h 5.44 m 0 0 -2.01 -1.89 m 2.01 1.89 -2.01 1.89" />
    </Svg>
  )
}
