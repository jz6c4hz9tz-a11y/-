import { useEffect, useRef, useState } from "react";
import { App, Button, Modal } from "antd";
import { Camera, LoaderCircle, Trash2, UserRound } from "lucide-react";

import { updateUserProfile } from "@/services/api/auth";
import { resourceFileUrl, uploadResourceFile } from "@/services/api/resources";
import { useUserStore } from "@/stores/use-user-store";

const MAX_AVATAR_BYTES = 8 * 1024 * 1024;

export function UserAvatarEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { message } = App.useApp();
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (open) setPreviewUrl("");
    }, [open]);

    useEffect(() => {
        return () => {
            if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const saveAvatarUrl = async (avatarUrl: string) => {
        const profile = await updateUserProfile({ avatarUrl });
        if (!user) return;
        setUser({ ...user, avatarUrl: profile.avatarUrl });
        window.dispatchEvent(new CustomEvent("user:profile-updated"));
    };

    const chooseFile = async (file?: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            message.error("请选择图片文件");
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            message.error("头像图片不能超过 8MB");
            return;
        }
        const nextPreview = URL.createObjectURL(file);
        setPreviewUrl(nextPreview);
        setUploading(true);
        try {
            const resource = await uploadResourceFile(file, "image");
            const avatarUrl = resource.publicUrl || resourceFileUrl(resource.id);
            await saveAvatarUrl(avatarUrl);
            message.success("头像已更新");
            onClose();
        } catch (error) {
            setPreviewUrl("");
            message.error(error instanceof Error ? error.message : "头像上传失败");
        } finally {
            setUploading(false);
        }
    };

    const removeAvatar = async () => {
        setUploading(true);
        try {
            await saveAvatarUrl("");
            message.success("头像已移除");
            onClose();
        } catch (error) {
            message.error(error instanceof Error ? error.message : "移除头像失败");
        } finally {
            setUploading(false);
        }
    };

    const avatarSrc = previewUrl || user?.avatarUrl || "";

    return (
        <Modal title="修改头像" open={open} onCancel={onClose} footer={null} width={420} destroyOnHidden>
            <div className="flex flex-col items-center gap-5 py-5">
                <span className="grid size-28 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-white/70">
                    {avatarSrc ? <img src={avatarSrc} alt="" className="size-full object-cover" /> : <UserRound className="size-12" />}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <Button type="primary" icon={uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
                        选择新头像
                    </Button>
                    {user?.avatarUrl ? (
                        <Button danger icon={<Trash2 className="size-4" />} disabled={uploading} onClick={() => void removeAvatar()}>
                            移除头像
                        </Button>
                    ) : null}
                </div>
                <p className="max-w-xs text-center text-xs leading-5 text-foreground/45">支持 PNG、JPG、WebP 等图片格式，上传后由服务器资源存储统一托管。</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                    void chooseFile(event.target.files?.[0]);
                    event.currentTarget.value = "";
                }}
            />
        </Modal>
    );
}
