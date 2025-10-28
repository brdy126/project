
import React from 'react';
import { SlotToBook } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slotToBook: SlotToBook | null;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, slotToBook }) => {
  if (!isOpen || !slotToBook) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">예약 확인</h2>
        <div className="space-y-2 text-slate-600 mb-6">
          <p><span className="font-semibold w-20 inline-block">마사지사:</span> {slotToBook.masseuse.name}</p>
          <p><span className="font-semibold w-20 inline-block">날짜:</span> {slotToBook.date.toLocaleDateString('ko-KR')}</p>
          <p><span className="font-semibold w-20 inline-block">시간:</span> {slotToBook.time}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors"
          >
            예약 확정
          </button>
        </div>
      </div>
    </div>
  );
};
