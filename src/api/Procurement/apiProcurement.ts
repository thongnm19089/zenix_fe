import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiProcurement = createApi({
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
  reducerPath: "procurementApi",
  tagTypes: [
    "PaymentTerm",
    "EvaluationCriteria",
    "SupplierManagement",
    "PurchaseOrder",
    "SupplierOutstanding",
    "SupplierRating",
  ],
  endpoints: (builder) => ({
    // Payment Term CRUD
    getPaymentTerms: builder.query<any, void>({
      query: () => `payment-term/`,
      providesTags: ["PaymentTerm"],
    }),
     getPaymentTermId: builder.query({
       query: ({ paymentTermId }) => `payment-term/${paymentTermId}/`,
       providesTags: (result, error, { paymentTermId }) => [{ type: "PaymentTerm", id: paymentTermId }],
     }),
    createPaymentTerm: builder.mutation({
      query: (data) => ({
        url: "payment-term/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentTerm"],
    }),
    updatePaymentTerm: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `payment-term/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PaymentTerm"],
    }),
    deletePaymentTerm: builder.mutation({
      query: ({ id }) => ({
        url: `payment-term/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentTerm"],
    }),

    // Evaluation Criteria CRUD
    getEvaluationCriteria: builder.query({
      query: () => `evaluation-criteria/`,
      providesTags: ["EvaluationCriteria"],
    }),
    createEvaluationCriteria: builder.mutation({
      query: (data) => ({
        url: "evaluation-criteria/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EvaluationCriteria"],
    }),
    updateEvaluationCriteria: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `evaluation-criteria/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["EvaluationCriteria"],
    }),
    deleteEvaluationCriteria: builder.mutation({
      query: ({ id }) => ({
        url: `evaluation-criteria/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["EvaluationCriteria"],
    }),

    // Supplier Management CRUD
    getSupplierList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        payment_term?: number[];
        brands?: number[];
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
      }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm, payment_term,brands }) => {
        let queryString = `supplier-management/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (payment_term) queryString += `&payment_term=${payment_term.toString()}`;
        if (brands) queryString += `&brands=${brands.toString()}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "SupplierManagement" }],
    }),

    getAllSupplierList: builder.query<any,void>({
      query: () => `supplier-management/?pageSize=10000`,
      providesTags: [{type: "SupplierManagement"}],
    }),

    getSupplier: builder.query({
      query: ({ supplierId }) => `supplier-management/${supplierId}/`,
      providesTags: (result, error, { supplierId }) => [
        { type: "SupplierManagement", id: supplierId },
      ],
    }),
    createSupplier: builder.mutation({
      query: (data) => ({
        url: "supplier-management/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupplierManagement"],
    }),
    createMultiSupplier: builder.mutation({
      query: (data) => ({
        url: "supplier-management/create-multiple-suppliers/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupplierManagement"],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `supplier-management/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SupplierManagement"],
    }),
    deleteSupplier: builder.mutation({
      query: ({ id }) => ({
        url: `supplier-management/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierManagement"],
    }),

    // Purchase Order CRUD
    getPurchaseOrderList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
      }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm }) => {
        let queryString = `purchase-order/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${searchTerm}`;
        return queryString;
      },
      providesTags: ["PurchaseOrder"],
    }),

    getAllPurchaseOrderList: builder.query<any,void>({
      query: () => `purchase-order/?pageSize=10000`,
      providesTags: [{ type: "PurchaseOrder"}],
    }),

    getPurchaseOrder: builder.query({
      query: ({ purchaseOrderId }) => `purchase-order/${purchaseOrderId}/`,
      providesTags: (result, error, { purchaseOrderId }) => [
        { type: "PurchaseOrder", id: purchaseOrderId },
      ],
    }),
    createPurchaseOrder: builder.mutation({
      query: (data) => ({
        url: "purchase-order/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    createMultiPurchaseOrder: builder.mutation({
      query: (data) => ({
        url: "purchase-order/create-multiple-purchase-orders/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    updatePurchaseOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `purchase-order/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),
    deletePurchaseOrder: builder.mutation({
      query: ({ id }) => ({
        url: `purchase-order/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseOrder"],
    }),

    // Supplier Outstanding CRUD
    getSupplierOutstandingList: builder.query({
      query: () => `supplier-outstanding/?pageSize=10000`,
      providesTags: ["SupplierOutstanding"],
    }),
    getSupplierOutstanding: builder.query({
      query: ({ supplierOutstandingId }) =>
        `supplier-outstanding/${supplierOutstandingId}/`,
      providesTags: (result, error, { supplierOutstandingId }) => [
        { type: "SupplierOutstanding", id: supplierOutstandingId },
      ],
    }),
    createSupplierOutstanding: builder.mutation({
      query: (data) => ({
        url: "supplier-outstanding/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupplierOutstanding"],
    }),
    updateSupplierOutstanding: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `supplier-outstanding/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SupplierOutstanding"],
    }),
    deleteSupplierOutstanding: builder.mutation({
      query: ({ id }) => ({
        url: `supplier-outstanding/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierOutstanding"],
    }),
    updateSupplierOutstandingDueDate: builder.mutation({
      query: (body) => ({
        url: `update-supplier-outstanding-due-date/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error
          ? []
          : [
              { type: "SupplierOutstanding", id },
              { type: "SupplierOutstanding" },
            ],
    }),
    // Supplier Rating CRUD
    getSupplierRatings: builder.query({
      query: () => `supplier-rating/`,
      providesTags: ["SupplierRating"],
    }),
    createSupplierRating: builder.mutation({
      query: (data) => ({
        url: "supplier-rating/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupplierRating"],
    }),
    updateSupplierRating: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `supplier-rating/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SupplierRating"],
    }),
    deleteSupplierRating: builder.mutation({
      query: ({ id }) => ({
        url: `supplier-rating/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierRating"],
    }),
  }),
});

export const {
  // Payment Term
  useGetPaymentTermsQuery,
  useGetPaymentTermIdQuery,
  useCreatePaymentTermMutation,
  useUpdatePaymentTermMutation,
  useDeletePaymentTermMutation,
  // Evaluation Criteria
  useGetEvaluationCriteriaQuery,
  useCreateEvaluationCriteriaMutation,
  useUpdateEvaluationCriteriaMutation,
  useDeleteEvaluationCriteriaMutation,
  // Supplier Management
  useGetSupplierListQuery,
  useGetAllSupplierListQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useCreateMultiSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  // Purchase Order
  useGetPurchaseOrderListQuery,
  useGetAllPurchaseOrderListQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useCreateMultiPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  // Supplier Outstanding
  useGetSupplierOutstandingListQuery,
  useGetSupplierOutstandingQuery,
  useCreateSupplierOutstandingMutation,
  useUpdateSupplierOutstandingMutation,
  useDeleteSupplierOutstandingMutation,
  useUpdateSupplierOutstandingDueDateMutation,
  // Supplier Rating
  useGetSupplierRatingsQuery,
  useCreateSupplierRatingMutation,
  useUpdateSupplierRatingMutation,
  useDeleteSupplierRatingMutation,
} = apiProcurement;
