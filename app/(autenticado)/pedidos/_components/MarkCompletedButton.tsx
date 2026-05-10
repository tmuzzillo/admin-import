'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { markAsCompleted } from '../actions'

type Props = {
  orderId: string
}

export function MarkCompletedButton({ orderId }: Props) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading'>('idle')

  async function handleConfirm() {
    setStep('loading')
    const result = await markAsCompleted(orderId)
    if (result.error) setStep('idle')
  }

  if (step === 'confirm') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleConfirm}
          className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          ¿Confirmar?
        </button>
        <span className="text-zinc-300">·</span>
        <button
          onClick={() => setStep('idle')}
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  if (step === 'loading') {
    return (
      <span className="flex items-center gap-1.5 text-sm text-zinc-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Guardando...
      </span>
    )
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-green-600 transition-colors"
    >
      <CheckCircle className="w-3.5 h-3.5" />
      Marcar como realizado
    </button>
  )
}
