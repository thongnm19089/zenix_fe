import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";


export const apiBranch = createApi({
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
  reducerPath: "branchApi",
  tagTypes: ["Branch"],
  endpoints: (builder) => ({

    getBranchList: builder.query<any, void>({
      query: () => `branch/`,
      providesTags: [{ type: "Branch" }],
    }),

    createBranch: builder.mutation({
      query: (branch) => ({
        url: "branch/",
        method: "POST",
        body: branch,
      }),
      invalidatesTags: [{ type: "Branch" }],
    }),
    // lấy thông tin của 1 chi nhánh
    getBranch: builder.query({
      query: ({branchId}) => `branch/${branchId}/`,
      providesTags: (result, error, { branchId }) => [{ type: "Branch", id: branchId }]
    }),
    // cập nhật chi nhánh
    editBranch: builder.mutation({
      query: (body) => ({
        url: `branch/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Branch", id },
        { type: "Branch" } 
      ],
    }),
    // xóa chi nhánh
    deleteBranch: builder.mutation({
      query: ({branchId}) => ({
        url: `branch/${branchId}/`,
        method: "DELETE",
   
      }),
      invalidatesTags: [{ type: "Branch" }],
    }),
  }),
});

export const {
  useGetBranchListQuery,
  useCreateBranchMutation,
  useEditBranchMutation,
  useDeleteBranchMutation,
  useGetBranchQuery
} = apiBranch;
