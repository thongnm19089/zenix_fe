import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiNotification = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/apis/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "notificationApi",
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotificationList: builder.query<any, { page?: number; pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => {
        let queryString = `notifications/?page=${page}&pageSize=${pageSize}`;
        return queryString;
      },
      providesTags: [{ type: "Notification" }],
    }),

    createNotification: builder.mutation({
      query: (data) => ({
        url: "notifications/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Notification" }],
    }),
    getNotification: builder.query({
      query: ({ notificationId }) => `notification/${notificationId}/`,
      providesTags: (result, error, { notificationId }) => [{ type: "Notification", id: notificationId }],
    }),
    editNotification: builder.mutation({
      query: (body) => ({
        url: `notifications/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Notification", id }, { type: "Notification" }],
    }),
    deleteNotification: builder.mutation({
      query: ({ notificationId }) => ({
        url: `notifications/${notificationId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Notification" }],
    }),
  }),
});

export const {
  useGetNotificationListQuery,
  useCreateNotificationMutation,
  useEditNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationQuery,
} = apiNotification;
