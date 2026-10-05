import { LoginRequest, LoginResponse } from "@/types/loginTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiLogin = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/apis/v1/` }),
  reducerPath: "loginApi",
  tagTypes: ["Function"],
  endpoints: (builder) => ({
    userLogin: builder.mutation<LoginResponse, Partial<LoginRequest>>({
      query: ({ username, password, provider, uid, token, extra_data }) => ({
        url: "user-login/",
        method: "POST",
        body: {
          ...(username && password ? { username, password } : {}),
          ...(provider && uid && token ? { provider, uid, token, extra_data } : {}),
        },
      }),
      invalidatesTags: [{ type: "Function" }],
    }),
    resetPassword: builder.mutation<void, { uidb64: string; token: string; new_password: string }>({
      query: ({ uidb64, token, new_password }) => ({
        url: "password-reset/",
        method: "POST",
        body: { uidb64, token, new_password },
      }),
      invalidatesTags: [{ type: "Function" }],
    }),
    passwordResetRequest: builder.mutation<void, { email: string }>({
      query: ({ email }) => ({
        url: "password-reset-request/",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  useUserLoginMutation,
  useResetPasswordMutation,
  usePasswordResetRequestMutation,
} = apiLogin;
