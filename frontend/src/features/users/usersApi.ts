import { api } from '../../app/api';
import type { User } from '../../types';

export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<User[], void>({
      query: () => ({ url: '/users/' }),
      providesTags: ['User'],
    }),
    createUser: build.mutation<User, Partial<User> & { password: string }>({
      query: (user) => ({
        url: '/users/',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation } = usersApi;
