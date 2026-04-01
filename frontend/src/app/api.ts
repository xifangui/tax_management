import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').trim();

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Customer',
    'File',
    'OcrResult',
    'User',
    'ClassificationRule',
    'AccountSubject',
    'ExportTemplate',
    'ExportLog',
    'SystemDashboard',
    'SystemSettings',
    'AuditLog',
  ],
  endpoints: () => ({}),
});