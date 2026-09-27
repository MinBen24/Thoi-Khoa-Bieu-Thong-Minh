import React from 'react';
import { AppTheme } from '../types/timetable';
import { 
  Calendar, 
  Palette, 
  Printer, 
  Layers,
  Pencil,
  Smartphone
} from 'lucide-react';

interface HeaderProps {
  weekTitle: string;
  onOpenEditWeekModal: () => void;
  dateRangeText: string;
  theme: AppTheme;
  onOpenThemeModal: () => void;
  activeView: 'weekly' | 'base';
  onViewChange: (view: 'weekly' | 'base') => void;
  changedCountThisWeek: number;
  onResetThisWeek: () => void;
  onPrint: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weekTitle,
  onOpenEditWeekModal,
  dateRangeText,
  theme,
  onOpenThemeModal,
  activeView,
  onViewChange,
  changedCountThisWeek,
  onResetThisWeek,
  onPrint,
  onOpenInstallModal,
}) => {
  return (
    <header id="main-app-header" className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs transition-all duration-300">
      {/* Top Banner with Brand & Theme Switcher */}
      <div className={`px-4 sm:px-6 py-2.5 bg-gradient-to-r ${theme.headerGradient} text-white flex flex-wrap items-center justify-between gap-2.5 transition-all duration-500`}>
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner text-lg">
            <span>{theme.mascotEmoji}</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide uppercase text-white drop-shadow-xs">
              THỜI KHÓA BIỂU THÔNG MINH
            </h1>
          </div>
        </div>

        {/* Action Controls: Install/Pin with Icon change, Theme Picker, Print Button */}
        <div className="flex items-center gap-2">
          {/* Super Prominent Pin to phone & Custom Icon button */}
          <button
            id="btn-open-install-modal"
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black shadow-md border border-amber-300/80 transition-all cursor-pointer ring-2 ring-amber-300/50 hover:ring-amber-200"
            title="Ghim ra màn hình chính điện thoại và tự chọn Icon đẹp cho app"
          >
            <Smartphone className="w-4 h-4 text-slate-900 shrink-0" />
            <span className="text-xs font-extrabold tracking-tight">
              <span className="sm:hidden">Ghim & Đổi Icon</span>
              <span className="hidden sm:inline">📱 Ghim Màn Hình & Đổi Icon</span>
            </span>
          </button>

          {/* Theme Palette Modal Picker Button */}
          <button
            id="btn-open-theme-picker"
            onClick={onOpenThemeModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold backdrop-blur-md border border-white/25 transition-all shadow-2xs cursor-pointer"
            title="Tự chọn chủ đề giao diện (Themes)"
          >
            <Palette className="w-4 h-4 text-sky-200" />
            <span className="text-xs font-bold hidden sm:inline">Themes</span>
          </button>

          {/* Print button */}
          <button
            id="btn-print-timetable"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white transition-all text-xs font-bold border border-white/25 shadow-2xs cursor-pointer backdrop-blur-md"
            title="In hoặc Lưu PDF thời khóa biểu"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">In Lịch</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar: Week Navigator & View Tabs */}
      <div className="px-4 sm:px-6 py-2.5 bg-white/92 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 transition-colors duration-300">
        {/* Week Title Button - Click to edit week title and dates */}
        <div className="flex items-center gap-2">
          <button
            id="btn-edit-week"
            type="button"
            onClick={onOpenEditWeekModal}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-white border border-slate-200 shadow-2xs transition-all text-left group cursor-pointer"
            title="Bấm để chỉnh sửa tên tuần và ngày học"
          >
            <div className={`w-8 h-8 rounded-lg ${theme.primaryColor} flex items-center justify-center shrink-0 transition-all shadow-2xs`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                  {weekTitle}
                </span>
                <Pencil className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                {dateRangeText}
              </span>
            </div>
          </button>

          {/* Changed count badge */}
          {changedCountThisWeek > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {changedCountThisWeek} tiết đổi tuần này
            </span>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            id="tab-view-weekly"
            onClick={() => onViewChange('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'weekly'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Lịch Tuần Học</span>
          </button>

          <button
            id="tab-view-base"
            onClick={() => onViewChange('base')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeView === 'base'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thời Khóa Biểu Gốc</span>
          </button>
        </div>
      </div>
    </header>
  );
};
