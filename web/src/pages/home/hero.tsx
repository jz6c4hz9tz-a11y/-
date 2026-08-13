import { ArrowRight, LoaderCircle, Play, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import { formatDuration } from "@/lib/image-utils";
import { createCanvasProjectWithRemoteSync } from "@/services/user-data-sync";
import { useCanvasStore } from "@/stores/canvas/use-canvas-store";
import { useAssetStore, type Asset, type ImageAsset, type VideoAsset } from "@/stores/use-asset-store";

type HeroMedia = {
    id: string;
    kind: "image" | "video";
    title: string;
    url: string;
    coverUrl?: string;
    durationMs?: number;
    updatedAt: string;
};

function collectMedia(assets: Asset[]): HeroMedia[] {
    return assets
        .filter((asset): asset is ImageAsset | VideoAsset => asset.kind === "image" || asset.kind === "video")
        .map((asset) => ({
            id: asset.id,
            kind: asset.kind,
            title: asset.title,
            url: asset.kind === "image" ? asset.data.dataUrl : asset.data.url,
            coverUrl: asset.coverUrl || undefined,
            durationMs: asset.kind === "video" ? asset.data.durationMs : undefined,
            updatedAt: asset.updatedAt,
        }))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function HeroSection() {
    const navigate = useNavigate();
    const assets = useAssetStore((state) => state.assets);
    const canvasCount = useCanvasStore((state) => state.projects.length);
    const [creating, setCreating] = useState(false);
    const media = useMemo(() => collectMedia(assets), [assets]);
    const featured = media[0];
    const thumbnails = media.slice(1, 4);
    const startCanvas = async () => {
        if (creating) return;
        setCreating(true);
        try {
            const { id } = await createCanvasProjectWithRemoteSync(`自由画布 ${canvasCount + 1}`);
            navigate(`/canvas/${id}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <section className="grid gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-16">
            <div className="relative">
                <span aria-hidden className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-accent/10 blur-3xl" />
                <p className="text-xs font-semibold tracking-[0.3em] text-white/45">AI STUDIO · GLOBAL AI VIDEO CREATION</p>
                <h1 className="mt-5 text-[var(--fs-hero)] font-semibold leading-[0.95] tracking-tight text-white">AI Studio</h1>
                <p className="mt-6 text-[var(--fs-heading-lg)] font-semibold text-white/92">全球 AI 视频创作平台</p>
                <p className="mt-3 max-w-md text-[var(--fs-body-lg)] leading-7 text-white/55">从文字到银幕：无限画布、分镜编排与多模态生成，一站式完成 AI 影视创作。</p>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void startCanvas()} disabled={creating} className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-70">
                        {creating ? <LoaderCircle className="size-4 animate-spin" /> : null}
                        开始制作
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/45">
                    <span className="inline-flex items-center gap-1.5"><Sparkles className="size-3.5 text-white/70" />无限画布</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-1 rounded-full bg-white/25" />分镜编排</span>
                    <span className="inline-flex items-center gap-1.5"><span className="size-1 rounded-full bg-white/25" />多模态生成</span>
                    <Link to="/canvas" className="ml-auto hidden items-center gap-1 text-xs text-white/40 transition hover:text-white sm:inline-flex">进入无限画布 <ArrowRight className="size-3" /></Link>
                </div>
            </div>

            <div className="relative min-h-[340px]">
                <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    {featured ? (
                        featured.kind === "video" ? (
                            <video key={featured.id} src={featured.url} poster={featured.coverUrl} muted autoPlay loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <img key={featured.id} src={featured.coverUrl || featured.url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover" />
                        )
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-indigo-500/15 via-transparent to-fuchsia-500/15">
                            <span className="flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                                <Play className="size-6 fill-current text-white" />
                            </span>
                            <p className="text-sm text-white/70">AI 创作的第一个镜头，从这里开始</p>
                        </div>
                    )}
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{featured ? featured.title : "AI STUDIO"}</p>
                            <p className="mt-1 text-xs text-white/60">{featured?.durationMs ? formatDuration(featured.durationMs) : "无限画布 · AI 生成"}</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[var(--fs-micro)] text-white/70 backdrop-blur">AI 创作</span>
                    </div>
                </div>
                {thumbnails.length > 0 ? (
                    <div className="absolute -right-3 top-8 hidden w-40 flex-col gap-4 lg:flex">
                        {thumbnails.map((item, index) => (
                            <div key={item.id} className={`overflow-hidden rounded-xl border border-white/10 bg-black/75 shadow-xl backdrop-blur transition-transform hover:-translate-y-1 ${index === 1 ? "ml-10" : ""} ${index === 2 ? "ml-20" : ""}`}>
                                {item.kind === "video" ? <video src={item.url} muted preload="metadata" className="aspect-video w-full object-cover" /> : <img src={item.coverUrl || item.url} alt={item.title} className="aspect-square w-full object-cover" />}
                                <p className="truncate px-2 py-1.5 text-[var(--fs-micro)] text-white/75">{item.title}</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
