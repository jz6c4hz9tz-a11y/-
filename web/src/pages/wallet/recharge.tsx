import { App, Button, Segmented, Tag } from "antd";
import { Wallet } from "lucide-react";
import { useState } from "react";

import { PageHeader, WorkspacePage } from "@/components/layout/workspace-page";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/use-user-store";

const amounts = [100, 300, 500, 1000];

export default function WalletRechargePage() {
    const { message } = App.useApp();
    const user = useUserStore((state) => state.user);
    const { profile } = useUserProfile(user?.id, Boolean(user));
    const [selected, setSelected] = useState(300);
    const [method, setMethod] = useState<"alipay" | "wechat">("alipay");

    const recharge = () => {
        message.warning("支付网关接入后即可完成充值");
    };

    return (
        <WorkspacePage>
            <PageHeader
                icon="wallet"
                title="钱包充值"
                description="余额用于支付创作费用"
                meta={<Tag color="gold">余额 {profile?.balance || "0.00"}</Tag>}
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {amounts.map((amount) => (
                    <button
                        key={amount}
                        type="button"
                        onClick={() => setSelected(amount)}
                        className={cn(
                            "rounded-lg border p-4 text-left transition",
                            selected === amount ? "border-foreground bg-foreground/[0.06]" : "border-border bg-background hover:border-foreground/40",
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-foreground">¥{amount}</span>
                            <Wallet className="size-4 text-amber-500" />
                        </div>
                        <div className="mt-2 text-sm text-foreground/55">充值 ¥{amount}</div>
                    </button>
                ))}
            </div>
            <div className="mt-5">
                <Segmented
                    value={method}
                    onChange={(value) => setMethod(value as "alipay" | "wechat")}
                    options={[
                        { label: "支付宝", value: "alipay" },
                        { label: "微信支付", value: "wechat" },
                    ]}
                />
            </div>
            <Button type="primary" size="large" className="mt-5 min-w-44" onClick={recharge}>
                {method === "alipay" ? "使用支付宝充值" : "使用微信充值"}
            </Button>
        </WorkspacePage>
    );
}
