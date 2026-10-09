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
