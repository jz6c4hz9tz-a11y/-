import { Button, Tooltip } from "antd";
import { BookOpenText, Bot, Focus, Globe2, Laptop, PanelRightClose, RotateCcw, Sparkles } from "lucide-react";

import type { CanvasContextSummary } from "@/lib/canvas/canvas-context-summary";
import type { CanvasTheme } from "@/lib/canvas-theme";
import type { CanvasAgentMode } from "./canvas-agent-chat-ui";

export function AgentPanelChrome({
    theme,
    mode,
    context,
    referenceCount,
    confirmTools,
    canUndo,
    undoCount,
    onModeChange,
    onConfirmToolsChange,
    onUndo,
    onCollapse,
}: {
    theme: CanvasTheme;
    mode: CanvasAgentMode;
    context: CanvasContextSummary;
    referenceCount: number;
    confirmTools: boolean;
    canUndo: boolean;
    undoCount: number;
    onModeChange: (mode: CanvasAgentMode) => void;
    onConfirmToolsChange: (confirm: boolean) => void;
    onUndo: () => void;
    onCollapse: () => void;
}) {
    return (
        <header className="shrink-0 px-3 pb-2 pt-3">
            <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md" style={{ background: theme.accent.primarySoft, color: theme.accent.primary }}>
                    <Bot className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold leading-5">AI Agent</div>
                    <div className="truncate text-[var(--fs-label)] leading-4" style={{ color: theme.node.muted }}>创意伙伴</div>
                </div>
                <AgentModeSwitch value={mode} theme={theme} onChange={onModeChange} />
                <Tooltip title="Standard · 精准执行，捕捉创意灵感">
                    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-1.5 text-[var(--fs-label)] font-medium" style={{ color: theme.node.muted, background: theme.spatial.surface }}>
                        <Sparkles className="size-3" />
                        Standard
                    </span>
                </Tooltip>
                <Tooltip title="收起 Agent">
                    <Button type="text" shape="circle" className="!h-8 !w-8 !min-w-8" style={{ color: theme.node.muted }} icon={<PanelRightClose className="size-4" />} onClick={onCollapse} />
                </Tooltip>
            </div>

            <div className="mt-2 flex min-h-8 flex-wrap items-center gap-x-2.5 gap-y-1 px-0.5 text-[var(--fs-label)]" style={{ color: theme.node.muted }}>
                <span className="font-medium" style={{ color: theme.node.text }}>{context.nodeCount} 个节点</span>
                {context.selectedCount ? <span className="inline-flex items-center gap-1"><Focus className="size-3" />选中 {context.selectedCount}</span> : <span>未选择节点</span>}
                {context.chapterLabel ? <span className="inline-flex min-w-0 items-center gap-1"><BookOpenText className="size-3 shrink-0" /><span className="max-w-32 truncate">{context.chapterLabel}{context.shotLabel ? ` · ${context.shotLabel}` : ""}</span></span> : null}
                {referenceCount ? <span>{referenceCount} 个参考</span> : null}
                <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    <Tooltip title={undoCount ? `撤销最近一批 Agent 写回，可撤销 ${undoCount} 批` : "没有可撤销的 Agent 写回"}>
                        <Button type="text" shape="circle" className="!h-7 !w-7 !min-w-7" disabled={!canUndo} style={{ color: theme.node.muted }} icon={<RotateCcw className="size-3.5" />} onClick={onUndo} aria-label="撤销最近一批 Agent 写回" />
                    </Tooltip>
                    <AgentExecutionModeSwitch value={confirmTools} theme={theme} onChange={onConfirmToolsChange} />
                </div>
            </div>
        </header>
    );
}

function AgentExecutionModeSwitch({ value, theme, onChange }: { value: boolean; theme: CanvasTheme; onChange: (confirm: boolean) => void }) {
    return (
        <div className="inline-flex h-7 shrink-0 items-center rounded-md p-0.5 text-[var(--fs-label)]" style={{ background: theme.spatial.surface }} role="group" aria-label="Agent 执行模式">
            {[{ label: "手动确认", value: true }, { label: "自动生成", value: false }].map((item) => {
                const active = value === item.value;
                return (
                    <button key={item.label} type="button" className="inline-flex h-6 items-center rounded-[var(--r-sm)] px-2 transition-colors" style={{ background: active ? theme.node.fill : "transparent", color: active ? theme.node.text : theme.node.muted, boxShadow: active ? `0 1px 5px ${theme.spatial.shadow}` : "none" }} onClick={() => onChange(item.value)} aria-pressed={active}>
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}

function AgentModeSwitch({ value, theme, onChange }: { value: CanvasAgentMode; theme: CanvasTheme; onChange: (value: CanvasAgentMode) => void }) {
    return (
        <div className="inline-flex h-8 shrink-0 items-center rounded-md p-0.5 text-[var(--fs-label)]" style={{ background: theme.spatial.surface }} role="group" aria-label="Agent 运行位置">
            {(["online", "local"] as const).map((item) => {
                const active = value === item;
                const Icon = item === "online" ? Globe2 : Laptop;
                return (
                    <button key={item} type="button" className="inline-flex h-7 items-center gap-1 rounded-[var(--r-sm)] px-2 transition-colors" style={{ background: active ? theme.node.fill : "transparent", color: active ? theme.node.text : theme.node.muted, boxShadow: active ? `0 1px 5px ${theme.spatial.shadow}` : "none" }} onClick={() => onChange(item)} aria-pressed={active}>
                        <Icon className="size-3" />
                        {item === "online" ? "网站" : "本机"}
                    </button>
                );
            })}
        </div>
    );
}

export function AgentChatEmptyState({ theme, nodeCount, onSelect }: { theme: CanvasTheme; nodeCount: number; onSelect: (value: string) => void }) {
    const starterActions = [
        { label: "我有一个创意", icon: Sparkles },
        { label: "帮我写剧本", icon: BookOpenText },
        { label: "设计一个角色", icon: Bot },
    ];
    return (
        <div className="flex h-full items-center px-5 py-8">
            <div className="mx-auto w-full max-w-[380px]">
                <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-md" style={{ background: theme.accent.primarySoft, color: theme.accent.primary }}><Bot className="size-3.5" /></span>
                    <span className="text-[var(--fs-label)] font-medium" style={{ color: theme.node.muted }}>{nodeCount} 个节点已就绪</span>
                </div>
                <h2 className="mt-3 text-[var(--fs-heading-lg)] font-semibold leading-6" style={{ color: theme.node.text }}>Hi 创作者! 今天有什么灵感我们一起创作？</h2>
                <div className="mt-4 grid grid-cols-1 gap-1">
                    {starterActions.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" className="group flex min-h-11 min-w-0 items-center gap-2.5 rounded-md px-2.5 text-left text-xs font-medium transition-colors" style={{ color: theme.node.text }} onMouseEnter={(event) => { event.currentTarget.style.background = theme.spatial.surface; }} onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }} onFocus={(event) => { event.currentTarget.style.background = theme.spatial.surface; }} onBlur={(event) => { event.currentTarget.style.background = "transparent"; }} onClick={() => onSelect(label)}>
                            <span className="grid size-7 shrink-0 place-items-center rounded-md" style={{ background: theme.spatial.surface, color: theme.node.muted }}><Icon className="size-3.5" /></span>
                            <span className="min-w-0 truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
