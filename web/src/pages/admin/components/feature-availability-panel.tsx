import { useEffect, useState, type ReactNode } from "react";
import { App, Switch } from "antd";
import { ListChecks, ToggleLeft } from "lucide-react";

import { getAdminFeatureAvailability, updateAdminFeatureAvailability } from "@/services/api/auth";
import { useUserStore, type FeatureAvailability } from "@/stores/use-user-store";
import { SettingsSectionCard } from "./admin-ui";

type FeatureKey = "shortDramaEnabled" | "taskCenterEnabled";

const featureRows: Array<{ key: FeatureKey; title: string; menu: string; description: string; icon: ReactNode }> = [
    { key: "taskCenterEnabled", title: "任务", menu: "/tasks", description: "关闭后仅隐藏并拦截任务中心页面；生成任务仍会创建、执行、记录和恢复。", icon: <ListChecks className="size-4" /> },
];

export default function FeatureAvailabilityPanel() {
    const { message } = App.useApp();
    const setGlobalFeatures = useUserStore((state) => state.setFeatures);
    const [features, setFeatures] = useState<FeatureAvailability | null>(null);
    const [saving, setSaving] = useState<FeatureKey | null>(null);

    useEffect(() => {
        let active = true;
        getAdminFeatureAvailability()
            .then(({ features: value }) => {
                if (active) setFeatures(value);
            })
            .catch((error) => message.error(error instanceof Error ? error.message : "读取功能开放配置失败"));
        return () => {
            active = false;
        };
    }, [message]);

    const save = async (key: FeatureKey, enabled: boolean) => {
        if (!features) return;
        setSaving(key);
        try {
            const next = { ...features, [key]: enabled };
            const result = await updateAdminFeatureAvailability({
                shortDramaEnabled: next.shortDramaEnabled,
                taskCenterEnabled: next.taskCenterEnabled,
            });
            setFeatures(result.features);
            setGlobalFeatures(result.features);
            message.success(`${featureRows.find((item) => item.key === key)?.title || "功能"}已${enabled ? "开放" : "关闭"}`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "保存功能开放配置失败");
        } finally {
            setSaving(null);
        }
    };

    const enabledCount = features ? featureRows.filter((item) => features[item.key]).length : 0;
    return (
        <div className="pt-4">
            <SettingsSectionCard
                icon={<ToggleLeft className="size-4" />}
                title="用户功能开放"
                description="统一控制用户工作台入口与页面访问。"
                status={{ label: features ? `${enabledCount}/${featureRows.length} 已开放` : "读取中", color: enabledCount === featureRows.length ? "success" : "default" }}
            >
                <div className="divide-y divide-border/75">
                    {featureRows.map((item) => (
                        <div key={item.key} className="flex min-h-16 items-center gap-3 px-4 py-3">
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted/35 text-foreground/65">{item.icon}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-medium">{item.title}</h3>
                                    <span className="rounded border border-border/70 px-1.5 py-0.5 text-[var(--fs-micro)] text-foreground/45">{item.menu}</span>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-foreground/55">{item.description}</p>
                            </div>
                            <Switch checked={features?.[item.key] === true} loading={!features || saving === item.key} disabled={Boolean(saving && saving !== item.key)} onChange={(checked) => void save(item.key, checked)} aria-label={`开放${item.title}`} />
                        </div>
                    ))}
                </div>
            </SettingsSectionCard>
        </div>
    );
}
