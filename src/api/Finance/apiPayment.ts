import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiPayment = createApi({
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
  reducerPath: "paymentApi",
  tagTypes: [
    "PaymentMethod",
    "PaymentStatus",
    "BankAccount",
    "PaymentSeller",
    "PaymentAccountant",
    "Outstanding",
    "Order",
  ],
  endpoints: (builder) => ({
    getPaymentMethodList: builder.query<any, void>({
      query: () => `payment-method/`,
      providesTags: [{ type: "PaymentMethod" }],
    }),

    createPaymentMethod: builder.mutation({
      query: (data) => ({
        url: "payment-method/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentMethod" }]),
    }),

    getPaymentMethod: builder.query({
      query: ({ paymentMethodId }) => `payment-method/${paymentMethodId}/`,
      providesTags: (result, error, { paymentMethodId }) => [{ type: "PaymentMethod", id: paymentMethodId }],
    }),
    editPaymentMethod: builder.mutation({
      query: (body) => ({
        url: `payment-method/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "PaymentMethod", id }, { type: "PaymentMethod" }],
    }),
    deletePaymentMethod: builder.mutation({
      query: ({ paymentMethodId }) => ({
        url: `payment-method/${paymentMethodId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentMethod" }]),
    }),
    getPaymentStatusList: builder.query<any, void>({
      query: () => `payment-status/`,
      providesTags: [{ type: "PaymentStatus" }],
    }),

    createPaymentStatus: builder.mutation({
      query: (data) => ({
        url: "payment-status/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentStatus" }]),
    }),

    getPaymentStatus: builder.query({
      query: ({ paymentStatusId }) => `payment-status/${paymentStatusId}/`,
      providesTags: (result, error, { paymentStatusId }) => [{ type: "PaymentStatus", id: paymentStatusId }],
    }),
    editPaymentStatus: builder.mutation({
      query: (body) => ({
        url: `payment-status/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "PaymentStatus", id }, { type: "PaymentStatus" }],
    }),
    deletePaymentStatus: builder.mutation({
      query: ({ paymentStatusId }) => ({
        url: `payment-status/${paymentStatusId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentStatus" }]),
    }),
    getBankAccountList: builder.query<any, void>({
      query: () => `bank-account/`,
      providesTags: [{ type: "BankAccount" }],
    }),

    createBankAccount: builder.mutation({
      query: (data) => ({
        url: "bank-account/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "BankAccount" }]),
    }),

    getBankAccount: builder.query({
      query: ({ bankAccountId }) => `bank-account/${bankAccountId}/`,
      providesTags: (result, error, { bankAccountId }) => [{ type: "BankAccount", id: bankAccountId }],
    }),
    editBankAccount: builder.mutation({
      query: (body) => ({
        url: `bank-account/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "BankAccount", id }, { type: "BankAccount" }]),
    }),
    deleteBankAccount: builder.mutation({
      query: ({ bankAccountId }) => ({
        url: `bank-account/${bankAccountId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "BankAccount" }],
    }),
    getPaymentSellerList: builder.query<any, void>({
      query: () => `payment-seller/`,
      providesTags: [{ type: "PaymentSeller" }],
    }),

    createPaymentSeller: builder.mutation({
      query: (data) => ({
        url: "payment-seller/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentSeller" }]),
    }),

    getPaymentSeller: builder.query({
      query: ({ paymentSellerId }) => `payment-seller/${paymentSellerId}/`,
      providesTags: (result, error, { paymentSellerId }) => [{ type: "PaymentSeller", id: paymentSellerId }],
    }),
    editPaymentSeller: builder.mutation({
      query: (body) => ({
        url: `payment-seller/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "PaymentSeller", id }, { type: "PaymentSeller" }],
    }),
    deletePaymentSeller: builder.mutation({
      query: ({ paymentSellerId }) => ({
        url: `payment-seller/${paymentSellerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentSeller" }]),
    }),
    getPaymentAccountantList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string; seller_id?: number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, seller_id }) => {
        let queryString = `payment-accountant/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (seller_id) queryString += `&seller_id=${seller_id.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "PaymentAccountant" }],
    }),
    getAllPaymentAccountantList: builder.query<any,void>({
      query: () => `payment-accountant/?pageSize=10000`,
      providesTags: [{ type: "PaymentAccountant" }],
    }),


    createPaymentAccountant: builder.mutation({
      query: (data) => ({
        url: "payment-accountant/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentAccountant" }]),
    }),

    getPaymentAccountant: builder.query({
      query: ({ paymentAccountantId }) => `payment-accountant/${paymentAccountantId}/`,
      providesTags: (result, error, { paymentAccountantId }) => [
        { type: "PaymentAccountant", id: paymentAccountantId },
      ],
    }),
    editPaymentAccountant: builder.mutation({
      query: (body) => ({
        url: `payment-accountant/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "PaymentAccountant", id }, { type: "PaymentAccountant" }],
    }),
    deletePaymentAccountant: builder.mutation({
      query: ({ paymentAccountantId }) => ({
        url: `payment-accountant/${paymentAccountantId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : [{ type: "PaymentAccountant" }]),
    }),
    getOutstandingList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm }) => {
        let queryString = `outstanding/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Outstanding" }],
    }),

    getAllOutstandingList: builder.query<any, void>({
      query: () => `outstanding/?pageSize=10000`,
      providesTags: [{ type: "Outstanding"}],
    }),

    getOutstandingAccountantList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string;seller_id?: number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, seller_id }) => {
        let queryString = `outstanding-accountant/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (seller_id) queryString += `&seller_id=${seller_id.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Outstanding" }],
    }),

    getAllOutstandingAccountantList: builder.query<any,void>({
      query: () => `outstanding-accountant/?pageSize=10000`,
      providesTags: [{ type: "Outstanding"}],
    }),

    updateDueDateByAccountant: builder.mutation({
      query: (body) => ({
        url: `update-due-date/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Outstanding", id }, { type: "Outstanding" }]),
    }),
    getOrderAccountantList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string; source?: number[];status?: number[]; seller_id?: number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm,source, status, seller_id }) => {
        let queryString = `order-accountant/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (status) queryString += `&status=${status.toString()}`;
        if (seller_id) queryString += `&seller_id=${seller_id.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Order" }],
    }),

    getAllOrderAccountantList: builder.query<any,void>({
      query: () => `order-accountant/?pageSize=10000`,
      providesTags: [{type: "Order"}],
    }),

  }),
});

export const {
  // set up Payment Method
  useGetPaymentMethodListQuery,
  useCreatePaymentMethodMutation,
  useEditPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentMethodQuery,

  // set up Payment Status
  useGetPaymentStatusListQuery,
  useCreatePaymentStatusMutation,
  useEditPaymentStatusMutation,
  useDeletePaymentStatusMutation,
  useGetPaymentStatusQuery,

  // set up Bank account
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useEditBankAccountMutation,
  useGetBankAccountListQuery,
  useGetBankAccountQuery,

  // Payment Seller
  useCreatePaymentSellerMutation,
  useDeletePaymentSellerMutation,
  useEditPaymentSellerMutation,
  useGetPaymentSellerListQuery,
  useGetPaymentSellerQuery,

  // Payment Account
  useCreatePaymentAccountantMutation,
  useDeletePaymentAccountantMutation,
  useEditPaymentAccountantMutation,
  useGetPaymentAccountantListQuery,
  useGetAllPaymentAccountantListQuery,
  useGetPaymentAccountantQuery,

  // Outstanding
  useGetOutstandingAccountantListQuery,
  useGetAllOutstandingAccountantListQuery,
  useGetOutstandingListQuery,
  useGetAllOutstandingListQuery,
  useUpdateDueDateByAccountantMutation,

  // Order
  useGetOrderAccountantListQuery,
  useGetAllOrderAccountantListQuery,
} = apiPayment;
