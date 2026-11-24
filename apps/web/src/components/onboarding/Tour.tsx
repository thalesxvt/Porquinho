import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTourStore } from '../../stores/tour.store'
import { TOUR_STEPS } from './tourSteps'
import { cn } from '../../lib/utils'

const GUTTER = 16
const GAP = 12
const PADDING = 6
/** Espaço do header fixo do mobile (h-16) mais folga. */
const TOP_OFFSET = 80

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

/** Desktop e mobile repetem alguns elementos (sidebar x header/dock): usa o que estiver visível. */
function findVisibleTarget(id: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`)
  for (const el of nodes) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) return el
  }
  return null
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function Tour() {
  const { isOpen, stepIndex, next, prev, finish } = useTourStore()
  const step = TOUR_STEPS[stepIndex]
  const [rect, setRect] = useState<Rect | null>(null)
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)

  const measure = useCallback(() => {
    if (!step?.target) return setRect(null)
    const el = findVisibleTarget(step.target)
    if (!el) return setRect(null)
    const r = el.getBoundingClientRect()
    setRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    })
  }, [step])

  // Ao trocar de passo: rola até o alvo e mede.
  useLayoutEffect(() => {
    if (!isOpen) return
    const el = step?.target ? findVisibleTarget(step.target) : null
    if (el) {
      const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
      const r = el.getBoundingClientRect()
      const cardHeight = cardRef.current?.offsetHeight || 180
      // Alvo alto demais para dividir a tela com o balão: alinha o topo dele logo abaixo do header.
      if (r.height + cardHeight + GAP * 2 > window.innerHeight - TOP_OFFSET) {
        window.scrollTo({ top: window.scrollY + r.top - TOP_OFFSET, behavior })
      } else {
        el.scrollIntoView({ block: 'center', behavior })
      }
    }
    measure()
  }, [isOpen, step, measure])

  // Mantém o destaque grudado no alvo durante rolagem/redimensionamento.
  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [isOpen, measure])

  // Tamanho do balão (muda com o texto do passo e a largura da tela) para posicioná-lo.
  useEffect(() => {
    const card = cardRef.current
    if (!isOpen || !card) return
    const observer = new ResizeObserver(() =>
      setCardSize({ width: card.offsetWidth, height: card.offsetHeight })
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) primaryRef.current?.focus()
  }, [isOpen, stepIndex])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [isOpen, next, prev, finish])

  if (!isOpen || !step) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const isLast = stepIndex === TOUR_STEPS.length - 1

  // Balão abaixo do alvo se couber; senão acima; senão preso no rodapé, com o destaque
  // cortado logo acima dele (alvo mais alto que a tela, ex.: previsão no mobile).
  let cardStyle: React.CSSProperties
  let highlight = rect
  if (rect && cardSize.height) {
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - cardSize.width / 2, GUTTER),
      vw - cardSize.width - GUTTER
    )
    const below = rect.top + rect.height + GAP
    const above = rect.top - GAP - cardSize.height
    let top: number
    if (below + cardSize.height <= vh - GUTTER) top = below
    else if (above >= GUTTER) top = above
    else {
      top = Math.max(GUTTER, vh - cardSize.height - GUTTER)
      const visibleTop = Math.max(rect.top, 0)
      const visibleBottom = Math.min(rect.top + rect.height, top - GAP)
      highlight =
        visibleBottom > visibleTop
          ? { ...rect, top: visibleTop, height: visibleBottom - visibleTop }
          : null
    }
    cardStyle = { top, left }
  } else {
    cardStyle = {
      top: Math.max(GUTTER, (vh - cardSize.height) / 2),
      left: Math.max(GUTTER, (vw - cardSize.width) / 2),
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[110]" aria-live="polite">
      {/* Bloqueia cliques na página enquanto o tour está aberto */}
      <div className={cn('absolute inset-0', !highlight && 'bg-[#111111]/55')} />

      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl ring-2 ring-[#F1ECDA] motion-safe:transition-all motion-safe:duration-300"
          style={{
            ...highlight,
            boxShadow: '0 0 0 9999px rgba(17,17,17,0.55)',
          }}
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className={cn(
          'absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] p-4 shadow-modal',
          'motion-safe:animate-scale-in',
          !cardSize.height && 'invisible'
        )}
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="tour-title" className="text-sm font-extrabold text-[#111111]">
            {step.title}
          </h2>
          <button
            type="button"
            onClick={finish}
            className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#758695] hover:bg-[#EFE9D5] hover:text-[#111111] cursor-pointer"
            aria-label="Fechar tutorial"
          >
            <X size={15} />
          </button>
        </div>
        <p id="tour-body" className="mt-1.5 text-xs leading-relaxed text-[#5C6D7C]">
          {step.body}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#758695] tabular-nums">
            {stepIndex + 1}/{TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-1.5">
            {stepIndex === 0 ? (
              <button
                type="button"
                onClick={finish}
                className="h-8 rounded-lg px-3 text-xs font-semibold text-[#5C6D7C] hover:bg-[#EFE9D5] hover:text-[#111111] cursor-pointer"
              >
                Pular
              </button>
            ) : (
              <button
                type="button"
                onClick={prev}
                className="h-8 rounded-lg px-3 text-xs font-semibold text-[#5C6D7C] hover:bg-[#EFE9D5] hover:text-[#111111] cursor-pointer"
              >
                Voltar
              </button>
            )}
            <button
              ref={primaryRef}
              type="button"
              onClick={next}
              className="h-8 rounded-lg bg-[#111111] px-3.5 text-xs font-bold text-[#F1ECDA] hover:bg-[#222222] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F2]"
            >
              {isLast ? 'Concluir' : stepIndex === 0 ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
