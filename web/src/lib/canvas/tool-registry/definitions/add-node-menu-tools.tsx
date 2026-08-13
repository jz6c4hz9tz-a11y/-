import { BookOpenCheck, Clapperboard, Film, FolderOpen, Image as ImageIcon, Images, LayoutGrid, Layers3, Music2, Orbit, Palette, PanelTop, Pencil, Type, UploadCloud, UserRound, Video, Workflow } from "lucide-react";

import { registerAddNodeMenuCommands, type AddNodeMenuCommand } from "@/lib/canvas/tool-registry";

export const addNodeMenuCommands: AddNodeMenuCommand[] = [
    // 项目级动作不占用节点网格，保证 8 个节点稳定保持四列两行。
    { id: "style", label: "项目画风", icon: <Palette />, section: "project", defaultOrder: 10, applicable: (ctx) => !ctx.isProjectLinked, run: (ctx) => ctx.handlers.onChooseStyle() },
    { id: "workflow-templates", label: "工作流模板", icon: <Workflow />, badge: "模板", section: "project", defaultOrder: 20, run: (ctx) => ctx.handlers.onOpenWorkflowTemplates() },
    // 创作节点
    { id: "text", label: "文本", icon: <Type />, section: "node", defaultOrder: 10, run: (ctx) => ctx.handlers.onAddText() },
    { id: "drawing", label: "绘图", icon: <Pencil />, section: "node", defaultOrder: 20, run: (ctx) => ctx.handlers.onAddDrawing() },
    { id: "script", label: "新剧本分镜", icon: <Clapperboard />, badge: "核心", description: "AI 分镜剧本拆解、自动分镜排版", section: "node", defaultOrder: 30, run: (ctx) => ctx.handlers.onAddScript() },
    { id: "frame", label: "背板", icon: <PanelTop />, section: "node", defaultOrder: 40, applicable: (ctx) => ctx.workspaceMode !== "simple", run: (ctx) => ctx.handlers.onAddFrame() },
    { id: "image", label: "图片", icon: <ImageIcon />, section: "node", defaultOrder: 50, run: (ctx) => ctx.handlers.onAddImage() },
    { id: "video", label: "视频", icon: <Video />, section: "node", defaultOrder: 60, run: (ctx) => ctx.handlers.onAddVideo() },
    { id: "skill", label: "技能", icon: <BookOpenCheck />, badge: "Skill", description: "把常用提示词和创作方法收进工具架", section: "node", defaultOrder: 70, run: (ctx) => ctx.handlers.onAddSkill?.() },
    { id: "video-compose", label: "视频合成", icon: <Film />, description: "将多段视频拼接合成", section: "node", defaultOrder: 80, run: (ctx) => ctx.handlers.onAddVideoCompose?.() },
    { id: "image-compare", label: "图像对比", icon: <Images />, description: "对比两张图片的差异", section: "node", defaultOrder: 90, run: (ctx) => ctx.handlers.onOpenImageCompare?.() },
    { id: "audio", label: "音频", icon: <Music2 />, section: "node", defaultOrder: 100, applicable: (ctx) => ctx.workspaceMode !== "simple", run: (ctx) => ctx.handlers.onAddAudio() },
    // 导演功能
    { id: "storyboard-editor", label: "剧本分镜", icon: <LayoutGrid />, description: "AI 分镜剧本拆解、自动分镜排版", section: "director", defaultOrder: 10, run: (ctx) => ctx.handlers.onOpenStoryboardEditor?.() },
    { id: "storyboard-grid", label: "分镜编辑宫格裁剪", icon: <PanelTop />, description: "打开分镜宫格编辑与裁剪", section: "director", defaultOrder: 20, run: (ctx) => ctx.handlers.onOpenStoryboardEditor?.() },
    { id: "vr-preview", label: "VR360° 全景沉浸预览", icon: <Orbit />, description: "全景沉浸预览", section: "director", defaultOrder: 30, run: (ctx) => ctx.handlers.onOpenVrPreview?.() },
    { id: "director", label: "3D 导演台", icon: <Layers3 />, badge: "3D", section: "director", defaultOrder: 40, applicable: (ctx) => ctx.workspaceMode !== "simple", run: (ctx) => ctx.handlers.onOpenDirector() },
    // 导入资源
    { id: "upload", label: "上传文件", icon: <UploadCloud />, section: "resource", defaultOrder: 10, run: (ctx) => ctx.handlers.onUpload() },
    { id: "project-character", label: "添加角色卡", icon: <UserRound />, section: "resource", defaultOrder: 20, applicable: (ctx) => ctx.isProjectLinked, run: (ctx) => ctx.handlers.onOpenProjectCharacters() },
    { id: "assets", label: "素材库", icon: <FolderOpen />, section: "resource", defaultOrder: 30, applicable: (ctx) => !ctx.isProjectLinked, run: (ctx) => ctx.handlers.onOpenMyAssets() },
];

registerAddNodeMenuCommands(addNodeMenuCommands);
