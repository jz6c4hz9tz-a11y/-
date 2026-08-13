import { CanvasNodeAnnotationDialog } from "@/components/canvas/canvas-node-annotation-dialog";
import { CanvasColorGradeDialog } from "@/components/canvas/canvas-color-grade-modal";
import { CanvasNodeCropDialog, type CanvasImageCropRect } from "@/components/canvas/canvas-node-crop-dialog";
import { CanvasNodeMaskEditDialog, type CanvasImageMaskEditPayload } from "@/components/canvas/canvas-node-mask-edit-dialog";
import { CanvasNodeSplitDialog, type CanvasImageSplitParams } from "@/components/canvas/canvas-node-split-dialog";
import { CanvasNodeUpscaleDialog, type CanvasImageUpscaleParams } from "@/components/canvas/canvas-node-upscale-dialog";
import type { CanvasColorGradeSettings } from "@/lib/canvas/canvas-color-grade";
import type { CanvasNodeData } from "@/types/canvas";

type CanvasProjectMediaDialogsProps = {
    cropNode: CanvasNodeData | null;
    annotationNode: CanvasNodeData | null;
    maskEditNode: CanvasNodeData | null;
    splitNode: CanvasNodeData | null;
    upscaleNode: CanvasNodeData | null;
    colorGradeNode: CanvasNodeData | null;
    onCloseCrop: () => void;
    onCloseAnnotation: () => void;
    onCloseMaskEdit: () => void;
    onCloseSplit: () => void;
    onCloseUpscale: () => void;
    onCloseColorGrade: () => void;
    onCrop: (node: CanvasNodeData, crop: CanvasImageCropRect) => void;
    onAnnotate: (node: CanvasNodeData, dataUrl: string) => void;
    onMaskEdit: (node: CanvasNodeData, payload: CanvasImageMaskEditPayload) => void;
    onSplit: (node: CanvasNodeData, params: CanvasImageSplitParams) => void;
    onUpscale: (node: CanvasNodeData, params: CanvasImageUpscaleParams) => void;
    onColorGrade: (node: CanvasNodeData, settings: CanvasColorGradeSettings, presetId?: string) => void;
};

export function CanvasProjectMediaDialogs({
    cropNode,
    annotationNode,
    maskEditNode,
    splitNode,
    upscaleNode,
    colorGradeNode,
    onCloseCrop,
    onCloseAnnotation,
    onCloseMaskEdit,
    onCloseSplit,
    onCloseUpscale,
    onCloseColorGrade,
    onCrop,
    onAnnotate,
    onMaskEdit,
    onSplit,
    onUpscale,
    onColorGrade,
}: CanvasProjectMediaDialogsProps) {
    return (
        <>
            {cropNode?.metadata?.content ? <CanvasNodeCropDialog dataUrl={cropNode.metadata.content} open onClose={onCloseCrop} onConfirm={(crop) => onCrop(cropNode, crop)} /> : null}
            {annotationNode?.metadata?.content ? <CanvasNodeAnnotationDialog image={{ url: annotationNode.metadata.content, storageKey: annotationNode.metadata.storageKey }} open onClose={onCloseAnnotation} onConfirm={(dataUrl) => onAnnotate(annotationNode, dataUrl)} /> : null}
            {maskEditNode?.metadata?.content ? <CanvasNodeMaskEditDialog dataUrl={maskEditNode.metadata.content} open onClose={onCloseMaskEdit} onConfirm={(payload) => onMaskEdit(maskEditNode, payload)} /> : null}
            {splitNode?.metadata?.content ? <CanvasNodeSplitDialog dataUrl={splitNode.metadata.content} open onClose={onCloseSplit} onConfirm={(params) => onSplit(splitNode, params)} /> : null}
            {upscaleNode?.metadata?.content ? <CanvasNodeUpscaleDialog dataUrl={upscaleNode.metadata.content} open onClose={onCloseUpscale} onConfirm={(params) => onUpscale(upscaleNode, params)} /> : null}
            {colorGradeNode?.metadata?.content ? <CanvasColorGradeDialog node={colorGradeNode} open onClose={onCloseColorGrade} onConfirm={(settings, presetId) => onColorGrade(colorGradeNode, settings, presetId)} /> : null}
        </>
    );
}
