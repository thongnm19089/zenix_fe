import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiOrder = createApi({
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
  reducerPath: "orderApi",
  tagTypes: ["Order", "Outstanding"],
  endpoints: (builder) => ({
    getOrderList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string, user?: number[], source?: number[], status?: number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, user, source, status }) => {
        let queryString = `order/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (user) queryString += `&user=${user.toString()}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (status) queryString += `&status=${status.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Order" }],
    }),
    getExportOrderList: builder.query<any, void>({
      query: () => `order/?pageSize=10000`,
      providesTags: [{ type: "Order" }],
    }),
    getAllOrderList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm }) => {
        let queryString = `order/all-orders/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Order" }],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: "order/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Order" }]),
    }),
    createMultiOrder: builder.mutation({
      query: (data) => ({
        url: "order/create-multiple-orders/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Order" }]),
    }),
    getOrder: builder.query({
      query: ({ orderId }) => `order/${orderId}/`,
      providesTags: (result, error, { orderId }) => [{ type: "Order", id: orderId }],
    }),
    editOrder: builder.mutation({
      query: (body) => ({
        url: `order/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Order", id }, { type: "Order" }]),
    }),
    updateCustomOrder: builder.mutation({
      query: (body) => ({
        url: `order/${body.id}/update-custom-order/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Order", id }, { type: "Order" }]),
    }),
    deleteOrder: builder.mutation({
      query: ({ orderId }) => ({
        url: `order/${orderId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Order" }]),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateMultiOrderMutation,
  useDeleteOrderMutation,
  useEditOrderMutation,
  useGetOrderListQuery,
  useGetExportOrderListQuery,
  useGetAllOrderListQuery,
  useGetOrderQuery,
  useUpdateCustomOrderMutation,
} = apiOrder;