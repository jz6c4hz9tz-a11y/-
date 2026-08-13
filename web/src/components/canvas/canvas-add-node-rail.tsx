import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bot, History, Images, Plus, UserRound, Workflow } from "lucide-react";

import { CanvasCreateMenu, type CanvasCreateCommand } from "@/components/canvas/canvas-create-menu";
import { aceternityMotion } from "@/lib/aceternity-motion";
import { resolveAddNodeMenuCommands, type AddNodeMenuContext } from "@/lib/canvas/tool-registry";
import type { CanvasWorkspaceMode } from "@/types/canvas";

type RailHandler = () => void;

export type CanvasAddNodeRailHandlers = {
    onAddText: RailHandler;
    onAddImage: RailHandler;
    onAddVideo: RailHandler;
    onAddAudio: RailHandler;
    onAddScript: RailHandler;
    onAddFrame: RailHandler;
    onAddDrawing: RailHandler;
    onAddSkill: RailHandler;
    onAddVideoCompose: RailHandler;
    onOpenImageCompare: RailHandler;
    onOpenVrPreview: RailHandler;
    onOpenStoryboardEditor: RailHandler;
    onChooseStyle: RailHandler;
    onOpenDirector: RailHandler;
    onOpenProjectCharacters: RailHandler;
    onUpload: RailHandler;
    onOpenMyAssets: RailHandler;
    onOpenWorkflowTemplates: RailHandler;
};

type CanvasAddNodeRailProps = {
    handlers: CanvasAddNodeRailHandlers;
    workspaceMode: CanvasWorkspaceMode;
    isProjectLinked: boolean;
    agentOpen: boolean;
    onToggleAgent: () => void;
    mainToolbarActive: boolean;
    onToggleMainToolbar: () => void;
};

export function CanvasAddNodeRail({ handlers, workspaceMode, isProjectLinked, agentOpen, onToggleAgent, mainToolbarActive, onToggleMainToolbar }: CanvasAddNodeRailProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (!addMenuOpen) return;
        const closeMenu = (event: PointerEvent) => {
            const target = event.target instanceof Node ? event.target : null;
            if (target && rootRef.current?.contains(target)) return;
            setAddMenuOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setAddMenuOpen(false);
        };
        document.addEventListener("pointerdown", closeMenu, true);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeMenu, true);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [addMenuOpen]);

    const createContext: AddNodeMenuContext = {
        workspaceMode,
        isProjectLinked,
        handlers: {
            onAddText: handlers.onAddText,
            onAddImage: handlers.onAddImage,
            onAddVideo: handlers.onAddVideo,
            onAddAudio: handlers.onAddAudio,
            onAddScript: handlers.onAddScript,
            onAddFrame: handlers.onAddFrame,
            onAddDrawing: handlers.onAddDrawing,
            onAddSkill: handlers.onAddSkill,
            onAddVideoCompose: handlers.onAddVideoCompose,
            onOpenImageCompare: handlers.onOpenImageCompare,
            onOpenVrPreview: handlers.onOpenVrPreview,
            onOpenStoryboardEditor: handlers.onOpenStoryboardEditor,
            onChooseStyle: handlers.onChooseStyle,
            onOpenDirector: handlers.onOpenDirector,
            onOpenWorkflowTemplates: handlers.onOpenWorkflowTemplates,
            onUpload: handlers.onUpload,
            onOpenMyAssets: handlers.onOpenMyAssets,
            onOpenProjectCharacters: handlers.onOpenProjectCharacters,
        },
    };
    const addMenuCommands: CanvasCreateCommand[] = resolveAddNodeMenuCommands(createContext).map((command) => ({
        id: command.id,
        label: command.label,
        icon: command.icon,
        badge: command.badge,
        description: command.description,
        section: command.section,
        onClick: () => {
            command.run(createContext);
            setAddMenuOpen(false);
        },
    }));

    return (
        <aside ref={rootRef} data-canvas-no-zoom className="pointer-events-none absolute inset-y-0 left-0 z-[var(--z-panel)] w-[var(--canvas-rail-width)]">
            <div className="aix-glass-sidebar pointer-events-auto absolute left-3 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center">
                <RailButton label="添加节点" primary active={addMenuOpen} onClick={() => setAddMenuOpen((value) => !value)}>
                    <Plus className={`size-5 transition-transform duration-300 ${addMenuOpen ? "rotate-45" : ""}`} />
                </RailButton>
                <RailButton label="素材库" onClick={handlers.onOpenMyAssets}>
                    <Images className="size-5" />
                </RailButton>
                <RailButton label="AI角色库" badge onClick={handlers.onOpenProjectCharacters}>
                    <UserRound className="size-5" />
                </RailButton>
                <RailButton label="预设工作流" onClick={handlers.onOpenWorkflowTemplates}>
                    <Workflow className="size-5" />
                </RailButton>
                <RailButton label="历史" active={mainToolbarActive} onClick={onToggleMainToolbar}>
                    <History className="size-5" />
                </RailButton>
                <div className="aix-sidebar-sep" />
                <RailButton label="AI Agent" round active={agentOpen} onClick={onToggleAgent}>
                    <Bot className="size-5" />
                </RailButton>
            </div>

            {addMenuOpen ? (
                <motion.div
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -8, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={aceternityMotion.spring.panel}
                    className="aix-add-node-panel pointer-events-auto absolute top-1/2 max-h-[calc(100vh-var(--space-16))] w-[var(--canvas-add-menu-w)] -translate-y-1/2 overflow-y-auto thin-scrollbar"
                    style={{ left: "calc(var(--canvas-rail-width) + var(--space-3))" }}
                >
                    <CanvasCreateMenu commands={addMenuCommands} />
                </motion.div>
            ) : null}
        </aside>
    );
}

function RailButton({ label, primary = false, active = false, round = false, badge = false, onClick, children }: { label: string; primary?: boolean; active?: boolean; round?: boolean; badge?: boolean; onClick: () => void; children: ReactNode }) {
    return (
        <button
            type="button"
            className={`aix-sidebar-btn ${primary ? "aix-sidebar-btn--primary" : ""} ${active ? "aix-sidebar-btn--active" : ""} ${round ? "aix-sidebar-btn--assistant" : ""}`}
            title={label}
            aria-label={label}
            aria-expanded={active ? true : undefined}
            onClick={onClick}
        >
            {children}
            {badge ? <span className="aix-sidebar-btn__dot" /> : null}
        </button>
    );
}
