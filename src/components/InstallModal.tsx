import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Download, 
  Check, 
  Copy, 
  Monitor, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Palette,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppTheme } from '../types/timetable';
import { 
  AppIconConfig, 
  PRESET_ICONS, 
  GRADIENT_PRESETS, 
  EMOJI_PRESETS,
  generateIconDataUrl,
  applyAppIconToBrowser,
  saveStoredIconConfig,
  loadStoredIconConfig,
  downloadIconImage 
} from '../utils/appIconManager';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, theme }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  
  // Navigation tabs: 'icon_customizer' or 'install_guide'
  const [mainTab, setMainTab] = useState<'icon_customizer' | 'install_guide'>('icon_customizer');

  // OS guide switcher
  const [activeOsTab, setActiveOsTab] = useState<'ios' | 'android' | 'shortcuts' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'ios';
  });

  // Icon customizer states
  const [selectedPresetId, setSelectedPresetId] = useState<string>('navy_graduate');
  const [activeIconConfig, setActiveIconConfig] = useState<AppIconConfig>(() => {
    const saved = loadStoredIconConfig();
    if (saved) return saved.config;
    return PRESET_ICONS[0];
  });

  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [customEmoji, setCustomEmoji] = useState('🎓');
  const [customTitle, setCustomTitle] = useState('TKB');
  const [customSubtitle, setCustomSubtitle] = useState('Smart');
  const [customGradient, setCustomGradient] = useState<[string, string]>(['#1e3a8a', '#0f172a']);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview data URL whenever active icon config changes
  useEffect(() => {
    let isCancelled = false;
    generateIconDataUrl(activeIconConfig).then((url) => {
      if (!isCancelled) {
        setPreviewDataUrl(url);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [activeIconConfig]);

  // Initial load check
  useEffect(() => {
    const saved = loadStoredIconConfig();
    if (saved) {
      setActiveIconConfig(saved.config);
      setSelectedPresetId(saved.config.id);
      applyAppIconToBrowser(saved.dataUrl);
    }
  }, []);

  if (!isOpen) return null;

  const directAppUrl = 'https://ais-pre-q72b4w7e7zd7kequdvnbe4-618213029376.asia-southeast1.run.app';
  const isInIframe = typeof window !== 'undefined' && (window.self !== window.top || window.location.hostname.includes('aistudio.google.com'));

  const handleSelectPreset = (preset: AppIconConfig) => {
    setIsCustomMode(false);
    setSelectedPresetId(preset.id);
    setActiveIconConfig(preset);
  };

  const handleCustomEmojiChange = (emoji: string) => {
    setCustomEmoji(emoji);
    setIsCustomMode(true);
    setSelectedPresetId('custom_emoji');
    const newConfig: AppIconConfig = {
      id: 'custom_emoji',
      name: 'Icon Tự Chọn',
      category: 'custom',
      emoji,
      title: customTitle,
      subtitle: customSubtitle,
      gradientColors: customGradient,
    };
    setActiveIconConfig(newConfig);
  };

  const handleCustomGradientChange = (gradient: [string, string]) => {
    setCustomGradient(gradient);
    setIsCustomMode(true);
    setSelectedPresetId('custom_emoji');
    const newConfig: AppIconConfig = {
      id: 'custom_emoji',
      name: 'Icon Tự Chọn',
      category: 'custom',
      emoji: customEmoji,
      title: customTitle,
      subtitle: customSubtitle,
      gradientColors: gradient,
    };
    setActiveIconConfig(newConfig);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setIsCustomMode(true);
        setSelectedPresetId('custom_upload');
        const newConfig: AppIconConfig = {
          id: 'custom_upload',
          name: 'Ảnh Tải Lên',
          category: 'custom',
          emoji: '🖼️',
          title: customTitle,
          gradientColors: ['#0f172a', '#1e293b'],
          customImageUrl: dataUrl,
        };
        setActiveIconConfig(newConfig);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyIcon = async () => {
    const dataUrl = await generateIconDataUrl(activeIconConfig);
    applyAppIconToBrowser(dataUrl);
    saveStoredIconConfig(activeIconConfig, dataUrl);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const handleDownloadIcon = async () => {
    const dataUrl = await generateIconDataUrl(activeIconConfig);
    downloadIconImage(dataUrl, `tkb-${activeIconConfig.id}.png`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenDirectUrl = () => {
    window.open(directAppUrl, '_blank');
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${theme.headerGradient} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">
                Ghim App & Tùy Biến Icon Điện Thoại
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Chọn icon bạn thích rồi ghim ra màn hình chính để dùng ngay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Iframe Notice for users previewing inside AI Studio */}
        {isInIframe && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý cho điện thoại Android:</strong> Bạn đang mở app qua trang quản lý <code>aistudio.google.com</code>. Để Chrome nhận diện đúng <strong>Thời Khóa Biểu</strong> (thay vì logo AI Studio), bạn hãy mở link trực tiếp bên cạnh!
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOpenDirectUrl}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở Link Trực Tiếp</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Đã chép!' : 'Chép link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary View Switcher: Icon Customizer vs Step Guide */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-black">
          <button
            onClick={() => setMainTab('icon_customizer')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              mainTab === 'icon_customizer'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4 text-blue-600" />
            <span>1. Chọn & Đổi Icon App</span>
          </button>
          <button
            onClick={() => setMainTab('install_guide')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              mainTab === 'install_guide'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>2. Cách Ghim Màn Hình</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* TAB 1: ICON CUSTOMIZER */}
          {mainTab === 'icon_customizer' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Phone Screen Mockup Preview */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl text-white shadow-inner border border-slate-700">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Xem trước Icon trên Màn Hình Điện Thoại:
                  </span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                    {activeIconConfig.name}
                  </span>
                </div>

                {/* Simulated Phone Screen Strip */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 py-2">
                  {/* Surrounding App 1 (Example) */}
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-xl shadow-lg border border-white/20">
                      <span>📞</span>
                    </div>
                    <span className="text-[11px] mt-1.5 font-medium text-slate-300">Điện thoại</span>
                  </div>

                  {/* ACTIVE APP ICON (HIGHLIGHTED) */}
                  <div className="flex flex-col items-center scale-105 transition-all">
                    <div className="relative group">
                      {/* Glow ring */}
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 rounded-3xl blur-xs opacity-75 animate-pulse"></div>
                      
                      {/* Icon preview image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 bg-slate-900 flex items-center justify-center">
                        {previewDataUrl ? (
                          <img 
                            src={previewDataUrl} 
                            alt="Preview Icon" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-3xl">{activeIconConfig.emoji}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs mt-2 font-bold text-white tracking-wide flex items-center gap-1">
                      <span>Thời Khóa Biểu</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </span>
                  </div>

                  {/* Surrounding App 2 (Example) */}
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center text-xl shadow-lg border border-white/20">
                      <span>📷</span>
                    </div>
                    <span className="text-[11px] mt-1.5 font-medium text-slate-300">Máy ảnh</span>
                  </div>
                </div>

                {/* Apply Button & Feedback inside card */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-300">
                    Bấm áp dụng để Safari & Chrome nhận diện icon này khi ghim:
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadIcon}
                      className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Lưu ảnh icon vào máy để dùng phím tắt iOS"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Lưu Ảnh</span>
                    </button>
                    <button
                      onClick={handleApplyIcon}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer active:scale-95"
                    >
                      {appliedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>Đã Áp Dụng Thành Công!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Áp Dụng Icon Này</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Icon Presets Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-blue-600" />
                    Bộ Sưu Tập Icon Đẹp Có Sẵn:
                  </h4>
                  <span className="text-[11px] text-slate-500">Chạm để thử ngay</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_ICONS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div 
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-xs border border-white/30 text-white font-bold relative"
                          style={{
                            background: `linear-gradient(135deg, ${preset.gradientColors[0]}, ${preset.gradientColors[1]})`
                          }}
                        >
                          <span>{preset.emoji}</span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="w-full">
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1 block">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                            {preset.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Icon Maker: Emoji + Gradients or Upload Picture */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Tự Sáng Tạo Hoặc Tải Ảnh Riêng:
                  </h4>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh Từ Máy Lên</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {/* Emoji Selector */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                    1. Chọn biểu tượng Emoji yêu thích:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {EMOJI_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleCustomEmojiChange(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-slate-100 transition cursor-pointer ${
                          customEmoji === emoji && isCustomMode ? 'bg-blue-100 ring-2 ring-blue-500 scale-105' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Gradient Selector */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                    2. Chọn màu nền Gradient:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {GRADIENT_PRESETS.map((grad, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCustomGradientChange(grad.colors)}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                          customGradient[0] === grad.colors[0] && isCustomMode
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          className="w-5 h-5 rounded-md shrink-0 shadow-2xs"
                          style={{
                            background: `linear-gradient(135deg, ${grad.colors[0]}, ${grad.colors[1]})`
                          }}
                        />
                        <span className="text-[10px] font-semibold text-slate-700 truncate">
                          {grad.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next step prompt */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="text-xs text-blue-900">
                  <span className="font-bold">Đã ưng ý với icon?</span> Bấm sang bước 2 để xem cách ghim ra màn hình chính điện thoại.
                </div>
                <button
                  onClick={() => {
                    handleApplyIcon();
                    setMainTab('install_guide');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                >
                  <span>Xem Cách Ghim</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: STEP-BY-STEP INSTALL GUIDE */}
          {mainTab === 'install_guide' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Quick status if already installed */}
              {isInstalled ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold">Ứng dụng đã được ghim/cài đặt!</div>
                    <div className="text-emerald-700">Bạn đang sử dụng Thời Khóa Biểu ở chế độ ứng dụng độc lập trên màn hình chính.</div>
                  </div>
                </div>
              ) : isInstallable ? (
                /* Direct One-Click Install for Chrome/Android when prompt is ready */
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-center space-y-2.5">
                  <div className="text-xs font-bold text-emerald-950">
                    🎉 Trình duyệt của bạn hỗ trợ cài đặt app ngay chỉ với 1 chạm:
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Cài Đặt App Với Icon Vừa Chọn</span>
                  </button>
                </div>
              ) : null}

              {/* OS Switcher Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setActiveOsTab('ios')}
                  className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    activeOsTab === 'ios'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🍎 iPhone</span>
                </button>
                <button
                  onClick={() => setActiveOsTab('shortcuts')}
                  className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    activeOsTab === 'shortcuts'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Ảnh Tự Do</span>
                </button>
                <button
                  onClick={() => setActiveOsTab('android')}
                  className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    activeOsTab === 'android'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🤖 Android</span>
                </button>
                <button
                  onClick={() => setActiveOsTab('desktop')}
                  className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    activeOsTab === 'desktop'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Máy Tính</span>
                </button>
              </div>

              {/* 1. iOS Safari Standard (Cách 1) */}
              {activeOsTab === 'ios' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Lưu ý quan trọng:</strong> Vui lòng mở bằng trình duyệt <strong>Safari</strong> trên iPhone. Nếu đang mở từ Facebook/Zalo, hãy bấm <strong>...</strong> và chọn <em>"Mở bằng Safari"</em>.
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Bấm biểu tượng Chia Sẻ (Share)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Ở thanh công cụ dưới cùng của trình duyệt Safari, bấm icon hình vuông có mũi tên chỉ lên (<span className="inline-block px-1 py-0.2 bg-slate-200 rounded font-mono">⬆️</span>).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Chọn "Thêm vào MH chính" (Add to Home Screen)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Cuộn xuống dưới và bấm vào dòng có biểu tượng dấu cộng (<span className="font-semibold text-blue-700">➕ Thêm vào màn hình chính</span>).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Kiểm tra icon và bấm "Thêm" (Add)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Safari sẽ hiển thị trước hình icon bạn vừa chọn ở Tab 1. Bạn chỉ việc bấm <strong>"Thêm"</strong> ở góc trên bên phải là hoàn tất!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. iOS Shortcuts (Đổi hình ảnh tự do 100% bằng Phím tắt iPhone) */}
              {activeOsTab === 'shortcuts' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Mẹo độc quyền cho iPhone:</strong> Ứng dụng <strong>Phím tắt (Shortcuts)</strong> có sẵn trên iPhone cho phép bạn gán <strong>BẤT KỲ ẢNH NÀO</strong> trong Album ảnh để làm icon ứng dụng trên màn hình!
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Mở ứng dụng "Phím tắt" (Shortcuts) trên iPhone</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bấm dấu <strong>+</strong> ở góc trên bên phải để tạo phím tắt mới &gt; Chọn <strong>"Thêm tác vụ"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Tìm tác vụ "Mở URL" (Open URL)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tìm từ khóa <em>"Mở URL"</em> rồi dán link của app Thời Khóa Biểu này vào ô URL.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Chọn ảnh tùy thích từ Album ảnh</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Bấm nút Chia sẻ (ở dưới đáy) &gt; Chọn <strong>"Thêm vào Màn hình chính"</strong> &gt; Chạm vào ô icon nhỏ &gt; Chọn <strong>"Chọn ảnh"</strong> (chọn ảnh bạn đã tải về hoặc bất kỳ ảnh kỷ niệm/idol nào bạn thích)!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Android Guide */}
              {activeOsTab === 'android' && (
                <div className="space-y-3.5">
                  {/* Warning regarding the exact screenshot issue */}
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-950 space-y-1.5">
                    <div className="font-extrabold flex items-center gap-1.5 text-red-700">
                      <span>⚠️ Giải thích ảnh chụp màn hình của bạn:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Trên thanh địa chỉ Chrome của bạn hiện đang là <code>aistudio.google.com</code> (khung xem trước của AI Studio). Do đó khi bạn bấm 3 chấm &gt; <em>"Cài đặt và tạo lối tắt"</em>, Chrome đang tạo lối tắt cho trang <strong>AI Studio</strong> (nên có logo nhiều màu của AI Studio) chứ không phải app Thời Khóa Biểu.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={handleOpenDirectUrl}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Bấm Để Mở Link Trực Tiếp Ngoài Chrome</span>
                      </button>
                    </div>
                  </div>

                  {/* Why Chrome doesn't have an icon picker button */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-slate-900">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tại sao khi chọn "Tạo lối tắt", Chrome không cho chọn icon theo ý thích?</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Mặc định trên Android, bảng tạo lối tắt của Google Chrome chỉ cho phép đổi <strong>Tên</strong>, Chrome sẽ tự lấy icon của trang web chứ Google không làm nút chọn ảnh trong bảng của Chrome.
                    </p>
                  </div>

                  {/* 2 Ways to get the exact custom icon on Android */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2 Cách Để Đổi Icon Theo Ý Thích Trên Android:
                    </div>

                    {/* Method A: Standard PWA Install */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">A</span>
                        <span>Cách Tự Động: Mở Link Trực Tiếp & Cài Đặt (PWA)</span>
                      </div>
                      <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside pl-1">
                        <li>Bấm nút <strong>"Mở Link Trực Tiếp"</strong> ở trên để mở bằng một thẻ Chrome độc lập.</li>
                        <li>Ở <strong>Tab 1 (Chọn & Đổi Icon App)</strong> trong app, chọn mẫu icon bạn thích & bấm <strong>"Áp Dụng Icon Này"</strong>.</li>
                        <li>Bấm menu 3 chấm (⋮) của Chrome &gt; chọn <strong>"Cài đặt ứng dụng"</strong> (Install App). Ứng dụng sẽ ra màn hình chính với icon bạn vừa chọn!</li>
                      </ol>
                    </div>

                    {/* Method B: Using Shortcut Maker for 100% custom picture */}
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                      <div className="font-bold text-purple-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">B</span>
                        <span>Cách Đỉnh Nhất Cho Android: Chọn Bất Kỳ Ảnh Nào Từ Album</span>
                      </div>
                      <p className="text-[11px] text-purple-800">
                        Áp dụng hoàn hảo cho điện thoại <strong>Samsung Galaxy</strong> (như trong ảnh của bạn) và mọi máy Android:
                      </p>
                      <ol className="text-[11px] text-slate-700 space-y-1.5 list-decimal list-inside pl-1">
                        <li>
                          Vào <strong>CH Play</strong> tải ứng dụng miễn phí <strong>Shortcut Maker</strong> (hoặc <strong>X Icon Changer</strong>).
                        </li>
                        <li>
                          Mở app <strong>Shortcut Maker</strong> &gt; Chọn mục <strong>Websites</strong> (Trang web).
                        </li>
                        <li>
                          Đặt tên là <strong>Thời Khóa Biểu</strong> và dán link: <br/>
                          <span className="inline-block px-2 py-0.5 mt-0.5 bg-white rounded border border-purple-200 font-mono text-[10px] text-purple-700 select-all">
                            {directAppUrl}
                          </span>
                        </li>
                        <li>
                          Chạm vào ô <strong>Icon</strong> &gt; Chọn <strong>Gallery (Bộ sưu tập)</strong> &gt; Bạn có thể chọn bất kỳ ảnh nào từ thư viện máy (ảnh kỷ niệm, idol, mèo cưng, hoặc bấm nút "Lưu Ảnh" ở Tab 1).
                        </li>
                        <li>
                          Bấm <strong>Tạo Lối Tắt (Create Shortcut)</strong> &gt; Icon độc quyền của bạn sẽ xuất hiện ngay trên màn hình chính!
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Desktop Guide */}
              {activeOsTab === 'desktop' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-900">Cài đặt trên máy tính (Google Chrome / Edge / Cốc Cốc):</div>
                    <p className="text-[11px]">
                      1. Nhìn vào thanh địa chỉ URL ở trên cùng, phía bên phải có biểu tượng màn hình kèm dấu mũi tên xuống <strong>"Cài đặt ứng dụng"</strong> (hoặc bấm 3 chấm ⋮ &gt; <em>"Cài đặt Thời Khóa Biểu..."</em>).
                    </p>
                    <p className="text-[11px]">
                      2. Bấm <strong>Cài đặt</strong> để mở thành cửa sổ độc lập trên desktop máy tính.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                copiedLink 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Đã sao chép link app!' : 'Sao chép link gửi qua Safari/Chrome'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs transition cursor-pointer"
            >
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
