import { api } from '../../app/api';
import type { FileItem } from '../../types';

export const filesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getFiles: build.query<FileItem[], void>({
      query: () => ({ url: '/files/' }),
      providesTags: ['File'],
    }),
    deleteFile: build.mutation<void, number>({
      query: (id) => ({
        url: `/files/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
    uploadFiles: build.mutation<FileItem[], FormData>({
      query: (formData) => ({
        url: '/files/upload/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['File'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFilesQuery, useUploadFilesMutation, useDeleteFileMutation } = filesApi;
