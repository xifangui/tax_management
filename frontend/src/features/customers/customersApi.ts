import { api } from '../../app/api';
import type { Customer } from '../../types';

export const customersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query<Customer[], void>({
      query: () => ({ url: '/customers/' }),
      providesTags: ['Customer'],
    }),
    createCustomer: build.mutation<Customer, Partial<Customer>>({
      query: (customer) => ({
        url: '/customers/',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: build.mutation<Customer, { id: number; customer: Partial<Customer> }>({
      query: ({ id, customer }) => ({
        url: `/customers/${id}/`,
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    deleteCustomer: build.mutation<void, number>({
      query: (id) => ({
        url: `/customers/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
