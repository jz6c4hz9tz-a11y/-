import { nanoid } from "nanoid";

import { createCanvasNode } from "@/lib/canvas/canvas-project-domain";
import { CanvasNodeType, type CanvasConnection, type CanvasNodeData, type CanvasNodeMetadata, type Position } from "@/types/canvas";

export type QuickCreationKind = "image" | "video" | "edit" | "face" | "cleanup" | "script" | "audio" | "merge" | "style" | "scene";
export type QuickCreationCategory = "商业" | "影视" | "修图" | "工具";

export type QuickCreationTemplate = {
    id: string;
    name: string;
    description: string;
    category: QuickCreationCategory;
    tags: string[];
    steps: string[];
    kind: QuickCreationKind;
    build: (center: Position) => { nodes: CanvasNodeData[]; connections: CanvasConnection[] };
};

type NodeOptions = {
    prompt?: string;
    size?: string;
    seconds?: string;
    edit?: boolean;
    workflowKind?: CanvasNodeMetadata["workflowKind"];
    content?: string;
    workflowTitle?: string;
    workflowDescription?: string;
};

function connect(from: CanvasNodeData, to: CanvasNodeData, toHandleId?: string): CanvasConnection {
    return { id: nanoid(), fromNodeId: from.id, toNodeId: to.id, toHandleId };
}

function buildTextNode(center: Position, offset: Position, title: string, content: string, options: NodeOptions = {}): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Text, { x: center.x + offset.x, y: center.y + offset.y }, {
        content: options.content ?? content,
        prompt: options.prompt ?? content,
        status: "idle",
        workflowKind: options.workflowKind ?? "free",
        workflowTitle: options.workflowTitle ?? title,
        workflowDescription: options.workflowDescription ?? "双击编辑提示词，或连线到生成节点",
        fontSize: 14,
    });
    node.title = title;
    node.width = 380;
    node.height = 220;
    return node;
}

function buildImageNode(center: Position, offset: Position, title: string, options: NodeOptions = {}): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Image, { x: center.x + offset.x, y: center.y + offset.y }, {
        prompt: options.prompt ?? "",
        status: "idle",
        workflowKind: options.workflowKind ?? "free",
        workflowTitle: options.workflowTitle ?? title,
        workflowDescription: options.workflowDescription ?? "打开节点面板输入提示词后生成",
        generationType: options.edit ? "edit" : "generation",
        size: options.size ?? "1:1",
        count: 1,
    });
    node.title = title;
    return node;
}

function buildVideoNode(center: Position, offset: Position, title: string, options: NodeOptions = {}): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Video, { x: center.x + offset.x, y: center.y + offset.y }, {
        prompt: options.prompt ?? "",
        status: "idle",
        workflowKind: options.workflowKind ?? "free",
        workflowTitle: options.workflowTitle ?? title,
        workflowDescription: options.workflowDescription ?? "上传首帧或直接输入提示词生成视频",
        seconds: options.seconds ?? "6",
    });
    node.title = title;
    return node;
}

function buildAudioNode(center: Position, offset: Position, title: string, prompt: string): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Audio, { x: center.x + offset.x, y: center.y + offset.y }, {
        prompt,
        status: "idle",
        workflowKind: "free",
        workflowTitle: title,
        workflowDescription: "输入声音、台词或氛围描述后生成音频",
    });
    node.title = title;
    return node;
}

function buildScriptNode(center: Position, offset: Position, title: string, prompt: string): CanvasNodeData {
    const node = createCanvasNode(CanvasNodeType.Script, { x: center.x + offset.x, y: center.y + offset.y }, {
        status: "idle",
        workflowKind: "storyboard",
        workflowTitle: title,
        workflowDescription: prompt,
        storyboard: {
            rows: [],
            visibleColumns: ["shotNumber", "durationSeconds", "plotDescription", "dialogue", "imageGenerationPrompt"],
            referenceNodeIds: [],
        },
    });
    node.title = `${title} · 待生成`;
    return node;
}

function buildEditFlow(center: Position, name: string, description: string, prompt: string): { nodes: CanvasNodeData[]; connections: CanvasConnection[] } {
    const source = buildImageNode(center, { x: -520, y: 0 }, "原图", { workflowTitle: "原图", workflowDescription: "上传需要处理的图片" });
    const instruction = buildTextNode(center, { x: -520, y: 260 }, "处理要求", prompt, { workflowTitle: "处理要求", workflowDescription: "描述本次编辑的目标" });
    const target = buildImageNode(center, { x: 20, y: 120 }, `${name} 结果`, { edit: true, prompt, workflowTitle: `${name} 结果`, workflowDescription: "基于原图和右侧提示词执行编辑" });
    return {
        nodes: [source, instruction, target],
        connections: [connect(source, target), connect(instruction, target)],
    };
}

function buildPromptMediaFlow(center: Position, name: string, description: string, prompt: string, mode: "image" | "video"): { nodes: CanvasNodeData[]; connections: CanvasConnection[] } {
    const source = buildTextNode(center, { x: -520, y: 0 }, `${name} 提示词`, prompt, { workflowTitle: `${name} 提示词`, workflowDescription: description });
    const target = mode === "image"
        ? buildImageNode(center, { x: 80, y: 0 }, `${name} 结果`, { prompt, size: "16:9", workflowTitle: `${name} 结果`, workflowDescription: "打开节点面板一键生成" })
        : buildVideoNode(center, { x: 80, y: 0 }, `${name} 结果`, { prompt, seconds: "6", workflowTitle: `${name} 结果`, workflowDescription: "打开节点面板一键生成视频" });
    return { nodes: [source, target], connections: [connect(source, target)] };
}

function buildImageToVideoFlow(center: Position, name: string, description: string, prompt: string): { nodes: CanvasNodeData[]; connections: CanvasConnection[] } {
    const source = buildImageNode(center, { x: -560, y: 0 }, "首帧 / 参考图", { workflowTitle: "首帧 / 参考图", workflowDescription: "上传首帧或参考图片" });
    const target = buildVideoNode(center, { x: 60, y: 0 }, `${name} 结果`, { prompt, seconds: "6", workflowTitle: `${name} 结果`, workflowDescription: "连接首帧后生成视频" });
    const instruction = buildTextNode(center, { x: -560, y: 280 }, "运镜与动作", prompt, { workflowTitle: "运镜与动作", workflowDescription: "描述画面运动、镜头和主体动作" });
    return { nodes: [source, instruction, target], connections: [connect(source, target), connect(instruction, target)] };
}

function buildFaceFlow(center: Position): { nodes: CanvasNodeData[]; connections: CanvasConnection[] } {
    const character = buildTextNode(center, { x: -620, y: 0 }, "角色一致性", "保持同一张脸、同一套造型和同样的光线，只改变表情与镜头。", {
        workflowKind: "character",
        workflowTitle: "角色一致性",
        workflowDescription: "填写角色名字、外观和不可变特征",
    });
    const reference = buildImageNode(center, { x: -620, y: 250 }, "角色参考图", { workflowTitle: "角色参考图", workflowDescription: "上传角色正面参考图" });
    const target = buildImageNode(center, { x: 40, y: 120 }, "新镜头结果", {
        edit: true,
        prompt: "保留角色面部特征和造型，改变表情、角度与景别。",
        workflowTitle: "新镜头结果",
        workflowDescription: "基于角色参考图生成一致的新镜头",
    });
    return {
        nodes: [character, reference, target],
        connections: [connect(reference, target), connect(character, target)],
    };
}

function buildVideoMergeFlow(center: Position): { nodes: CanvasNodeData[]; connections: CanvasConnection[] } {
    const first = buildVideoNode(center, { x: -640, y: -120 }, "片段 A", { workflowTitle: "片段 A", workflowDescription: "上传第一段视频" });
    const second = buildVideoNode(center, { x: -640, y: 180 }, "片段 B", { workflowTitle: "片段 B", workflowDescription: "上传第二段视频" });
    const instruction = buildTextNode(center, { x: 40, y: 30 }, "成片说明", "框选两个视频节点后使用工具栏「合并视频」，按顺序导出成片。", {
        workflowTitle: "成片说明",
        workflowDescription: "框选后合并",
    });
    return { nodes: [first, second, instruction], connections: [] };
}

export const QUICK_CREATION_TEMPLATES: QuickCreationTemplate[] = [
    {
        id: "quick-all-in-one-image",
        name: "全能图片PRO",
        description: "一张画布完成文生图、图生图、局部编辑和批量出图，适合高频商业出图。",
        category: "影视",
        tags: ["图片", "商业", "批量"],
        steps: ["输入提示词", "设置比例", "生成图片"],
        kind: "image",
        build: (center) => buildPromptMediaFlow(center, "全能图片PRO", "用一句话描述主体、环境、光线和画质要求。", "电影感商业摄影，主体清晰，细节锐利，高质量灯光，专业后期。", "image"),
    },
    {
        id: "quick-universal-t2i",
        name: "万能文生图",
        description: "文字直接变成图片：主体、场景、光线、构图一次描述到位。",
        category: "影视",
        tags: ["文生图", "灵感", "快速"],
        steps: ["描述画面", "选比例", "生成"],
        kind: "image",
        build: (center) => buildPromptMediaFlow(center, "万能文生图", "把脑海里的画面完整写下来。", "极具氛围感的数字影像，电影感光线，精致细节，4K 画质。", "image"),
    },
    {
        id: "quick-single-image-to-video",
        name: "商业单图生视频",
        description: "一张静态图变成动态镜头，适合产品展示和广告首帧。",
        category: "商业",
        tags: ["图生视频", "广告", "产品"],
        steps: ["上传首帧", "写运镜", "生成视频"],
        kind: "video",
        build: (center) => buildImageToVideoFlow(center, "商业单图生视频", "让静态产品图产生自然的镜头运动。", "镜头缓慢推进，产品保持稳定，灯光自然流动，背景轻微虚化。"),
    },
    {
        id: "quick-commerce-first-last-frame",
        name: "商业首尾帧视频",
        description: "首尾帧串联成完整镜头，适配商业片头的转场与运镜。",
        category: "商业",
        tags: ["首尾帧", "视频", "转场"],
        steps: ["上传首帧", "上传尾帧", "生成过渡"],
        kind: "video",
        build: (center) => {
            const first = buildImageNode(center, { x: -680, y: -140 }, "首帧", { workflowTitle: "首帧", workflowDescription: "上传起始画面" });
            const last = buildImageNode(center, { x: -680, y: 180 }, "尾帧", { workflowTitle: "尾帧", workflowDescription: "上传结束画面" });
            const target = buildVideoNode(center, { x: 20, y: 20 }, "转场视频", {
                prompt: "从首帧平滑过渡到尾帧，镜头连贯，动作自然，商业质感。",
                seconds: "6",
                workflowTitle: "转场视频",
                workflowDescription: "连接首尾帧后生成",
            });
            return { nodes: [first, last, target], connections: [connect(first, target), connect(last, target)] };
        },
    },
    {
        id: "quick-light-chase",
        name: "追光",
        description: "给画面加入追光与光斑流动，快速提升商业广告的氛围感。",
        category: "商业",
        tags: ["光效", "视频", "广告"],
        steps: ["上传素材", "写光效", "生成"],
        kind: "video",
        build: (center) => buildImageToVideoFlow(center, "追光", "让一束光跟随主体移动，形成聚焦视线。", "一束柔和追光跟随主体移动，光斑在背景中流动，商业电影质感。"),
    },
    {
        id: "quick-dual-image-merge",
        name: "双图融合",
        description: "两张参考图融合成一张新图：产品、场景、材质自由组合。",
        category: "商业",
        tags: ["融合", "合成", "商品"],
        steps: ["上传参考图", "写融合要求", "生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "双图融合", "把两张图的特征自然融合在一起。", "自然融合两张参考图，保留各自主要特征，光影方向一致，无生硬接缝。"),
    },
    {
        id: "quick-kv-car-replace",
        name: "商业KV替换汽车",
        description: "在既有主视觉中替换汽车车型，保留背景、光影与构图。",
        category: "商业",
        tags: ["KV", "汽车", "替换"],
        steps: ["上传KV", "上传车型", "替换生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "商业KV替换汽车", "把参考车型替换进主视觉画面。", "将参考车型替换到画面指定位置，保留原背景、光线、阴影和构图。"),
    },
    {
        id: "quick-object-transfer",
        name: "商业级万物迁移",
        description: "把任意物体迁移到新场景，保留材质、比例和产品真实感。",
        category: "商业",
        tags: ["迁移", "合成", "产品"],
        steps: ["上传物体", "上传场景", "迁移生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "商业级万物迁移", "把产品放进展厅、厨房、户外等场景。", "将参考物体迁移到目标场景中，透视、比例、阴影和材质完全匹配。"),
    },
    {
        id: "quick-jewelry-redesign",
        name: "珠宝设计改款",
        description: "保留主石与工艺特征，快速生成珠宝改款方案。",
        category: "商业",
        tags: ["珠宝", "设计", "改款"],
        steps: ["上传珠宝", "写改款", "生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "珠宝设计改款", "在保留主石的前提下改变戒托、链型或工艺。", "保留主石和主要工艺，重新设计戒托与链型，高清商业珠宝渲染。"),
    },
    {
        id: "quick-portrait-replace",
        name: "商业人像完美置换",
        description: "把参考人像放进新服装或场景，保留面部特征与真实感。",
        category: "商业",
        tags: ["人像", "置换", "服装"],
        steps: ["上传人像", "上传服装", "置换生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "商业人像完美置换", "让人物穿上新服装或进入新场景。", "保留人物面部和姿态，将参考服装自然穿在身上，皮肤、布料与光影真实。"),
    },
    {
        id: "quick-word-blade",
        name: "词刃4.0言出法随",
        description: "把一句话扩写成专业创作提示词，再连接到图片或视频节点。",
        category: "工具",
        tags: ["提示词", "扩写", "创作"],
        steps: ["写一句话", "扩写提示词", "接生成节点"],
        kind: "script",
        build: (center) => {
            const source = buildTextNode(center, { x: -560, y: 0 }, "一句话灵感", "写下一个镜头、角色或场景的原始想法。", { workflowTitle: "一句话灵感", workflowDescription: "先写一句最直觉的描述" });
            const prompt = buildTextNode(center, { x: -560, y: 260 }, "专业提示词", "将灵感扩写为：主体、场景、光线、镜头、画质与负向提示词。", { workflowTitle: "专业提示词", workflowDescription: "可再连接到图片或视频节点" });
            const target = buildImageNode(center, { x: 40, y: 130 }, "生成结果", { prompt: "根据专业提示词生成画面", workflowTitle: "生成结果", workflowDescription: "连接提示词后生成" });
            return { nodes: [source, prompt, target], connections: [connect(source, prompt), connect(prompt, target)] };
        },
    },
    {
        id: "quick-character-closeup",
        name: "人物特写镜头",
        description: "用统一角色参考快速生成人物特写，适合连续剧集与品牌片。",
        category: "影视",
        tags: ["人物", "特写", "连续"],
        steps: ["上传参考", "写表情", "生成镜头"],
        kind: "face",
        build: (center) => buildFaceFlow(center),
    },
    {
        id: "quick-face-consistency",
        name: "面部一致性",
        description: "让不同镜头中的同一角色保持面部一致，适合 AI 短剧。",
        category: "影视",
        tags: ["角色", "一致性", "短剧"],
        steps: ["创建角色卡", "上传参考", "批量生成"],
        kind: "face",
        build: (center) => buildFaceFlow(center),
    },
    {
        id: "quick-skin-polish",
        name: "面部磨皮精修",
        description: "保留肤质与五官结构，只做自然磨皮和细节精修。",
        category: "修图",
        tags: ["人像", "磨皮", "精修"],
        steps: ["上传人像", "设置程度", "精修"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "面部磨皮精修", "自然保留皮肤纹理。", "自然磨皮，保留五官结构与皮肤纹理，避免塑料感，商业精修。"),
    },
    {
        id: "quick-jewelry-retouch",
        name: "珠宝精修商业级",
        description: "让金属高光、宝石火彩和细节边缘全部达到电商标准。",
        category: "修图",
        tags: ["珠宝", "精修", "电商"],
        steps: ["上传原图", "一键精修", "检查细节"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "珠宝精修商业级", "提升金属与宝石质感。", "金属高光清晰，宝石火彩锐利，边缘无瑕疵，电商白底商业精修。"),
    },
    {
        id: "quick-glass-blend",
        name: "透明玻璃融合",
        description: "把产品放进玻璃质感场景，透光、反射与折射自然统一。",
        category: "修图",
        tags: ["玻璃", "透光", "产品"],
        steps: ["上传产品", "选择玻璃场景", "融合生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "透明玻璃融合", "让产品与玻璃场景自然融合。", "将产品融入透明玻璃场景，透光、反射、折射与边缘高光自然一致。"),
    },
    {
        id: "quick-digital-retouch",
        name: "数码3C商业精修",
        description: "屏幕、机身、接口和反光条全部按 3C 电商图标准精修。",
        category: "修图",
        tags: ["3C", "数码", "电商"],
        steps: ["上传产品", "一键精修", "输出"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "数码3C商业精修", "屏幕与机身细节拉满。", "屏幕内容清晰，机身金属质感准确，接口与按键锐利，商业电商精修。"),
    },
    {
        id: "quick-shoes-on-feet",
        name: "鞋类上脚",
        description: "让鞋子穿到模特脚上，姿态、尺码与鞋型自然匹配。",
        category: "商业",
        tags: ["鞋类", "上脚", "电商"],
        steps: ["上传鞋图", "选择姿态", "生成上脚"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "鞋类上脚", "让产品鞋自然穿在模特脚上。", "将参考鞋穿在模特脚上，鞋型、尺码、褶皱与光影自然，电商级质感。"),
    },
    {
        id: "quick-tyndall-light",
        name: "丁达尔光影斑驳",
        description: "给画面加入光束穿过树叶的丁达尔效应，氛围感一步到位。",
        category: "修图",
        tags: ["光影", "氛围", "特效"],
        steps: ["上传原图", "选择光型", "生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "丁达尔光影斑驳", "让光束穿过植物或缝隙。", "加入丁达尔效应，光束穿过植物缝隙，光斑自然散布，保留原有构图。"),
    },
    {
        id: "quick-snow-effect",
        name: "一键雪景特效",
        description: "把普通场景变成雪景，保留主体与构图，快速出氛围图。",
        category: "修图",
        tags: ["雪景", "季节", "特效"],
        steps: ["上传场景", "一键下雪", "微调"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "一键雪景特效", "把场景变成真实雪景。", "把画面变成雪景，地面和树冠积雪自然，雪花飘落，保留主体和构图。"),
    },
    {
        id: "quick-fog-effect",
        name: "一键迷雾特效",
        description: "给场景叠加薄雾、晨雾或舞台烟雾，层次更丰富。",
        category: "修图",
        tags: ["迷雾", "氛围", "特效"],
        steps: ["上传场景", "选雾浓度", "生成"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "一键迷雾特效", "让画面产生自然雾气。", "为画面加入自然薄雾，远近层次明显，光线透过雾气，保留主体。"),
    },
    {
        id: "quick-perfect-erase",
        name: "完美消除",
        description: "智能移除画面中的路人、杂物、电线或水印，不留痕迹。",
        category: "修图",
        tags: ["消除", "清理", "杂物"],
        steps: ["上传图片", "框选目标", "消除"],
        kind: "cleanup",
        build: (center) => buildEditFlow(center, "完美消除", "移除不需要的元素。", "移除画面中不需要的路人、杂物或电线，用周围背景自然填补，无痕迹。"),
    },
    {
        id: "quick-watermark-remove",
        name: "一键去水印",
        description: "去除角落水印、Logo 和日期，自动补全被遮挡区域。",
        category: "修图",
        tags: ["水印", "Logo", "清理"],
        steps: ["上传图片", "定位水印", "去除"],
        kind: "cleanup",
        build: (center) => buildEditFlow(center, "一键去水印", "干净移除水印。", "移除图片中的水印和 Logo，纹理与光影自然延续，无明显修复痕迹。"),
    },
    {
        id: "quick-cutout",
        name: "精准抠主体",
        description: "保留发丝、毛绒、玻璃和半透明材质的精细主体抠图。",
        category: "修图",
        tags: ["抠图", "透明", "素材"],
        steps: ["上传图片", "一键抠图", "导出透明素材"],
        kind: "edit",
        build: (center) => buildEditFlow(center, "精准抠主体", "保留复杂边缘与半透明材质。", "精准抠出主体，保留发丝、毛绒、玻璃和半透明材质，边缘干净。"),
    },
    {
        id: "quick-thick-paint-woman",
        name: "厚涂脸（女）",
        description: "把女性人像转成厚涂插画风格，保留身份与五官特征。",
        category: "修图",
        tags: ["厚涂", "插画", "人像"],
        steps: ["上传人像", "选择画风", "生成"],
        kind: "style",
        build: (center) => buildEditFlow(center, "厚涂脸（女）", "女性人像厚涂插画风。", "将人像转成厚涂插画风格，保留五官与身份特征，笔触自然，油画质感。"),
    },
    {
        id: "quick-thick-paint-man",
        name: "厚涂脸（男）",
        description: "把男性人像转成厚涂插画风格，保留轮廓与气质。",
        category: "修图",
        tags: ["厚涂", "插画", "人像"],
        steps: ["上传人像", "选择画风", "生成"],
        kind: "style",
        build: (center) => buildEditFlow(center, "厚涂脸（男）", "男性人像厚涂插画风。", "将人像转成厚涂插画风格，保留轮廓与气质，笔触自然，油画质感。"),
    },
    {
        id: "quick-video-merge",
        name: "视频成片",
        description: "多段视频按顺序合并导出成片，支持框选后一键操作。",
        category: "影视",
        tags: ["视频", "合并", "成片"],
        steps: ["导入片段", "框选合并", "导出"],
        kind: "merge",
        build: (center) => buildVideoMergeFlow(center),
    },
    {
        id: "quick-storyboard",
        name: "分镜故事板",
        description: "把一段故事拆成逐镜头表格，再逐镜生成图片或视频。",
        category: "影视",
        tags: ["分镜", "故事板"],
        steps: ["输入故事", "生成分镜", "逐镜成片"],
        kind: "script",
        build: (center) => {
            const story = buildTextNode(center, { x: -520, y: 0 }, "故事输入", "写下题材、角色、冲突和结局方向。", { workflowTitle: "故事输入", workflowDescription: "一段故事即可生成分镜脚本" });
            const script = buildScriptNode(center, { x: 80, y: 0 }, "分镜脚本", "按故事生成逐镜头分镜表");
            return { nodes: [story, script], connections: [connect(story, script, "storyboard:context")] };
        },
    },
    {
        id: "quick-audio-design",
        name: "音频设计",
        description: "从台词、旁白到氛围音效，用一张画布完成声音资产。",
        category: "工具",
        tags: ["音频", "配音", "音效"],
        steps: ["写描述", "选音色", "生成音频"],
        kind: "audio",
        build: (center) => {
            const prompt = buildTextNode(center, { x: -520, y: 0 }, "音频需求", "描述声音风格、语速、情绪和用途。", { workflowTitle: "音频需求", workflowDescription: "写清楚生成目标和参考风格" });
            const audio = buildAudioNode(center, { x: 40, y: 0 }, "音频结果", "生成符合描述的配音或氛围音效");
            return { nodes: [prompt, audio], connections: [connect(prompt, audio)] };
        },
    },
];

export function findQuickCreationTemplate(templateId: string) {
    return QUICK_CREATION_TEMPLATES.find((template) => template.id === templateId) || null;
}
