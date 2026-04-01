import { api } from '../../app/api';
import type { OcrResult } from '../../types';

export const ocrApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOcrResults: build.query<OcrResult[], void>({
      query: () => ({ url: '/ocr/results/' }),
      providesTags: ['OcrResult'],
    }),
    getOcrResult: build.query<OcrResult, number>({
      query: (id) => ({ url: `/ocr/results/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'OcrResult', id }],
    }),
    updateOcrResult: build.mutation<OcrResult, { id: number; review_status: string }>({
      query: ({ id, review_status }) => ({
        url: `/ocr/results/${id}/`,
        method: 'PUT',
        body: { review_status },
      }),
      invalidatesTags: ['OcrResult'],
    }),
    retryOcrResult: build.mutation<void, number>({
      query: (id) => ({
        url: `/ocr/results/${id}/retry/`,
        method: 'POST',
      }),
      invalidatesTags: ['OcrResult'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOcrResultsQuery,
  useGetOcrResultQuery,
  useUpdateOcrResultMutation,
  useRetryOcrResultMutation,
} = ocrApi;
