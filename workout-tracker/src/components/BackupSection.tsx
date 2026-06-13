import { useRef, useState } from 'react'
import { Download, Upload, Database } from 'lucide-react'
import { downloadBackup, validateBackup, restoreBackup } from '../utils/backup'

// Export/import of all app data (workout + nutrition + profile).
// Restoring overwrites local data and reloads the app so every store
// re-reads from storage.
export default function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!validateBackup(parsed)) throw new Error('invalid')
        if (!confirm('Importar este backup? Os dados atuais serão substituídos.')) return
        restoreBackup(parsed)
        window.location.reload()
      } catch {
        setError('Ficheiro de backup inválido.')
      }
    }
    reader.onerror = () => setError('Não foi possível ler o ficheiro.')
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-[#22c55e]" />
        <p className="text-sm font-semibold text-white">Dados</p>
      </div>
      <p className="text-xs text-[#737373]">
        Os dados vivem apenas neste dispositivo. Exporta um backup regularmente para não os perderes.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={downloadBackup}
          className="flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#22c55e] text-sm font-medium border border-[#22c55e]/30 hover:border-[#22c55e]/60">
          <Download size={15} />Exportar tudo
        </button>
        <button onClick={() => fileRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] rounded-xl text-[#a3a3a3] text-sm font-medium border border-[#2e2e2e] hover:border-[#525252]">
          <Upload size={15} />Importar backup
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFile} className="hidden" />
    </div>
  )
}
