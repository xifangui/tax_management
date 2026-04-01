import { api } from '../../app/api';

export interface SystemSettings {
  ocr: {
    provider: string;
    apiEndpoint: string;
    maxConcurrency: number;
    timeout: number;
  };
  file: {
    maxFileSize: number;
    allowedExtensions: string[];
    storageType: string;
    storagePath: string;
  };
  export: {
    defaultEncoding: string;
    linkExpirationDays: number;
  };
  security: {
    jwtExpiration: number;
    refreshTokenExpiration: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}

export interface SystemDashboard {
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  totalFiles: number;
  pendingOcr: number;
  completedOcr: number;
  failedOcr: number;
  totalExports: number;
  storageUsage: {
    total: number;
    used: number;
    percentage: number;
  };
  ocrTrend?: { date: string; count: number }[];
  ocrStats?: {
    approved?: number;
    pending?: number;
    rejected?: number;
  };
}

export interface AuditLog {
  id: number;
  operatorId: number;
  operatorName: string;
  module: string;
  action: string;
  targetId?: number;
  targetName?: string;
  detail?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSystemDashboard: builder.query<SystemDashboard, void>({
      query: () => '/system/dashboard',
      providesTags: ['SystemDashboard'],
    }),

    getSystemSettings: builder.query<SystemSettings, void>({
      query: () => '/system/settings',
      providesTags: ['SystemSettings'],
    }),

    updateSystemSettings: builder.mutation<
      { message: string; updatedFields: string[] },
      Partial<SystemSettings>
    >({
      query: (data) => ({
        url: '/system/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SystemSettings'],
    }),

    getAuditLogs: builder.query<AuditLogListResponse, {
      page?: number;
      limit?: number;
      operatorId?: number;
      module?: string;
      action?: string;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params = {}) => ({
        url: '/system/audit-logs',
        params,
      }),
      providesTags: ['AuditLog'],
    }),
  }),
});

export const {
  useGetSystemDashboardQuery,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetAuditLogsQuery,
} = systemApi;
