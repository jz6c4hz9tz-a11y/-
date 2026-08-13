import { useCallback, useEffect, useRef, useState } from "react";

import { getUserProfile, type UserProfile } from "@/services/api/auth";

type UserProfileSnapshot = {
    userId: string;
    profile: UserProfile | null;
    loading: boolean;
};

export function useUserProfile(userId?: string, enabled = true) {
    const activeUserId = enabled ? userId || "" : "";
    const requestSequence = useRef(0);
    const [snapshot, setSnapshot] = useState<UserProfileSnapshot>({ userId: "", profile: null, loading: false });

    const refresh = useCallback(async () => {
        const requestedUserId = activeUserId;
        const sequence = ++requestSequence.current;
        if (!requestedUserId) {
            setSnapshot({ userId: "", profile: null, loading: false });
            return;
        }
        setSnapshot((current) => ({
            userId: requestedUserId,
            profile: current.userId === requestedUserId ? current.profile : null,
            loading: true,
        }));
        try {
            const profile = await getUserProfile();
            if (sequence !== requestSequence.current || profile.userId !== requestedUserId) return;
            setSnapshot({ userId: requestedUserId, profile, loading: false });
        } catch (error) {
            if (sequence !== requestSequence.current) return;
            console.warn("用户资料刷新失败", error);
            setSnapshot((current) => ({
                userId: requestedUserId,
                profile: current.userId === requestedUserId ? current.profile : null,
                loading: false,
            }));
        }
    }, [activeUserId]);

    useEffect(() => {
        if (!activeUserId) {
            requestSequence.current += 1;
            setSnapshot({ userId: "", profile: null, loading: false });
            return;
        }
        void refresh();
        const handleFocus = () => void refresh();
        const handleVisibility = () => {
            if (document.visibilityState === "visible") void refresh();
        };
        window.addEventListener("focus", handleFocus);
        window.addEventListener("user:profile-updated", handleFocus);
        document.addEventListener("visibilitychange", handleVisibility);
        return () => {
            requestSequence.current += 1;
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("user:profile-updated", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [activeUserId, refresh]);

    const matchesUser = snapshot.userId === activeUserId;
    return {
        profile: matchesUser ? snapshot.profile : null,
        loading: matchesUser ? snapshot.loading : Boolean(activeUserId),
        refresh,
    };
}
