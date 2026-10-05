import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiHRConfiguration = createApi({
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
  reducerPath: "hrConfigurationApi",
  tagTypes: ["ApplicationSource", "ApplicationStatus", 'JobPosition', 'StaffManager'],
  endpoints: (builder) => ({
    getSources: builder.query<any, void>({
      query: () => `application-source/`,
      providesTags: [{ type: "ApplicationSource" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),

    createSource: builder.mutation({
      query: (source) => ({
        url: "application-source/",
        method: "POST",
        body: source,
      }),
      invalidatesTags: [{ type: "ApplicationSource" }],
    }),
    // lấy thông tin của 1 nguồn
    getSource: builder.query({
      query: ({ sourceId }) => `application-source/${sourceId}/`,
      providesTags: (result, error, { sourceId }) => [{ type: "ApplicationSource", id: sourceId }],
    }),
    // cập nhật nguồn
    editSource: builder.mutation({
      query: (body) => ({
        url: `application-source/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ApplicationSource", id }, { type: "ApplicationSource" }],
    }),
    // xóa nguồn
    deleteSource: builder.mutation({
      query: ({ sourceId }) => ({
        url: `application-source/${sourceId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ApplicationSource" }],
    }),
    getStatusList: builder.query<any, void>({
      query: () => `application-status/`,
      providesTags: [{ type: "ApplicationStatus" }],
      //   providesTags: (result) => (result ? result.map(({ id }: { id: string }) => ({ type: "Account", id })) : []),
    }),
    // Tạo 1 trạng thái
    createStatus: builder.mutation({
      query: (status) => ({
        url: "application-status/",
        method: "POST",
        body: status,
      }),
      invalidatesTags: [{ type: "ApplicationStatus" }],
    }),
    // lấy thông tin của 1 trạng thái
    getStatus: builder.query({
      query: ({ statusId }) => `application-status/${statusId}/`,
      providesTags: (result, error, { statusId }) => [{ type: "ApplicationStatus", id: statusId }],
    }),
    // cập nhật trạng thái
    editStatus: builder.mutation({
      query: (body) => ({
        url: `application-status/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ApplicationStatus", id }, { type: "ApplicationStatus" }],
    }),
    // xóa trạng thái
    deleteStatus: builder.mutation({
      query: ({ statusId }) => ({
        url: `application-status/${statusId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ApplicationStatus" }],
    }),
    // Vị trí công việc
    getPositionList: builder.query<any, void>({
      query: () => `position/`,
      providesTags: [{ type: "JobPosition" }],
    }),
    // Tạo 1 vị trí
    createPosition: builder.mutation({
      query: (position) => ({
        url: "position/",
        method: "POST",
        body: position,
      }),
      invalidatesTags: [{ type: "JobPosition" }],
    }),
    // lấy thông tin của 1 vị trí
    getPosition: builder.query({
      query: ({ positionId }) => `position/${positionId}/`,
      providesTags: (result, error, { positionId }) => [{ type: "JobPosition", id: positionId }],
    }),
    // cập nhật vị trí
    editPosition: builder.mutation({
      query: (body) => ({
        url: `position/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "JobPosition", id }, { type: "JobPosition" }],
    }),
    // xóa vị trí
    deletePosition: builder.mutation({
      query: ({ positionId }) => ({
        url: `position/${positionId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "JobPosition" }],
    }),

    // Mối quan hệ cấp trên cấp dưới
    getStaffManagerList: builder.query<any, void>({
      query: () => `staff-manager-relationship/`,
      providesTags: [{ type: "StaffManager" }],
    }),
    // Tạo 1 mối quan hệ
    createStaffManager: builder.mutation({
      query: (staffManager) => ({
        url: "staff-manager-relationship/",
        method: "POST",
        body: staffManager,
      }),
      invalidatesTags: [{ type: "StaffManager" }],
    }),
    // lấy thông tin của 1 mối quan hệ
    getStaffManager: builder.query({
      query: ({ staffManagerId }) => `staff-manager-relationship/${staffManagerId}/`,
      providesTags: (result, error, { staffManagerId }) => [{ type: "StaffManager", id: staffManagerId }],
    }),
    // cập nhật mối quan hệ
    editStaffManager: builder.mutation({
      query: (body) => ({
        url: `staff-manager-relationship/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "StaffManager", id }, { type: "StaffManager" }],
    }),
    // xóa mối quan hệ
    deleteStaffManager: builder.mutation({
      query: ({ staffManagerId }) => ({
        url: `staff-manager-relationship/${staffManagerId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "StaffManager" }],
    }),
    getSubordinates: builder.query({
      query: ({ staffManagerId }) => {
        let queryString = `staff-manager-relationship/get-subordinates/`;
        if (staffManagerId) queryString += `?actor_id=${staffManagerId}`;
        return queryString;
      },
      providesTags: (result, error, { staffManagerId }) => [{ type: "StaffManager", id: staffManagerId }],
    }),

  }),
});

export const {
  // Recruitment Source 
  useGetSourcesQuery,
  useCreateSourceMutation,
  useEditSourceMutation,
  useDeleteSourceMutation,
  useGetSourceQuery,

  // Recruitment Status 
  useGetStatusListQuery,
  useCreateStatusMutation,
  useEditStatusMutation,
  useDeleteStatusMutation,
  useGetStatusQuery,

  // Job Position
  useGetPositionListQuery,
  useCreatePositionMutation,
  useEditPositionMutation,
  useDeletePositionMutation,
  useGetPositionQuery,

  // StaffManagerRelationship
  useGetStaffManagerListQuery,
  useCreateStaffManagerMutation,
  useEditStaffManagerMutation,
  useDeleteStaffManagerMutation,
  useGetStaffManagerQuery,

  useGetSubordinatesQuery,

} = apiHRConfiguration;
