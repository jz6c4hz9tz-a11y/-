import { App, Button } from "antd";
import { FileText } from "lucide-react";

import { PageHeader, WorkspacePage } from "@/components/layout/workspace-page";

export default function WalletInvoicePage() {
    const { message } = App.useApp();

    const applyInvoice = () => {
        message.warning("支付网关接入后即可申请发票");
    };

    return (
        <WorkspacePage>
            <PageHeader icon="wallet" title="自助开发票" description="管理充值发票" />
            <div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background">
                <span className="grid size-12 place-items-center rounded-full border border-border bg-foreground/[0.04] text-foreground/60">
                    <FileText className="size-5" />
                </span>
                <p className="text-sm text-foreground/55">暂无发票记录</p>
                <Button onClick={applyInvoice}>申请发票</Button>
            </div>
        </WorkspacePage>
    );
}
