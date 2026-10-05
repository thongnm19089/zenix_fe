import { getAccessTokenFromCookie, refreshAccessToken, saveNewAccessToken } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSetup = createApi({
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
  reducerPath: "setupApi",
  endpoints: (builder) => ({
    getSetup: builder.query<any, void>({
      query: () => `set-up/`,
    }),
    getSetupCrmApp: builder.query<any, void>({
      query: () => `set-up-crm-app/`,
    }),
    getSetupFinanceApp: builder.query<any, void>({
      query: () => `set-up-finance-app/`,
    }),
    getSetupHrApp: builder.query<any, void>({
      query: () => `set-up-hr-app/`,
    }),
    getSetupTask: builder.query<any, void>({
      query: () => `set-up-task-app/`,
    }),
    getSetupCommunityApp: builder.query<any, void>({
      query: () => `set-up-community-app/`,
    }),
    getSetupProcurementApp: builder.query<any, void>({
      query: () => `set-up-procurement-app/`,
    }),
    getSetUpCustomerService: builder.query({
      query: () => `set-up-request/`,
  }),
  }),
});

export const {
  useGetSetupCrmAppQuery,
  useGetSetupFinanceAppQuery,
  useGetSetupHrAppQuery,
  useGetSetupQuery,
  useGetSetupTaskQuery,
  useGetSetupCommunityAppQuery,
  useGetSetupProcurementAppQuery,
  useGetSetUpCustomerServiceQuery,
} = apiSetup;
