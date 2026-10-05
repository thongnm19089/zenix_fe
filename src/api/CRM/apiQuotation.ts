import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiQuotation = createApi({
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
  reducerPath: "quotationApi",
  tagTypes: ["Quotation"],
  endpoints: (builder) => ({
    getQuotationList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm }) => {
        let queryString = `quotation/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Quotation" }],
    }),
    getAllQuotationList: builder.query<any, void>({
      query: () => `quotation/?pageSize=10000`,
      providesTags: [{ type: "Quotation" }],
    }),
    createQuotation: builder.mutation({
      query: (Quotation) => ({
        url: "quotation/",
        method: "POST",
        body: Quotation,
      }),
      invalidatesTags: [{ type: "Quotation" }],
    }),
    createMultiQuotation: builder.mutation({
      query: (Quotation) => ({
        url: "quotation/create-multiple-quotations/",
        method: "POST",
        body: Quotation,
      }),
      invalidatesTags: [{ type: "Quotation" }],
    }),
    getQuotation: builder.query({
      query: ({ id }) => ` quotation/${id}/`,
      providesTags: (result, error, { id }) => [{ type: "Quotation", id: id }],
    }),
    // cập nhật địa điểm
    editQuotation: builder.mutation({
      query: (body) => ({
        url: `quotation/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Quotation", id }, { type: "Quotation" }],
    }),
    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: `quotation/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Quotation" }],
    }),
  }),
});

export const {
  useGetQuotationListQuery,
  useGetAllQuotationListQuery,
  useCreateQuotationMutation,
  useCreateMultiQuotationMutation,
  useEditQuotationMutation,
  useDeleteQuotationMutation,
  useGetQuotationQuery,
} = apiQuotation;
