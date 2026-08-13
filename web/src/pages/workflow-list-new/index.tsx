import { App, Button } from "antd";
import { AudioLines, Box, Clapperboard, Film, Image as ImageIcon, LoaderCircle, Maximize2, Minus, PanelLeft, PanelRight, Plus, Search, Sparkles, Type, Video, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { CanvasNodePromptPanel } from "@/components/canvas/canvas-node-prompt-panel";
import { InfiniteCanvas } from "@/components/canvas/infinite-canvas";
import { canvasThemes, type CanvasTheme } from "@/lib/canvas-theme";
import { QUICK_CREATION_TEMPLATES, type QuickCreationTemplate } from "@/lib/canvas/canvas-quick-creation";
import { createCanvasProjectWithRemoteSync } from "@/services/user-data-sync";
import { CanvasNodeType, type CanvasConnection, type CanvasNodeData, type ViewportTransform } from "@/types/canvas";

const CATEGORIES = ["全部", "商业", "影视", "修图", "工具"] as const;

export default function WorkFlowListNewPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = canvasThemes.dark;
    const [selectedId, setSelectedId] = useState(QUICK_CREATION_TEMPLATES[0].id);
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("全部");
    const [showSidebar, setShowSidebar] = useState(false);
    const [showParams, setShowParams] = useState(false);
    const [viewport, setViewport] = useState<ViewportTransform>({ x: 0, y: 0, k: 0.72 });
    const [creating, setCreating] = useState(false);

    const selected = useMemo(() => QUICK_CREATION_TEMPLATES.find((template) => template.id === selectedId) || QUICK_CREATION_TEMPLATES[0], [selectedId]);
    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        return QUICK_CREATION_TEMPLATES.filter((template) => {
            if (category !== "全部" && template.category !== category) return false;
            if (!query) return true;
            return template.name.toLowerCase().includes(query) || template.description.toLowerCase().includes(query) || template.tags.some((tag) => tag.toLowerCase().includes(query));
        });
    }, [category, keyword]);

    const workflow = useMemo(() => selected.build({ x: 0, y: 0 }), [selected]);
    const generationNode = useMemo(() => workflow.nodes.find((node) => node.type === CanvasNodeType.Image || node.type === CanvasNodeType.Video || node.type === CanvasNodeType.Audio) || workflow.nodes[0], [workflow]);

    useEffect(() => {
        setViewport({ x: 0, y: 0, k: 0.72 });
    }, [selectedId]);

    const openFullCanvas = async (template: QuickCreationTemplate) => {
        if (creating) return;
        setCreating(true);
        try {
            const { nodes, connections } = template.build({ x: 0, y: 0 });
            const { id } = await createCanvasProjectWithRemoteSync(`${template.name} · AI 画布`, undefined, { nodes, connections });
            message.success(`已创建「${template.name}」画布`);
            navigate(`/canvas/${id}`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "创建画布失败");
            setCreating(false);
        }
    };

    const openBlankCanvas = async () => {
        if (creating) return;
        setCreating(true);
        try {
            const { id } = await createCanvasProjectWithRemoteSync(`自由画布 ${Date.now().toString().slice(-4)}`);
            navigate(`/canvas/${id}`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "创建画布失败");
            setCreating(false);
        }
    };

    return (
        <div className="relative flex h-full w-full min-h-0 overflow-hidden text-white" style={{ background: theme.canvas.background }}>
            {showSidebar ? (
                <button
                    type="button"
                    aria-label="关闭工作流列表"
                    className="max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-14 max-lg:z-20 max-lg:bg-black/50 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            ) : null}
            {showParams ? (
                <button
                    type="button"
                    aria-label="关闭参数面板"
                    className="max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-14 max-lg:z-20 max-lg:bg-black/50 lg:hidden"
                    onClick={() => setShowParams(false)}
                />
            ) : null}
            <WorkFlowListSidebar
                theme={theme}
                keyword={keyword}
                category={category}
                filtered={filtered}
                selectedId={selectedId}
                mobileOpen={showSidebar}
                onKeywordChange={setKeyword}
                onCategoryChange={setCategory}
                onSelect={(template) => {
                    setSelectedId(template.id);
                    setShowSidebar(false);
                }}
            />
            <div className="relative flex min-w-0 flex-1 flex-col">
                <WorkFlowTopBar
                    theme={theme}
                    title={selected.name}
                    description={selected.description}
                    creating={creating}
                    sidebarOpen={showSidebar}
                    paramsOpen={showParams}
                    onToggleSidebar={() => setShowSidebar((current) => !current)}
                    onToggleParams={() => setShowParams((current) => !current)}
                    onOpenFull={() => void openFullCanvas(selected)}
                    onOpenBlank={() => void openBlankCanvas()}
                />
                <div className="relative min-h-0 flex-1">
                    <InfiniteCanvas
                        containerRef={containerRef}
                        viewport={viewport}
                        onViewportChange={setViewport}
                        onCanvasDoubleClick={() => void openFullCanvas(selected)}
                    >
                        <WorkFlowConnectionLayer connections={workflow.connections} nodes={workflow.nodes} />
                        {workflow.nodes.map((node) => (
                            <WorkflowNodeCard key={node.id} node={node} theme={theme} />
                        ))}
                    </InfiniteCanvas>
                    <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border p-1 backdrop-blur" style={{ background: theme.spatial.elevated, borderColor: theme.toolbar.border, boxShadow: `0 16px 40px ${theme.spatial.shadow}` }}>
                        <button type="button" className="pointer-events-auto grid size-8 place-items-center rounded-full transition hover:bg-white/10" style={{ color: theme.node.text }} onClick={() => setViewport((current) => ({ ...current, k: Math.max(0.2, current.k * 0.85) }))} aria-label="缩小">
                            <Minus className="size-4" />
                        </button>
                        <span className="min-w-12 text-center text-xs tabular-nums" style={{ color: theme.node.muted }}>{Math.round(viewport.k * 100)}%</span>
                        <button type="button" className="pointer-events-auto grid size-8 place-items-center rounded-full transition hover:bg-white/10" style={{ color: theme.node.text }} onClick={() => setViewport((current) => ({ ...current, k: Math.min(2.5, current.k * 1.18) }))} aria-label="放大">
                            <Plus className="size-4" />
                        </button>
                    </div>
                </div>
            </div>
            <WorkFlowParamPanel
                theme={theme}
                template={selected}
                node={generationNode}
                creating={creating}
                mobileOpen={showParams}
                onOpenFull={() => void openFullCanvas(selected)}
            />
        </div>
    );
}

function WorkFlowListSidebar({ theme, keyword, category, filtered, selectedId, mobileOpen, onKeywordChange, onCategoryChange, onSelect }: {
    theme: CanvasTheme;
    keyword: string;
    category: (typeof CATEGORIES)[number];
    filtered: QuickCreationTemplate[];
    selectedId: string;
    mobileOpen: boolean;
    onKeywordChange: (value: string) => void;
    onCategoryChange: (value: (typeof CATEGORIES)[number]) => void;
    onSelect: (template: QuickCreationTemplate) => void;
}) {
    return (
        <aside
            className={`flex w-72 shrink-0 flex-col border-r max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:top-14 max-lg:z-30 max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-200 ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}`}
            style={{ background: theme.spatial.surface, borderColor: theme.toolbar.border }}
        >
            <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4" style={{ borderColor: theme.toolbar.border }}>
                <span className="grid size-8 place-items-center rounded-lg" style={{ background: theme.accent.primary, color: "#fff" }}>
                    <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">Agent 智能体包</div>
                    <div className="text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>WorkFlowListNew</div>
                </div>
            </div>
            <div className="border-b p-3" style={{ borderColor: theme.toolbar.border }}>
                <label className="relative flex h-9 items-center">
                    <Search className="absolute left-3 size-3.5" style={{ color: theme.node.muted }} />
                    <input
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder="搜索工作流"
                        className="h-full w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition placeholder:opacity-45"
                        style={{ background: theme.spatial.surface, borderColor: theme.toolbar.border, color: theme.node.text }}
                    />
                </label>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {CATEGORIES.map((item) => {
                        const active = category === item;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onCategoryChange(item)}
                                className="h-7 rounded-full border px-2.5 text-xs font-medium transition"
                                style={{
                                    background: active ? theme.accent.primary : "transparent",
                                    borderColor: active ? theme.accent.primary : theme.toolbar.border,
                                    color: active ? "#fff" : theme.node.text,
                                }}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {filtered.map((template) => {
                    const active = template.id === selectedId;
                    const Icon = workflowIcon(template.kind);
                    return (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => onSelect(template)}
                            className="mb-1 flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition"
                            style={{
                                background: active ? theme.toolbar.activeBg : "transparent",
                                borderColor: active ? theme.accent.primary : "transparent",
                            }}
                        >
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg border" style={{ background: theme.spatial.surface, borderColor: theme.toolbar.border, color: theme.accent.primary }}>
                                <Icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-xs font-medium" style={{ color: active ? theme.node.text : theme.node.text }}>{template.name}</span>
                                <span className="mt-0.5 block truncate text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>{template.category} · {template.steps.length} 步</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}

function WorkFlowTopBar({ theme, title, description, creating, sidebarOpen, paramsOpen, onToggleSidebar, onToggleParams, onOpenFull, onOpenBlank }: {
    theme: CanvasTheme;
    title: string;
    description: string;
    creating: boolean;
    sidebarOpen: boolean;
    paramsOpen: boolean;
    onToggleSidebar: () => void;
    onToggleParams: () => void;
    onOpenFull: () => void;
    onOpenBlank: () => void;
}) {
    return (
        <header className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4" style={{ background: theme.spatial.elevated, borderColor: theme.toolbar.border }}>
            <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{title}</div>
                <div className="truncate text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>{description}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    aria-label={sidebarOpen ? "关闭工作流列表" : "打开工作流列表"}
                    className="inline-flex size-8 items-center justify-center rounded-full border transition hover:bg-white/10 lg:hidden"
                    style={{ borderColor: theme.toolbar.border, color: sidebarOpen ? theme.accent.primary : theme.node.text, background: sidebarOpen ? theme.toolbar.activeBg : "transparent" }}
                    onClick={onToggleSidebar}
                >
                    <PanelLeft className="size-4" />
                </button>
                <button
                    type="button"
                    aria-label={paramsOpen ? "关闭参数面板" : "打开参数面板"}
                    className="inline-flex size-8 items-center justify-center rounded-full border transition hover:bg-white/10 lg:hidden"
                    style={{ borderColor: theme.toolbar.border, color: paramsOpen ? theme.accent.primary : theme.node.text, background: paramsOpen ? theme.toolbar.activeBg : "transparent" }}
                    onClick={onToggleParams}
                >
                    <PanelRight className="size-4" />
                </button>
                <Button size="small" className="!inline-flex !h-8 !items-center !gap-1.5 !rounded-full !px-3 !text-xs" icon={<Plus className="size-3.5" />} onClick={onOpenBlank} disabled={creating}>
                    {creating ? <LoaderCircle className="size-3.5 animate-spin" /> : "空白画布"}
                </Button>
                <Button size="small" type="primary" className="!inline-flex !h-8 !items-center !gap-1.5 !rounded-full !px-3 !text-xs" icon={<Maximize2 className="size-3.5" />} onClick={onOpenFull} disabled={creating}>
                    {creating ? <LoaderCircle className="size-3.5 animate-spin" /> : "打开完整画布"}
                </Button>
            </div>
        </header>
    );
}

function WorkFlowParamPanel({ theme, template, node, creating, mobileOpen, onOpenFull }: {
    theme: CanvasTheme;
    template: QuickCreationTemplate;
    node: CanvasNodeData;
    creating: boolean;
    mobileOpen: boolean;
    onOpenFull: () => void;
}) {
    const { message } = App.useApp();
    return (
        <aside
            className={`flex w-96 shrink-0 flex-col border-l max-lg:fixed max-lg:bottom-0 max-lg:right-0 max-lg:top-14 max-lg:z-30 max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-200 ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-full"}`}
            style={{ background: theme.spatial.elevated, borderColor: theme.toolbar.border }}
        >
            <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4" style={{ borderColor: theme.toolbar.border }}>
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{template.name}</div>
                    <div className="truncate text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>节点参数 · {template.kind}</div>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border" style={{ background: theme.spatial.surface, borderColor: theme.toolbar.border, color: theme.accent.primary }}>
                    <Box className="size-4" />
                </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <CanvasNodePromptPanel
                    node={node}
                    isRunning={false}
                    workspaceMode="professional"
                    onPromptChange={() => undefined}
                    onConfigChange={() => undefined}
                    onGenerate={() => message.info("请在完整画布中生成，这里只做参数预览")}
                    onStop={() => undefined}
                    onImageSettingsOpenChange={() => undefined}
                />
            </div>
            <div className="shrink-0 border-t p-3" style={{ borderColor: theme.toolbar.border }}>
                <Button type="primary" block className="!h-9 !rounded-lg !text-xs !font-medium" icon={<Maximize2 className="size-3.5" />} onClick={onOpenFull} disabled={creating} loading={creating}>
                    打开完整画布并生成
                </Button>
                <p className="mt-2 text-center text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>预览模式，编辑、连线、批量生成和导出都在完整画布中完成。</p>
            </div>
        </aside>
    );
}

function WorkFlowConnectionLayer({ nodes, connections }: { nodes: CanvasNodeData[]; connections: CanvasConnection[] }) {
    const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
    return (
        <svg className="pointer-events-none absolute left-0 top-0" width="2400" height="1400" style={{ overflow: "visible" }}>
            {connections.map((connection) => {
                const from = byId.get(connection.fromNodeId);
                const to = byId.get(connection.toNodeId);
                if (!from || !to) return null;
                const start = { x: from.position.x + from.width, y: from.position.y + from.height / 2 };
                const end = { x: to.position.x, y: to.position.y + to.height / 2 };
                const curve = Math.max(24, Math.abs(end.x - start.x) / 2);
                return (
                    <path
                        key={connection.id}
                        d={`M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`}
                        fill="none"
                        stroke="rgba(255,255,255,.35)"
                        strokeWidth={1.5}
                    />
                );
            })}
        </svg>
    );
}

function WorkflowNodeCard({ node, theme }: { node: CanvasNodeData; theme: CanvasTheme }) {
    const Icon = nodeIcon(node.type);
    const prompt = node.metadata?.prompt || node.metadata?.workflowDescription || node.title;
    return (
        <div
            data-node-id={node.id}
            data-canvas-no-zoom
            className="absolute flex flex-col overflow-hidden rounded-xl border"
            style={{
                left: node.position.x,
                top: node.position.y,
                width: node.width,
                height: node.height,
                background: theme.toolbar.panel,
                borderColor: theme.toolbar.border,
                boxShadow: `0 18px 44px ${theme.spatial.shadow}`,
            }}
        >
            <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: theme.toolbar.border, background: theme.spatial.surface }}>
                <span className="grid size-6 shrink-0 place-items-center rounded-md" style={{ background: `${theme.accent.primary}18`, color: theme.accent.primary }}>
                    <Icon className="size-3.5" />
                </span>
                <span className="truncate text-xs font-semibold">{node.title}</span>
            </div>
            <div className="flex min-h-0 flex-1 items-start gap-2 p-3">
                {node.type === CanvasNodeType.Image || node.type === CanvasNodeType.Video ? (
                    <span className="grid size-16 shrink-0 place-items-center rounded-lg border" style={{ background: theme.spatial.surface, borderColor: theme.toolbar.border }}>
                        <Icon className="size-6 opacity-55" />
                    </span>
                ) : null}
                <div className="min-w-0 flex-1">
                    <div className="text-[var(--fs-label)] font-medium">{node.metadata?.workflowTitle || node.title}</div>
                    <p className="mt-1.5 line-clamp-4 text-[var(--fs-micro)] leading-5" style={{ color: theme.node.muted }}>{prompt}</p>
                </div>
            </div>
        </div>
    );
}

function nodeIcon(type: CanvasNodeType) {
    switch (type) {
        case CanvasNodeType.Text:
            return Type;
        case CanvasNodeType.Image:
            return ImageIcon;
        case CanvasNodeType.Video:
            return Video;
        case CanvasNodeType.Audio:
            return AudioLines;
        case CanvasNodeType.Script:
            return Clapperboard;
        default:
            return WandSparkles;
    }
}

function workflowIcon(kind: QuickCreationTemplate["kind"]) {
    switch (kind) {
        case "video":
            return Video;
        case "face":
            return Type;
        case "cleanup":
            return WandSparkles;
        case "script":
            return Clapperboard;
        case "audio":
            return AudioLines;
        case "merge":
            return Film;
        case "style":
            return Sparkles;
        default:
            return ImageIcon;
    }
}
