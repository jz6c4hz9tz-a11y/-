import { App, Dropdown, Popover } from "antd";
import { ChevronDown, Coins, FileText, Globe, Infinity as InfinityIcon, LogIn, LogOut, Settings, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { SystemAnnouncementCenter } from "@/components/layout/system-announcement-center";
import { UserAvatar } from "@/components/layout/user-avatar";
import { UserAvatarEditor } from "@/components/layout/user-avatar-editor";
import { useUserProfile } from "@/hooks/use-user-profile";
import { applyUserSession } from "@/lib/user-session";
import { cn } from "@/lib/utils";
import { logout, type UserProfile } from "@/services/api/auth";
import { useThemeStore } from "@/stores/use-theme-store";
import { useUserStore, type LocalUser } from "@/stores/use-user-store";

const navItems = [
    { label: "首页", to: "/home", match: ["/home"] },
    { label: "画布", to: "/canvas", match: ["/canvas"], beta: true },
];

export function StudioHeader() {
    const { pathname } = useLocation();
    const user = useUserStore((state) => state.user);
    const hydrated = useUserStore((state) => state.hydrated);
    const { profile } = useUserProfile(user?.id, Boolean(user));

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-black px-3 text-white sm:px-5">
            <Link to="/home" className="flex min-w-0 shrink-0 items-center gap-2.5" title="AI Studio">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-black">
                    <InfinityIcon className="size-4" />
                </span>
                <span className="truncate text-sm font-bold tracking-widest">AI Studio</span>
            </Link>

            <nav className="hidden min-w-0 items-center gap-1 md:flex" aria-label="主导航">
                {navItems.map((item) => {
                    const active = item.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
                    return (
                        <Link key={item.to} to={item.to} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm transition", active ? "bg-white font-semibold text-black" : "text-white/60 hover:bg-white/10 hover:text-white")}>
                            {item.label}
                            {"beta" in item && item.beta ? <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[var(--fs-micro)] font-semibold text-white">BETA</span> : null}
                        </Link>
                    );
                })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
                {user ? <SystemAnnouncementCenter userId={user.id} className="grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white" /> : null}
                <Link to="/settings" aria-label="设置" title="设置" className="hidden size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white sm:grid">
                    <Settings className="size-4" />
                </Link>
                <LanguageMenu />
                {user ? (
                    <StudioAccountMenu user={user} profile={profile} />
                ) : (
                    <div className="flex items-center gap-1.5">
                        {hydrated ? (
                            <>
                                <Link to="/login" className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">
                                    <LogIn className="size-3.5" />
                                    登录
                                </Link>
                                <Link to="/register" className="inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/85">
                                    注册
                                </Link>
                            </>
                        ) : (
                            <span className="size-9 animate-pulse rounded-full bg-white/10" />
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

function LanguageMenu() {
    const [language, setLanguage] = useState<"CH" | "EN">("CH");
    return (
        <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
                selectedKeys: [language],
                items: [
                    { key: "CH", label: "简体中文" },
                    { key: "EN", label: "English" },
                ],
                onClick: ({ key }) => setLanguage(key as "CH" | "EN"),
            }}
        >
            <button type="button" className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white sm:inline-flex" aria-label="切换语言">
                <Globe className="size-4" />
                <span className="font-medium">{language}</span>
                <ChevronDown className="size-3.5" />
            </button>
        </Dropdown>
    );
}

function StudioAccountMenu({ user, profile }: { user: LocalUser; profile: UserProfile | null }) {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.setTheme);
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const accountType = profile?.accountType === "team" ? "团队" : "个人";

    const go = (to: string) => {
        setOpen(false);
        navigate(to);
    };

    const handleLogout = async () => {
        try {
            await logout();
            await applyUserSession({ user: null, systemChannels: [] });
            setOpen(false);
            message.success("已退出登录");
            navigate("/login", { replace: true });
        } catch (error) {
            message.error(error instanceof Error ? error.message : "退出失败");
        }
    };

    return (
        <>
            <Popover
                trigger="click"
                placement="bottomRight"
                arrow={false}
                open={open}
                onOpenChange={setOpen}
                classNames={{ content: "!p-0" }}
                styles={{ content: { width: 288, overflow: "hidden", background: "#000" } }}
                content={
                    <div className="w-[288px] overflow-hidden rounded-lg border border-white/10 bg-black text-white">
                        <div className="border-b border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={user} className="size-10" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <span className="truncate text-sm font-semibold">{user.displayName || user.username}</span>
                                        <span className="shrink-0 text-[var(--fs-micro)] text-white/40">「{accountType}」</span>
                                        <ChevronDown className="size-3.5 shrink-0 text-white/30" />
                                    </div>
                                    <div className="mt-0.5 truncate text-xs text-white/45">{user.email || user.username}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-b border-white/10 p-3">
                            <span className="inline-flex items-baseline gap-2 text-xs text-white/60">
                                余额：
                                <span className="text-lg font-bold leading-none text-white">{profile?.balance || "0.00"}</span>
                            </span>
                            <button type="button" onClick={() => go("/wallet/recharge")} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-white/10 px-3 text-xs text-white transition hover:bg-white/20">
                                <Coins className="size-3.5" />
                                充值
                            </button>
                        </div>

                        <div className="p-1.5">
                            <AccountMenuLink
                                icon={<UserRound className="size-3.5" />}
                                label="个人设置"
                                onSelect={() => {
                                    setOpen(false);
                                    setProfileOpen(true);
                                }}
                            />
                            <AccountMenuLink icon={<FileText className="size-3.5" />} label="自助开发票" onSelect={() => go("/wallet/invoice")} />
                            <AccountMenuLink icon={<UserRound className="size-3.5" />} label="作品主页" onSelect={() => go("/home")} />
                            <div className="my-1 h-px bg-white/10" />
                            <div className="flex h-9 items-center gap-2 px-2">
                                <span className="text-xs text-white/60">深色模式</span>
                                <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="ml-auto inline-flex h-6 w-11 items-center rounded-full bg-white/15 p-0.5 transition" aria-label="切换深色模式">
                                    <span className={cn("size-5 rounded-full bg-white transition-transform", theme === "dark" && "translate-x-5")} />
                                </button>
                            </div>
                            <button type="button" onClick={() => void handleLogout()} className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-xs text-white/60 transition hover:bg-red-500/10 hover:text-red-400">
                                <LogOut className="size-3.5" />
                                退出登录
                            </button>
                        </div>
                    </div>
                }
            >
                <button type="button" className="flex h-9 items-center gap-1.5 rounded-full px-1.5 transition hover:bg-white/10" aria-label="账户菜单">
                    <UserAvatar user={user} className="size-8" />
                    <ChevronDown className="size-3.5 text-white/50" />
                </button>
            </Popover>
            <UserAvatarEditor open={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
}

function AccountMenuLink({ icon, label, onSelect }: { icon: ReactNode; label: string; onSelect: () => void }) {
    return (
        <button type="button" onClick={onSelect} className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-xs text-white/65 transition hover:bg-white/10 hover:text-white">
            <span className="flex size-3.5 shrink-0 items-center justify-center">{icon}</span>
            <span>{label}</span>
        </button>
    );
}
