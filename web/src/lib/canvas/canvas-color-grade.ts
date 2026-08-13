// LUT 调色能力：预设 + 手动参数，编译为 CSS filter，用于图片/视频节点的非破坏性调色。

export type CanvasColorGradeSettings = {
    /** 亮度倍率，0.5 - 1.5，默认 1 */
    brightness: number;
    /** 对比度倍率，0.5 - 1.5，默认 1 */
    contrast: number;
    /** 饱和度倍率，0 - 2，默认 1 */
    saturation: number;
    /** 色温 -1(冷) 到 1(暖)，0 为原色温 */
    temperature: number;
    /** 灰度 0 - 1，1 为完全黑白 */
    grayscale: number;
};

export const DEFAULT_COLOR_GRADE_SETTINGS: CanvasColorGradeSettings = {
    brightness: 1,
    contrast: 1,
    saturation: 1,
    temperature: 0,
    grayscale: 0,
};

export type ColorGradePreset = {
    id: string;
    name: string;
    description: string;
    settings: CanvasColorGradeSettings;
};

export const COLOR_GRADE_PRESETS: ColorGradePreset[] = [
    { id: "original", name: "原片", description: "无任何调整", settings: { ...DEFAULT_COLOR_GRADE_SETTINGS } },
    { id: "cinema", name: "电影感", description: "拉高对比与饱和，轻微暖调", settings: { brightness: 1, contrast: 1.14, saturation: 1.16, temperature: 0.12, grayscale: 0 } },
    { id: "sunny", name: "日系清新", description: "提亮低饱和，轻微冷调", settings: { brightness: 1.08, contrast: 0.96, saturation: 0.88, temperature: -0.14, grayscale: 0 } },
    { id: "film", name: "复古胶片", description: "暖色低饱和的胶片质感", settings: { brightness: 1.02, contrast: 1.06, saturation: 0.82, temperature: 0.3, grayscale: 0 } },
    { id: "mono", name: "黑白", description: "去色并增强对比", settings: { brightness: 1, contrast: 1.12, saturation: 0, temperature: 0, grayscale: 1 } },
    { id: "cyber", name: "赛博霓虹", description: "高对比高饱和的冷色霓虹", settings: { brightness: 1, contrast: 1.22, saturation: 1.36, temperature: -0.28, grayscale: 0 } },
    { id: "warm", name: "暖阳", description: "提亮并强化暖色氛围", settings: { brightness: 1.05, contrast: 1.02, saturation: 1.12, temperature: 0.45, grayscale: 0 } },
    { id: "cool", name: "冷调", description: "偏冷的青蓝基调", settings: { brightness: 1, contrast: 1.04, saturation: 1.06, temperature: -0.4, grayscale: 0 } },
    { id: "fade", name: "低饱和胶片", description: "柔和低饱和的做旧感", settings: { brightness: 1.05, contrast: 0.94, saturation: 0.68, temperature: 0.15, grayscale: 0 } },
];

export function isDefaultColorGradeSettings(settings: CanvasColorGradeSettings) {
    return settings.brightness === 1 && settings.contrast === 1 && settings.saturation === 1 && settings.temperature === 0 && settings.grayscale === 0;
}

/** 将调色参数编译为 CSS filter 字符串；无调整时返回空字符串，避免产生无意义样式。 */
export function buildColorGradeFilter(settings: CanvasColorGradeSettings): string {
    const parts: string[] = [];
    if (settings.brightness !== 1) parts.push(`brightness(${settings.brightness})`);
    if (settings.contrast !== 1) parts.push(`contrast(${settings.contrast})`);
    if (settings.saturation !== 1) parts.push(`saturate(${settings.saturation})`);
    if (settings.grayscale > 0) parts.push(`grayscale(${settings.grayscale})`);
    // 色温用 sepia + hue-rotate 近似：暖色向红橙偏移，冷色向蓝青偏移。
    if (settings.temperature !== 0) {
        parts.push(`sepia(${0.12 + Math.abs(settings.temperature) * 0.28})`);
        parts.push(`hue-rotate(${(-settings.temperature * 24).toFixed(2)}deg)`);
    }
    return parts.join(" ");
}

export function findColorGradePreset(presetId?: string) {
    return COLOR_GRADE_PRESETS.find((preset) => preset.id === presetId) || null;
}

export function clampColorGradeSettings(settings: CanvasColorGradeSettings): CanvasColorGradeSettings {
    return {
        brightness: clampNumber(settings.brightness, 0.5, 1.5),
        contrast: clampNumber(settings.contrast, 0.5, 1.5),
        saturation: clampNumber(settings.saturation, 0, 2),
        temperature: clampNumber(settings.temperature, -1, 1),
        grayscale: clampNumber(settings.grayscale, 0, 1),
    };
}

function clampNumber(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
