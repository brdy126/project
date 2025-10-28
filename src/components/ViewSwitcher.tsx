
import React from 'react';

type ViewMode = 'user' | 'admin';

interface ViewSwitcherProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, onViewChange }) => (
    <div className="flex bg-slate-200 rounded-lg p-1 w-full sm:w-auto">
        <button
            onClick={() => onViewChange('user')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${viewMode === 'user' ? 'bg-white text-teal-600 shadow' : 'text-slate-600'}`}
        >
            사용자
        </button>
        <button
            onClick={() => onViewChange('admin')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${viewMode === 'admin' ? 'bg-white text-teal-600 shadow' : 'text-slate-600'}`}
        >
            관리자
        </button>
    </div>
);
