import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiDivision = createApi({
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
  reducerPath: "divisionApi",
  tagTypes: ["Division"],
  endpoints: (builder) => ({
    getDivisions: builder.query<any, void>({
      query: () => `division/`,
      providesTags: [{ type: "Division" }],
    }),

    createDivision: builder.mutation({
      query: (division) => ({
        url: "division/",
        method: "POST",
        body: division,
      }),
      invalidatesTags: [{ type: "Division" }],
    }),
    // lấy thông tin của 1 phòng ban
    getDivision: builder.query({
      query: ({ divisionId }) => `division/${divisionId}/`,
      providesTags: (result, error, { divisionId }) => [{ type: "Division", id: divisionId }],
    }),
    // cập nhật phòng ban
    editDivision: builder.mutation({
      query: (body) => ({
        url: `division/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Division", id }, { type: "Division" }],
    }),
    // xóa phòng ban
    deleteDivision: builder.mutation({
      query: ({ divisionId }) => ({
        url: `division/${divisionId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Division" }],
    }),
  }),
});

export const {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useEditDivisionMutation,
  useDeleteDivisionMutation,
  useGetDivisionQuery,
} = apiDivision;
