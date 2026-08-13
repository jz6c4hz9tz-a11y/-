// 工作流模板画廊：内置“一键建画布”模板，全部基于本地画布节点能力从零构建。

import { createCanvasNode, createStoryboardRow } from "@/lib/canvas/canvas-project-domain";
import { CanvasNodeType, type CanvasConnection, type CanvasNodeData, type Position } from "@/types/canvas";

export type CanvasWorkflowTemplateCategory = "影视" | "分镜" | "风格" | "角色" | "成片";

export type CanvasWorkflowTemplate = {
    id: string;
    name: string;
    description: string;
    category: CanvasWorkflowTemplateCategory;
    tags: string[];
    steps: string[];
    build: (center: Position) => { nodes: CanvasNodeData[]; connections: CanvasConnection[] };
};

function buildStyleNode(center: Position): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Text, { x: center.x, y: center.y - 150 }, {
        content: "",
        status: "idle",
        workflowKind: "styleboard",
        workflowTitle: "项目画风",
        workflowDescription: "待选择",
        fontSize: 14,
    });
    node.title = "项目画风 · 待选择";
    node.width = 380;
    node.height = 220;
    return node;
}

function buildStoryNode(center: Position): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Text, { x: center.x, y: center.y + 170 }, {
        content: "",
        status: "idle",
        workflowKind: "story_input",
        workflowTitle: "故事输入",
        workflowDescription: "题材、角色、冲突和结局方向",
        fontSize: 14,
    });
    node.title = "故事梗概";
    node.width = 420;
    node.height = 260;
    return node;
}

function buildScriptNode(center: Position): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Script, center, {
        status: "idle",
        workflowKind: "storyboard",
        workflowTitle: "分镜脚本",
        storyboard: {
            rows: [createStoryboardRow(1)],
            visibleColumns: ["shotNumber", "durationSeconds", "plotDescription", "dialogue"],
            referenceNodeIds: [],
        },
    });
    node.title = "分镜脚本 · 待生成";
    return node;
}

function buildCharacterNode(center: Position, index: number, name: string): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Text, { x: center.x + index * 300, y: center.y }, {
        content: "",
        status: "idle",
        workflowKind: "character",
        characterName: name,
        characterPrompt: "",
        characterAliases: [],
        characterDefinition: {},
        fontSize: 14,
    });
    node.title = `角色卡 · ${name}`;
    node.width = 300;
    node.height = 260;
    return node;
}

function buildVideoNode(center: Position, index: number): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Video, { x: center.x + index * 340, y: center.y }, {
        status: "idle",
        workflowKind: "free",
    });
    node.title = `视频片段 ${index + 1}`;
    return node;
}

function buildInstructionNode(center: Position, content: string): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Text, { x: center.x, y: center.y + 230 }, {
        content,
        status: "success",
        workflowKind: "free",
        workflowTitle: "操作说明",
        fontSize: 13,
    });
    node.title = "操作说明";
    node.width = 420;
    node.height = 120;
    return node;
}

export const CANVAS_WORKFLOW_TEMPLATES: CanvasWorkflowTemplate[] = [
    {
        id: "storyboard",
        name: "分镜故事板",
        description: "故事输入 + 分镜脚本节点：把一段故事拆解成逐镜头的分镜表格，再逐镜生成图片或视频。",
        category: "分镜",
        tags: ["分镜", "故事板"],
        steps: ["输入故事", "生成分镜", "逐镜成片"],
        build: (center) => {
            const storyNode = buildStoryNode(center);
            const scriptNode = buildScriptNode(center);
            const connections: CanvasConnection[] = [{ id: `wf-storyboard-${Date.now()}`, fromNodeId: storyNode.id, toNodeId: scriptNode.id, toHandleId: "storyboard:context" }];
            return { nodes: [storyNode, scriptNode], connections };
        },
    },
    {
        id: "styleboard",
        name: "项目画风",
        description: "先选定统一的视觉风格再开始创作，风格节点会贯穿后续所有图片与视频生成。",
        category: "风格",
        tags: ["画风", "风格"],
        steps: ["选择画风", "应用到创作"],
        build: (center) => {
            const styleNode = buildStyleNode(center);
            return { nodes: [styleNode], connections: [] };
        },
    },
    {
        id: "character",
        name: "角色设定",
        description: "预置两名角色卡节点，填写人设后即可生成角色形象，并在分镜中保持角色一致。",
        category: "角色",
        tags: ["角色", "人物"],
        steps: ["填写角色卡", "生成形象", "参考创作"],
        build: (center) => ({
            nodes: [buildCharacterNode(center, 0, "角色一"), buildCharacterNode(center, 1, "角色二")],
            connections: [],
        }),
    },
    {
        id: "video-merge",
        name: "视频成片",
        description: "准备两段视频片段，框选后一键合并导出成片；文本节点说明完整操作路径。",
        category: "成片",
        tags: ["视频", "合并"],
        steps: ["导入片段", "框选合并", "导出成片"],
        build: (center) => ({
            nodes: [
                buildVideoNode(center, 0),
                buildVideoNode(center, 1),
                buildInstructionNode(center, "向两个视频节点上传片段，框选后点击工具栏「合并视频」即可按顺序拼接导出成片。"),
            ],
            connections: [],
        }),
    },
];

export function findWorkflowTemplate(templateId: string) {
    return CANVAS_WORKFLOW_TEMPLATES.find((template) => template.id === templateId) || null;
}
