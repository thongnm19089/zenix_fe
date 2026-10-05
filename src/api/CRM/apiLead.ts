import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiLead = createApi({
  // baseQuery: baseQueryWithAxios,
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
  reducerPath: "leadApi",
  tagTypes: ["LeadSeller", "LeadMarketer", "LeadFollower", "Customer"],
  endpoints: (builder) => ({
    getLeadSellerList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        recontactDeadline?: string;
        stage?: number[];
        source?: number[];
        marketer?: number[];
        seller?: number[];
        product?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        recontactDeadline,
        stage,
        source,
        marketer,
        seller,
        product,
      }) => {
        let queryString = `lead-seller/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (recontactDeadline)
          queryString += `&recontactDeadline=${recontactDeadline}`;
        if (stage) queryString += `&stage=${stage.toString()}`;
        if (marketer) queryString += `&marketer=${marketer.toString()}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (seller) queryString += `&seller=${seller.toString()}`;
        if (product) queryString += `&product=${product.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "LeadSeller" }],
    }),

    getAllLeadSellerList: builder.query<any, void>({
      query: () => `lead-seller/?pageSize=10000`,
      providesTags: [{ type: "LeadSeller" }],
    }),

    createLeadSeller: builder.mutation({
      query: (data) => ({
        url: "lead-seller/",
        method: "POST",
        body: data,
      }),
      // invalidatesTags: [{ type: "LeadSeller" }], // Chạy thêm api createLeadFollower rồi mới gọi lại danh sách LeadSeller
    }),

    createMultiLeadSeller: builder.mutation({
      query: (data) => ({
        url: "lead-seller/create-multiple-leads/",
        method: "POST",
        body: data,
      }),
      // invalidatesTags: [{ type: "LeadSeller" }], // Chạy thêm api createLeadFollower rồi mới gọi lại danh sách LeadSeller
    }),

    getLeadSeller: builder.query({
      query: ({ leadSellerId }) => `lead-seller/${leadSellerId}/`,
      providesTags: (result, error, { leadSellerId }) => [
        { type: "LeadSeller", id: leadSellerId },
      ],
    }),
    editLeadSeller: builder.mutation({
      query: (body) => ({
        url: `lead-seller/${body.id}/?seller_id=${body.seller}`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller", id }, { type: "LeadSeller" }],
    }),
    editMultiLeadSeller: builder.mutation({
      query: (body) => ({
        url: `lead-seller/bulk-update/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller", id }, { type: "LeadSeller" }],
    }),
    deleteLeadSeller: builder.mutation({
      query: ({ leadSellerId }) => ({
        url: `lead-seller/${leadSellerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller" }],
    }),
    deleteMultiLeadSeller: builder.mutation({
      query: (leadSellerId) => ({
        url: `lead-seller/bulk-delete/`,
        method: "POST",
        body: { lead_ids: leadSellerId }
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller" }],
    }),
    leadDuplicate: builder.mutation({
      query: (data) => ({
        url: `lead-duplicate/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller", id }, { type: "LeadSeller" }],
    }),
    deteleReContactDate: builder.mutation({
      query: (body) => ({
        url: `re-contact-delete/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller", id }, { type: "LeadSeller" }],
    }),
    getLeadMarketerList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        stage?: number[];
        source?: number[];
        marketer?: number[];
        seller?: number[];
        product?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        stage,
        source,
        marketer,
        seller,
        product
      }) => {
        let queryString = `lead-marketer/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (stage) queryString += `&stage=${stage.toString()}`;
        if (marketer) queryString += `&marketer=${marketer.toString()}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (seller) queryString += `&seller=${seller.toString()}`;
        if (product) queryString += `&product=${product.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "LeadMarketer" }],
    }),
    getAllLeadMarketerList: builder.query<any, void>({
      query: () => `lead-marketer/?pageSize=10000`,
      providesTags: [{ type: "LeadMarketer" }],
    }),

    createLeadMarketer: builder.mutation({
      query: (data) => ({
        url: "lead-marketer/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer" }],
    }),

    createMultiLeadMarketer: builder.mutation({
      query: (data) => ({
        url: "lead-marketer/create-multiple-leads/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer" }],
    }),

    getLeadMarketer: builder.query({
      query: ({ leadMarketerId }) => `lead-marketer/${leadMarketerId}/`,
      providesTags: (result, error, { leadMarketerId }) => [
        { type: "LeadMarketer", id: leadMarketerId },
      ],
    }),
    editLeadMarketer: builder.mutation({
      query: (body) => ({
        url: `lead-marketer/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer", id }, { type: "LeadMarketer" }],
    }),
    editMultiLeadMarketer: builder.mutation({
      query: (body) => ({
        url: `lead-marketer/bulk-update/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer", id }, { type: "LeadMarketer" }],
    }),
    deleteLeadMarketer: builder.mutation({
      query: ({ marketerId }) => ({
        url: `lead-marketer/${marketerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer" }],
    }),
    deleteMultiLeadMarketer: builder.mutation({
      query: (marketerIds) => ({
        url: `lead-marketer/bulk-delete/`,
        method: "POST",
        body: { lead_ids: marketerIds }
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadMarketer" }],
    }),
    getLeadFollowerList: builder.query({
      query: () => `lead-follower/`,
      providesTags: [{ type: "LeadFollower" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),

    createLeadFollower: builder.mutation({
      query: (data) => ({
        url: "lead-follower/",
        method: "POST",
        body: data,
      }),
      // invalidatesTags: [{ type: "LeadFollower" }], // Chưa cần để danh sách LeadFollower
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller" }], // sau khi tạo LeadSeller và tạo LeadFollower chạy lại api làm mới danh sách LeadSeller
    }),

    getLeadFollower: builder.query({
      query: ({ leadFollowerId }) => `lead-follower/${leadFollowerId}/`,
      providesTags: (result, error, { leadFollowerId }) => [
        { type: "LeadFollower", id: leadFollowerId },
      ],
    }),
    editLeadFollower: builder.mutation({
      query: (body) => ({
        url: `lead-follower/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadFollower", id }, { type: "LeadSeller" }],
    }),
    deleteLeadFollower: builder.mutation({
      query: ({ leadFollowerId }) => ({
        url: `lead-follower/${leadFollowerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "LeadSeller" }],
    }),
    getCustomerList: builder.query<
      any,
      {
        customerType: string;
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        seller?: number[];
      }
    >({
      query: ({
        customerType,
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        seller,
      }) => {
        let queryString = `customer/?customerType=${customerType}&page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm)
          queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (seller) queryString += `&seller=${seller.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Customer" }],
    }),

    getAllCustomerList: builder.query<any, { customerType: string; }>({
      query: ({ customerType }) => {
        let queryString = `customer/?customerType=${customerType}&pageSize=10000`;
        return queryString;
      },
      providesTags: [{type: "Customer"}],
    }),

    createCustomer: builder.mutation({
      query: (data) => ({
        url: "customer/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer" }],
    }),

    createMultiCustomer: builder.mutation({
      query: (data) => ({
        url: "customer/create-multiple-customers/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer" }],
    }),

    getCustomer: builder.query({
      query: ({ customerId }) => ({ url: `customer/${customerId}` }),
      providesTags: (result, error, { customerId }) => [
        { type: "Customer", id: customerId },
      ],
    }),
    editCustomer: builder.mutation({
      query: (body) => ({
        url: `customer/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer", id }, { type: "Customer" }],
    }),
    editMultiCustomer: builder.mutation({
      query: (body) => ({
        url: `customer/bulk-update/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer", id }, { type: "Customer" }],
    }),
    deleteCustomer: builder.mutation({
      query: ({ customerId }) => ({
        url: `customer/${customerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer" }],
    }),
    deleteMultiCustomer: builder.mutation({
      query: (customerId) => ({
        url: `customer/bulk-delete/`,
        method: "POST",
        body: { lead_ids: customerId }
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "Customer" }],
    }),
    getCustomerOrder: builder.query<any, number>({
      query: (id: number) => `customer-orders/${id}/`,
    }),

    getDuplicateLeadsMarketer: builder.query<
      any,
      { id?: number }
    >({
      query: ({ id }) => {
        let queryString = `get-lead-duplicate/${id}`;
        return queryString;
      },
      providesTags: [{ type: "Customer" }],
    }),

    getDuplicateLeadsSeller: builder.query<
      any,
      { id?: number }
    >({
      query: ({ id }) => {
        let queryString = `lead-seller/get-duplicate-leads/`;
        if (id) queryString += `?lead_id=${id}`;
        return queryString;
      },
      providesTags: [{ type: "Customer" }],
    }),
  }),
});

export const {
  //Lead Seller
  useCreateLeadSellerMutation,
  useCreateMultiLeadSellerMutation,
  useDeleteLeadSellerMutation,
  useDeleteMultiLeadSellerMutation,
  useEditLeadSellerMutation,
  useEditMultiLeadSellerMutation,
  useGetLeadSellerListQuery,
  useGetAllLeadSellerListQuery,
  useGetLeadSellerQuery,
  useLeadDuplicateMutation,
  useDeteleReContactDateMutation,
  //Lead Marketer
  useCreateLeadMarketerMutation,
  useCreateMultiLeadMarketerMutation,
  useDeleteLeadMarketerMutation,
  useDeleteMultiLeadMarketerMutation,
  useEditLeadMarketerMutation,
  useEditMultiLeadMarketerMutation,
  useGetLeadMarketerListQuery,
  useGetAllLeadMarketerListQuery,
  useGetLeadMarketerQuery,
  //Lead Follower
  useCreateLeadFollowerMutation,
  useDeleteLeadFollowerMutation,
  useEditLeadFollowerMutation,
  useGetLeadFollowerListQuery,
  useGetLeadFollowerQuery,
  //Lead Customer
  useCreateCustomerMutation,
  useCreateMultiCustomerMutation,
  useDeleteCustomerMutation,
  useDeleteMultiCustomerMutation,
  useEditCustomerMutation,
  useEditMultiCustomerMutation,
  useGetCustomerListQuery,
  useGetAllCustomerListQuery,
  useGetCustomerQuery,
  useGetCustomerOrderQuery,

  useGetDuplicateLeadsMarketerQuery,
  useGetDuplicateLeadsSellerQuery
} = apiLead;
