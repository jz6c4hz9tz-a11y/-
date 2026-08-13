import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { App, Input } from "antd";
import { useNavigate } from "react-router";
import { Clapperboard, Film, LoaderCircle, Palette, Plus, Search, Sparkles, UserRound, Workflow, Scissors } from "lucide-react";

import { canvasThemes } from "@/lib/canvas-theme";
import { CANVAS_WORKFLOW_TEMPLATES, type CanvasWorkflowTemplate, type CanvasWorkflowTemplateCategory } from "@/lib/canvas/canvas-workflow-templates";
import { QUICK_CREATION_TEMPLATES, type QuickCreationCategory } from "@/lib/canvas/canvas-quick-creation";
import { createCanvasProjectWithRemoteSync } from "@/services/user-data-sync";
import { useThemeStore } from "@/stores/use-theme-store";

type GalleryWorkflowCategory = CanvasWorkflowTemplateCategory | QuickCreationCategory | "all";
type GalleryWorkflowTemplate = Omit<CanvasWorkflowTemplate, "category"> & { category: string };

const categoryOptions: Array<{ value: GalleryWorkflowCategory; label: string }> = [
    { value: "all", label: "全部" },
    { value: "影视", label: "影视" },
    { value: "分镜", label: "分镜" },
    { value: "风格", label: "风格" },
    { value: "角色", label: "角色" },
    { value: "成片", label: "成片" },
    { value: "商业", label: "商业" },
    { value: "修图", label: "修图" },
    { value: "工具", label: "工具" },
];

const categoryIcons: Record<string, ReactNode> = {
    影视: <Clapperboard className="size-4" />,
    分镜: <Film className="size-4" />,
    风格: <Palette className="size-4" />,
    角色: <UserRound className="size-4" />,
    成片: <Scissors className="size-4" />,
    商业: <Workflow className="size-4" />,
    修图: <Palette className="size-4" />,
    工具: <Workflow className="size-4" />,
};

const galleryTemplates: GalleryWorkflowTemplate[] = [...CANVAS_WORKFLOW_TEMPLATES, ...QUICK_CREATION_TEMPLATES];

export default function WorkflowsPage() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState<GalleryWorkflowCategory>("all");
    const [creatingId, setCreatingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        return galleryTemplates.filter((template) => {
            if (category !== "all" && template.category !== category) return false;
            if (!query) return true;
            return template.name.toLowerCase().includes(query) || template.description.toLowerCase().includes(query) || template.tags.some((tag) => tag.toLowerCase().includes(query));
        });
    }, [category, keyword]);

    const handleCreate = async (template: GalleryWorkflowTemplate) => {
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
        <main className="app-user-content app-workspace-scroll h-full overflow-y-auto text-foreground">
            <div className="mx-auto w-full max-w-[1440px] px-6 py-8">
                <header className="flex flex-col gap-4 border-b pb-6" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-xl border" style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border, color: theme.accent.primary }}>
                            <Workflow className="size-5" />
                        </span>
                        <div>
                            <h1 className="text-[var(--fs-title)] font-semibold leading-tight">工作流模板</h1>
                            <p className="mt-0.5 text-sm" style={{ color: theme.node.muted }}>选择一个流程，一键生成可编辑的无限画布</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            {categoryOptions.map((option) => {
                                const active = category === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className="rounded-full border px-3.5 py-1.5 text-sm font-medium transition hover:brightness-110"
                                        style={{
                                            background: active ? theme.accent.primary : theme.toolbar.panel,
                                            borderColor: active ? theme.accent.primary : theme.toolbar.border,
                                            color: active ? "#fff" : theme.node.text,
                                        }}
                                        onClick={() => setCategory(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        <Input
                            allowClear
                            prefix={<Search className="size-3.5 opacity-60" />}
                            placeholder="搜索工作流或标签"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            className="md:w-72"
                        />
                    </div>
                </header>

                {filtered.length ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((template) => (
                            <WorkflowTemplateCard
                                key={template.id}
                                template={template}
                                creating={creatingId === template.id}
                                disabled={Boolean(creatingId)}
                                onApply={() => void handleCreate(template)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 flex flex-col items-center gap-2 text-sm" style={{ color: theme.node.muted }}>
                        <Search className="size-6 opacity-50" />
                        <span>没有匹配的工作流模板</span>
                    </div>
                )}
            </div>
        </main>
    );
}

function WorkflowTemplateCard({ template, creating, disabled, onApply }: { template: GalleryWorkflowTemplate; creating: boolean; disabled: boolean; onApply: () => void }) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border transition hover:-translate-y-0.5" style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border, boxShadow: `0 18px 44px ${theme.spatial.shadow}` }}>
            <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: `${theme.accent.primary}16`, color: theme.accent.primary }}>
                        {categoryIcons[template.category] || <Workflow className="size-4" />}
                    </span>
                    <h2 className="truncate text-[var(--fs-body)] font-semibold">{template.name}</h2>
                </div>
                <span className="shrink-0 rounded-full border px-2 py-0.5 text-[var(--fs-micro)]" style={{ borderColor: theme.toolbar.border, color: theme.node.muted }}>{template.category}</span>
            </div>
            <p className="min-h-12 px-4 text-[var(--fs-label)] leading-5" style={{ color: theme.node.muted }}>{template.description}</p>
            <div className="flex flex-wrap gap-1.5 px-4 py-3">
                {template.steps.map((step, index) => (
                    <span key={step} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[var(--fs-micro)]" style={{ borderColor: theme.toolbar.border, color: theme.node.text }}>
                        <span className="tabular-nums" style={{ color: theme.accent.primary }}>{index + 1}</span>
                        {step}
                    </span>
                ))}
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3" style={{ borderColor: theme.toolbar.border }}>
                <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                        <span key={tag} className="text-[var(--fs-micro)]" style={{ color: theme.node.muted }}>#{tag}</span>
                    ))}
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[var(--fs-label)] font-medium transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: theme.accent.primary, color: "#fff" }}
                    onClick={onApply}
                >
                    {creating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                    {creating ? "创建中…" : "新建画布并应用"}
                </button>
            </div>
        </article>
    );
}
