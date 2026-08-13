import { App, Button, Input, Modal } from "antd";
import { BookOpenCheck, Check, LoaderCircle, Plus, Search, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { canvasThemes } from "@/lib/canvas-theme";
import { SkillEditorDrawer } from "@/pages/skills/skill-editor-drawer";
import { fallbackSkillCategories, skillCategoryLabel } from "@/pages/skills/skill-catalog";
import { addSkill, listSkills, removeSkill, type Skill, type SkillCategory, type SkillScope } from "@/services/api/skills";
import { useThemeStore } from "@/stores/use-theme-store";

const scopeTabs: Array<{ value: SkillScope; label: string }> = [
    { value: "public", label: "通用" },
    { value: "favorites", label: "收藏" },
    { value: "mine", label: "我的" },
];

export function CanvasSkillLibraryPanel({ open, onClose, onInsertSkill }: {
    open: boolean;
    onClose: () => void;
    onInsertSkill: (skill: Skill) => void;
}) {
    const { message } = App.useApp();
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const [scope, setScope] = useState<SkillScope>("public");
    const [search, setSearch] = useState("");
    const [skills, setSkills] = useState<Skill[]>([]);
    const [categories, setCategories] = useState<SkillCategory[]>(fallbackSkillCategories);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [mutatingId, setMutatingId] = useState("");
    const [editorOpen, setEditorOpen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        setLoadError("");
        listSkills({ page: 1, page_size: 30, scope, sort: "popular", search: search.trim() || undefined })
            .then((result) => {
                if (cancelled) return;
                setSkills(result.skills);
                if (result.categories.length) setCategories(result.categories);
            })
            .catch((error) => {
                if (cancelled) return;
                setSkills([]);
                setLoadError(error instanceof Error ? error.message : "技能加载失败");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, reloadKey, scope, search]);

    const groupedSkills = useMemo(() => {
        const groups = fallbackSkillCategories.map((category) => ({
            ...category,
            skills: skills.filter((skill) => skill.tag === category.value),
        }));
        const unmatched = skills.filter((skill) => !fallbackSkillCategories.some((category) => category.value === skill.tag));
        return [...groups, ...(unmatched.length ? [{ value: "others", label: "其他", skills: unmatched }] : [])].filter((group) => group.skills.length > 0);
    }, [skills]);

    const toggleAdded = async (skill: Skill) => {
        if (skill.is_owner) return;
        setMutatingId(skill.skill_id);
        try {
            const result = skill.is_added ? await removeSkill(skill.skill_id) : await addSkill(skill.skill_id);
            patchSkill(result.skill);
            message.success(result.skill.is_added ? "已加入我的技能" : "已从我的技能移除");
        } catch (error) {
            message.error(error instanceof Error ? error.message : "技能状态更新失败");
        } finally {
            setMutatingId("");
        }
    };

    const patchSkill = (next: Skill) => {
        setSkills((items) => items.map((item) => item.skill_id === next.skill_id ? { ...item, ...next } : item));
    };

    return (
        <>
            <Modal
                title="Skill 技能库"
                open={open}
                width={760}
                centered
                onCancel={onClose}
                footer={null}
                styles={{ body: { overflow: "hidden", padding: 0 } }}
            >
                <div className="flex h-[min(640px,calc(100dvh-120px))] flex-col">
                    <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ borderColor: theme.toolbar.border }}>
                        <div className="flex h-8 items-center gap-0.5 rounded-md p-0.5" style={{ background: theme.spatial.surface }}>
                            {scopeTabs.map((tab) => {
                                const active = scope === tab.value;
                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        className="inline-flex h-7 items-center rounded-[var(--r-sm)] px-2.5 text-xs font-medium outline-none focus-visible:ring-2"
                                        style={{ background: active ? theme.node.fill : "transparent", color: active ? theme.node.text : theme.node.muted, boxShadow: active ? `0 1px 5px ${theme.spatial.shadow}` : "none", "--tw-ring-color": theme.node.muted } as CSSProperties}
                                        onClick={() => setScope(tab.value)}
                                        aria-pressed={active}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                        <Input
                            className="!h-8 min-w-0 flex-1"
                            allowClear
                            prefix={<Search className="size-3.5" style={{ color: theme.node.muted }} />}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="搜索技能"
                        />
                        <Button className="!h-8" type="primary" icon={<Plus className="size-3.5" />} onClick={() => setEditorOpen(true)}>
                            创建技能
                        </Button>
                    </div>

                    <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">
                        {loading ? (
                            <div className="grid place-items-center gap-2 py-12 text-sm" style={{ color: theme.node.muted }}>
                                <LoaderCircle className="size-5 animate-spin" />
                                正在加载技能库
                            </div>
                        ) : loadError ? (
                            <div className="grid place-items-center py-12 text-sm" style={{ color: theme.accent.danger }}>
                                {loadError}
                            </div>
                        ) : groupedSkills.length ? (
                            groupedSkills.map((group) => (
                                <section key={group.value} className="mb-4">
                                    <div className="mb-1.5 flex items-center gap-2 px-0.5">
                                        <h3 className="text-xs font-semibold" style={{ color: theme.node.text }}>{group.label}</h3>
                                        <span className="text-[var(--fs-label)]" style={{ color: theme.node.muted }}>{group.skills.length} 个</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.skills.map((skill) => (
                                            <article key={skill.skill_id} className="flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: theme.node.stroke, background: theme.node.panel }}>
                                                <span className="grid size-8 shrink-0 place-items-center rounded-md" style={{ background: `${theme.accent.primarySoft}`, color: theme.accent.primary }}>
                                                    <BookOpenCheck className="size-4" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <h4 className="truncate text-sm font-medium" style={{ color: theme.node.text }} title={skill.skill_name}>{skill.skill_name}</h4>
                                                        <span className="shrink-0 rounded border px-1.5 py-0.5 text-[var(--fs-micro)]" style={{ borderColor: theme.node.stroke, color: theme.node.muted }}>{skillCategoryLabel(skill.tag, categories)}</span>
                                                        {skill.is_private ? <span className="shrink-0 rounded border px-1.5 py-0.5 text-[var(--fs-micro)]" style={{ borderColor: theme.node.stroke, color: theme.node.muted }}>仅自己</span> : null}
                                                    </div>
                                                    <p className="mt-0.5 truncate text-[var(--fs-label)]" style={{ color: theme.node.muted }} title={skill.description}>{skill.description || "暂无技能简介"}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    {!skill.is_owner ? (
                                                        <Button size="small" className="!h-7 !px-2.5" loading={mutatingId === skill.skill_id} icon={skill.is_added ? <Check className="size-3" /> : <Plus className="size-3" />} onClick={() => void toggleAdded(skill)}>
                                                            {skill.is_added ? "已加入" : "加入"}
                                                        </Button>
                                                    ) : null}
                                                    <Button size="small" type="primary" className="!h-7 !px-2.5" icon={<Sparkles className="size-3" />} onClick={() => onInsertSkill(skill)}>
                                                        添加到画布
                                                    </Button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="grid place-items-center gap-2 py-12 text-sm" style={{ color: theme.node.muted }}>
                                <Sparkles className="size-5 opacity-60" />
                                没有找到匹配的技能
                            </div>
                        )}
                    </div>

                    <div className="border-t px-4 py-2.5 text-[var(--fs-label)]" style={{ borderColor: theme.toolbar.border, color: theme.node.muted }}>
                        {skills.length} 个技能 · 可添加到画布并与图片、视频、音频或文本节点连线使用
                    </div>
                </div>
            </Modal>

            <SkillEditorDrawer
                open={editorOpen}
                skill={null}
                onClose={() => setEditorOpen(false)}
                onSaved={() => {
                    setEditorOpen(false);
                    setReloadKey((value) => value + 1);
                    message.success("技能已创建，可在通用或我的中查找");
                }}
            />
        </>
    );
}
