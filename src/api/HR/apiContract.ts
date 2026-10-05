import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiContract = createApi({
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
  reducerPath: "contractApi",
  tagTypes: ["ContractDuration", "ContractType"],
  endpoints: (builder) => ({
    getContractDurationList: builder.query<any, void>({
      query: () => `contract-duration/`,
      providesTags: [{ type: "ContractDuration" }],
    }),

    createContractDuration: builder.mutation({
      query: (data) => ({
        url: "contract-duration/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ContractDuration" }],
    }),
    getContractDuration: builder.query({
      query: (contractDurationId) => `contract-duration/${contractDurationId}/`,
      providesTags: (result, error) => [{ type: "ContractDuration" }],
    }),
    editContractDuration: builder.mutation({
      query: (body) => ({
        url: `contract-duration/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ContractDuration", id }, { type: "ContractDuration" }],
    }),
    deleteContractDuration: builder.mutation({
      query: (contractDurationId) => ({
        url: `contract-duration/${contractDurationId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ContractDuration" }],
    }),
    getContractTypeList: builder.query<any, void>({
      query: () => `contract-type/`,
      providesTags: [{ type: "ContractType" }],
    }),

    createContractType: builder.mutation({
      query: (data) => ({
        url: "contract-type/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "ContractType" }],
    }),
    getContractType: builder.query({
      query: (contractTypeId) => `contract-type/${contractTypeId}/`,
      providesTags: (result, error, { contractTypeId }) => [{ type: "ContractType", id: contractTypeId }],
    }),
    editContractType: builder.mutation({
      query: (body) => ({
        url: `contract-type/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ContractType", id }, { type: "ContractType" }],
    }),
    deleteContractType: builder.mutation({
      query: (contractTypeId) => ({
        url: `contract-type/${contractTypeId}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ContractType" }],
    }),
  }),
});

export const {
  //Contract Duration
  useCreateContractDurationMutation,
  useDeleteContractDurationMutation,
  useEditContractDurationMutation,
  useGetContractDurationListQuery,
  useGetContractDurationQuery,

  //Contract Type
  useCreateContractTypeMutation,
  useDeleteContractTypeMutation,
  useEditContractTypeMutation,
  useGetContractTypeListQuery,
  useGetContractTypeQuery,
} = apiContract;
