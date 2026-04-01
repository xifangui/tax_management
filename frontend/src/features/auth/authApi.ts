import { api } from '../../app/api';
import type { User } from '../../types';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<TokenResponse, LoginRequest>({
      query: ({ email, password }) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        return {
          url: '/auth/token',
          method: 'POST',
          body: formData,
        };
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    me: build.query<User, void>({
      query: () => ({
        url: '/auth/me',
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useLogoutMutation, useLazyMeQuery } = authApi;
