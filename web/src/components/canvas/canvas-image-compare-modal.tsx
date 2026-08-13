import { Button, Empty, Modal, Select } from "antd";
import { Images, LocateFixed, MoveHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";
import { CanvasNodeType, type CanvasNodeData } from "@/types/canvas";

export function CanvasImageCompareModal({ open, nodes, onClose, onFocus }: {
    open: boolean;
    nodes: CanvasNodeData[];
    onClose: () => void;
    onFocus: (nodeId: string) => void;
}) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const imageNodes = useMemo(() => nodes.filter((node) => node.type === CanvasNodeType.Image && Boolean(node.metadata?.content)), [nodes]);
    const options = imageNodes.map((node) => ({ value: node.id, label: node.title || "图片节点" }));
    const [leftId, setLeftId] = useState("");
    const [rightId, setRightId] = useState("");

    useEffect(() => {
        if (!open) return;
        const next = imageNodes.slice(0, 2);
        setLeftId(next[0]?.id || "");
        setRightId(next[1]?.id || next[0]?.id || "");
    }, [imageNodes, open]);

    const left = imageNodes.find((node) => node.id === leftId) || null;
    const right = imageNodes.find((node) => node.id === rightId) || null;

    return (
        <Modal title="图像对比" open={open} width={1040} centered onCancel={onClose} footer={null} styles={{ body: { overflow: "hidden", paddingTop: 8 } }}>
            <div className="flex flex-wrap items-center gap-3">
                <Select className="!min-w-56 flex-1" value={leftId || undefined} options={options} placeholder="选择左侧图片" onChange={setLeftId} />
                <span className="grid size-8 shrink-0 place-items-center rounded-md" style={{ background: theme.spatial.surface, color: theme.node.muted }}>
                    <MoveHorizontal className="size-4" />
                </span>
                <Select className="!min-w-56 flex-1" value={rightId || undefined} options={options} placeholder="选择右侧图片" onChange={setRightId} />
            </div>

            {imageNodes.length < 2 ? (
                <div className="grid place-items-center py-10">
                    <Empty
                        image={<span className="grid size-12 place-items-center rounded-xl" style={{ background: theme.spatial.surface, color: theme.node.muted }}><Images className="size-6" /></span>}
                        description="画布中至少需要两张图片节点"
                    />
                </div>
            ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ComparePane node={left} theme={theme} onFocus={onFocus} />
                    <ComparePane node={right} theme={theme} onFocus={onFocus} />
                </div>
            )}
        </Modal>
    );
}

function ComparePane({ node, theme, onFocus }: { node: CanvasNodeData | null; theme: (typeof canvasThemes)[keyof typeof canvasThemes]; onFocus: (nodeId: string) => void }) {
    if (!node) {
        return (
            <div className="grid min-h-72 place-items-center rounded-lg border" style={{ borderColor: theme.node.stroke, background: theme.node.panel, color: theme.node.muted }}>
                请选择图片
            </div>
        );
    }
    return (
        <figure className="overflow-hidden rounded-lg border" style={{ borderColor: theme.node.stroke, background: theme.node.panel }}>
            <figcaption className="flex h-11 items-center justify-between gap-3 border-b px-3" style={{ borderColor: theme.node.stroke }}>
                <span className="min-w-0 truncate text-sm font-medium" title={node.title}>{node.title}</span>
                <Button size="small" className="!h-7 !px-2.5" icon={<LocateFixed className="size-3" />} onClick={() => onFocus(node.id)}>
                    定位节点
                </Button>
            </figcaption>
            <div className="grid min-h-72 place-items-center overflow-hidden bg-black/5 p-2 dark:bg-white/[.03]">
                <img src={node.metadata?.content} alt={node.title || "图片对比"} className="max-h-[52vh] w-full object-contain" draggable={false} />
            </div>
        </figure>
    );
}
