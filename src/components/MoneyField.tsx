import React, { useState, useEffect } from 'react'

interface MoneyFieldProps {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  error?: string
}

export function MoneyField({ label, value, onChange, error }: MoneyFieldProps) {
  const [display, setDisplay] = useState(
    value != null
      ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '',
  )

  useEffect(() => {
    if (value === null && display !== '') {
      setDisplay('')
    }
  }, [value, display])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^\d,]/g, '')
    const parts = raw.split(',')
    if (parts.length > 2) {
      raw = parts[0] + ',' + parts.slice(1).join('')
    }

    setDisplay(raw)

    if (raw === '') {
      onChange(null)
      return
    }

    const parsed = Number(raw.replace(',', '.'))
    onChange(Number.isFinite(parsed) ? parsed : null)
  }

  function handleBlur() {
    if (display) {
      const parsed = Number(display.replace(',', '.'))
      if (Number.isFinite(parsed)) {
        setDisplay(
          parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        )
      }
    }
  }

  return (
    <label className="flex flex-col gap-1.5 w-full">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div
        className={`flex items-center rounded-lg border bg-slate-900/50 px-3 transition-colors ${error ? 'border-red-500' : 'border-slate-700 hover:border-slate-500 focus-within:border-blue-500 shadow-sm'}`}
      >
        <span className="text-slate-500 mr-2 font-medium">R$</span>
        <input
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent py-2.5 text-slate-100 outline-none w-full placeholder:text-slate-600"
          placeholder="0,00"
        />
      </div>
      {error && <span className="text-xs text-red-500 mt-0.5 font-medium">{error}</span>}
    </label>
  )
}
