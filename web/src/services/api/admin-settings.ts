import { apiClient, request } from "@/services/api/request";

const api = apiClient;

export type LinuxDOSetting = {
    enabled: boolean;
    clientId: string;
    clientSecret?: string;
    hasClientSecret: boolean;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    redirectUrl: string;
    scopes: string[];
    clientAuthMethod: "client_secret_post" | "client_secret_basic";
    subjectField: string;
    usernameField: string;
    displayNameField: string;
    emailField: string;
    avatarField: string;
    updatedAt?: string;
};

export type RegistrationSetting = {
    enabled: boolean;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type EmailSetting = {
    enabled: boolean;
    host: string;
    port: number;
    username: string;
    password?: string;
    encryption: "starttls" | "tls" | "none";
    fromEmail: string;
    fromName: string;
    hasPassword: boolean;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ChannelModel = {
    id: string;
    channelId: string;
    modelKey: string;
    displayName: string;
    capability: "text" | "image" | "video" | "audio" | "";
    protocol?: import("@/lib/model-protocols").ModelProtocol;
    enabled: boolean;
    capabilityVersion?: number;
    capabilityConfig?: import("@/lib/model-capabilities").ModelCapabilityConfig;
    createdAt: string;
    updatedAt: string;
};

export function getAdminLinuxDOSetting() {
    return request<{ setting: LinuxDOSetting }>(api.get("/admin/settings/linuxdo"));
}

export function updateAdminLinuxDOSetting(input: Partial<LinuxDOSetting>) {
    return request<{ setting: LinuxDOSetting }>(api.patch("/admin/settings/linuxdo", input));
}

export function getAdminRegistrationSetting() {
    return request<{ setting: RegistrationSetting }>(api.get("/admin/settings/registration"));
}

export function updateAdminRegistrationSetting(enabled: boolean) {
    return request<{ setting: RegistrationSetting }>(api.patch("/admin/settings/registration", { enabled }));
}

export function getAdminEmailSetting() {
    return request<{ setting: EmailSetting }>(api.get("/admin/settings/email"));
}

export function updateAdminEmailSetting(input: Partial<EmailSetting>) {
    return request<{ setting: EmailSetting }>(api.patch("/admin/settings/email", input));
}

export function listAdminChannelModels(channelId: string) {
    return request<{ models: ChannelModel[] }>(api.get(`/admin/channels/${encodeURIComponent(channelId)}/models`));
}

export function fetchAdminChannelModels(channelId: string) {
    return request<{ models: string[]; added: number }>(api.post(`/admin/channels/${encodeURIComponent(channelId)}/models/fetch`));
}

export function testAdminChannelModel(channelId: string, input: Pick<ChannelModel, "modelKey" | "capability" | "protocol"> & { capabilityConfig?: ChannelModel["capabilityConfig"] }) {
    return request<{ durationMs: number }>(api.post(`/admin/channels/${encodeURIComponent(channelId)}/models/test`, input, { timeout: 10 * 60 * 1000 }));
}

export function createAdminChannelModel(channelId: string, input: Omit<ChannelModel, "id" | "channelId" | "createdAt" | "updatedAt">) {
    return request<{ model: ChannelModel }>(api.post(`/admin/channels/${encodeURIComponent(channelId)}/models`, input));
}

export function updateAdminChannelModel(channelId: string, id: string, input: Omit<ChannelModel, "id" | "channelId" | "createdAt" | "updatedAt">) {
    return request<{ model: ChannelModel }>(api.patch(`/admin/channels/${encodeURIComponent(channelId)}/models/${encodeURIComponent(id)}`, input));
}

export function deleteAdminChannelModel(channelId: string, id: string) {
    return request<{ ok: boolean }>(api.delete(`/admin/channels/${encodeURIComponent(channelId)}/models/${encodeURIComponent(id)}`));
}
