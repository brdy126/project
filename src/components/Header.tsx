
import React from 'react';

interface HeaderProps {
    viewMode: 'user' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({ viewMode }) => (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-teal-600">마사지 예약 시스템</h1>
            <p className="text-slate-500 mt-1">
                {viewMode === 'user' ? '오늘부터 예약 가능한 날짜의 스케줄입니다.' : '관리자 페이지: 마사지사 휴일을 설정하세요.'}
            </p>
        </div>
    </header>
);
