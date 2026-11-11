import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/auth.store'
import { api } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { PorquinhoLogo } from '../components/ui/PorquinhoLogo'

const schema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function Register() {
  const [showPassword, setShowPassword] = useState(false)
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
    try {
      const res = await api.post('/auth/register', {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      })
      login(res.data.data.token, res.data.data.user)
      toast('Conta criada com sucesso! Bem-vindo ao Porquinho.', 'success')
      navigate('/')
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Erro ao criar conta. Tente outro e-mail.'
      toast(message, 'error')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F1ECDA]">
      {/* Brand Editorial Side Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#111111] p-12 text-[#F1ECDA] relative overflow-hidden">
        {/* Ambient cinza glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#758695]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-[#758695]/15 blur-3xl pointer-events-none" />

        {/* Top brand */}
        <div className="relative z-10">
          <PorquinhoLogo size="lg" subtitle="Finanças Pessoais" variant="white" />
        </div>

        {/* Copy */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#758695]/30 bg-[#758695]/15 px-3 py-1 text-xs font-semibold text-[#F1ECDA]">
            <Sparkles size={13} className="text-[#758695]" />
            <span>Comece gratuitamente em menos de 1 minuto</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-[#F1ECDA]">
            Assuma o controle do seu patrimônio com disciplina e agilidade.
          </h2>
          <p className="text-[#A3B2BF] text-sm leading-relaxed">
            Tenha em mãos relatórios em tempo real, fluxo de caixa categorizado e o fim definitivo
            da incerteza financeira no final do mês.
          </p>

          <ul className="space-y-3 pt-4 border-t border-zinc-800 text-sm text-[#F1ECDA]/90">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-[#758695] shrink-0" />
              <span>Categorização inteligente com paletas customizadas</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-[#758695] shrink-0" />
              <span>Cálculo automático de taxa de economia e saldo líquido</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-[#758695] shrink-0" />
              <span>Atalhos rápidos para registro instantâneo no celular ou desktop</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-[#758695]">
          © {new Date().getFullYear()} Porquinho. Desenvolvido para máxima clareza financeira.
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
              Criar sua conta
            </h1>
            <p className="mt-1 text-sm text-[#5C6D7C]">
              Junte-se ao Porquinho e simplifique suas finanças a partir de hoje.
            </p>
          </div>

          {/* Card Form */}
          <div className="rounded-2xl border border-[#DDD7C0] bg-[#FAF8F2] p-7 sm:p-8 shadow-surface">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Nome completo"
                placeholder="Ex: Ana Silva"
                autoComplete="name"
                error={errors.name?.message}
                {...register('name')}
              />

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
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
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

              <Input
                label="Confirmar senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repita sua senha"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight size={16} />}
                className="mt-2 w-full"
              >
                Criar conta gratuita
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Já possui uma conta?{' '}
            <Link
              to="/login"
              className="font-bold text-slate-900 hover:text-emerald-600 transition-colors underline"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
