import { App, Input } from "antd";
import { AudioLines, Clapperboard, Eraser, Film, Image as ImageIcon, LoaderCircle, Plus, Search, Sparkles, UserRound, Video, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { canvasThemes } from "@/lib/canvas-theme";
import { QUICK_CREATION_TEMPLATES, type QuickCreationTemplate } from "@/lib/canvas/canvas-quick-creation";
import { createCanvasProjectWithRemoteSync } from "@/services/user-data-sync";
import { useThemeStore } from "@/stores/use-theme-store";

const categoryOptions = [
    { value: "all", label: "全部" },
    { value: "商业", label: "商业" },
    { value: "影视", label: "影视" },
    { value: "修图", label: "修图" },
    { value: "工具", label: "工具" },
] as const;

export function CanvasWorkflowGallery() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState<(typeof categoryOptions)[number]["value"]>("all");
    const [creatingId, setCreatingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        return QUICK_CREATION_TEMPLATES.filter((template) => {
            if (category !== "all" && template.category !== category) return false;
            if (!query) return true;
            return template.name.toLowerCase().includes(query) || template.description.toLowerCase().includes(query) || template.tags.some((tag) => tag.toLowerCase().includes(query));
        });
    }, [category, keyword]);

    const openBlankCanvas = async () => {
        if (creatingId) return;
        setCreatingId("blank");
        try {
            const { id } = await createCanvasProjectWithRemoteSync(`自由画布 ${Date.now().toString().slice(-4)}`);
            navigate(`/canvas/${id}`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "创建画布失败");
            setCreatingId(null);
        }
    };

    const openTemplate = async (template: QuickCreationTemplate) => {
        if (creatingId) return;
        setCreatingId(template.id);
        try {
            const { nodes, connections } = template.build({ x: 0, y: 0 });
            const { id } = await createCanvasProjectWithRemoteSync(`${template.name} · AI 画布`, undefined, { nodes, connections });
            message.success(`已创建「${template.name}」画布`);
            navigate(`/canvas/${id}`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "创建画布失败");
            setCreatingId(null);
        }
    };

    return (
        <div>
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((option) => {
                        const active = category === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setCategory(option.value)}
                                className={`h-8 rounded-full px-4 text-xs font-medium transition ${active ? "bg-white text-black" : "border border-white/15 bg-white/[0.03] text-white/60 hover:border-white/35 hover:text-white"}`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                <label className="relative flex h-9 w-full max-w-xs items-center">
                    <Search className="absolute left-3 size-4 text-white/40" />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="搜索工作流或标签"
                        className="h-full w-full rounded-full border border-white/15 bg-white/[0.04] pl-9 pr-4 text-xs text-white outline-none transition placeholder:text-white/35 focus:border-white/40 focus:bg-white/[0.07]"
                    />
                </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-white/45">一键创建画布节点，打开无限画布继续生成、连线、编辑和导出。</p>
                <button
                    type="button"
                    onClick={() => void openBlankCanvas()}
                    disabled={Boolean(creatingId)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {creatingId === "blank" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                    {creatingId === "blank" ? "创建中…" : "进入无限画布"}
                </button>
            </div>

            {filtered.length ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((template) => (
                        <WorkflowCard
                            key={template.id}
                            template={template}
                            creating={creatingId === template.id}
                            disabled={Boolean(creatingId)}
                            onApply={() => void openTemplate(template)}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]"><Search className="size-6 text-white/55" /></span>
                    <p className="mt-4 text-sm font-medium text-white/80">没有匹配的工作流</p>
                    <p className="mt-1.5 max-w-sm text-xs leading-5 text-white/45">换个分类或关键词试试，也可以直接进入空白无限画布。</p>
                </div>
            )}
        </div>
    );
}

function WorkflowCard({ template, creating, disabled, onApply }: { template: QuickCreationTemplate; creating: boolean; disabled: boolean; onApply: () => void }) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const Icon = kindIcon(template.kind);
    return (
        <article className="group flex min-h-56 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]" style={{ boxShadow: `0 18px 44px ${theme.spatial.shadow}` }}>
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white/85">
                        <Icon className="size-4" />
                    </span>
                    <h3 className="truncate text-sm font-semibold text-white">{template.name}</h3>
                </div>
                <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[var(--fs-micro)] text-white/55">{template.category}</span>
            </div>
            <p className="min-h-10 px-4 text-xs leading-5 text-white/55">{template.description}</p>
            <div className="flex flex-wrap gap-1.5 px-4 py-3">
                {template.steps.map((step, index) => (
                    <span key={step} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[var(--fs-micro)] text-white/65">
                        <span className="tabular-nums text-white/85">{index + 1}</span>
                        {step}
                    </span>
                ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                        <span key={tag} className="text-[var(--fs-micro)] text-white/40">#{tag}</span>
                    ))}
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={onApply}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {creating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                    {creating ? "创建中…" : "打开画布"}
                </button>
            </div>
        </article>
    );
}

function kindIcon(kind: QuickCreationTemplate["kind"]) {
    switch (kind) {
        case "video":
            return Video;
        case "edit":
            return WandSparkles;
        case "face":
            return UserRound;
        case "cleanup":
            return Eraser;
        case "script":
            return Clapperboard;
        case "audio":
            return AudioLines;
        case "merge":
            return Film;
        case "style":
            return Sparkles;
        case "scene":
            return Clapperboard;
        default:
            return ImageIcon;
    }
}
