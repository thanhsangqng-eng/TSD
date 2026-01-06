
import React, { useState, useCallback } from 'react';
import Camera from './components/Camera';
import { ScanStatus, VerificationResult } from './types';
import { extractCCCDData } from './services/geminiService';
import { verifyIdWithDatabase } from './services/dbService';

const App: React.FC = () => {
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCapture = useCallback(async (base64: string) => {
    setStatus(ScanStatus.PROCESSING);
    setErrorMsg(null);
    setResult(null);

    try {
      const extracted = await extractCCCDData(base64);
      if (!extracted.idNumber) {
        throw new Error("Không thể nhận diện được số CCCD. Vui lòng thử lại.");
      }

      const dbResponse = await verifyIdWithDatabase(extracted.idNumber);
      
      setResult({
        idNumber: extracted.idNumber,
        fullName: extracted.fullName || "Người dùng hệ thống",
        isValid: dbResponse.isValid,
        message: dbResponse.message
      });

      setStatus(dbResponse.isValid ? ScanStatus.SUCCESS : ScanStatus.FAILED);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối server.");
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
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">TS Design Scanner</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400">MySQL Connected</span>
            </div>
          </div>
        </div>
        {status !== ScanStatus.IDLE && (
          <button onClick={resetScanner} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all">
            Hủy
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {status === ScanStatus.IDLE && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 00-1-1H3a1 1 0 01-1-1V9a1 1 0 011-1h2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black">Xác Thực CCCD</h2>
                  <p className="text-slate-400">Kiểm tra số thẻ trực tiếp từ database MySQL</p>
                </div>
                <button 
                  onClick={() => setStatus(ScanStatus.SCANNING)}
                  className="w-full bg-blue-600 hover:bg-blue-500 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3.2"/></svg>
                  Bắt đầu quét ngay
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
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Đang kết nối Database...</h3>
                  <p className="text-slate-400 text-sm">Truy vấn server 103.77.162.39</p>
                </div>
              </div>
            )}

            {(status === ScanStatus.SUCCESS || status === ScanStatus.FAILED) && result && (
              <div className={`p-8 rounded-[2.5rem] border-2 animate-in zoom-in-95 duration-300 ${result.isValid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex flex-col items-center text-center gap-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${result.isValid ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'}`}>
                    {result.isValid ? (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h2 className={`text-3xl font-black ${result.isValid ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isValid ? 'OK - HỢP LỆ' : 'KHÔNG KHỚP'}
                    </h2>
                    <p className="text-slate-300">{result.message}</p>
                  </div>

                  <div className="w-full bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mã định danh</span>
                      <span className="text-xl font-mono text-blue-400 font-bold">{result.idNumber}</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Trạng thái</span>
                      <span className={result.isValid ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                        {result.isValid ? 'Đã cấp phép' : 'Chưa đăng ký'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={resetScanner}
                    className="w-full bg-white text-black h-14 rounded-xl font-bold transition-all active:scale-95"
                  >
                    Hoàn tất & Tiếp tục
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Secure Infrastructure &bull; TS DESIGN &bull; v1.0
        </p>
      </footer>
    </div>
  );
};

export default App;
