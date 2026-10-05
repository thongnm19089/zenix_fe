import { toFormData } from "@/helper"; import { getAccessTokenFromCookie } from "@/utils/token";
import { Business } from "@/views/private/management/project/BusinessTable";
import { DocumentGroup, PortalDocument } from "@/views/private/management/project/DocumentTable";
import { PaymentSchedule, Transaction } from "@/views/private/management/project/PaymentTable";
import { BusinessService, DetailedServicePackage, ServicePackage } from "@/views/private/management/project/ServiceTable";
import { PortalVideo, VideoGroup } from "@/views/private/management/project/VideoTable";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import isNull from "lodash/isNull";

export const apiPortal = createApi({
    // baseQuery: baseQueryWithAxios,
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/portal/`,
        prepareHeaders: (headers, { getState }) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    reducerPath: "portalApi",
    tagTypes: [
        "Business", // Added this so you can invalidate it later
        "Service",
        "Package",
        "Document",
        "DocumentGroup",
        "Video",
        "VideoGroup",
        "Payment",
        "Transaction",
    ],
    endpoints: (builder) => ({
        portalBussinesses: builder.query<any, { limit?: number, offset?: number }>({
            query: ({ limit, offset }) => ({
                url: `businesses/`,
                method: "GET",
                params: { limit, offset },
            }),
            providesTags: ["Business"],
        }),
        portalBusinessIds: builder.query<any, number[]>({
            async queryFn(ids, _api, _opt, fetchWithBQ) {
                const businesses = await Promise.all(
                    [...new Set(ids)].map(async (id) => (await fetchWithBQ({
                        url: `businesses/${id}`,
                        method: "GET",
                    })).data
                    )
                )

                return { data: businesses.filter((ele) => ele) };
            }
        }),
        portalBussiness: builder.query<any, { ids: number[] }>({
            async queryFn({ ids }, _api, _a, fetchWithBQ) {
                const businesses = await Promise.all(
                    [...new Set(ids)].map((id) => fetchWithBQ({
                        url: `businesses/${id}`,
                        method: "GET",
                    })))

                return { data: businesses.map(res => res.data).filter(ele => ele) }
            },
            providesTags: ["Business"],
        }),
        portalBussinessAdd: builder.mutation<any, Omit<Business, "id">>({
            query: (record) => ({
                url: `businesses/create-business/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Business"],
        }),
        portalBussinessDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `businesses/${id}/`,
                method: "DELETE"
            }),
            invalidatesTags: ["Business"],
        }),
        portalBussinessEdit: builder.mutation<any, Partial<Business>>({
            query: ({ id, ...business }) => ({
                url: `businesses/${id}/`,
                body: business,
                method: "PATCH"
            }),
            invalidatesTags: ["Business"],
        }),
        portalService: builder.query<any, { limit?: number, offset?: number }>({
            query: ({ limit, offset }) => ({
                url: `services/?limit=${limit}&offset=${offset}`,
                method: "GET",
            }),
            providesTags: ["Service", "Package"],
        }),
        portalServiceIds: builder.query<any, number[]>({
            async queryFn(ids, _api, _opt, fetchBQ) {
                const services = await Promise.all(
                    [...new Set(ids)].map(async (id) => (await fetchBQ({
                        url: `services/${id}`,
                        method: "GET",
                    })).data)
                );

                return { data: services.filter(ser => ser) };
            },
            providesTags: ["Service", "Package"],
        }),
        portalServiceDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => {
                return {
                    url: `services/${id}/`,
                    method: "DELETE",
                }},
            invalidatesTags: ["Service", "Package"],
        }),
        portalServiceEdit: builder.mutation<any, Partial<BusinessService>>({
            query: ({ id, ...record }) => ({
                url: `services/${id}/`,
                method: "PATCH",
                body: record,
            }),
            invalidatesTags: ["Service", "Package"],
        }),
        portalServiceAdd: builder.mutation<any, Omit<BusinessService, "id">>({
            query: (record) => ({
                url: `services/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Service", "Package"],
        }),
        portalServicePackage: builder.query<any, { ids: number[] }>({
            async queryFn({ ids }, api, _a, fetchWithBQ) {
                const packages = await Promise.all(
                    [...new Set(ids)].map((id) => fetchWithBQ({
                        url: `packages/${id}/`,
                        method: "GET",
                    })))

                return { data: packages.map(res => res.data).filter(ele => ele) }
            },
            providesTags: ["Service", "Package"],
        }),
        portalServicePackageDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `packages/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Service", "Package"],
        }),
        portalServicePackageAdd: builder.mutation<any, Omit<DetailedServicePackage, "id">>({
            query: (record) => ({
                url: `packages/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Service", "Package"],
        }),
        portalDocument: builder.query<any, { limit?: number, offset?: number }>({
            query: ({ limit, offset }) => ({
                url: `documents/?limit=${limit}&offset=${offset}`,
                method: "GET",
            }),
            providesTags: ["Document", "DocumentGroup",]
        }),
        portalDocumentDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `documents/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Document", "DocumentGroup",],
        }),
        portalDocumentEdit: builder.mutation<any, Partial<PortalDocument>>({
            query: ({ id, ...record }) => {
                let payload = { ...record }
                for (const [key, value] of Object.entries(record)) {
                    if (isNull(value)) {
                        delete payload[key as keyof typeof payload];
                    }
                }
                if (typeof payload.file === "string") {
                    delete payload.file;
                }
                const formData = toFormData(record)

                return {
                    url: `documents/${id}/`,
                    method: "PATCH",
                    body: formData,
                };
            },
            invalidatesTags: ["Document", "DocumentGroup",],
        }),
        portalDocumentAdd: builder.mutation<any, Omit<PortalDocument, "id">>({
            query: (record) => {
                if (typeof record.is_active === 'undefined') {
                    record.is_active = false;
                }
                const formData = toFormData(record)

                return {
                    url: `documents/`,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Document", "DocumentGroup",],
        }),
        portalDocumentGroups: builder.query<any, {}>({
            query: ({ }) => ({
                url: `document-groups/`,
                method: "GET",
            }),
            providesTags: ["Document", "DocumentGroup",]
        }),
        portalDocumentGroupDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `document-groups/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Document", "DocumentGroup"],
        }),
        portalDocumentGroupEdit: builder.mutation<any, Partial<DocumentGroup>>({
            query: ({ id, ...record }) => {
                return {
                    url: `document-groups/${id}/`,
                    method: "PATCH",
                    body: record,
                }
            },
            invalidatesTags: ["Document", "DocumentGroup"],
        }),
        portalDocumentGroupAdd: builder.mutation<any, Omit<DocumentGroup, "id">>({
            query: (record) => ({
                url: `document-groups/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Document", "DocumentGroup"],
        }),
        portalVideos: builder.query<any, { limit?: number, offset?: number }>({
            query: ({ limit, offset }) => ({
                url: `videos/?limit=${limit}&offset=${offset}`,
                method: "GET",
            }),
            providesTags: ["Video", "VideoGroup",]
        }),
        portalVideoDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `videos/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalVideoEdit: builder.mutation<any, Partial<PortalVideo>>({
            query: ({ id, ...record }) => {
                let payload = { ...record };
                for (const [key, value] of Object.entries(record)) {
                    //@ts-ignore
                    if (isNull(value)) {
                        //@ts-ignore
                        delete payload[key]
                    }
                }

                if (typeof payload.video_file === "string") {
                    delete payload.video_file
                }

                const formData = toFormData(payload);

                return {
                    url: `videos/${id}/`,
                    method: "PATCH",
                    body: formData,
                }
            },
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalVideoAdd: builder.mutation<any, Omit<PortalVideo, "id">>({
            query: (record) => {
                if (typeof record.is_active === 'undefined') {
                    record.is_active = false;
                }
                const formData = toFormData(record)

                return {
                    url: `videos/`,
                    method: "POST",
                    body: formData,
                }
            },
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalVideoGroupDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `video-groups/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalVideoGroupEdit: builder.mutation<any, Partial<VideoGroup>>({
            query: ({ id, ...record }) => ({
                url: `video-groups/${id}/`,
                method: "PATCH",
                body: record,
            }),
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalVideosGroups: builder.query<any, {}>({
            query: ({ }) => ({
                url: `video-groups/`,
                method: "GET",
            }),
            providesTags: ["Video", "VideoGroup",]
        }),
        portalVideoGroupAdd: builder.mutation<any, Omit<VideoGroup, "id">>({
            query: (record) => ({
                url: `video-groups/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Video", "VideoGroup",]
        }),
        portalPayments: builder.query<any, { limit?: number, offset?: number }>({
            query: ({ limit, offset }) => ({
                url: `payment-schedules/?limit=${limit}&offset=${offset}`,
                method: "GET",
            }),
            providesTags: ["Payment", "Transaction"]
        }),
        portalPaymentDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `payment-schedules/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
        portalPaymentEdit: builder.mutation<any, Partial<PaymentSchedule>>({
            query: ({ id, ...record }) => ({
                url: `payment-schedules/${id}/`,
                method: "PATCH",
                body: record,
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
        portalPaymentAdd: builder.mutation<any, Omit<PaymentSchedule, 'id'>>({
            query: (record) => ({
                url: `payment-schedules/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
        portalTransactions: builder.query<any, { limit?: number, offset?: number }>({
            query: (params) => ({
                url: `payment-transactions/`,
                method: "GET",
                params,
            }),
            providesTags: ["Payment", "Transaction"]
        }),
        portalTransactionDelete: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `payment-transactions/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
        portalTransactionEdit: builder.mutation<any, Partial<Transaction>>({
            query: ({ id, ...record }) => ({
                url: `payment-transactions/${id}/`,
                method: "PATCH",
                body: record,
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
        portalTransactionAdd: builder.mutation<any, Omit<Transaction, 'id'>>({
            query: (record) => ({
                url: `payment-transactions/`,
                method: "POST",
                body: record,
            }),
            invalidatesTags: ["Payment", "Transaction"]
        }),
    }),
});

export const {
    // business
    usePortalBussinessesQuery,
    usePortalBussinessQuery,
    usePortalBussinessEditMutation,
    usePortalBussinessDeleteMutation,
    usePortalBussinessAddMutation,
    // service
    usePortalServiceQuery,
    usePortalServicePackageQuery,
    usePortalServiceDeleteMutation,
    usePortalServicePackageDeleteMutation,
    usePortalServiceEditMutation,
    usePortalServiceAddMutation,
    usePortalServicePackageAddMutation,
    usePortalServiceIdsQuery,
    //document
    usePortalDocumentQuery,
    usePortalDocumentGroupsQuery,
    usePortalDocumentGroupDeleteMutation,
    usePortalDocumentDeleteMutation,
    usePortalDocumentEditMutation,
    usePortalDocumentGroupEditMutation,
    usePortalDocumentGroupAddMutation,
    usePortalDocumentAddMutation,
    //video
    usePortalVideosGroupsQuery,
    usePortalVideosQuery,
    usePortalVideoDeleteMutation,
    usePortalVideoAddMutation,
    usePortalVideoGroupDeleteMutation,
    usePortalVideoEditMutation,
    usePortalVideoGroupEditMutation,
    usePortalVideoGroupAddMutation,
    //payment
    usePortalPaymentsQuery,
    usePortalPaymentDeleteMutation,
    usePortalPaymentEditMutation,
    usePortalTransactionsQuery,
    usePortalTransactionEditMutation,
    usePortalTransactionDeleteMutation,
    usePortalPaymentAddMutation,
    usePortalTransactionAddMutation,
} = apiPortal;
