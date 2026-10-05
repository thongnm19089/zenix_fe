import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiContactConfiguration = createApi({
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
  reducerPath: "contactConfigurationApi",
  tagTypes: ["LeadStage", "LeadSource", "LeadContactType", 'OrderStatus'],
  endpoints: (builder) => ({
    getLeadSources: builder.query<any, void>({
      query: () => `lead-source/`,
      providesTags: [{ type: "LeadSource" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),

    createLeadSource: builder.mutation({
      query: (source) => ({
        url: "lead-source/",
        method: "POST",
        body: source,
      }),
      invalidatesTags: [{ type: "LeadSource" }],
    }),
    // lấy thông tin của 1 nguồn
    getLeadSource: builder.query({
      query: ({ sourceId }) => `lead-source/${sourceId}/`,
      providesTags: (result, error, { sourceId }) => [{ type: "LeadSource", id: sourceId }],
    }),
    // cập nhật nguồn
    editLeadSource: builder.mutation({
      query: (body) => ({
        url: `lead-source/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "LeadSource", id }, { type: "LeadSource" }],
    }),
    // xóa nguồn
    deleteLeadSource: builder.mutation({
      query: ({ sourceId }) => ({
        url: `lead-source/${sourceId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LeadSource" }],
    }),
    getLeadStages: builder.query<any, void>({
      query: () => `lead-stage/`,
      providesTags: [{ type: "LeadStage" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),
    // Tạo 1 trạng thái liên hệ
    createLeadStage: builder.mutation({
      query: (stage) => ({
        url: "lead-stage/",
        method: "POST",
        body: stage,
      }),
      invalidatesTags: [{ type: "LeadStage" }],
    }),
    // lấy thông tin của 1 trạng thái liên hệ
    getLeadStage: builder.query({
      query: ({ stageId }) => `lead-stage/${stageId}/`,
      providesTags: (result, error, { stageId }) => [{ type: "LeadStage", id: stageId }],
    }),
    // cập nhật trạng thái liên hệ
    editLeadStage: builder.mutation({
      query: (body) => ({
        url: `lead-stage/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "LeadStage", id }, { type: "LeadStage" }],
    }),
    // xóa trạng thái liên hệ
    deleteLeadStage: builder.mutation({
      query: ({ stageId }) => ({
        url: `lead-stage/${stageId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LeadStage" }],
    }),

    getLeadContactTypes: builder.query<any, void>({
      query: () => `lead-contact-type/`,
      providesTags: [{ type: "LeadContactType" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),
    // Tạo 1 kiểu liên hệ
    createLeadContactType: builder.mutation({
      query: (contactType) => ({
        url: "lead-contact-type/",
        method: "POST",
        body: contactType,
      }),
      invalidatesTags: [{ type: "LeadContactType" }],
    }),
    // lấy thông tin của 1 kiểu liên hệ
    getLeadContactType: builder.query({
      query: ({ contactTypeId }) => `lead-contact-type/${contactTypeId}/`,
      providesTags: (result, error, { contactTypeId }) => [{ type: "LeadContactType", id: contactTypeId }],
    }),
    // cập nhật kiểu liên hệ
    editLeadContactType: builder.mutation({
      query: (body) => ({
        url: `lead-contact-type/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "LeadContactType", id }, { type: "LeadContactType" }],
    }),
    // xóa kiểu liên hệ
    deleteLeadContactType: builder.mutation({
      query: ({ contactTypeId }) => ({
        url: `lead-contact-type/${contactTypeId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LeadContactType" }],
    }),

    //
    //Trạng thái đơn hàng
    getOrderStatuses: builder.query<any, void>({
      query: () => `order-status/`,
      providesTags: [{ type: "OrderStatus" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),
    // Tạo 1 kiểu liên hệ
    createOrderStatus: builder.mutation({
      query: (orderStatus) => ({
        url: "order-status/",
        method: "POST",
        body: orderStatus,
      }),
      invalidatesTags: [{ type: "OrderStatus" }],
    }),
    // lấy thông tin của 1 kiểu liên hệ
    getOrderStatus: builder.query({
      query: ({ orderStatusId }) => `order-status/${orderStatusId}/`,
      providesTags: (result, error, { orderStatusId }) => [{ type: "OrderStatus", id: orderStatusId }],
    }),
    // cập nhật kiểu liên hệ
    editOrderStatus: builder.mutation({
      query: (body) => ({
        url: `order-status/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "OrderStatus", id }, { type: "OrderStatus" }],
    }),
    // xóa kiểu liên hệ
    deleteOrderStatus: builder.mutation({
      query: ({ orderStatusId }) => ({
        url: `order-status/${orderStatusId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "OrderStatus" }],
    }),
  }),
});

export const {
  useGetLeadSourcesQuery,
  useCreateLeadSourceMutation,
  useEditLeadSourceMutation,
  useDeleteLeadSourceMutation,
  useGetLeadSourceQuery,

  useGetLeadStagesQuery,
  useCreateLeadStageMutation,
  useEditLeadStageMutation,
  useDeleteLeadStageMutation,
  useGetLeadStageQuery,

  useCreateLeadContactTypeMutation,
  useDeleteLeadContactTypeMutation,
  useGetLeadContactTypesQuery,
  useGetLeadContactTypeQuery,
  useEditLeadContactTypeMutation,

  //Order Status
  useCreateOrderStatusMutation,
  useEditOrderStatusMutation,
  useGetOrderStatusQuery,
  useGetOrderStatusesQuery,
  useDeleteOrderStatusMutation,
} = apiContactConfiguration;
