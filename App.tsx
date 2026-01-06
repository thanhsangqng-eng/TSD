
import React, { useState, useCallback } from 'react';
import Camera from './components/Camera.tsx';
import { ScanStatus } from './types.ts';
import { extractCCCDData } from './services/geminiService.ts';
import { verifyIdWithDatabase } from './services/dbService.ts';

const App = () => {
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64: string) => {
    setStatus(ScanStatus.PROCESSING);
    setErrorMsg(null);
    try {
      const extracted = await extractCCCDData(base64);
      const dbResponse = await verifyIdWithDatabase(extracted.idNumber);
      
      setResult({
        idNumber: extracted.idNumber,
        fullName: extracted.fullName || "Người dùng",
        isValid: dbResponse.isValid,
        message: dbResponse.message
      });
      setStatus(dbResponse.isValid ? ScanStatus.SUCCESS : ScanStatus.FAILED);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi không xác định.");
      setStatus(ScanStatus.ERROR);
    }
  }, []);

  const reset = () => {
    setStatus(ScanStatus.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <header className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">TS DESIGN</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Hệ Thống Xác Thực CCCD</p>
        </header>

        <main>
          {status === ScanStatus.IDLE && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5 text-center">
                <p className="text-slate-400 text-sm">Nhấn nút bên dưới để bắt đầu quét thẻ CCCD và đối soát dữ liệu MySQL.</p>
              </div>
              <button 
                onClick={() => setStatus(ScanStatus.SCANNING)}
                className="w-full bg-blue-600 hover:bg-blue-500 h-20 rounded-[2rem] font-bold text-xl shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
              >
                QUÉT NGAY
              </button>
            </div>
          )}

          {status === ScanStatus.SCANNING && (
            <div className="animate-in fade-in zoom-in duration-300">
              <Camera isActive={true} onCapture={handleCapture} />
              <button onClick={reset} className="w-full mt-6 text-slate-500 font-bold text-sm uppercase tracking-widest">Hủy bỏ</button>
            </div>
          )}

          {status === ScanStatus.PROCESSING && (
            <div className="text-center py-16 space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold animate-pulse">Đang xử lý AI...</h3>
                <p className="text-slate-500 text-sm">Trích xuất dữ liệu & Đối soát MySQL</p>
              </div>
            </div>
          )}

          {(status === ScanStatus.SUCCESS || status === ScanStatus.FAILED) && result && (
            <div className={`p-8 rounded-[2.5rem] border-4 animate-in zoom-in duration-300 ${result.isValid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
              <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg ${result.isValid ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'}`}>
                  {result.isValid ? (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black">{result.isValid ? 'HỢP LỆ' : 'KHÔNG KHỚP'}</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.message}</p>
                </div>
                <div className="bg-black/40 p-5 rounded-2xl text-left border border-white/5 space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Số CCCD Nhận Diện</p>
                  <p className="text-2xl font-mono font-black text-blue-400">{result.idNumber}</p>
                </div>
                <button onClick={reset} className="w-full bg-white text-black h-16 rounded-2xl font-black text-lg shadow-xl shadow-white/10 active:scale-95 transition-transform">TIẾP TỤC QUÉT</button>
              </div>
            </div>
          )}

          {status === ScanStatus.ERROR && (
            <div className="text-center p-8 bg-red-500/10 rounded-[2.5rem] border border-red-500/30 animate-in shake duration-500">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-red-400 font-bold mb-6">{errorMsg}</p>
              <button onClick={reset} className="w-full bg-white/10 hover:bg-white/20 h-14 rounded-2xl font-bold transition-colors">THỬ LẠI</button>
            </div>
          )}
        </main>
      </div>
      
      <footer className="mt-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
        Powered by TS Design & Gemini AI
      </footer>
    </div>
  );
};

export default App;
