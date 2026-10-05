import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiInvoice = createApi({
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
  reducerPath: "invoiceApi",
  tagTypes: ["IncomingInvoice", "OutcomingInvoice"],
  endpoints: (builder) => ({
    getIncomingInvoiceList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string; rate?:number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm,rate }) => {
        let queryString = `incoming-invoice/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (rate) queryString += `&rate=${rate.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "IncomingInvoice" }],
    }),

    getAllIncomingInvoiceList: builder.query<any,void>({
      query: () => `incoming-invoice/?pageSize=10000`,
      providesTags: [{ type: "IncomingInvoice"}],
    }),

    createIncomingInvoice: builder.mutation({
      query: (data) => ({
        url: "incoming-invoice/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "IncomingInvoice" }]),
    }),
    getIncomingInvoice: builder.query({
      query: ({ invoiceId }) => `incoming-invoice/${invoiceId}/`,
      providesTags: (result, error, { invoiceId }) => [{ type: "IncomingInvoice", id: invoiceId }],
    }),
    editIncomingInvoice: builder.mutation({
      query: ({ id, formData }) => ({
        url: `incoming-invoice/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "IncomingInvoice", id }, { type: "IncomingInvoice" }],
    }),
    deleteIncomingInvoice: builder.mutation({
      query: ({ invoiceId }) => ({
        url: `incoming-invoice/${invoiceId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "IncomingInvoice" }]),
    }),

    getOutcomingInvoiceList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string; rate?: number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm,rate }) => {
        let queryString = `outcoming-invoice/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (rate) queryString += `&rate=${rate.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "OutcomingInvoice" }],
    }),

    getAllOutcomingInvoiceList: builder.query<any,void>({
      query: () => `outcoming-invoice/?pageSize=10000`,
      providesTags: [{ type: "OutcomingInvoice" }],
    }),

    createOutcomingInvoice: builder.mutation({
      query: (data) => ({
        url: "outcoming-invoice/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "OutcomingInvoice" }]),
    }),
    getOutcomingInvoice: builder.query({
      query: ({ invoiceId }) => `outcoming-invoice/${invoiceId}/`,
      providesTags: (result, error, { invoiceId }) => [{ type: "OutcomingInvoice", id: invoiceId }],
    }),
    editOutcomingInvoice: builder.mutation({
      query: ({ id, formData }) => ({
        url: `outcoming-invoice/${id}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "OutcomingInvoice", id }, { type: "OutcomingInvoice" }],
    }),
    deleteOutcomingInvoice: builder.mutation({
      query: ({ invoiceId }) => ({
        url: `outcoming-invoice/${invoiceId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "OutcomingInvoice" }]),
    }),
  }),
});

export const {
  // Incoming Invoice
  useGetIncomingInvoiceListQuery,
  useGetAllIncomingInvoiceListQuery,
  useCreateIncomingInvoiceMutation,
  useEditIncomingInvoiceMutation,
  useDeleteIncomingInvoiceMutation,
  useGetIncomingInvoiceQuery,
  // Outcoming Invoice
  useGetOutcomingInvoiceListQuery,
  useGetAllOutcomingInvoiceListQuery,
  useCreateOutcomingInvoiceMutation,
  useEditOutcomingInvoiceMutation,
  useDeleteOutcomingInvoiceMutation,
  useGetOutcomingInvoiceQuery,
} = apiInvoice;
