import type { CSSProperties, ReactNode } from "react";
import { Boxes, Camera, Clapperboard, Play, ShoppingBag, Sparkles, UserRound, WandSparkles } from "lucide-react";

import type { CanvasTheme } from "@/lib/canvas-theme";

type AgentPackage = {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    prompt: string;
    icon: ReactNode;
};

const AGENT_PACKAGES: AgentPackage[] = [
    {
        id: "cinematic-director",
        title: "影视导演",
        description: "剧本、场景、分镜、镜头到成片的一体化导演流。",
        image: "/short-drama-styles/cyberpunk-neon.jpg",
        tags: ["剧本", "分镜", "成片"],
        icon: <Clapperboard className="size-4" />,
        prompt: "请作为影视导演 Agent，帮我搭建一套完整创作流程：先创建剧本节点，再拆解场景、分镜、镜头和角色参考，最后把每一步节点连线并标注生成方式。",
    },
    {
        id: "ecommerce-visual",
        title: "电商视觉",
        description: "商品主图、背景氛围、文案排版与成片发布。",
        image: "/short-drama-styles/future-tech.jpg",
        tags: ["商品图", "文案", "成片"],
        icon: <ShoppingBag className="size-4" />,
        prompt: "请作为电商视觉 Agent，帮我创建商品主图工作流：商品图、背景氛围、文案排版、细节放大和电商成片节点，并自动连线。",
    },
    {
        id: "photo-retouch",
        title: "摄影后期",
        description: "人像精修、光影重塑、细节增强与成片对比。",
        image: "/short-drama-styles/urban-live-action.jpg",
        tags: ["人像", "精修", "对比"],
        icon: <Camera className="size-4" />,
        prompt: "请作为摄影后期 Agent，帮我建立人像精修流程：原图、打光调整、皮肤细节、背景替换、成片对比节点，并自动连线。",
    },
    {
        id: "character-design",
        title: "角色设计",
        description: "三视图、表情延展与角色动作板。",
        image: "/short-drama-styles/three-d-cartoon.jpg",
        tags: ["三视图", "表情", "动作"],
        icon: <UserRound className="size-4" />,
        prompt: "请作为角色设计 Agent，创建角色三视图流程：角色设定文本、正面、侧面、背面参考图、表情延展和动作板节点，并自动连线。",
    },
    {
        id: "short-video",
        title: "短视频工作流",
        description: "主题脚本、分镜、字幕、音效与成片。",
        image: "/short-drama-styles/storybook-fantasy.jpg",
        tags: ["脚本", "字幕", "音效"],
        icon: <Play className="size-4" />,
        prompt: "请作为短视频 Agent，创建短视频生产流程：主题脚本、分镜、素材、字幕、音效和成片节点，并自动连线。",
    },
    {
        id: "storyboard-evolution",
        title: "分镜推演",
        description: "剧情拆解、四宫格分镜与镜头语言推演。",
        image: "/short-drama-styles/ink-narrative.jpg",
        tags: ["剧情", "四宫格", "运镜"],
        icon: <WandSparkles className="size-4" />,
        prompt: "请作为分镜 Agent，创建剧情推演流程：剧本节点、场景拆解、四宫格分镜、镜头语言注释和视频生成节点，并自动连线。",
    },
];

export function AgentPackageLibrary({ theme, onStart, onLoad }: {
    theme: CanvasTheme;
    onStart: (prompt: string) => void;
    onLoad: (prompt: string) => void;
}) {
    return (
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <div className="flex items-center gap-2.5 px-1 pb-3 pt-1">
                <span className="grid size-8 shrink-0 place-items-center rounded-md" style={{ background: theme.accent.primarySoft, color: theme.accent.primary }}>
                    <Boxes className="size-4" />
                </span>
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold" style={{ color: theme.node.text }}>智能体包</div>
                    <div className="truncate text-[var(--fs-label)]" style={{ color: theme.node.muted }}>影视 · 电商 · 摄影 · 短视频</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {AGENT_PACKAGES.map((pkg) => (
                    <AgentPackageCard key={pkg.id} pkg={pkg} theme={theme} onStart={() => onStart(pkg.prompt)} onLoad={() => onLoad(pkg.prompt)} />
                ))}
            </div>
        </div>
    );
}

function AgentPackageCard({ pkg, theme, onStart, onLoad }: { pkg: AgentPackage; theme: CanvasTheme; onStart: () => void; onLoad: () => void }) {
    return (
        <article
            className="group relative flex h-36 min-w-0 flex-col overflow-hidden rounded-lg border transition-colors"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.62)), url(${pkg.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderColor: theme.toolbar.border,
                color: "#fff",
                "--tw-ring-color": theme.accent.primary,
            } as CSSProperties}
        >
            <div className="relative z-10 flex min-w-0 items-start gap-2 p-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-black/45 text-white backdrop-blur-sm">{pkg.icon}</span>
                <div className="min-w-0">
                    <h3 className="truncate text-xs font-semibold drop-shadow">{pkg.title}</h3>
                    <p className="mt-0.5 line-clamp-2 text-[var(--fs-micro)] leading-4 text-white/80">{pkg.description}</p>
                </div>
            </div>
            <div className="relative z-10 mt-auto flex flex-wrap items-center gap-1 px-2.5 pb-2">
                {pkg.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/25 bg-black/40 px-1.5 py-0.5 text-[var(--fs-micro)] text-white/85 backdrop-blur-sm">{tag}</span>
                ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-between gap-1.5 px-2.5 pb-2.5 pt-2 transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0">
                <button
                    type="button"
                    onClick={onLoad}
                    className="inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-md border border-white/25 bg-black/50 px-2 text-[var(--fs-micro)] font-medium text-white backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-1"
                    style={{ "--tw-ring-color": theme.accent.primary } as CSSProperties}
                >
                    <Sparkles className="size-3" />
                    载入
                </button>
                <button
                    type="button"
                    onClick={onStart}
                    className="inline-flex h-7 min-w-0 items-center justify-center gap-1 rounded-md px-2 text-[var(--fs-micro)] font-semibold text-black transition focus-visible:outline-none focus-visible:ring-1"
                    style={{ background: theme.accent.primary, "--tw-ring-color": theme.node.muted } as CSSProperties}
                >
                    <Play className="size-3 fill-current" />
                    使用
                </button>
            </div>
        </article>
    );
}
