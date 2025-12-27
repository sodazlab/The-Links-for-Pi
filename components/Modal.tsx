import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, Loader2 } from 'lucide-react';

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
        console.error("Modal action failed", err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-10 h-10 text-green-400" />;
      case 'warning': return <AlertCircle className="w-10 h-10 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-10 h-10 text-red-500" />;
      case 'confirm': return <Info className="w-10 h-10 text-purple-400" />;
      default: return <Info className="w-10 h-10 text-blue-400" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-purple-600';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={isProcessing ? undefined : onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-[#16161a] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${getAccentColor()}`} />

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                {getIcon()}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">{message}</p>

              <div className="flex gap-3 w-full">
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 ${
                    type === 'error' || type === 'warning' && showCancel
                      ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-purple-900/20'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>

            {/* Close button icon for non-processing alerts */}
            {!isProcessing && !showCancel && (
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition"
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