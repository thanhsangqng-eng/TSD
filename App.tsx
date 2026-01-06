
import React, { useState, useCallback } from 'react';
import Camera from './components/Camera.tsx';
import { ScanStatus } from './types.ts';
import { extractCCCDData } from './services/geminiService.ts';
import { verifyIdWithDatabase } from './services/dbService.ts';

const App = () => {
  const [status, setStatus] = useState(ScanStatus.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleCapture = useCallback(async (base64) => {
    setStatus(ScanStatus.PROCESSING);
    setErrorMsg(null);
    setResult(null);

    try {
      const extracted = await extractCCCDData(base64);
      if (!extracted.idNumber) {
        throw new Error("Không thể nhận diện số CCCD. Vui lòng chụp lại rõ nét hơn.");
      }

      const dbResponse = await verifyIdWithDatabase(extracted.idNumber);
      
      setResult({
        idNumber: extracted.idNumber,
        fullName: extracted.fullName || "Người dùng",
        isValid: dbResponse.isValid,
        message: dbResponse.message
      });

      setStatus(dbResponse.isValid ? ScanStatus.SUCCESS : ScanStatus.FAILED);
    } catch (err) {
      setErrorMsg(err.message || "Lỗi kết nối.");
      setStatus(ScanStatus.ERROR);
    }
  }, []);

  const resetScanner = () => {
    setStatus(ScanStatus.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans overflow-hidden">
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">TS Design</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Live DB</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowHelp(true)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {status !== ScanStatus.IDLE && (
            <button onClick={resetScanner} className="bg-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase">
              Thoát
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {status === ScanStatus.IDLE && (
              <div className="space-y-8 text-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 00-1-1H3a1 1 0 01-1-1V9a1 1 0 011-1h2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black">Xác Thực CCCD</h2>
                  <p className="text-slate-400">Đối soát trực tiếp MySQL Server <br/> <span className="text-blue-400 font-mono text-xs font-bold">103.77.162.39</span></p>
                </div>
                <button onClick={() => setStatus(ScanStatus.SCANNING)} className="w-full bg-blue-600 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3">
                  Quét thẻ ngay
                </button>
              </div>
            )}

            {status === ScanStatus.SCANNING && <Camera isActive={true} onCapture={handleCapture} />}

            {status === ScanStatus.PROCESSING && (
              <div className="text-center space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold">Đang xử lý...</h3>
              </div>
            )}

            {(status === ScanStatus.SUCCESS || status === ScanStatus.FAILED) && result && (
              <div className={`p-8 rounded-[2.5rem] border-2 ${result.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex flex-col items-center text-center gap-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${result.isValid ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'}`}>
                    {result.isValid ? (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className={`text-3xl font-black ${result.isValid ? 'text-green-400' : 'text-red-400'}`}>{result.isValid ? 'HỢP LỆ' : 'KHÔNG KHỚP'}</h2>
                    <p className="text-slate-300 text-sm">{result.message}</p>
                  </div>
                  <div className="w-full bg-black/40 p-5 rounded-2xl border border-white/5 text-left">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Số CCCD</p>
                    <p className="text-xl font-mono text-blue-400 font-bold">{result.idNumber}</p>
                  </div>
                  <button onClick={resetScanner} className="w-full bg-white text-black h-14 rounded-xl font-bold">Quét lại</button>
                </div>
              </div>
            )}
            
            {status === ScanStatus.ERROR && (
              <div className="text-center space-y-6">
                 <h3 className="text-xl font-bold text-red-400">Lỗi</h3>
                 <p className="text-slate-400 text-sm">{errorMsg}</p>
                 <button onClick={resetScanner} className="w-full bg-white/10 h-14 rounded-xl font-bold">Thử lại</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] p-8 border border-white/10 relative">
            <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 text-slate-500">X</button>
            <h3 className="text-xl font-bold mb-6">Hướng dẫn</h3>
            <p className="text-slate-300 mb-4">Mở link trên Chrome/Safari, chọn "Thêm vào màn hình chính" để dùng như App.</p>
            <button onClick={() => setShowHelp(false)} className="w-full bg-blue-600 h-12 rounded-xl font-bold">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
