import SettingsPanel from '@/components/SettingsPanel';
import { llmStatus } from '@/lib/llm';
export default async function Pengaturan() {
  const st = await llmStatus();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pengaturan</h1>
      <div className="card max-w-xl mb-4">
        <h2 className="font-semibold mb-1">Status AI</h2>
        <p className="text-sm"><span className="tag mr-2">{st.mode === 'llm' ? `Mode: ${st.model}` : 'Mode: simulasi'}</span>{st.detail}</p>
        <p className="text-xs text-stone mt-2">Untuk mengaktifkan SLM lokal, atur USE_LLM=true di file .env.local lalu jalankan ulang aplikasi.</p>
      </div>
      <SettingsPanel role="petani" />
    </div>
  );
}
