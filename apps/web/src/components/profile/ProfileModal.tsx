import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProfileSchema, UpdateProfileInput } from '@porquinho/types'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../stores/auth.store'
import { api } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, login } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setErrorMessage(null)
    setLoading(true)
    try {
      const payload: any = {
        name: data.name.trim(),
        email: data.email.trim(),
      }

      if (data.newPassword && data.newPassword.trim().length > 0) {
        payload.currentPassword = data.currentPassword
        payload.newPassword = data.newPassword.trim()
      }

      const res = await api.put('/auth/profile', payload)
      const { token, user: updatedUser } = res.data.data

      // Update state and token
      login(token, updatedUser)

      toast('Perfil atualizado com sucesso!', 'success')

      reset({
        name: updatedUser.name,
        email: updatedUser.email,
        currentPassword: '',
        newPassword: '',
      })

      onClose()
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Não foi possível atualizar o perfil. Verifique seus dados.'
      setErrorMessage(msg)
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meu Perfil" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* User Identity Banner */}
        <div className="flex items-center gap-3 rounded-xl border border-[#DDD7C0] bg-[#F1ECDA] p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-[#F1ECDA] font-extrabold text-base shadow-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-sm text-[#111111] truncate">
              {user?.name || 'Usuário'}
            </p>
            <p className="text-xs text-[#5C6D7C] truncate">{user?.email}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#758695]/15 px-2 py-0.5 text-[10px] font-bold text-[#1B2228] border border-[#758695]/30">
            <ShieldCheck size={11} />
            Conta Ativa
          </span>
        </div>

        {/* Name */}
        <Input
          label="Nome completo"
          placeholder="Seu nome"
          leftIcon={<User size={16} />}
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="seuemail@exemplo.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Change password section */}
        <div className="pt-2 border-t border-[#DDD7C0]">
          <p className="text-xs font-bold text-[#111111] mb-1">
            Alterar Senha (opcional)
          </p>
          <p className="text-[11px] text-[#5C6D7C] mb-3">
            Deixe em branco caso não queira alterar sua senha atual.
          </p>

          <div className="flex flex-col gap-3">
            <Input
              label="Senha Atual"
              type="password"
              placeholder="Digite sua senha atual"
              leftIcon={<Lock size={16} />}
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />

            <Input
              label="Nova Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              leftIcon={<Lock size={16} />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex items-center justify-end gap-2 pt-3 border-t border-[#DDD7C0]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-[#111111] text-[#F1ECDA] hover:bg-[#222222]"
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  )
}
