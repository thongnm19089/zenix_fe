import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiAccount = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/apis/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  reducerPath: "accountApi",
  tagTypes: ["UserProfile", "Account"],
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (data: any) => ({
        url: "update-profile/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "UserProfile" }], // and used here
    }),
    // change password    
    changePassword: builder.mutation({
      query: (data: any) => ({
        url: "change-password/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Account" }], // and used here
    }),
    // tạo account người dùng mới
    createAccount: builder.mutation({
      query: (account) => ({
        url: "user-account/",
        method: "POST",
        body: account,
      }),
      invalidatesTags: [{ type: "Account" }],
    }),
    createMultiAccount: builder.mutation({
      query: (account) => ({
        url: "create-multiple-user-accounts/",
        method: "POST",
        body: account,
      }),
      invalidatesTags: [{ type: "Account" }],
    }),
    // Define a single query that optionally accepts a userId
    getAccount: builder.query({
      // The query function checks if userId is provided
      query: (userId) => `user-account/${userId ? `?user_id=${userId}` : ''}`,
    }),
    // cập nhật thông tin của 1 người dùng bất kỳ
    editAccount: builder.mutation({
      query: (account) => ({
        url: `user-account/`,
        method: "PATCH",
        body: account,
      }),
      invalidatesTags: [{ type: "Account" }],
    }),
    // xóa 1 người dùng bất kỳ
    deleteAccount: builder.mutation({
      query: (userId) => ({
        url: `user-account/`,
        method: "DELETE",
        body: { user_id: userId },  // Ensure the body is structured correctly
      }),
      invalidatesTags: [{ type: "Account" }],
    }),
    // lấy thông tin user dashboard
    getHomeUserDashboard: builder.query({
      query: () => `home-user-dashboard/`,
    }),

    // get users mcs
    getUserMcs: builder.query<any, void>({
      query: () => `user-mcs/`,
    }),
  }),
});

export const {
  // User Profile API
  useUpdateProfileMutation,
  // Password API
  useChangePasswordMutation,
  // Account CRUD API
  useCreateAccountMutation,
  useCreateMultiAccountMutation,
  useEditAccountMutation,
  useDeleteAccountMutation,
  useGetAccountQuery,
  useGetHomeUserDashboardQuery,
  //get user mcs
  useGetUserMcsQuery
} = apiAccount;