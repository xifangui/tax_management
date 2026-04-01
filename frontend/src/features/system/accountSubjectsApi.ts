import { api } from '../../app/api';

export interface AccountSubject {
  id: number;
  customer_id?: number;
  industry_type?: string;
  subject_code: string;
  subject_name: string;
  subject_type: string;
  tax_category?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountSubjectRequest {
  customer_id?: number;
  industry_type?: string;
  subject_code: string;
  subject_name: string;
  subject_type: string;
  tax_category?: string;
  status?: string;
}

export interface UpdateAccountSubjectRequest {
  customer_id?: number;
  industry_type?: string;
  subject_code?: string;
  subject_name?: string;
  subject_type?: string;
  tax_category?: string;
  status?: string;
}

export const accountSubjectsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listAccountSubjects: builder.query<AccountSubject[], {
      customer_id?: number;
      industry_type?: string;
      subject_type?: string;
      status?: string;
      include_common?: boolean;
    }>({
      query: (params = {}) => ({
        url: '/account-subjects/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AccountSubject' as const, id })),
              { type: 'AccountSubject', id: 'LIST' },
            ]
          : [{ type: 'AccountSubject', id: 'LIST' }],
    }),

    createAccountSubject: builder.mutation<AccountSubject, CreateAccountSubjectRequest>({
      query: (data) => ({
        url: '/account-subjects/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'AccountSubject', id: 'LIST' }],
    }),

    updateAccountSubject: builder.mutation<AccountSubject, { id: number; data: UpdateAccountSubjectRequest }>({
      query: ({ id, data }) => ({
        url: `/account-subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AccountSubject', id },
        { type: 'AccountSubject', id: 'LIST' },
      ],
    }),

    deleteAccountSubject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/account-subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'AccountSubject', id },
        { type: 'AccountSubject', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useListAccountSubjectsQuery,
  useCreateAccountSubjectMutation,
  useUpdateAccountSubjectMutation,
  useDeleteAccountSubjectMutation,
} = accountSubjectsApi;
