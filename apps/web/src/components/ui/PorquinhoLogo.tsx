
export type PorquinhoLogoVariant = 'default' | 'white'

interface PorquinhoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  subtitle?: string
  variant?: PorquinhoLogoVariant
}

export function PorquinhoLogo({
  size = 'md',
  className = '',
  showText = true,
  subtitle,
  variant = 'default',
}: PorquinhoLogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const svgSizes = {
    sm: 15,
    md: 18,
    lg: 22,
    xl: 28,
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  }

  const isWhite = variant === 'white'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-[#F1ECDA] shadow-sm ring-1 ${
          isWhite ? 'ring-[#758695]/40' : 'ring-[#758695]/30'
        } overflow-hidden`}
      >
        {/* Subtle radial sheen in cinza tone */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#758695]/20 via-transparent to-transparent pointer-events-none" />

        <svg
          width={svgSizes[size]}
          height={svgSizes[size]}
          viewBox="-0.5 -0.5 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 text-[#F1ECDA] stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Piggy body with pink fill */}
          <path
            d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"
            fill="#F472B6"
            fillOpacity="0.85"
          />
          {/* Snout detail */}
          <path d="M2 9v1c0 1.1.9 2 2 2h1" />
          {/* Eye */}
          <circle cx="16" cy="11" r="0.85" fill="#ffffffff" stroke="#fffdfdff" strokeWidth="0.5" />
          {/* Coin drop slot with subtle golden/cinza accent */}
          <line x1="10" y1="5.5" x2="13" y2="5.5" stroke="#F1ECDA" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight ${
                isWhite ? 'text-white' : 'text-zinc-950'
              } ${textSizes[size]}`}
            >
              Porquinho
            </span>
            <span
              className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold border ${
                isWhite
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-[#758695]/15 text-[#1B2228] border-[#758695]/25'
              }`}
            >
              PRO
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[11px] font-medium mt-1 ${
                isWhite ? 'text-[#A3B2BF]' : 'text-[#758695]'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
