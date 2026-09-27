import React, { useState, useEffect, useMemo } from 'react';
import { 
  DayOfWeek, 
  LessonSlot, 
  OverrideLessonSlot, 
  ChangeStatus, 
  StudentProgress 
} from './types/timetable';
import { 
  DAYS_CONFIG, 
  PERIODS_CONFIG, 
  DEFAULT_BASE_SCHEDULE, 
  INITIAL_SAMPLE_OVERRIDES, 
  DEFAULT_SUBJECTS,
  getSlotKey 
} from './data/defaultTimetable';
import { getThemeById, APP_THEMES } from './themes/themeConfig';
import { Header } from './components/Header';
import { TimetableGrid } from './components/TimetableGrid';
import { TodayCard } from './components/TodayCard';
import { EditSlotModal } from './components/EditSlotModal';
import { ThemeModal } from './components/ThemeModal';
import { BaseScheduleManager } from './components/BaseScheduleManager';
import { EditWeekModal } from './components/EditWeekModal';
import { ThemeBackground } from './components/ThemeBackground';
import { PrintModal } from './components/PrintModal';
import { InstallModal } from './components/InstallModal';
import { 
  CalendarDays, 
  CheckCircle2, 
  Sparkles, 
  Palette, 
  RotateCcw,
  Zap,
  Info,
  X
} from 'lucide-react';
import { loadStoredIconConfig, applyAppIconToBrowser } from './utils/appIconManager';

function getInitialMondayStr(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const d = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${d}`;
}

const STORAGE_KEYS = {
  THEME: 'tkb_selected_theme_v3',
  BASE_SCHEDULE: 'tkb_base_schedule_v3',
  WEEKLY_OVERRIDES: 'tkb_weekly_overrides_v3',
  CURRENT_WEEK: 'tkb_current_week_v3',
  WEEK_TITLE: 'tkb_week_title_v4',
  WEEK_START_DATE: 'tkb_week_start_date_v4',
  CUSTOM_DATE_RANGE: 'tkb_custom_date_range_v4',
  SHOW_WEEKEND: 'tkb_show_weekend_v3',
  STUDENT_PROGRESS: 'tkb_student_progress_v1',
};

export default function App() {
  // Theme state
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'boy-navy';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isQuickBannerDismissed, setIsQuickBannerDismissed] = useState(false);

  // Apply stored custom app icon and detect standalone PWA mode on mount
  useEffect(() => {
    try {
      const savedIcon = loadStoredIconConfig();
      if (savedIcon?.dataUrl) {
        applyAppIconToBrowser(savedIcon.dataUrl);
      }
    } catch (e) {
      console.warn('Could not load custom icon:', e);
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
  }, []);

  // Check URL params for auto-print when opened in dedicated tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      setIsPrintModalOpen(true);
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print was blocked or canceled:', e);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Week navigation state
  const [weekTitle, setWeekTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.WEEK_TITLE) || 'Tuần 1';
  });
  const [weekStartDate, setWeekStartDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.WEEK_START_DATE) || getInitialMondayStr();
  });
  const [customDateRange, setCustomDateRange] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_DATE_RANGE) || '';
  });
  const [isEditWeekModalOpen, setIsEditWeekModalOpen] = useState(false);

  const currentWeekNumber = useMemo(() => {
    const match = weekTitle.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }, [weekTitle]);

  // Base schedule state (Lịch gốc)
  const [baseSchedule, setBaseSchedule] = useState<Record<string, LessonSlot>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BASE_SCHEDULE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse base schedule', e);
      }
    }
    return DEFAULT_BASE_SCHEDULE;
  });

  // Weekly overrides (Chỉ lưu các buổi bị thay đổi cho từng tuần)
  const [weeklyOverrides, setWeeklyOverrides] = useState<Record<string, Record<string, OverrideLessonSlot>>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_OVERRIDES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse weekly overrides', e);
      }
    }
    return INITIAL_SAMPLE_OVERRIDES;
  });

  // View state: 'weekly' (bảng tuần) | 'base' (lịch gốc)
  const [activeView, setActiveView] = useState<'weekly' | 'base'>('weekly');
  const [showWeekend, setShowWeekend] = useState<boolean>(false);

  // Gamification Progress State (Yêu cầu 5: Game hóa hiển thị)
  const [progress, setProgress] = useState<StudentProgress>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_PROGRESS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reset completed slots if day changed
        if (parsed.lastActiveDate !== todayStr) {
          parsed.completedSlotsToday = [];
          parsed.lastActiveDate = todayStr;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
    return {
      level: 2,
      exp: 60,
      maxExp: 150,
      streakDays: 4,
      title: 'Học Sinh Chăm Chỉ',
      completedSlotsToday: [],
      lastActiveDate: todayStr,
    };
  });

  // Slot editing modal state
  const [editingSlot, setEditingSlot] = useState<{ dayKey: DayOfWeek; period: number } | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, themeId);
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, currentWeekNumber.toString());
  }, [currentWeekNumber]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEK_TITLE, weekTitle);
  }, [weekTitle]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEK_START_DATE, weekStartDate);
  }, [weekStartDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DATE_RANGE, customDateRange);
  }, [customDateRange]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BASE_SCHEDULE, JSON.stringify(baseSchedule));
  }, [baseSchedule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_OVERRIDES, JSON.stringify(weeklyOverrides));
  }, [weeklyOverrides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_WEEKEND, showWeekend.toString());
  }, [showWeekend]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_PROGRESS, JSON.stringify(progress));
  }, [progress]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const currentTheme = useMemo(() => getThemeById(themeId), [themeId]);

  // Handle fast theme switcher for Boy / Girl directly
  const handleQuickToggleGender = (gender: 'boy' | 'girl') => {
    if (gender === 'boy') {
      const target = themeId.startsWith('boy-') ? themeId : 'boy-navy';
      setThemeId(target);
      showToast(`Đã bật giao diện Bạn Nam: ${getThemeById(target).name} 👦`);
    } else {
      const target = themeId.startsWith('girl-') ? themeId : 'girl-blossom';
      setThemeId(target);
      showToast(`Đã bật giao diện Bạn Nữ: ${getThemeById(target).name} 👧`);
    }
  };

  // Calculate current dates for the selected week
  const { dateRangeText, daysMap, currentDayKey, todayDateStr } = useMemo(() => {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday...
    const jsDayToDayKey: Record<number, DayOfWeek> = {
      1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN',
    };
    const resolvedCurrentDayKey = jsDayToDayKey[currentDayIndex] || 'T2';

    let weekMonday: Date;
    try {
      const parts = weekStartDate.split('-').map(Number);
      if (parts.length === 3) {
        weekMonday = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        weekMonday = new Date();
      }
    } catch {
      weekMonday = new Date();
    }

    const formatDayMonth = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

    const map: Record<DayOfWeek, { date: Date; dateStr: string; isToday: boolean }> = {} as any;
    const dayKeys: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    dayKeys.forEach((key, index) => {
      const d = new Date(weekMonday);
      d.setDate(weekMonday.getDate() + index);
      const isToday = d.toDateString() === today.toDateString();
      map[key] = {
        date: d,
        dateStr: formatDayMonth(d),
        isToday,
      };
    });

    const sundayDate = new Date(weekMonday);
    sundayDate.setDate(weekMonday.getDate() + 6);
    const autoRange = `${formatDayMonth(weekMonday)} - ${formatDayMonth(sundayDate)}/${sundayDate.getFullYear()}`;
    const range = customDateRange && customDateRange.trim() ? customDateRange.trim() : autoRange;

    return {
      dateRangeText: range,
      daysMap: map,
      currentDayKey: resolvedCurrentDayKey,
      todayDateStr: `${formatDayMonth(today)}`,
    };
  }, [weekStartDate, customDateRange]);

  // Current week overrides key
  const currentWeekKey = useMemo(() => {
    const clean = weekTitle.trim().toLowerCase().replace(/\s+/g, '_');
    return `week_${clean}`;
  }, [weekTitle]);

  const currentWeekOverrides = useMemo(() => {
    return weeklyOverrides[currentWeekKey] || weeklyOverrides[`week_${currentWeekNumber}`] || {};
  }, [weeklyOverrides, currentWeekKey, currentWeekNumber]);

  // Count changed slots this week
  const changedCountThisWeek = useMemo(() => {
    return Object.values(currentWeekOverrides).filter(slot => slot.isOverridden).length;
  }, [currentWeekOverrides]);

  // Today lessons counts for gamification
  const { todayTotalCount, todayCompletedCount } = useMemo(() => {
    const periods = PERIODS_CONFIG;
    let total = 0;
    periods.forEach(p => {
      const k = getSlotKey(currentDayKey, p.period);
      const slot = currentWeekOverrides[k]?.isOverridden ? currentWeekOverrides[k] : baseSchedule[k];
      if (slot?.subject) total++;
    });
    const completed = progress.completedSlotsToday.length;
    return { todayTotalCount: total, todayCompletedCount: Math.min(completed, total) };
  }, [currentDayKey, currentWeekOverrides, baseSchedule, progress.completedSlotsToday]);

  // Gamification: Toggle complete slot
  const handleToggleSlotCompleted = (slotKey: string) => {
    const isCompleted = progress.completedSlotsToday.includes(slotKey);
    let newCompleted = isCompleted 
      ? progress.completedSlotsToday.filter(k => k !== slotKey)
      : [...progress.completedSlotsToday, slotKey];

    const expDelta = isCompleted ? -15 : 15;
    let newExp = Math.max(0, progress.exp + expDelta);
    let newLevel = progress.level;
    let newMaxExp = progress.maxExp;
    let newTitle = progress.title;

    if (newExp >= newMaxExp) {
      newLevel += 1;
      newExp = newExp - newMaxExp;
      newMaxExp = Math.round(newMaxExp * 1.3);
      const titles = [
        'Học Sinh Tập Sự',
        'Chiến Thần Đúng Giờ',
        'Học Bá Chăm Chỉ',
        'Chiến Binh Thời Gian',
        'Thủ Khoa Tương Lai',
        'Huyền Thoại Học Đường',
      ];
      newTitle = titles[Math.min(newLevel - 1, titles.length - 1)];
      showToast(`🎉 CHÚC MỪNG! Bạn vừa lên Cấp ${newLevel}: ${newTitle}!`);
    } else if (!isCompleted) {
      showToast('Đã hoàn thành tiết học! +15 EXP ✨');
    }

    setProgress(prev => ({
      ...prev,
      level: newLevel,
      exp: newExp,
      maxExp: newMaxExp,
      title: newTitle,
      completedSlotsToday: newCompleted,
    }));
  };

  const handleClaimDailyCheckin = () => {
    setProgress(prev => ({
      ...prev,
      exp: prev.exp + 20,
    }));
    showToast('Đã nhận thưởng điểm danh ngày: +20 EXP 🌟');
  };

  // Override actions
  const handleOpenEditSlot = (dayKey: DayOfWeek, period: number) => {
    setEditingSlot({ dayKey, period });
  };

  const handleSaveSlotOverride = (overrideData: {
    subject: string;
    status: ChangeStatus;
    room?: string;
    note?: string;
    changeReason?: string;
  }) => {
    if (!editingSlot) return;

    const { dayKey, period } = editingSlot;
    const slotKey = getSlotKey(dayKey, period);
    const originalSlot = baseSchedule[slotKey];

    const newOverride: OverrideLessonSlot = {
      subject: overrideData.subject,
      status: overrideData.status,
      room: overrideData.room,
      note: overrideData.note,
      changeReason: overrideData.changeReason,
      isOverridden: true,
      originalSubject: originalSlot?.subject,
      originalRoom: originalSlot?.room,
      overrideTimestamp: Date.now(),
    };

    setWeeklyOverrides(prev => ({
      ...prev,
      [currentWeekKey]: {
        ...(prev[currentWeekKey] || {}),
        [slotKey]: newOverride,
      },
    }));

    showToast(`Đã lưu thay đổi cho ${weekTitle}! Các tuần khác vẫn giữ nguyên.`);
  };

  const handleRemoveSlotOverride = (slotKeyToRemove?: string) => {
    const key = slotKeyToRemove || (editingSlot ? getSlotKey(editingSlot.dayKey, editingSlot.period) : null);
    if (!key) return;

    setWeeklyOverrides(prev => {
      const currentWeek = { ...(prev[currentWeekKey] || {}) };
      delete currentWeek[key];
      return {
        ...prev,
        [currentWeekKey]: currentWeek,
      };
    });

    showToast(`Đã khôi phục lại môn học gốc cho ${weekTitle}.`);
  };

  const handleResetAllThisWeek = () => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy tất cả các tiết đổi của ${weekTitle} và trở về lịch học gốc?`)) {
      setWeeklyOverrides(prev => {
        const next = { ...prev };
        delete next[currentWeekKey];
        delete next[`week_${currentWeekNumber}`];
        return next;
      });
      showToast(`Đã đưa ${weekTitle} về hoàn toàn theo lịch gốc!`);
    }
  };

  // Base schedule actions
  const handleUpdateBaseSlot = (slotKey: string, newSlot: LessonSlot | null) => {
    setBaseSchedule(prev => {
      const updated = { ...prev };
      if (newSlot && newSlot.subject.trim()) {
        updated[slotKey] = newSlot;
      } else {
        delete updated[slotKey];
      }
      return updated;
    });
    showToast('Đã cập nhật thời khóa biểu gốc.');
  };

  const handleResetToSampleBase = () => {
    if (window.confirm('Khôi phục toàn bộ thời khóa biểu gốc về mẫu chuẩn?')) {
      setBaseSchedule(DEFAULT_BASE_SCHEDULE);
      showToast('Đã khôi phục thời khóa biểu gốc.');
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${currentTheme.bodyBg} text-slate-800 transition-colors duration-500 pb-12 relative overflow-x-hidden`}>
      {/* Dynamic Theme Background Illustration Layer */}
      <ThemeBackground themeId={currentTheme.id} />

      {/* Top Header */}
      <Header
        weekTitle={weekTitle}
        onOpenEditWeekModal={() => setIsEditWeekModalOpen(true)}
        dateRangeText={dateRangeText}
        theme={currentTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        changedCountThisWeek={changedCountThisWeek}
        onResetThisWeek={handleResetAllThisWeek}
        onPrint={handlePrint}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3.5">
        {/* Dynamic View rendering */}
        {activeView === 'weekly' && (
          <>
            {/* Today Quick Widget with 2 Distinct Rows */}
            <TodayCard
              currentDayKey={currentDayKey}
              baseSchedule={baseSchedule}
              currentWeekOverrides={currentWeekOverrides}
              todayDateStr={todayDateStr}
              theme={currentTheme}
              onSlotClick={handleOpenEditSlot}
              completedSlotsToday={progress.completedSlotsToday}
              onToggleSlotCompleted={handleToggleSlotCompleted}
            />

            {/* Compact Timetable Table Grid */}
            <div className={`bg-white/94 backdrop-blur-md rounded-2xl border ${currentTheme.containerBorder} shadow-xs p-3.5 sm:p-4 mb-4 transition-all duration-300`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    Bảng Thời Khóa Biểu {weekTitle}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Bấm trực tiếp vào ô môn học để đổi môn tuần này • Khung tiết được thu nhỏ vừa vặn
                  </p>
                </div>
              </div>

              <TimetableGrid
                currentWeekNumber={currentWeekNumber}
                baseSchedule={baseSchedule}
                currentWeekOverrides={currentWeekOverrides}
                daysMap={daysMap}
                showWeekend={false}
                theme={currentTheme}
                onSlotClick={handleOpenEditSlot}
              />
            </div>
          </>
        )}

        {activeView === 'base' && (
          <BaseScheduleManager
            baseSchedule={baseSchedule}
            onUpdateBaseSlot={handleUpdateBaseSlot}
            onResetToSampleBase={handleResetToSampleBase}
            subjectPresets={DEFAULT_SUBJECTS}
            theme={currentTheme}
          />
        )}
      </main>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <EditSlotModal
          isOpen={!!editingSlot}
          onClose={() => setEditingSlot(null)}
          dayKey={editingSlot.dayKey}
          period={editingSlot.period}
          weekNumber={currentWeekNumber}
          weekTitle={weekTitle}
          baseSlot={baseSchedule[getSlotKey(editingSlot.dayKey, editingSlot.period)]}
          currentOverride={currentWeekOverrides[getSlotKey(editingSlot.dayKey, editingSlot.period)]}
          onSaveOverride={handleSaveSlotOverride}
          onRemoveOverride={() => handleRemoveSlotOverride()}
          subjectPresets={DEFAULT_SUBJECTS}
        />
      )}

      {/* Edit Week & Date Modal */}
      <EditWeekModal
        isOpen={isEditWeekModalOpen}
        onClose={() => setIsEditWeekModalOpen(false)}
        currentTitle={weekTitle}
        currentStartDate={weekStartDate}
        currentCustomDateRange={customDateRange}
        onSave={(newTitle, newStartDate, newCustomRange) => {
          setWeekTitle(newTitle);
          setWeekStartDate(newStartDate);
          setCustomDateRange(newCustomRange);
          showToast(`Đã lưu "${newTitle}"!`);
        }}
        theme={currentTheme}
      />

      {/* Theme Picker Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={themeId}
        onSelectTheme={(id) => {
          setThemeId(id);
          showToast(`Đã áp dụng giao diện: ${getThemeById(id).name}`);
        }}
      />

      {/* Print & Export Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        weekTitle={weekTitle}
        dateRangeText={dateRangeText}
        baseSchedule={baseSchedule}
        currentWeekOverrides={currentWeekOverrides}
      />

      {/* PWA / Pin to Mobile Screen Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        theme={currentTheme}
      />

      {/* Floating Quick Action Pill for Mobile Screen Pin & Custom Icon */}
      {!isStandalone && !isQuickBannerDismissed && (
        <aside 
          aria-label="Ghim ra màn hình chính & đổi icon"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-amber-400/50 flex items-center justify-between gap-2.5 ring-1 ring-white/10">
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center text-xl font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                📱
              </div>
              <div className="truncate">
                <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span>Ghim Màn Hình & Đổi Icon</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">Tiện ích</span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  Bấm để chọn icon đẹp & ghim ra điện thoại
                </div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                Mở Ngay
              </button>
              <button
                onClick={() => setIsQuickBannerDismissed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Đóng thanh thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="app-toast-feedback"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
