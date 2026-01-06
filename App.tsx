
import React, { useState, useCallback } from 'react';
import Camera from './components/Camera.tsx';
import { ScanStatus } from './types.ts';
import { extractCCCDData } from './services/geminiService.ts';
import { verifyIdWithDatabase } from './services/dbService.ts';

const App = () => {
  const [status, setStatus] = useState(ScanStatus.IDLE);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCapture = useCallback(async (base64) => {
    setStatus(ScanStatus.PROCESSING);
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
    } catch (err) {
      setErrorMsg(err.message);
      setStatus(ScanStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-blue-500">TS DESIGN</h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase mt-2">CCCD Scanner System</p>
        </div>

        {status === ScanStatus.IDLE && (
          <button 
            onClick={() => setStatus(ScanStatus.SCANNING)}
            className="w-full bg-blue-600 h-20 rounded-3xl font-bold text-xl shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform"
          >
            BẮT ĐẦU QUÉT
          </button>
        )}

        {status === ScanStatus.SCANNING && (
          <div className="animate-in fade-in zoom-in duration-300">
            <Camera isActive={true} onCapture={handleCapture} />
            <button onClick={() => setStatus(ScanStatus.IDLE)} className="w-full mt-4 text-slate-500 text-sm">Hủy bỏ</button>
          </div>
        )}

        {status === ScanStatus.PROCESSING && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="animate-pulse">Đang đối soát dữ liệu...</p>
          </div>
        )}

        {(status === ScanStatus.SUCCESS || status === ScanStatus.FAILED) && result && (
          <div className={`p-8 rounded-[2rem] border-4 animate-in zoom-in duration-300 ${result.isValid ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
            <div className="text-center space-y-6">
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`}>
                {result.isValid ? (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black">{result.isValid ? 'OK - HỢP LỆ' : 'KHÔNG KHỚP'}</h2>
                <p className="text-slate-400 text-sm mt-2">{result.message}</p>
              </div>
              <div className="bg-black/40 p-4 rounded-xl text-left border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Số CCCD quét được</p>
                <p className="text-xl font-mono font-bold text-blue-400 tracking-wider">{result.idNumber}</p>
              </div>
              <button onClick={() => setStatus(ScanStatus.IDLE)} className="w-full bg-white text-black h-14 rounded-2xl font-bold">QUAY LẠI</button>
            </div>
          </div>
        )}

        {status === ScanStatus.ERROR && (
          <div className="text-center p-8 bg-red-500/10 rounded-3xl border border-red-500/30">
            <p className="text-red-400 mb-6">{errorMsg}</p>
            <button onClick={() => setStatus(ScanStatus.IDLE)} className="w-full bg-white/10 h-12 rounded-xl font-bold">THỬ LẠI</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
