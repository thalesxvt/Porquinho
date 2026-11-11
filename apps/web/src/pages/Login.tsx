import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/auth.store'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { PorquinhoLogo } from '../components/ui/PorquinhoLogo'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setAuthError(null)
    try {
      const res = await api.post('/auth/login', data)
      login(res.data.data.token, res.data.data.user)
      toast('Login realizado com sucesso! Bem-vindo de volta.', 'success')
      navigate('/')
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Email ou senha incorretos. Verifique seus dados.'
      setAuthError(message)
      toast(message, 'error')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F1ECDA]">
      {/* Brand Editorial Side Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#111111] p-12 text-[#F1ECDA] relative overflow-hidden">
        {/* Ambient cinza blur */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#758695]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-[#758695]/15 blur-3xl pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10">
          <PorquinhoLogo size="lg" subtitle="Finanças Pessoais" variant="white" />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#758695]/30 bg-[#758695]/15 px-3 py-1 text-xs font-semibold text-[#F1ECDA]">
            <Sparkles size={13} className="text-[#758695]" />
            <span>Controle Financeiro de Alta Performance</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-[#F1ECDA]">
            Clareza absoluta sobre seu patrimônio em poucos segundos.
          </h2>
          <p className="text-[#A3B2BF] text-sm leading-relaxed">
            Elimine planilhas confusas e formulários cansativos. O Porquinho foi desenhado para
            oferecer fluxo contínuo de caixa, taxas de economia reais e conciliação instantânea.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-[#758695] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#F1ECDA]">Privacidade Total</p>
                <p className="text-[11px] text-[#A3B2BF] mt-0.5">Seus dados protegidos e criptografados</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <TrendingUp size={18} className="text-[#758695] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#F1ECDA]">Zero Atrito</p>
                <p className="text-[11px] text-[#A3B2BF] mt-0.5">Lançamento de despesas em menos de 5 segundos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10 text-xs text-[#758695]">
          © {new Date().getFullYear()} Porquinho. Desenvolvido para máxima clareza e controle financeiro.
        </div>
      </div>

      {/* Form Area */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile brand logo */}
          <div className="mb-8 lg:hidden flex justify-center">
            <PorquinhoLogo size="md" subtitle="Finanças Pessoais" />
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#111111]">
              Acesse sua conta
            </h1>
            <p className="mt-1 text-sm text-[#5C6D7C]">
              Entre com suas credenciais para gerenciar suas receitas e despesas.
            </p>
          </div>

          {/* Card Form */}
          <div className="rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] p-7 sm:p-8 shadow-surface">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {authError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50/90 p-3 text-xs text-rose-900 transition-all"
                >
                  <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                  <div className="leading-relaxed font-medium">
                    {authError}
                  </div>
                </div>
              )}

              <Input
                label="E-mail"
                type="email"
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight size={16} />}
                className="mt-2 w-full"
              >
                Entrar no Porquinho
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Ainda não tem conta no Porquinho?{' '}
            <Link
              to="/register"
              className="font-bold text-slate-900 hover:text-emerald-600 transition-colors underline"
            >
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
