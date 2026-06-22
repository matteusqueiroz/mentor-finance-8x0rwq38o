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
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div
        className={`flex items-center rounded-lg border bg-background px-3 transition-colors duration-200 ${error ? 'border-destructive' : 'border-input hover:border-ring focus-within:border-ring focus-within:ring-1 focus-within:ring-ring shadow-sm'}`}
      >
        <span className="text-muted-foreground mr-2 font-medium">R$</span>
        <input
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 bg-transparent py-2.5 text-foreground outline-none w-full placeholder:text-muted-foreground"
          placeholder="0,00"
        />
      </div>
      {error && <span className="text-xs text-destructive mt-0.5 font-medium">{error}</span>}
    </label>
  )
}
