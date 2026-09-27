export interface AppIconConfig {
  id: string;
  name: string;
  category: 'study' | 'cute' | 'gaming' | 'aesthetic' | 'custom';
  emoji: string;
  title: string;
  subtitle?: string;
  gradientColors: [string, string]; // [start, end]
  customImageUrl?: string;
}

export const PRESET_ICONS: AppIconConfig[] = [
  {
    id: 'navy_graduate',
    name: 'Học Bá Thủ Khoa',
    category: 'study',
    emoji: '🎓',
    title: 'TKB',
    subtitle: 'Học Bá',
    gradientColors: ['#1e3a8a', '#0f172a'],
  },
  {
    id: 'cyan_study',
    name: 'Sách Vở Công Nghệ',
    category: 'study',
    emoji: '📚',
    title: 'TKB',
    subtitle: 'Smart',
    gradientColors: ['#0284c7', '#0369a1'],
  },
  {
    id: 'gold_star',
    name: 'Ngôi Sao Tinh Anh',
    category: 'study',
    emoji: '⭐',
    title: 'TKB',
    subtitle: 'Top 1',
    gradientColors: ['#d97706', '#78350f'],
  },
  {
    id: 'kawaii_neko',
    name: 'Mèo Chibi May Mắn',
    category: 'cute',
    emoji: '🐱',
    title: 'TKB',
    subtitle: 'Neko',
    gradientColors: ['#fb923c', '#db2777'],
  },
  {
    id: 'sakura_pastel',
    name: 'Hoa Anh Đào Anime',
    category: 'aesthetic',
    emoji: '🌸',
    title: 'TKB',
    subtitle: 'Sakura',
    gradientColors: ['#f472b6', '#ec4899'],
  },
  {
    id: 'cyber_gamer',
    name: 'Cyberpunk Game Thủ',
    category: 'gaming',
    emoji: '🎮',
    title: 'TKB',
    subtitle: 'Gamer',
    gradientColors: ['#8b5cf6', '#4c1d95'],
  },
  {
    id: 'space_rocket',
    name: 'Tên Lửa Khát Vọng',
    category: 'aesthetic',
    emoji: '🚀',
    title: 'TKB',
    subtitle: 'Future',
    gradientColors: ['#3b82f6', '#1d4ed8'],
  },
  {
    id: 'bear_chibi',
    name: 'Gấu Trúc Đáng Yêu',
    category: 'cute',
    emoji: '🐼',
    title: 'TKB',
    subtitle: 'Panda',
    gradientColors: ['#10b981', '#065f46'],
  },
  {
    id: 'music_chill',
    name: 'Tai Nghe Lofi Chill',
    category: 'aesthetic',
    emoji: '🎧',
    title: 'TKB',
    subtitle: 'Chill',
    gradientColors: ['#a855f7', '#6366f1'],
  },
  {
    id: 'champion_fire',
    name: 'Ngọn Lửa Quyết Tâm',
    category: 'gaming',
    emoji: '🔥',
    title: 'TKB',
    subtitle: 'Win',
    gradientColors: ['#ea580c', '#b91c1c'],
  },
];

export const GRADIENT_PRESETS: { name: string; colors: [string, string] }[] = [
  { name: 'Xanh Navy Hoàng Gia', colors: ['#1e3a8a', '#0f172a'] },
  { name: 'Xanh Biển Năng Động', colors: ['#0284c7', '#0369a1'] },
  { name: 'Hồng Sakura Ngọt Ngào', colors: ['#f472b6', '#ec4899'] },
  { name: 'Tím Cyberpunk Huyền Ảo', colors: ['#8b5cf6', '#4c1d95'] },
  { name: 'Cam Đào Tươi Sáng', colors: ['#fb923c', '#ea580c'] },
  { name: 'Xanh Ngọc Lục Bảo', colors: ['#10b981', '#047857'] },
  { name: 'Đen Vàng Sang Trọng', colors: ['#292524', '#0c0a09'] },
];

export const EMOJI_PRESETS = [
  '🎓', '📚', '🐱', '🌸', '🎮', '🚀', '⭐', '🐼', 
  '🎧', '🔥', '🦄', '🐶', '⚽', '🎨', '💡', '💎',
  '🍀', '🏆', '🎯', '⚡', '☕', '🪐', '🧸', '✨'
];

const STORAGE_ICON_KEY = 'tkb_custom_app_icon_v2';

/**
 * Render a high quality 512x512 PNG app icon using canvas
 */
export async function generateIconDataUrl(config: AppIconConfig, size = 512): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // If custom image is uploaded
    if (config.customImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // Aspect fit / cover
        const imgRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;
        let drawX = 0;
        let drawY = 0;

        if (imgRatio > 1) {
          drawWidth = size * imgRatio;
          drawX = (size - drawWidth) / 2;
        } else {
          drawHeight = size / imgRatio;
          drawY = (size - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Optional badge overlay at bottom
        if (config.title) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(0, size * 0.8, size, size * 0.2);
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(size * 0.09)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(config.title, size / 2, size * 0.9);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        // fallback to default
        resolve(drawPresetOnCanvas(ctx, config, size));
      };
      img.src = config.customImageUrl;
    } else {
      resolve(drawPresetOnCanvas(ctx, config, size));
    }
  });
}

function drawPresetOnCanvas(ctx: CanvasRenderingContext2D, config: AppIconConfig, size: number): string {
  // 1. Draw rounded/smooth gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, config.gradientColors[0]);
  gradient.addColorStop(1, config.gradientColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // 2. Draw subtle inner glow / sheen
  const sheen = ctx.createLinearGradient(0, 0, 0, size * 0.55);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size * 0.55);

  // 3. Central glowing circle for mascot
  const circleGrad = ctx.createRadialGradient(
    size / 2, size * 0.42, 10,
    size / 2, size * 0.42, size * 0.35
  );
  circleGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  circleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.42, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // 4. Draw Emoji Icon
  ctx.font = `${Math.round(size * 0.44)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Shadow for emoji
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = Math.round(size * 0.05);
  ctx.shadowOffsetY = Math.round(size * 0.02);
  ctx.fillText(config.emoji, size / 2, size * 0.42);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 5. Bottom banner pill with title and subtitle
  const bannerY = size * 0.77;
  const bannerHeight = size * 0.16;
  const bannerWidth = size * 0.76;
  const bannerX = (size - bannerWidth) / 2;
  const radius = bannerHeight / 2;

  // Pill background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, radius);
  ctx.fill();

  // Pill border
  ctx.lineWidth = Math.max(2, Math.round(size * 0.008));
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.stroke();

  // Pill Text
  ctx.fillStyle = config.gradientColors[0];
  ctx.font = `900 ${Math.round(size * 0.075)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textToShow = config.subtitle ? `${config.title} • ${config.subtitle}` : config.title;
  ctx.fillText(textToShow, size / 2, bannerY + bannerHeight / 2);

  return ctx.canvas.toDataURL('image/png');
}

/**
 * Apply the icon data URL to <link rel="apple-touch-icon">, <link rel="icon">,
 * and dynamically recreate Web App Manifest Blob URL.
 */
export function applyAppIconToBrowser(iconDataUrl: string, appName = 'Thời Khóa Biểu') {
  if (!iconDataUrl || typeof document === 'undefined') return;

  try {
    // 1. Apple Touch Icon (used by iOS Safari when adding to Home Screen)
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', iconDataUrl);

    // 2. Standard Favicon
    let favicon = document.querySelector('link[rel="icon"][type="image/png"]') as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/png');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', iconDataUrl);

    // 3. Dynamic Web App Manifest with custom icon
    const dynamicManifest = {
      id: window.location.pathname || '/',
      name: appName,
      short_name: 'TKB Smart',
      description: 'Thời khóa biểu học tập thông minh linh hoạt theo tuần',
      start_url: window.location.href,
      scope: window.location.pathname || '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      theme_color: '#1d4ed8',
      background_color: '#ffffff',
      icons: [
        {
          src: iconDataUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: iconDataUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: iconDataUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestUrl);
  } catch (err) {
    console.error('Failed to apply app icon to browser:', err);
  }
}

/**
 * Save icon configuration to localStorage
 */
export function saveStoredIconConfig(config: AppIconConfig, dataUrl: string) {
  try {
    localStorage.setItem(STORAGE_ICON_KEY, JSON.stringify({ config, dataUrl }));
  } catch (e) {
    console.warn('Could not save custom icon to localStorage:', e);
  }
}

/**
 * Load saved icon configuration from localStorage
 */
export function loadStoredIconConfig(): { config: AppIconConfig; dataUrl: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_ICON_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Trigger download of the generated icon as PNG file for saving to phone Photos/Gallery
 */
export function downloadIconImage(dataUrl: string, filename = 'tkb-app-icon.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
