import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiChat = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-chat/v1/`,
    prepareHeaders: (headers) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "apiChat",
  tagTypes: ["Group", "Message"],
  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => 'groups',
      providesTags: ["Group"],
    }),
    createGroup: builder.mutation({
      query: (data) => ({
        url: 'groups/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ["Group"],
    }),
    getMessages: builder.query({
      query: (id) => `sender/${id}/`,
      providesTags: (result, error, id) => [{ type: "Message", id }],
    }),
    adminJoinGroup: builder.mutation({
      query: ({ id, data }) => ({
        url: `groups/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ["Group"],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetMessagesQuery,
  useAdminJoinGroupMutation,
} = apiChat;
