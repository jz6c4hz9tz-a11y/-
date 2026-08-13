import type { ReactNode } from "react";

export type CanvasCreateCommand = {
    id: string;
    label: string;
    icon: ReactNode;
    badge?: string;
    description?: string;
    section: "node" | "project" | "resource" | "director";
    onClick: () => void;
};

export function CanvasCreateMenu({ commands }: { commands: CanvasCreateCommand[] }) {
    const projectCommands = commands.filter((command) => command.section === "project");
    const nodeCommands = commands.filter((command) => command.section === "node");
    const directorCommands = commands.filter((command) => command.section === "director");
    const resourceCommands = commands.filter((command) => command.section === "resource");

    return (
        <div className="aix-add-node-menu">
            {projectCommands.length ? (
                <>
                    <MenuSection title="项目" />
                    {projectCommands.map((command) => <AddNodeItem key={command.id} command={command} />)}
                </>
            ) : null}

            <MenuSection title="创作节点" />
            {nodeCommands.map((command) => <AddNodeItem key={command.id} command={command} />)}

            {directorCommands.length ? (
                <>
                    <MenuSection title="导演功能" />
                    {directorCommands.map((command) => <AddNodeItem key={command.id} command={command} />)}
                </>
            ) : null}

            <MenuSection title="导入资源" />
            {resourceCommands.map((command) => <AddNodeItem key={command.id} command={command} />)}
        </div>
    );
}

function AddNodeItem({ command }: { command: CanvasCreateCommand }) {
    return (
        <button
            type="button"
            className="aix-add-node-item"
            title={command.description ? `${command.label} · ${command.description}` : command.label}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={command.onClick}
        >
            <span className="aix-add-node-item-icon">{command.icon}</span>
            <span className="aix-add-node-item-content">
                <span className="aix-add-node-item-title-row">
                    <span className="aix-add-node-item-label">{command.label}</span>
                    {command.badge ? <span className="aix-add-node-item-tag">{command.badge}</span> : null}
                </span>
                <span className="aix-add-node-item-desc">{command.description || "点击添加到画布"}</span>
            </span>
        </button>
    );
}

function MenuSection({ title }: { title: string }) {
    return <h3 className="aix-add-node-section-title">{title}</h3>;
}
