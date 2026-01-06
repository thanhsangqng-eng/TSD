
import React, { useState, useCallback } from 'react';
import Camera from './components/Camera.tsx';
import { ScanStatus, VerificationResult } from './types.ts';
import { extractCCCDData } from './services/geminiService.ts';
import { verifyIdWithDatabase } from './services/dbService.ts';

const App: React.FC = () => {
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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
            <h1 className="text-sm font-bold leading-tight">TS Design</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Live DB</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all"
            title="Hướng dẫn cài đặt"
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {status !== ScanStatus.IDLE && (
            <button onClick={resetScanner} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase">
              Thoát
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {status === ScanStatus.IDLE && (
              <div className="space-y-8 animate-in">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 00-1 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2a1 1 0 00-1-1H3a1 1 0 01-1-1V9a1 1 0 011-1h2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black">Xác Thực CCCD</h2>
                  <p className="text-slate-400">Đối soát trực tiếp MySQL Server <br/> <span className="text-blue-400 font-mono text-xs font-bold">103.77.162.39</span></p>
                </div>
                <button 
                  onClick={() => setStatus(ScanStatus.SCANNING)}
                  className="w-full bg-blue-600 hover:bg-blue-500 h-16 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3.2"/></svg>
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
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Đang xử lý dữ liệu...</h3>
                  <p className="text-slate-400 text-sm">Đang trích xuất OCR & Truy vấn DB</p>
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
                      {result.isValid ? 'HỢP LỆ' : 'KHÔNG KHỚP'}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.message}</p>
                  </div>

                  <div className="w-full bg-black/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Số CCCD</span>
                      <span className="text-xl font-mono text-blue-400 font-bold tracking-tight">{result.idNumber}</span>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Database</span>
                      <span className={result.isValid ? 'text-green-500 text-xs font-bold' : 'text-red-500 text-xs font-bold'}>
                        {result.isValid ? 'Đã tìm thấy' : 'Không tồn tại'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={resetScanner}
                    className="w-full bg-white text-black h-14 rounded-xl font-bold transition-all active:scale-95"
                  >
                    Tiếp tục quét thẻ mới
                  </button>
                </div>
              </div>
            )}
            
            {status === ScanStatus.ERROR && (
              <div className="text-center space-y-6 animate-in">
                 <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/40">
                   <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <div className="space-y-2">
                   <h3 className="text-xl font-bold text-red-400">Lỗi Hệ Thống</h3>
                   <p className="text-slate-400 text-sm">{errorMsg}</p>
                 </div>
                 <button onClick={resetScanner} className="w-full bg-white/10 hover:bg-white/20 h-14 rounded-xl font-bold">Thử lại</button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] p-8 border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Cài đặt như App
            </h3>
            <div className="space-y-6 text-sm">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold shrink-0">1</div>
                <p className="text-slate-300">Mở link web này trên trình duyệt điện thoại (Chrome hoặc Safari).</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold shrink-0">2</div>
                <p className="text-slate-300">Nhấn nút <b>Menu (3 chấm)</b> hoặc <b>Chia sẻ</b>.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-bold shrink-0">3</div>
                <p className="text-slate-300 font-bold text-white">Chọn "Thêm vào màn hình chính" (Add to Home Screen).</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-8 bg-blue-600 h-12 rounded-xl font-bold"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      <footer className="p-6 text-center border-t border-white/5">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          Powered by TS Design &bull; Secure Protocol
        </p>
      </footer>
    </div>
  );
};

export default App;
