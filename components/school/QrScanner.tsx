import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { AttendanceLog } from '../../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (log: AttendanceLog) => void;
  schoolId: string;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onSuccess, schoolId }) => {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
  const readerId = `qr-reader-school-${Math.random().toString(36).slice(2, 11)}`;
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isProcessingRef.current = false;
      setScanResult(null);

      const html5QrCode = new Html5Qrcode(readerId, false);
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const qrCodeSuccessCallback = (decodedText: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          html5QrCodeRef.current.pause();
        }

        setScanResult({ type: 'loading', message: 'Processing...' });
        handleQrCode(decodedText);
      };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        undefined
      ).catch(err => {
        setScanResult({ type: 'error', message: `Camera error: ${err.message}. Please grant permission and try again.` });
      });

      return () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error("Failed to stop QR scanner.", err));
        }
      };
    }
  }, [isOpen]);

  const handleQrCode = async (decodedText: string) => {
    try {
      if (!user) throw new Error("User not authenticated.");

      const { log, entityName } = await api.markAttendanceByQr(schoolId, user.token, decodedText);
      setScanResult({ type: 'success', message: `Success! Attendance marked for ${entityName}` });

      setTimeout(() => {
        onSuccess(log);
        onClose();
      }, 1500);
    } catch (err) {
      setScanResult({ type: 'error', message: (err as Error).message || "Scan failed. Please try again." });
      setTimeout(() => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.PAUSED) {
          html5QrCodeRef.current.resume();
        }
        setScanResult(null);
        isProcessingRef.current = false;
      }, 2500);
    }
  };
  
  if (!isOpen) return null;

  const renderScanResult = () => {
    if (!scanResult) return null;

    let icon, textClass;
    switch(scanResult.type) {
        case 'loading':
            icon = <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>;
            textClass = 'text-gray-700 dark:text-gray-300';
            break;
        case 'error':
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            textClass = 'text-red-500 font-semibold';
            break;
        case 'success':
            icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
            textClass = 'text-green-500 font-semibold';
            break;
    }

    return (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg z-10">
          <div role="status" aria-live="polite" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-3 w-64 text-center">
              {icon}
              <p className={textClass}>{scanResult.message}</p>
          </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Scan QR Code
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 relative text-center">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Point the camera at a student or teacher QR code.</p>
             <div className="w-full max-w-xs mx-auto aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                 <div id={readerId} className="w-full h-full"></div>
                 {renderScanResult()}
             </div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;