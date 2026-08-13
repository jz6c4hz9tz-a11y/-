import { App } from "antd";
import { AudioLines, Box, Clapperboard, Heart, MessageCircle, Play, Search, Trash2, Type, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import { formatDuration } from "@/lib/image-utils";
import { uploadMediaFile } from "@/services/file-storage";
import { uploadImage } from "@/services/image-storage";
import { deleteAllAssetsWithRemoteSync } from "@/services/user-data-sync";
import { useAssetStore, type Asset } from "@/stores/use-asset-store";
import { useUserStore } from "@/stores/use-user-store";

const CATEGORIES = ["全部", "推荐", "品牌", "电商", "影视", "摄影", "设计", "汽车", "ACG", "COSPLAY", "其他"] as const;
type Category = (typeof CATEGORIES)[number];

const KIND_LABEL: Record<Asset["kind"], string> = { image: "图片", video: "视频", audio: "音频", model: "3D 模型", text: "文本", entity: "素材" };

function matchesCategory(asset: Asset, category: Category) {
    const tag = category.toLowerCase();
    switch (category) {
        case "全部":
        case "推荐":
            return true;
        case "影视":
            return asset.kind === "video";
        case "摄影":
            return asset.kind === "image";
        case "其他":
            return asset.kind === "text" || asset.kind === "audio" || asset.kind === "model" || asset.kind === "entity";
        default:
            // 品牌/电商等垂直分类按作品标签匹配，未命中时该分类为空。
            return asset.tags.some((value) => value.toLowerCase().includes(tag));
    }
}

export function ShowcaseSection() {
    const { message, modal } = App.useApp();
    const assets = useAssetStore((state) => state.assets);
    const hydrated = useAssetStore((state) => state.hydrated);
    const addAsset = useAssetStore((state) => state.addAsset);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<Category>("推荐");
    const [keyword, setKeyword] = useState("");
    const [visible, setVisible] = useState(12);

    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        return assets
            .filter((asset) => matchesCategory(asset, activeTab))
            .filter((asset) => !query || asset.title.toLowerCase().includes(query) || asset.tags.some((value) => value.toLowerCase().includes(query)))
            .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    }, [assets, activeTab, keyword]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) setVisible((count) => count + 12);
            },
            { rootMargin: "400px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    useEffect(() => setVisible(12), [activeTab, keyword]);

    const uploadWorks = async (fileList: FileList | null) => {
        const file = fileList?.[0];
        if (!file) return;
        const title = file.name.replace(/\.[^.]+$/, "");
        try {
            if (file.type.startsWith("image/")) {
                const image = await uploadImage(file);
                addAsset({
                    kind: "image",
                    title,
                    category: "other",
                    coverUrl: image.url,
                    tags: ["作品"],
                    source: "手动上传",
                    data: { dataUrl: image.url, storageKey: image.storageKey, width: image.width, height: image.height, bytes: image.bytes, mimeType: image.mimeType },
                    metadata: { source: "manual" },
                });
            } else if (file.type.startsWith("video/")) {
                const video = await uploadMediaFile(file, "video");
                addAsset({
                    kind: "video",
                    title,
                    category: "other",
                    coverUrl: "",
                    tags: ["作品"],
                    source: "手动上传",
                    data: { url: video.url, storageKey: video.storageKey, bytes: video.bytes, mimeType: video.mimeType, width: video.width ?? 1920, height: video.height ?? 1080, durationMs: video.durationMs },
                    metadata: { source: "manual" },
                });
            } else if (file.type.startsWith("audio/")) {
                const audio = await uploadMediaFile(file, "audio");
                addAsset({
                    kind: "audio",
                    title,
                    category: "other",
                    coverUrl: "",
                    tags: ["作品"],
                    source: "手动上传",
                    data: { url: audio.url, storageKey: audio.storageKey, bytes: audio.bytes, mimeType: audio.mimeType, durationMs: audio.durationMs },
                    metadata: { source: "manual" },
                });
            } else {
                message.warning("支持上传图片、视频或音频文件");
                return;
            }
            message.success("作品已上传");
        } catch (error) {
            message.error(error instanceof Error ? error.message : "作品上传失败");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const clearAllWorks = async () => {
        if (!assets.length) return;
        modal.confirm({
            title: "清空全部作品素材",
            content: "将删除首页展示的图片、视频、音频等全部素材，画布项目本身不受影响。",
            okText: "删除全部",
            okButtonProps: { danger: true },
            cancelText: "取消",
            onOk: async () => {
                try {
                    const { deleted, failed } = await deleteAllAssetsWithRemoteSync();
                    if (failed.length) message.warning(`已删除 ${deleted} 个素材，${failed.length} 个素材删除失败`);
                    else message.success("作品素材已全部清空");
                } catch (error) {
                    message.error(error instanceof Error ? error.message : "清空作品素材失败");
                }
            },
        });
    };

    const items = filtered.slice(0, visible);

    return (
        <section className="px-4 pb-20 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-[var(--fs-title)] font-semibold text-white">AI TV 精选</h2>
                    <p className="mt-1.5 text-xs text-white/45">全球 AI 创作者的作品正在热映，支持自由上传与无限下拉。</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link to="/assets" className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-xs font-medium text-white/65 transition hover:border-white/35 hover:text-white">
                        素材库
                    </Link>
                    {assets.length ? (
                        <button
                            type="button"
                            onClick={() => void clearAllWorks()}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 px-4 text-xs font-medium text-white/65 transition hover:border-rose-400/60 hover:text-rose-300"
                        >
                            <Trash2 className="size-3.5" />
                            清空全部
                        </button>
                    ) : null}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/85">
                        <Upload className="size-3.5" />
                        上传作品
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={(event) => void uploadWorks(event.target.files)} />
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveTab(category)}
                            className={`h-8 rounded-full px-4 text-xs font-medium transition ${activeTab === category ? "bg-white text-black" : "border border-white/15 bg-white/[0.03] text-white/60 hover:border-white/35 hover:text-white"}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <label className="relative flex h-9 w-full max-w-xs items-center">
                    <Search className="absolute left-3 size-4 text-white/40" />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="搜索作品…"
                        className="h-full w-full rounded-full border border-white/15 bg-white/[0.04] pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:bg-white/[0.07]"
                    />
                </label>
            </div>

            {!hydrated ? (
                <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="mb-4 break-inside-avoid">
                            <div className="aspect-video w-full animate-pulse rounded-xl bg-white/[0.06]" />
                            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-white/[0.06]" />
                            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-white/[0.05]" />
                        </div>
                    ))}
                </div>
            ) : items.length > 0 ? (
                <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                    {items.map((asset) => (
                        <div key={asset.id} className="mb-4 break-inside-avoid">
                            <WorkCard asset={asset} />
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyWorks
                    hasAny={assets.length > 0}
                    onUpload={() => fileInputRef.current?.click()}
                    onReset={() => {
                        setActiveTab("全部");
                        setKeyword("");
                    }}
                />
            )}
            {hydrated && items.length > 0 ? <div ref={sentinelRef} className="h-10" /> : null}
            {hydrated && filtered.length > items.length ? <p className="pb-2 pt-1 text-center text-xs text-white/35">继续下拉，加载更多作品</p> : null}
        </section>
    );
}

function WorkCard({ asset }: { asset: Asset }) {
    const user = useUserStore((state) => state.user);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const creatorName = user?.displayName || user?.username || "AI 创作者";
    const durationMs = asset.kind === "video" || asset.kind === "audio" ? asset.data.durationMs : undefined;

    const toggleLike = () => {
        setLiked((value) => !value);
        setLikes((count) => Math.max(0, count + (liked ? -1 : 1)));
    };

    return (
        <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25 hover:bg-white/[0.05]">
            <div className="relative overflow-hidden">
                <WorkCover asset={asset} />
                <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[var(--fs-micro)] text-white/75 backdrop-blur">{KIND_LABEL[asset.kind]}</span>
                {durationMs ? <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[var(--fs-micro)] text-white/85 backdrop-blur">{formatDuration(durationMs)}</span> : null}
            </div>
            <div className="p-3">
                <h3 className="truncate text-sm font-medium text-white" title={asset.title}>
                    {asset.title || "未命名作品"}
                </h3>
                <div className="mt-2.5 flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-[var(--fs-micro)] font-semibold text-white">
                        {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="size-full object-cover" /> : creatorName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-xs text-white/60">{creatorName}</span>
                    <span className="ml-auto flex items-center gap-3 text-white/50">
                        <button type="button" onClick={toggleLike} className={`inline-flex items-center gap-1 text-xs transition ${liked ? "text-rose-400" : "hover:text-white"}`}>
                            <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
                            {likes}
                        </button>
                        <span className="inline-flex items-center gap-1 text-xs">
                            <MessageCircle className="size-3.5" />0
                        </span>
                    </span>
                </div>
            </div>
        </article>
    );
}

function WorkCover({ asset }: { asset: Asset }) {
    switch (asset.kind) {
        case "image":
            return <img src={asset.coverUrl || asset.data.dataUrl} alt={asset.title} loading="lazy" decoding="async" className="w-full bg-black/20" />;
        case "video":
            return (
                <div className="relative">
                    <video src={asset.data.url} poster={asset.coverUrl || undefined} muted preload="metadata" className="aspect-video w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <span className="flex size-10 items-center justify-center rounded-full bg-black/50 backdrop-blur">
                            <Play className="size-4 fill-current text-white" />
                        </span>
                    </span>
                </div>
            );
        case "audio":
            return (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-sky-500/10 to-indigo-500/10">
                    <AudioLines className="size-8 text-white/50" />
                </div>
            );
        case "model":
            return (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <Box className="size-8 text-white/50" />
                </div>
            );
        default:
            return (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10">
                    <Type className="size-8 text-white/50" />
                </div>
            );
    }
}

function EmptyWorks({ hasAny, onUpload, onReset }: { hasAny: boolean; onUpload: () => void; onReset: () => void }) {
    return (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]">
                <Clapperboard className="size-6 text-white/55" />
            </span>
            <p className="mt-4 text-sm font-medium text-white/80">{hasAny ? "没有匹配的作品" : "还没有作品"}</p>
            <p className="mt-1.5 max-w-sm text-xs leading-5 text-white/45">{hasAny ? "换个分类或关键词试试。" : "上传你的第一个 AI 作品，或进入画布开始创作。"}</p>
            <div className="mt-5 flex items-center gap-2.5">
                <button type="button" onClick={onUpload} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/85">
                    <Upload className="size-3.5" />
                    上传作品
                </button>
                {hasAny ? (
                    <button type="button" onClick={onReset} className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-xs text-white/75 transition hover:border-white/40 hover:text-white">
                        清除筛选
                    </button>
                ) : (
                    <Link to="/canvas" className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-xs text-white/75 transition hover:border-white/40 hover:text-white">
                        进入画布
                    </Link>
                )}
            </div>
        </div>
    );
}
