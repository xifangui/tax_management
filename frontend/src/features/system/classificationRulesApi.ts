import { api } from '../../app/api';

export interface ClassificationRule {
  id: number;
  customer_id?: number;
  industry_type?: string;
  keyword: string;
  match_type?: string;
  target_subject_id: number;
  priority: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassificationRuleRequest {
  customer_id?: number;
  industry_type?: string;
  keyword: string;
  match_type?: string;
  target_subject_id: number;
  priority?: number;
  status?: string;
}

export interface UpdateClassificationRuleRequest {
  customer_id?: number;
  industry_type?: string;
  keyword?: string;
  match_type?: string;
  target_subject_id?: number;
  priority?: number;
  status?: string;
}

export interface ApplyClassificationRulesRequest {
  transactionIds?: number[];
  dateFrom?: string;
  dateTo?: string;
}

export interface ApplyClassificationRulesResponse {
  processedCount: number;
  classifiedCount: number;
  unclassifiedCount: number;
}

export interface ClassificationRulesListResponse {
  items: ClassificationRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const classificationRulesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // List Classification Rules
    getClassificationRules: builder.query<ClassificationRulesListResponse, {
      page?: number;
      limit?: number;
      category?: string;
      isActive?: boolean;
    }>({
      query: (params = {}) => ({
        url: '/classification-rules/',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...(result?.items || []).map(({ id }) => ({ type: 'ClassificationRule' as const, id })),
              { type: 'ClassificationRule', id: 'LIST' },
            ]
          : [{ type: 'ClassificationRule', id: 'LIST' }],
    }),

    // Get Classification Rule
    getClassificationRule: builder.query<ClassificationRule, number>({
      query: (id) => `/classification-rules/${id}`,
      providesTags: (result, error, id) => [{ type: 'ClassificationRule', id }],
    }),

    // Create Classification Rule
    createClassificationRule: builder.mutation<ClassificationRule, CreateClassificationRuleRequest>({
      query: (data) => ({
        url: '/classification-rules/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ClassificationRule', id: 'LIST' }],
    }),

    // Update Classification Rule
    updateClassificationRule: builder.mutation<ClassificationRule, { id: number; data: UpdateClassificationRuleRequest }>({
      query: ({ id, data }) => ({
        url: `/classification-rules/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ClassificationRule', id },
        { type: 'ClassificationRule', id: 'LIST' },
      ],
    }),

    // Delete Classification Rule
    deleteClassificationRule: builder.mutation<void, number>({
      query: (id) => ({
        url: `/classification-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ClassificationRule', id },
        { type: 'ClassificationRule', id: 'LIST' },
      ],
    }),

    // Apply Classification Rules
    applyClassificationRules: builder.mutation<ApplyClassificationRulesResponse, ApplyClassificationRulesRequest>({
      query: (data) => ({
        url: '/classification-rules/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OcrResult'],
    }),
  }),
});

export const {
  useGetClassificationRulesQuery,
  useGetClassificationRuleQuery,
  useCreateClassificationRuleMutation,
  useUpdateClassificationRuleMutation,
  useDeleteClassificationRuleMutation,
  useApplyClassificationRulesMutation,
} = classificationRulesApi;
