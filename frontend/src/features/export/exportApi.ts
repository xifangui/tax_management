import { api } from '../../app/api';
import type { RootState } from '../../app/store';

export interface ExportRequest {
  customerId: number;
  dateFrom: string;
  dateTo: string;
  templateId: number;
  encoding?: 'UTF-8' | 'Shift_JIS';
  includeStatus?: string[];
  classifiedSubjectIds?: number[];
}

export interface ExportTemplate {
  id: number;
  templateName: string;
  description?: string;
  templateType: string;
  columnMapping: string;
  encoding: string;
  isDefault: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportLog {
  id: number;
  customerId: number;
  templateId?: number;
  filename: string;
  recordCount: number;
  fileSize: number;
  encoding: string;
  exportedBy: number;
  expiresAt: string;
  createdAt: string;
}

export const exportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    exportCsv: builder.mutation<Blob, ExportRequest>({
      query: (data) => ({
        url: '/export/csv',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      }),
    }),

    getExportTemplates: builder.query<ExportTemplate[], void>({
      query: () => '/export/templates',
      providesTags: ['ExportTemplate'],
    }),

    createExportTemplate: builder.mutation<ExportTemplate, Partial<ExportTemplate>>({
      query: (data) => ({
        url: '/export/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExportTemplate'],
    }),

    updateExportTemplate: builder.mutation<ExportTemplate, { id: number; data: Partial<ExportTemplate> }>({
      query: ({ id, data }) => ({
        url: `/export/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ExportTemplate', id }],
    }),

    deleteExportTemplate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/export/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ExportTemplate', id }],
    }),

    getExportLogs: builder.query<ExportLog[], { customerId?: number }>({
      query: (params = {}) => ({
        url: '/export/logs',
        params: params.customerId ? { customerId: params.customerId } : undefined,
      }),
      providesTags: ['ExportLog'],
    }),

    downloadExportFile: builder.query<Blob, number>({
      query: (id) => ({
        url: `/export/logs/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useExportCsvMutation,
  useGetExportTemplatesQuery,
  useCreateExportTemplateMutation,
  useUpdateExportTemplateMutation,
  useDeleteExportTemplateMutation,
  useGetExportLogsQuery,
  useDownloadExportFileQuery,
} = exportApi;
