import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { App, Input, Modal } from "antd";
import { Compass, Focus, HelpCircle, MessageCircle } from "lucide-react";

import { subscribeCanvasViewportPreview } from "@/lib/canvas/canvas-live-viewport";

type CanvasZoomControlsProps = {
    scale: number;
    onScaleChange: (scale: number) => void;
    onReset: () => void;
    isMiniMapOpen: boolean;
    onToggleMiniMap: () => void;
    onOpenShortcuts: () => void;
    containerRef?: RefObject<HTMLDivElement | null>;
};

export function CanvasZoomControls({ scale, onScaleChange, onReset, isMiniMapOpen, onToggleMiniMap, onOpenShortcuts, containerRef }: CanvasZoomControlsProps) {
    const { message } = App.useApp();
    const rootRef = useRef<HTMLDivElement>(null);
    const liveScaleRef = useRef(scale);
    const rangeRef = useRef<HTMLInputElement>(null);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    useEffect(() => updateScaleDisplay(scale), [scale]);

    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;
        return subscribeCanvasViewportPreview(container, (viewport) => updateScaleDisplay(viewport.k));
    }, [containerRef]);

    function updateScaleDisplay(nextScale: number) {
        liveScaleRef.current = nextScale;
        const percent = String(Math.round(nextScale * 100));
        if (rangeRef.current) rangeRef.current.value = percent;
    }

    function commitScale(nextScale: number) {
        const clampedScale = Math.min(2, Math.max(0.05, nextScale));
        updateScaleDisplay(clampedScale);
        onScaleChange(clampedScale);
    }

    function submitFeedback() {
        const content = feedbackText.trim();
        if (!content) {
            message.warning("请先填写反馈内容");
            return;
        }
        const previous = localStorage.getItem("aix-canvas-feedback") || "[]";
        try {
            const list = JSON.parse(previous);
            list.push({ content, createdAt: new Date().toISOString() });
            localStorage.setItem("aix-canvas-feedback", JSON.stringify(list));
        } catch {
            localStorage.setItem("aix-canvas-feedback", JSON.stringify([{ content, createdAt: new Date().toISOString() }]));
        }
        message.success("感谢你的反馈");
        setFeedbackOpen(false);
        setFeedbackText("");
    }

    const zoomPercent = Math.round(liveScaleRef.current * 100);

    return (
        <div ref={rootRef} data-canvas-no-zoom className="relative z-[var(--z-toolbar)]" onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
            <div className="aix-bottom-toolbar flex items-center gap-2">
                <div className="aix-glass-pill flex h-10 items-center gap-1 rounded-2xl px-3">
                    <button type="button" className="aix-bottom-btn" title={isMiniMapOpen ? "关闭小地图" : "打开小地图"} aria-label={isMiniMapOpen ? "关闭小地图" : "打开小地图"} onClick={onToggleMiniMap}>
                        <Compass className="size-[22px]" strokeWidth={1.6} />
                    </button>
                    <button type="button" className="aix-bottom-btn" title="适应全部内容" aria-label="适应全部内容" onClick={onReset}>
                        <Focus className="size-[22px]" strokeWidth={1.6} />
                    </button>
                    <span className="aix-glass-divider" />
                    <input
                        ref={rangeRef}
                        type="range"
                        min="5"
                        max="200"
                        step="1"
                        defaultValue={Math.round(scale * 100)}
                        className="canvas-aix-zoom-range aix-zoom-slider"
                        style={{ "--zoom-pct": `${zoomPercent}%` } as CSSProperties}
                        onChange={(event) => commitScale(Number(event.target.value) / 100)}
                        aria-label="缩放画布"
                    />
                </div>
                <button type="button" className="aix-glass-pill aix-bottom-btn h-10 w-10 rounded-full" title="画布快捷键" aria-label="画布快捷键" onClick={onOpenShortcuts}>
                    <HelpCircle className="size-[22px]" strokeWidth={1.6} />
                </button>
                <button type="button" className="aix-glass-pill aix-bottom-btn h-10 w-10 rounded-full" title="意见反馈" aria-label="意见反馈" onClick={() => setFeedbackOpen(true)}>
                    <MessageCircle className="size-[22px]" strokeWidth={1.6} />
                </button>
            </div>

            <Modal title="意见反馈" open={feedbackOpen} onCancel={() => setFeedbackOpen(false)} onOk={submitFeedback} okText="提交" cancelText="取消">
                <Input.TextArea
                    value={feedbackText}
                    onChange={(event) => setFeedbackText(event.target.value)}
                    rows={5}
                    maxLength={512}
                    showCount
                    placeholder="告诉我们哪里可以做得更好"
                />
            </Modal>
        </div>
    );
}
