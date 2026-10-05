import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiCompany = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/apis/v1/`,
    prepareHeaders: (headers, { getState }) => {
      const accessToken = getAccessTokenFromCookie();      
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  reducerPath: "companyApi",
  tagTypes: ["Company"],
  endpoints: (builder) => ({
    editCompany: builder.mutation({
      query: (data) => ({
        url: "update-company/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Company" }],
    }),
  }),
});

export const {useEditCompanyMutation} = apiCompany;