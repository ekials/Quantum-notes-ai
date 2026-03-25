// src/components/Notes/TranscribeModal.tsx
// Modal para subir audio/video y transcribir con Whisper

import { useState, useRef } from 'react';
import { Upload, Mic, X, Loader2, AlertCircle } from 'lucide-react';

interface TranscribeModalProps {
  onClose: () => void;
  onTranscribed: (text: string) => void;
}

const SUPPORTED_AUDIO = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];
const SUPPORTED_VIDEO = ['.mp4', '.mpeg', '.mpga'];

export function TranscribeModal({ onClose, onTranscribed }: TranscribeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasApiKey = !!import.meta.env.VITE_OPENAI_KEY;

  const handleFile = (f: File) => {
    setFile(f);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleTranscribe = async () => {
    if (!file) return;
    if (!hasApiKey) {
      setError('Disponible cuando agregues API key');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');
      formData.append('language', 'es'); // Prioriza español, pero detecta automático

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Error en transcripción');
      }

      const data = await res.json();
      onTranscribed(data.text);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const fileExt = file?.name.split('.').pop()?.toLowerCase();
  const isVideo = fileExt && SUPPORTED_VIDEO.some(ext => ext.includes(fileExt));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(20, 20, 35, 0.98)',
          border: '1px solid rgba(124, 106, 245, 0.25)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(124, 106, 245, 0.2)' }}>
              <Mic size={15} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Transcribir con Whisper</h3>
              <p className="text-xs text-gray-500">OpenAI Whisper API</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* No API key banner */}
          {!hasApiKey && (
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            >
              <AlertCircle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-1">Disponible cuando agregues API key</p>
                <p className="text-xs text-amber-500/80">
                  Por ahora el botón está bloqueado porque falta tu clave.
                </p>
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
            style={{
              borderColor: file ? 'rgba(124, 106, 245, 0.5)' : 'rgba(255,255,255,0.1)',
              background: file ? 'rgba(124, 106, 245, 0.06)' : 'rgba(255,255,255,0.02)',
            }}
          >
            <Upload size={20} className="mx-auto mb-2 text-gray-500" />
            {file ? (
              <div>
                <p className="text-sm text-white font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {isVideo ? '🎬 Video' : '🎵 Audio'} · {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400">Arrastra tu archivo o haz click</p>
                <p className="text-xs text-gray-600 mt-1">
                  Audio: {SUPPORTED_AUDIO.join(', ')}
                </p>
                <p className="text-xs text-gray-600">Video: {SUPPORTED_VIDEO.join(', ')}</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={[...SUPPORTED_AUDIO, ...SUPPORTED_VIDEO].join(',')}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm text-gray-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleTranscribe}
              disabled={!file || !hasApiKey || isLoading}
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #7c6af5, #5b4de0)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Transcribiendo...
                </>
              ) : !hasApiKey ? (
                'Disponible cuando agregues API key'
              ) : (
                <>
                  <Mic size={14} /> Transcribir
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
