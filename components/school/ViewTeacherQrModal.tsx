import React, { useRef } from 'react';
import { Teacher } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

interface ViewTeacherQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
}

const ViewTeacherQrModal: React.FC<ViewTeacherQrModalProps> = ({ isOpen, onClose, teacher }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svgElement = qrCodeRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = `${teacher.name.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Teacher QR Code
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 text-center space-y-4">
            <div ref={qrCodeRef} className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG value={teacher.qr_value} size={200} level="H" />
            </div>
            <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                <p><strong>Name:</strong> {teacher.name}</p>
                <p><strong>Teacher ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{teacher.teacher_id}</code></p>
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
            >
              Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTeacherQrModal;