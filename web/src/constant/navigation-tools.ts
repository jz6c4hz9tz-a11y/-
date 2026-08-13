import { BookOpenCheck, Images, ListChecks } from "lucide-react";

export const navigationTools = [
    {
        slug: "tasks",
        label: "任务",
        icon: ListChecks,
        section: "创作空间",
    },
    {
        slug: "assets",
        label: "素材",
        icon: Images,
        section: "创作空间",
    },
    {
        slug: "skills",
        label: "技能库",
        icon: BookOpenCheck,
        section: "工作台管理",
    },
] as const;

export type NavigationToolSlug = (typeof navigationTools)[number]["slug"];
