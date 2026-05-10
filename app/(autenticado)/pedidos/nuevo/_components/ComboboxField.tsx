'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (value: string) => void
  options: string[]
  onAddOption: (option: string) => void
  placeholder?: string
}

export function ComboboxField({ value, onChange, options, onAddOption, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
  const canCreate =
    search.trim() !== '' &&
    !options.some(o => o.toLowerCase() === search.trim().toLowerCase())

  function handleSelect(option: string) {
    onChange(option)
    setOpen(false)
    setSearch('')
  }

  function handleCreate() {
    const newOption = search.trim()
    onAddOption(newOption)
    onChange(newOption)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors',
          'hover:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-ring',
          !value && 'text-zinc-300'
        )}
      >
        <span className="truncate">{value || placeholder || 'Seleccionar...'}</span>
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o escribir..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandGroup>
              {filtered.map(option => (
                <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
                  <Check
                    className={cn('mr-2 h-4 w-4', value === option ? 'opacity-100' : 'opacity-0')}
                  />
                  {option}
                </CommandItem>
              ))}
              {canCreate && (
                <CommandItem onSelect={handleCreate} className="text-blue-600 font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar &quot;{search.trim()}&quot;
                </CommandItem>
              )}
              {filtered.length === 0 && !canCreate && (
                <p className="py-6 text-center text-sm text-zinc-500">Sin resultados.</p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
