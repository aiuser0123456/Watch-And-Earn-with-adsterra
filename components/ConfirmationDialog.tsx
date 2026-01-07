
import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass w-full max-w-sm p-8 rounded-[32px] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black mb-3 text-white tracking-tight">{title}</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className={`w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg ${
              isDanger 
                ? 'bg-red-500 text-white' 
                : 'bg-[#13ec5b] text-[#102216]'
            }`}
          >
            {confirmText}
          </button>
          <button 
            onClick={onCancel}
            className="w-full h-14 glass border-white/5 text-gray-400 rounded-2xl font-bold hover:text-white transition-colors active:scale-95"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
