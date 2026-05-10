type Props = {
  family: string
}

export function FamilyDivider({ family }: Props) {
  return (
    <div className="flex items-center gap-3 pt-3 pb-1">
      <div className="h-px flex-1 bg-zinc-200" />
      <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
          {family}
        </span>
      </div>
      <div className="h-px flex-1 bg-zinc-200" />
    </div>
  )
}
