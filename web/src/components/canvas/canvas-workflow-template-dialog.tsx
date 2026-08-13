import { useMemo, useState } from "react";
import { App, Input, Modal } from "antd";
import { LoaderCircle, Plus, Search } from "lucide-react";

import { canvasThemes } from "@/lib/canvas-theme";
import { CANVAS_WORKFLOW_TEMPLATES, type CanvasWorkflowTemplate } from "@/lib/canvas/canvas-workflow-templates";
import { QUICK_CREATION_TEMPLATES, type QuickCreationTemplate } from "@/lib/canvas/canvas-quick-creation";
import { useThemeStore } from "@/stores/use-theme-store";

type GalleryWorkflowTemplate = CanvasWorkflowTemplate | QuickCreationTemplate;

type CanvasWorkflowTemplateDialogProps = {
    open: boolean;
    onClose: () => void;
    onApply: (template: GalleryWorkflowTemplate) => void;
};

export function CanvasWorkflowTemplateDialog({ open, onClose, onApply }: CanvasWorkflowTemplateDialogProps) {
    const { message } = App.useApp();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const [keyword, setKeyword] = useState("");
    const [applyingId, setApplyingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const query = keyword.trim().toLowerCase();
        const templates: GalleryWorkflowTemplate[] = [...CANVAS_WORKFLOW_TEMPLATES, ...QUICK_CREATION_TEMPLATES];
        if (!query) return templates;
        return templates.filter((template) => template.name.toLowerCase().includes(query) || template.description.toLowerCase().includes(query) || template.tags.some((tag) => tag.toLowerCase().includes(query)));
    }, [keyword]);

    const apply = (template: GalleryWorkflowTemplate) => {
        if (applyingId) return;
        setApplyingId(template.id);
        try {
            onApply(template);
            message.success(`已应用「${template.name}」到当前画布`);
        } finally {
            setApplyingId(null);
        }
    };

    return (
        <Modal title="应用工作流模板" open={open} onCancel={onClose} width={720} centered destroyOnHidden footer={null}>
            <div className="flex flex-col gap-3">
                <Input
                    allowClear
                    prefix={<Search className="size-3.5 opacity-60" />}
                    placeholder="搜索工作流或标签"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                />
                <div className="max-h-[56vh] space-y-2 overflow-y-auto pr-1">
                    {filtered.map((template) => (
                        <div key={template.id} className="flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3" style={{ background: theme.toolbar.panel, borderColor: theme.toolbar.border }}>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-[var(--fs-body)] font-semibold">{template.name}</span>
                                    <span className="shrink-0 rounded-full border px-1.5 py-px text-[var(--fs-micro)]" style={{ borderColor: theme.toolbar.border, color: theme.node.muted }}>{template.category}</span>
                                </div>
                                <p className="mt-0.5 truncate text-[var(--fs-label)]" style={{ color: theme.node.muted }}>{template.description}</p>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {template.steps.map((step) => (
                                        <span key={step} className="rounded-full border px-1.5 py-px text-[var(--fs-micro)]" style={{ borderColor: theme.toolbar.border, color: theme.node.text }}>{step}</span>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={Boolean(applyingId)}
                                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[var(--fs-label)] font-medium transition hover:brightness-110 disabled:opacity-60"
                                style={{ background: theme.accent.primary, color: "#fff" }}
                                onClick={() => apply(template)}
                            >
                                {applyingId === template.id ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                                应用
                            </button>
                        </div>
                    ))}
                    {!filtered.length ? (
                        <div className="py-10 text-center text-sm" style={{ color: theme.node.muted }}>没有匹配的工作流模板</div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
