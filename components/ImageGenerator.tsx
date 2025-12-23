
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { GeneratedImage, AppStatus } from '../types';

interface ImageGeneratorProps {
  onLogout: () => void;
  user: any;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onLogout, user }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const imageUrl = await GeminiService.generateImage(prompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now()
      };
      setHistory([newImage, ...history]);
      setPrompt('');
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-bolt-lightning text-lg"></i>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">NanoGen</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-100 py-1 pl-1 pr-3 rounded-full">
                <img 
                  src={user.photoUrl} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full border border-white shadow-sm"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Sign out"
              >
                <i className="fas fa-sign-out-alt text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create something extraordinary</h1>
          <p className="text-gray-500 mb-8">Powered by Gemini 2.5 Nano Banana for rapid high-quality image synthesis.</p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create (e.g., 'A cyberpunk city with neon lights in the rain')..."
                className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-800"
                required
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={status === AppStatus.LOADING || !prompt.trim()}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95"
                >
                  {status === AppStatus.LOADING ? (
                    <><i className="fas fa-circle-notch fa-spin"></i><span>Generating...</span></>
                  ) : (
                    <><i className="fas fa-magic"></i><span>Generate</span></>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-pulse">
              <div className="flex">
                <i className="fas fa-exclamation-circle mt-1 mr-3"></i>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Gallery */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-images mr-2 text-blue-600"></i>
            Your Creations
          </h2>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                <i className="far fa-image text-3xl"></i>
              </div>
              <p className="text-gray-500 font-medium">No images generated yet.</p>
              <p className="text-gray-400 text-sm">Enter a prompt above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {history.map((img) => (
                <div key={img.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.prompt} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button 
                        onClick={() => window.open(img.url, '_blank')}
                        className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"
                        title="View Full Size"
                      >
                        <i className="fas fa-expand"></i>
                      </button>
                      <a 
                        href={img.url} 
                        download={`nanogen-${img.id}.png`}
                        className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-all"
                        title="Download"
                      >
                        <i className="fas fa-download"></i>
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 line-clamp-2 font-medium h-10 mb-2">{img.prompt}</p>
                    <p className="text-xs text-gray-400 flex items-center">
                      <i className="far fa-clock mr-1"></i>
                      {new Date(img.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ImageGenerator;
