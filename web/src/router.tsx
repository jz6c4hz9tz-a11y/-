import { createBrowserRouter, Navigate, Outlet } from "react-router";

import { RequireAuth } from "@/components/auth/require-auth";
import { RequireFeature } from "@/components/auth/require-feature";
import UserLayout from "@/layouts/user-layout";
import AdminPage from "@/pages/admin";
import { AccessSettingsPage, AnalyticsPage, AnnouncementsPage, EmailSettingsPage, FeatureAvailabilityPage } from "@/pages/admin/admin-route-pages";
import ChannelsPage from "@/pages/admin/channels/channels-page";
import LogsPage from "@/pages/admin/logs/logs-page";
import RuntimePolicySettingsPage from "@/pages/admin/settings/runtime-policy-settings-page";
import DrawingEngineSettingsPage from "@/pages/admin/settings/drawing-engine-settings-page";
import StorageSettingsPage from "@/pages/admin/settings/storage-settings-page";
import StoryboardPromptsPage from "@/pages/admin/storyboard-prompts/storyboard-prompts-page";
import UsersPage from "@/pages/admin/users/users-page";
import AssetsPage from "@/pages/assets";
import { AuthScene } from "@/pages/auth/auth-scene";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import CanvasPage from "@/pages/canvas";
import CanvasProjectPage from "@/pages/canvas/project";
import SharedCanvasPage from "@/pages/canvas/shared";
import HomePage from "@/pages/home";
import WorkFlowListNewPage from "@/pages/workflow-list-new";
import NotFound from "@/pages/not-found";
import RouteErrorPage from "@/pages/route-error";
import SkillsPage from "@/pages/skills";
import TasksPage from "@/pages/tasks";
import WalletInvoicePage from "@/pages/wallet/invoice";
import WalletRechargePage from "@/pages/wallet/recharge";
import WorkflowsPage from "@/pages/workflows";
import SettingsPage from "@/pages/settings";
import TestVoiceRecording from "@/pages/test-voice-recording";

export const router = createBrowserRouter([
    {
        element: <AuthScene />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
        ],
    },
    { path: "/share/canvas/:token", element: <SharedCanvasPage />, errorElement: <RouteErrorPage /> },
    {
        element: (
            <UserLayout>
                <Outlet />
            </UserLayout>
        ),
        errorElement: <RouteErrorPage />,
        children: [
            { path: "/", element: <Navigate to="/home" replace /> },
            { path: "/home", element: <HomePage /> },
            { path: "/creation/workflow-list-new", element: <WorkFlowListNewPage /> },
            { path: "/creation/WorkFlowListNew", element: <WorkFlowListNewPage /> },
            { path: "/workflow-list-new", element: <WorkFlowListNewPage /> },
            {
                path: "/tasks",
                element: (
                    <RequireAuth>
                        <RequireFeature feature="taskCenterEnabled">
                            <TasksPage />
                        </RequireFeature>
                    </RequireAuth>
                ),
            },
            {
                path: "/assets",
                element: (
                    <RequireAuth>
                        <AssetsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/workflows",
                element: (
                    <RequireAuth>
                        <WorkflowsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/skills",
                element: (
                    <RequireAuth>
                        <SkillsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/settings",
                element: (
                    <RequireAuth>
                        <SettingsPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/wallet/recharge",
                element: (
                    <RequireAuth>
                        <WalletRechargePage />
                    </RequireAuth>
                ),
            },
            {
                path: "/wallet/invoice",
                element: (
                    <RequireAuth>
                        <WalletInvoicePage />
                    </RequireAuth>
                ),
            },
            {
                path: "/test-voice-recording",
                element: (
                    <RequireAuth>
                        <TestVoiceRecording />
                    </RequireAuth>
                ),
            },
            {
                path: "/canvas",
                element: (
                    <RequireAuth>
                        <CanvasPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/canvas/:id",
                element: (
                    <RequireAuth>
                        <CanvasProjectPage />
                    </RequireAuth>
                ),
            },
            {
                path: "/admin",
                element: (
                    <RequireAuth>
                        <AdminPage />
                    </RequireAuth>
                ),
                children: [
                    { index: true, element: <AnalyticsPage /> },
                    { path: "users", element: <UsersPage /> },
                    { path: "channels", element: <ChannelsPage /> },
                    { path: "prompt-templates", element: <StoryboardPromptsPage /> },
                    { path: "storyboard-prompts", element: <Navigate to="/admin/prompt-templates" replace /> },
                    { path: "announcements", element: <AnnouncementsPage /> },
                    { path: "logs", element: <LogsPage /> },
                    { path: "settings", element: <Navigate to="runtime-policy" replace /> },
                    { path: "settings/drawing-engine", element: <DrawingEngineSettingsPage /> },
                    { path: "settings/concurrency", element: <Navigate to="/admin/settings/runtime-policy" replace /> },
                    { path: "settings/runtime-policy", element: <RuntimePolicySettingsPage /> },
                    { path: "settings/features", element: <FeatureAvailabilityPage /> },
                    { path: "settings/access", element: <AccessSettingsPage /> },
                    { path: "settings/email", element: <EmailSettingsPage /> },
                    { path: "settings/storage", element: <StorageSettingsPage /> },
                ],
            },
        ],
    },
    { path: "*", element: <NotFound /> },
]);
