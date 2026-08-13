import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { IdentityProviderBadge } from "@/components/layout/identity-provider-badge";
import type { LocalUser } from "@/stores/use-user-store";

export function UserAvatar({ user, className }: { user: LocalUser; className: string }) {
    const [failed, setFailed] = useState(false);
    const avatarUrl = /^(https?:\/\/|\/api\/)/i.test(user.avatarUrl || "") ? user.avatarUrl : "";

    useEffect(() => setFailed(false), [avatarUrl]);

    return (
        <span className={`relative grid shrink-0 place-items-center ${className}`}>
            <span className="grid size-full place-items-center overflow-hidden rounded-full bg-white/15 text-white/70">
                {avatarUrl && !failed ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setFailed(true)} /> : <UserRound className="size-[52%]" aria-hidden />}
            </span>
            <IdentityProviderBadge user={user} compact className="absolute -bottom-1 -right-1" />
        </span>
    );
}
