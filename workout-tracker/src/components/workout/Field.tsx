export default function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-[#737373] font-semibold">{label}</label>
      {children}
    </div>
  )
}
