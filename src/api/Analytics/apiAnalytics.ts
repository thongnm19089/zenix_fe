import { getAccessTokenFromCookie, refreshAccessToken, saveNewAccessToken } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiAnalytics = createApi({
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
  reducerPath: "analyticsApi",
  endpoints: (builder) => ({
    // Cập nhật các endpoints mới
    getAnalyticsCompany: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-company/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsSales: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-sales/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsMarketing: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-marketing/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsInventory: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-inventory/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsProduct: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-product/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsFinance: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-finance/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsCustomer: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-customer/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsHr: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-hr/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsTask: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-task/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
    getAnalyticsTraining: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let queryString = `analytics-training/`;
        if (startDate) queryString += `?start_date=${startDate}`;
        if (endDate) queryString += `${startDate ? "&" : "?"}end_date=${endDate}`;
        return queryString;
      },
    }),
  }),
});

// Export hooks
export const {
  useGetAnalyticsCompanyQuery,
  useGetAnalyticsSalesQuery,
  useGetAnalyticsMarketingQuery,
  useGetAnalyticsInventoryQuery,
  useGetAnalyticsProductQuery,
  useGetAnalyticsFinanceQuery,
  useGetAnalyticsCustomerQuery,
  useGetAnalyticsHrQuery,
  useGetAnalyticsTaskQuery,
  useGetAnalyticsTrainingQuery,
} = apiAnalytics;
