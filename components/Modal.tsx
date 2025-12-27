import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsProcessing(true);
      try {
        await onConfirm();
        onClose();
      } catch (err) {
        console.error("Modal confirmation failed:", err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-10 h-10 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-10 h-10 text-amber-500" />;
      case 'error': return <ShieldAlert className="w-10 h-10 text-rose-500" />;
      case 'confirm': return <Info className="w-10 h-10 text-indigo-400" />;
      default: return <Info className="w-10 h-10 text-sky-400" />;
    }
  };

  const getAccentClass = () => {
    switch (type) {
      case 'success': return 'from-emerald-600 to-teal-600';
      case 'warning': return 'from-amber-500 to-orange-600';
      case 'error': return 'from-rose-600 to-red-700';
      case 'confirm': return 'from-indigo-600 to-purple-600';
      default: return 'from-sky-600 to-indigo-600';
    }
  };

  const getButtonClass = () => {
    const base = "flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2";
    if (type === 'error' || (type === 'confirm' && showCancel && confirmText?.toLowerCase().includes('delete'))) {
      return `${base} bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-900/20 hover:scale-[1.02] active:scale-95`;
    }
    return `${base} bg-gradient-to-r ${getAccentClass()} text-white shadow-purple-900/20 hover:scale-[1.02] active:scale-95`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Heavy Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0a0c]/80 backdrop-blur-xl"
            onClick={isProcessing ? undefined : onClose}
          />

          {/* Luxury Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative bg-[#1a1a20] border border-white/10 rounded-[3rem] p-10 max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="mb-6 p-4 bg-white/5 rounded-[2rem] border border-white/5 shadow-inner">
                {getIcon()}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 px-2">{message}</p>

              <div className="flex gap-3 w-full">
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={getButtonClass()}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>

            {/* Subtle Top Accent */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getAccentClass()}`} />

            {!isProcessing && !showCancel && (
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 text-gray-600 hover:text-white transition group active:scale-90"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;