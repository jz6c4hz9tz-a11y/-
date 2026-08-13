import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Slider } from "antd";
import { Check, Palette, RotateCcw } from "lucide-react";

import { canvasThemes } from "@/lib/canvas-theme";
import { buildColorGradeFilter, clampColorGradeSettings, COLOR_GRADE_PRESETS, DEFAULT_COLOR_GRADE_SETTINGS, isDefaultColorGradeSettings, type CanvasColorGradeSettings } from "@/lib/canvas/canvas-color-grade";
import { useThemeStore } from "@/stores/use-theme-store";
import { CanvasNodeType, type CanvasNodeData } from "@/types/canvas";
import { useNodeResourceUrl } from "./canvas-node";

type CanvasColorGradeDialogProps = {
    node: CanvasNodeData;
    open: boolean;
    onClose: () => void;
    onConfirm: (settings: CanvasColorGradeSettings, presetId?: string) => void;
};

const sliderStep = 0.01;

export function CanvasColorGradeDialog({ node, open, onClose, onConfirm }: CanvasColorGradeDialogProps) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const isVideo = node.type === CanvasNodeType.Video;
    const { url, loading } = useNodeResourceUrl(node, true);
    const initial = node.metadata?.colorGrade?.settings || DEFAULT_COLOR_GRADE_SETTINGS;
    const [draft, setDraft] = useState<CanvasColorGradeSettings>(initial);
    const [presetId, setPresetId] = useState<string | undefined>(node.metadata?.colorGrade?.presetId);

    // 每次打开或切换节点时，以节点当前调色状态重建草稿。
    useEffect(() => {
        if (!open) return;
        const current = node.metadata?.colorGrade?.settings || DEFAULT_COLOR_GRADE_SETTINGS;
        setDraft({ ...current });
        setPresetId(node.metadata?.colorGrade?.presetId);
    }, [node.id, node.metadata?.colorGrade?.presetId, open]);

    const filter = useMemo(() => buildColorGradeFilter(draft), [draft]);
    const isOriginal = isDefaultColorGradeSettings(draft);

    const updateDraft = (partial: Partial<CanvasColorGradeSettings>) => {
        setDraft((current) => ({ ...current, ...partial }));
        setPresetId(undefined);
    };

    const selectPreset = (id: string) => {
        const preset = COLOR_GRADE_PRESETS.find((item) => item.id === id);
        if (!preset) return;
        setDraft({ ...preset.settings });
        setPresetId(id);
    };

    const resetDraft = () => {
        setDraft({ ...DEFAULT_COLOR_GRADE_SETTINGS });
        setPresetId("original");
    };

    const confirm = () => {
        onConfirm(clampColorGradeSettings(draft), presetId);
        onClose();
    };

    return (
        <Modal title={<span className="inline-flex items-center gap-2"><Palette className="size-4" />调色</span>} open={open} onCancel={onClose} width={880} centered destroyOnHidden footer={null}>
            <div className="flex flex-col gap-4 md:flex-row">
                {/* 左侧实时预览 */}
                <div className="relative flex min-h-72 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black" style={{ borderColor: theme.toolbar.border }}>
                    {loading ? (
                        <span className="text-xs" style={{ color: theme.node.muted }}>正在加载媒体…</span>
                    ) : isVideo ? (
                        <video src={url} autoPlay muted loop playsInline controls={false} className="h-full max-h-72 w-full object-contain" style={{ filter }} />
                    ) : (
                        <img src={url} alt={node.title} className="max-h-72 w-full object-contain" style={{ filter }} draggable={false} />
                    )}
                    {isOriginal ? null : (
                        <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur" style={{ background: `${theme.accent.primary}1f`, color: theme.accent.primary, border: `1px solid ${theme.accent.primary}40` }}>
                            已应用调色
                        </span>
                    )}
                </div>

                {/* 右侧：预设 + 手动参数 */}
                <div className="flex w-full shrink-0 flex-col gap-4 md:w-72">
                    <div>
                        <div className="mb-2 text-xs font-semibold" style={{ color: theme.node.text }}>预设滤镜</div>
                        <div className="grid grid-cols-3 gap-2">
                            {COLOR_GRADE_PRESETS.map((preset) => {
                                const active = preset.id === presetId;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        title={preset.description}
                                        className="flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition hover:brightness-110 focus-visible:outline focus-visible:outline-2"
                                        style={{
                                            background: active ? `${theme.accent.primary}14` : theme.toolbar.panel,
                                            borderColor: active ? theme.accent.primary : theme.toolbar.border,
                                            color: active ? theme.accent.primary : theme.node.text,
                                            outlineColor: theme.accent.primary,
                                        }}
                                        onClick={() => selectPreset(preset.id)}
                                    >
                                        {active ? <Check className="size-3" /> : <Palette className="size-3 opacity-60" />}
                                        {preset.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="text-xs font-semibold" style={{ color: theme.node.text }}>手动调节</div>
                        <SliderRow label="亮度" min={0.5} max={1.5} value={draft.brightness} onChange={(value) => updateDraft({ brightness: value })} />
                        <SliderRow label="对比度" min={0.5} max={1.5} value={draft.contrast} onChange={(value) => updateDraft({ contrast: value })} />
                        <SliderRow label="饱和度" min={0} max={2} value={draft.saturation} onChange={(value) => updateDraft({ saturation: value })} />
                        <SliderRow label="色温" min={-1} max={1} value={draft.temperature} tips={["冷", "暖"]} onChange={(value) => updateDraft({ temperature: value })} />
                        <SliderRow label="灰度" min={0} max={1} value={draft.grayscale} tips={["彩色", "黑白"]} onChange={(value) => updateDraft({ grayscale: value })} />
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: theme.toolbar.border }}>
                        <Button icon={<RotateCcw className="size-3.5" />} onClick={resetDraft}>重置</Button>
                        <div className="flex gap-2">
                            <Button onClick={onClose}>取消</Button>
                            <Button type="primary" onClick={confirm} style={{ background: theme.accent.primary }}>应用调色</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function SliderRow({ label, min, max, value, tips, onChange }: { label: string; min: number; max: number; value: number; tips?: [string, string]; onChange: (value: number) => void }) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: theme.node.muted }}>
                <span>{label}</span>
                <span className="tabular-nums">{value.toFixed(2)}</span>
            </div>
            <Slider min={min} max={max} step={sliderStep} value={value} onChange={onChange} tooltip={{ formatter: (next) => Number(next).toFixed(2) }} />
            {tips ? (
                <div className="-mt-1 flex justify-between text-[var(--fs-tiny)]" style={{ color: theme.node.muted }}>
                    <span>{tips[0]}</span>
                    <span>{tips[1]}</span>
                </div>
            ) : null}
        </div>
    );
}
