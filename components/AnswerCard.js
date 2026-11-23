import { Leaf, AlertTriangle } from 'lucide-react';
const Sec = ({ t, items }) => (
  <>
    <h4 className="font-semibold text-sm mt-3">{t}</h4>
    <ul className="list-disc pl-5 text-sm space-y-0.5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
  </>
);
export default function AnswerCard({ a }) {
  return (
    <div className="bg-aibg rounded-2xl rounded-bl-sm p-4 max-w-[760px] self-start">
      <div className="flex items-center gap-1.5 text-xs font-bold text-teal mb-1"><Leaf size={14} /> DigiTani AI</div>
      {a.risk && (
        <div className="flex gap-2 bg-gold/20 border border-gold rounded-xl p-3 mb-2 text-sm">
          <AlertTriangle size={20} className="flex-none" />
          <div><b>Peringatan keamanan</b><br />Pertanyaan ini menyangkut bahan kimia atau takaran. Prototipe ini sengaja tidak memberikan angka dosis. Ikuti label produk dan anjuran penyuluh atau pakar setempat, dan gunakan alat pelindung diri.</div>
        </div>
      )}
      {a.note && <p className="text-xs text-stone">{a.note}</p>}
      <h4 className="font-semibold text-sm">Ringkasan jawaban</h4>
      <p className="text-sm">{a.summary}</p>
      <Sec t={a.label} items={a.points} />
      <Sec t="Langkah yang disarankan" items={a.actions} />
      <Sec t="Yang perlu diperhatikan" items={a.cautions} />
      <div className="bg-white border border-line rounded-xl p-3 mt-3 text-sm">
        <b>Referensi</b> <span className="tag">Contoh ilustratif</span>
        <ul className="list-disc pl-5 mt-1">{a.refs.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <p className="text-xs text-stone mt-2">{a.mode === 'llm' ? `Dibuat oleh model ${a.model} (lokal) dari basis pengetahuan contoh` : 'Mode simulasi: model AI belum terhubung, jawaban diambil langsung dari basis pengetahuan contoh'}{a.confidence ? ` · keyakinan perkiraan ${a.confidence}%` : ''}.</p>
      <p className="text-xs text-stone mt-1">Jawaban AI merupakan informasi awal. Periksa kondisi tanaman dan gunakan referensi yang tersedia sebelum mengambil keputusan.</p>
    </div>
  );
}
