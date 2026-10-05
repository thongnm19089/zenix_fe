import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiLocation = createApi({
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
  reducerPath: "locationApi",
  tagTypes: ["Location"],
  endpoints: (builder) => ({
    getLocationList: builder.query<any, void>({
      query: () => `location/`,
      providesTags: [{ type: "Location" }],
    }),

    createLocation: builder.mutation({
      query: (location) => ({
        url: "location/",
        method: "POST",
        body: location,
      }),
      invalidatesTags: [{ type: "Location" }],
    }),
    // lấy thông tin của 1 địa điểm
    getLocation: builder.query({
      query: ({ locationId }) => `location/${locationId}/`,
      providesTags: (result, error, { locationId }) => [{ type: "Location", id: locationId }],
    }),
    // cập nhật địa điểm
    editLocation: builder.mutation({
      query: (body) => ({
        url: `location/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Location", id }, { type: "Location" }],
    }),
    // xóa địa điểm
    deleteLocation: builder.mutation({
      query: ({locationId}) => ({
        url: `location/${locationId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Location" }],
    }),
    getAddressList: builder.query({
      query: () => ({
        url: "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetLocationListQuery,
  useCreateLocationMutation,
  useEditLocationMutation,
  useDeleteLocationMutation,
  useGetLocationQuery,
  useGetAddressListQuery,
} = apiLocation;
