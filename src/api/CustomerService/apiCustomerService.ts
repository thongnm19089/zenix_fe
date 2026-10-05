import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

// Tạo API với Redux Toolkit
export const apiCustomerService = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-customer-service/v1/`,
    prepareHeaders: (headers) => {
      const accessToken = getAccessTokenFromCookie();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "customerServiceApi",
  endpoints: (builder) => ({
    // User Requests for Admin
    getUserRequestsForAdmin: builder.query<any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        status?: number[];
        severity?: number[];
        created_by_username?: number[];
      }>({
        query: ({
          page = 1,
          pageSize = 10,
          startDate,
          endDate,
          searchTerm,
          status,
          severity,
          created_by_username
        }) => {
          let queryString = `user-requests-for-admin/?page=${page}&pageSize=${pageSize}`;
          if (startDate) queryString += `&startDate=${startDate}`;
          if (endDate) queryString += `&endDate=${endDate}`;
          if (searchTerm)
            queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
          if (status) queryString += `&status=${status.toString()}`;
          if (severity) queryString += `&severity=${severity.toString()}`;
          if (created_by_username) queryString += `&created_by_username=${created_by_username.toString()}`;
          return queryString;
        },
      }),

    getUserRequestForAdminById: builder.query<any, { id: number }>({
      query: ({ id }) => `user-requests-for-admin/${id}/`,
    }),
    createUserRequestForAdmin: builder.mutation<any, { user_request: number; feedback: string; status: string }>({
      query: (newRequest) => ({
        url: `user-requests-for-admin/`,
        method: "POST",
        body: newRequest,
      }),
    }),
    updateUserRequestForAdmin: builder.mutation<any, {
      id: number;
      data: {
        assign_admin?: number | null;
        type?: string | null;
        severity?: string | null; // Chấp nhận null
        status?: string;
        function_category?: number | null;
        detail_function?: number | null;
        expected_completion_date?: string | null;
        actual_completion_date?: string | null;
      }
    }>({
      query: ({ id, data }) => ({
        url: `user-requests-for-admin/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteUserRequestForAdmin: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `user-requests-for-admin/${id}/`,
        method: "DELETE",
      }),
    }),
    // User Requests
    getUserRequests: builder.query<any, void>({
      query: () => `user-requests/`,
    }),
    getUserRequestById: builder.query<any, { id: number }>({
      query: ({ id }) => `user-request/${id}/`,
    }),
    createUserRequest: builder.mutation<any, { type: string; title: string }>({
      query: (newRequest) => ({
        url: `user-requests/`,
        method: "POST",
        body: newRequest,
      }),
    }),
    updateUserRequest: builder.mutation<any, { id: number; data: { type?: string; title?: string; status?: string; description?: string } }>({
      query: ({ id, data }) => ({
        url: `user-requests/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteUserRequest: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `user-requests/${id}/`,
        method: "DELETE",
      }),
    }),

    // Request Comments
    getRequestComments: builder.query<any, { requestId: number }>({
      query: ({ requestId }) => `request-comments/?requestId=${requestId}`,
    }),
    createRequestComment: builder.mutation<any, { user_request: number; content: string; comment_images?: File[]; comment_files?: File[] }>({
      query: ({ user_request, content, comment_images, comment_files }) => {
        const formData = new FormData();
        formData.append('user_request', user_request.toString());
        formData.append('content', content);

        if (comment_images && comment_images.length > 0) {
          comment_images.forEach((image) => {
            formData.append('comment_images', image);
          });
        }

        if (comment_files && comment_files.length > 0) {
          comment_files.forEach((file) => {
            formData.append('comment_files', file);  // 'comment_files' là tên mà API mong đợi
          });
        }

        return {
          url: `request-comments/`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    updateRequestComment: builder.mutation<any, { id: number; content: string }>({
      query: ({ id, content }) => ({
        url: `request-comments/${id}/`,
        method: "PATCH",
        body: { comment: content },  // Replace 'comment' with the correct field name if needed
      }),
    }),
    deleteRequestComment: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `request-comments/${id}/`,
        method: "DELETE",
      }),
    }),

    // Admin Process
    getAdminProcesses: builder.query<any, void>({
      query: () => `admin-process/`,
    }),
    getAdminProcessById: builder.query<any, { id: number }>({
      query: ({ id }) => `admin-process/${id}/`,
    }),
    createAdminProcess: builder.mutation<any, { user_request: number; feedback: string; newStatus: string, process_images?: File[]; process_files?: File[] }>({
      query: ({ user_request, feedback, process_images, process_files, newStatus }) => {
        const formData = new FormData();
        formData.append('user_request', user_request.toString());
        formData.append('feedback', feedback);
        formData.append('status', newStatus);

        if (process_images && process_images.length > 0) {
          process_images.forEach((image) => {
            formData.append('process_images', image);
          });
        }

        if (process_files && process_files.length > 0) {
          process_files.forEach((file) => {
            formData.append('process_files', file);
          });
        }

        return {
          url: `admin-process/`,
          method: 'POST',
          body: formData,
        };
      },
    }),
    updateAdminProcess: builder.mutation<any, { id: number; data: { feedback?: string; status?: string } }>({
      query: ({ id, data }) => ({
        url: `admin-process/${id}/`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteAdminProcess: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `admin-process/${id}/`,
        method: "DELETE",
      }),
    }),

    // Surveys
    getSurveysForAdmin: builder.query<any, void>({
      query: () => `surveys-for-admin/`,
    }),
    getSurveys: builder.query<any, void>({
      query: () => `surveys/`,
    }),
    getSurveyById: builder.query<any, { id: number }>({
      query: ({ id }) => `surveys/${id}/`,
    }),
    createSurvey: builder.mutation<any, { title: string; description: string }>({
      query: (newSurvey) => ({
        url: `surveys/`,
        method: "POST",
        body: newSurvey,
      }),
    }),
    updateSurvey: builder.mutation<any, { id: number; data: { title?: string; description?: string } }>({
      query: ({ id, data }) => ({
        url: `surveys/${id}/`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteSurvey: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `surveys/${id}/`,
        method: "DELETE",
      }),
    }),  
  }),
});

// Export hooks
export const {
  // User Requests for Admin
  useGetUserRequestsForAdminQuery,
  useGetUserRequestForAdminByIdQuery,
  useCreateUserRequestForAdminMutation,
  useUpdateUserRequestForAdminMutation,
  useDeleteUserRequestForAdminMutation,

  // User Requests  
  useGetUserRequestsQuery,
  useGetUserRequestByIdQuery,
  useCreateUserRequestMutation,
  useUpdateUserRequestMutation,
  useDeleteUserRequestMutation,

  // Request Comments
  useGetRequestCommentsQuery,
  useCreateRequestCommentMutation,
  useUpdateRequestCommentMutation,
  useDeleteRequestCommentMutation,

  // Admin Processes
  useGetAdminProcessesQuery,
  useGetAdminProcessByIdQuery,
  useCreateAdminProcessMutation,
  useUpdateAdminProcessMutation,
  useDeleteAdminProcessMutation,

  // Surveys
  useGetSurveysForAdminQuery,
  useGetSurveysQuery,
  useGetSurveyByIdQuery,
  useCreateSurveyMutation,
  useUpdateSurveyMutation,
  useDeleteSurveyMutation,

} = apiCustomerService;
