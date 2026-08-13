import { Clapperboard, Film, LayoutTemplate, MousePointerClick, Sparkles, UserRound } from "lucide-react";

export function CanvasAixEmptyState({ onAddScript, onOpenCharacters, onImageToVideo, onOpenWorkflowTemplates }: {
    onAddScript: () => void;
    onOpenCharacters: () => void;
    onImageToVideo: () => void;
    onOpenWorkflowTemplates: () => void;
}) {
    const quickActions = [
        { label: "图生视频", icon: <Film className="size-4" />, onClick: onImageToVideo },
        { label: "故事脚本", icon: <Clapperboard className="size-4" />, onClick: onAddScript },
        { label: "角色三视图", icon: <UserRound className="size-4" />, onClick: onOpenCharacters },
        { label: "打开模板库", icon: <LayoutTemplate className="size-4" />, onClick: onOpenWorkflowTemplates },
    ];
    return (
        <div data-canvas-no-zoom className="pointer-events-none absolute inset-0 z-20 select-none">
            <div className="pointer-events-none absolute inset-0 flex flex-col transition-opacity duration-500">
                <div className="aix-studio-empty-hero flex min-h-0 flex-1 items-center justify-center p-4 md:p-6">
                    <div className="aix-studio-preview-card pointer-events-auto relative flex min-h-0 w-full max-w-[1200px] flex-col overflow-hidden rounded-lg outline-none transition focus-visible:ring-2">
                        <button
                            type="button"
                            className="aix-studio-preview-media group relative block min-h-0 flex-1 overflow-hidden bg-cover bg-center text-left outline-none"
                            style={{ backgroundImage: "url(/short-drama-styles/cyberpunk-neon.jpg)" }}
                            onClick={onImageToVideo}
                            aria-label="从示例图开始图生视频"
                            title="从示例图开始图生视频"
                        >
                            <span className="aix-studio-preview-shade absolute inset-0" />
                            <span className="absolute left-5 top-5 flex items-center gap-2">
                                <span className="aix-studio-logo grid size-8 shrink-0 place-items-center rounded-lg">
                                    <Sparkles className="size-4" strokeWidth={2.2} />
                                </span>
                                <span className="aix-studio-logo-text whitespace-nowrap">AI studio</span>
                            </span>
                            <span className="absolute right-5 top-5 flex items-center gap-1.5 text-xs font-semibold">
                                <span className="aix-studio-status-dot size-2 rounded-full" />
                                准备就绪
                            </span>
                            <span className="aix-studio-preview-cta absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <MousePointerClick className="size-3.5" />
                                双击画布或点击此处添加节点
                            </span>
                        </button>

                        <div className="aix-studio-model-bar flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-5">
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <span className="aix-studio-model-icon grid size-8 shrink-0 place-items-center rounded-xl">
                                    <Sparkles className="size-4" />
                                </span>
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-semibold">AI Studio Gimage 2.0（图生图）</div>
                                    <div className="mt-0.5 truncate text-[11px] opacity-60">从示例图开始，一键进入图生视频创作</div>
                                </div>
                            </div>
                            <div className="aix-studio-chip flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium">
                                <Sparkles className="size-3.5" />
                                风格
                                <span className="font-bold">1639</span>
                            </div>
                            <div className="aix-studio-chip hidden h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium sm:flex">
                                <LayoutTemplate className="size-3.5" />
                                预设 1x
                            </div>
                            <div className="aix-studio-chip hidden h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium md:flex">
                                35 Muses
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none flex h-16 shrink-0 items-center justify-center px-4">
                    <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                className="aix-studio-quick-btn flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium outline-none transition focus-visible:ring-2"
                                onClick={action.onClick}
                            >
                                {action.icon}
                                <span className="whitespace-nowrap">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
