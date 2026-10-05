import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiBranding = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-brand/v1/`,
        prepareHeaders: (headers, { getState }) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    reducerPath: "brandingApi",
    tagTypes: [
        "Branding",
        "Platform",
        "Status",
        "Category",
        "Comment",
        "Creator",
        "SubCategory",
        "Tag",
        "MetricType",
        "Post",
        "Cost",       
        "Metric"  
    ],
    endpoints: (builder) => ({
        //--------------------------Branding Channels ------------------------------//
        getBrandingChannelList: builder.query({
            query: () => `brandingchannels/`,
            providesTags: [{ type: "Branding" }]
        }),
        getBrandingChannel: builder.query({
            query: (brandId) => `brandingchannels/${brandId}/`,
            providesTags: (result, error) => [{ type: "Branding" }],
        }),
        createBrandingChannel: builder.mutation({
            query: (data) => ({
                url: "brandingchannels/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Branding" }],
        }),
        editBrandingChannel: builder.mutation({
            query: (body) => ({
                url: `brandingchannels/${body.brandId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { brandId }) => [{ type: "Branding" }],
        }),
        deleteBrandingChannel: builder.mutation({
            query: (brandId) => ({
                url: `brandingchannels/${brandId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Branding" }],
        }),

        //--------------------------Categories ------------------------------//
        getCategoryList: builder.query({
            query: () => `categories/`,
            providesTags: [{ type: "Category" }],
        }),
        getCategory: builder.query({
            query: (catId) => `categories/${catId}/`,
            providesTags: (result, error) => [{ type: "Category" }],
        }),
        createCategory: builder.mutation({
            query: (data) => ({
                url: "categories/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Category" }],
        }),
        editCategory: builder.mutation({
            query: (body) => ({
                url: `categories/${body.categoryId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { categoryId }) => [{ type: "Category" }],
        }),
        deleteCategory: builder.mutation({
            query: (catId) => ({
                url: `categories/${catId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Category" }],
        }),

        //--------------------------SubCategories ------------------------------//
        getSubCategoryList: builder.query({
            query: () => `subcategories/`,
            providesTags: [{ type: "SubCategory" }],
        }),
        getSubCategory: builder.query({
            query: (subCatId) => `subcategories/${subCatId}/`,
            providesTags: (result, error) => [{ type: "SubCategory" }],
        }),
        createSubCategory: builder.mutation({
            query: (data) => ({
                url: "subcategories/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "SubCategory" }],
        }),
        editSubCategory: builder.mutation({
            query: (body) => ({
                url: `subcategories/${body.subCategoryId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { subCategoryId }) => [{ type: "SubCategory" }],
        }),
        deleteSubCategory: builder.mutation({
            query: (subCatId) => ({
                url: `subcategories/${subCatId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "SubCategory" }],
        }),

        //--------------------------Comments ------------------------------//
        getCommentsList: builder.query({
            query: () => `comments/`,
            providesTags: [{ type: "Comment" }],
        }),
        getComments: builder.query({
            query: (commentId) => `comments/${commentId}/`,
            providesTags: (result, error) => [{ type: "Comment" }],
        }),
        createComments: builder.mutation({
            query: (data) => ({
                url: "comments/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Comment" }],
        }),
        editComments: builder.mutation({
            query: (body) => ({
                url: `comments/${body.commentId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { commentId }) => [{ type: "Comment" }],
        }),
        deleteComments: builder.mutation({
            query: (commentId) => ({
                url: `comments/${commentId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Comment" }],
        }),

        //--------------------------Creators ------------------------------//
        getCreatorList: builder.query({
            query: () => `creators/`,
            providesTags: [{ type: "Creator" }],
        }),
        getCreator: builder.query({
            query: (creatorId) => `creators/${creatorId}/`,
            providesTags: (result, error) => [{ type: "Creator" }],
        }),
        createCreator: builder.mutation({
            query: (data) => ({
                url: "creators/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Creator" }],
        }),
        editCreator: builder.mutation({
            query: (body) => ({
                url: `creators/${body.creatorId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { creatorId }) => [{ type: "Creator" }],
        }),
        deleteCreator: builder.mutation({
            query: (creatorId) => ({
                url: `creators/${creatorId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Creator" }],
        }),

        //--------------------------Platforms ------------------------------//
        getPlatformList: builder.query({
            query: () => `platforms/`,
            providesTags: [{ type: "Platform" }],
        }),
        getPlatform: builder.query({
            query: (platformId) => `platforms/${platformId}/`,
            providesTags: (result, error) => [{ type: "Platform" }],
        }),
        createPlatform: builder.mutation({
            query: (data) => ({
                url: "platforms/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Platform" }],
        }),
        editPlatform: builder.mutation({
            query: (body) => ({
                url: `platforms/${body.platformId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { platformId }) => [{ type: "Platform" }],
        }),
        deletePlatform: builder.mutation({
            query: (platformId) => ({
                url: `platforms/${platformId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Platform" }],
        }),

        //--------------------------Statuses ------------------------------//
        getStatusList: builder.query({
            query: () => `statuses/`,
            providesTags: [{ type: "Status" }],
        }),
        getStatus: builder.query({
            query: (statusId) => `statuses/${statusId}/`,
            providesTags: (result, error) => [{ type: "Status" }],
        }),
        createStatus: builder.mutation({
            query: (data) => ({
                url: "statuses/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Status" }],
        }),
        editStatus: builder.mutation({
            query: (body) => ({
                url: `statuses/${body.statusId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { statusId }) => [{ type: "Status" }],
        }),
        deleteStatus: builder.mutation({
            query: (statusId) => ({
                url: `statuses/${statusId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Status" }],
        }),

        //--------------------------Tags ------------------------------//
        getTagList: builder.query({
            query: () => `tags/`,
            providesTags: [{ type: "Tag" }],
        }),
        getTag: builder.query({
            query: (tagId) => `tags/${tagId}/`,
            providesTags: (result, error) => [{ type: "Tag" }],
        }),
        createTag: builder.mutation({
            query: (data) => ({
                url: "tags/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Tag" }],
        }),
        editTag: builder.mutation({
            query: (body) => ({
                url: `tags/${body.tagId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { tagId }) => [{ type: "Tag" }],
        }),
        deleteTag: builder.mutation({
            query: (tagId) => ({
                url: `tags/${tagId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Tag" }],
        }),

        //--------------------------MetricTypes ------------------------------//
        getMetricTypeList: builder.query({
            query: () => `metric-types/`,
            providesTags: [{ type: "MetricType" }],
        }),
        getMetricType: builder.query({
            query: (metricTypeId) => `metric-types/${metricTypeId}/`,
            providesTags: (result, error) => [{ type: "MetricType" }],
        }),
        createMetricType: builder.mutation({
            query: (data) => ({
                url: "metric-types/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "MetricType" }],
        }),
        editMetricType: builder.mutation({
            query: (body) => ({
                url: `metric-types/${body.metricTypeId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { metricTypeId }) => [{ type: "MetricType" }],
        }),
        deleteMetricType: builder.mutation({
            query: (metricTypeId) => ({
                url: `metric-types/${metricTypeId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "MetricType" }],
        }),

        //--------------------------Posts ------------------------------//
        getPostList: builder.query({
            query: () => `posts/`,
            providesTags: [{ type: "Post" }],
        }),
        getPostDetailsList: builder.query({
            query: ({ page, pageSize, searchTerm, startDate, endDate, status, platform, category, brandingChannels, creator }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page);
                if (pageSize) params.append("pageSize", pageSize);
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", endDate);
                if (searchTerm) params.append("searchTerm", searchTerm);
                if (status) params.append("status", status);
                if (platform) params.append("platform", platform);
                if (category) params.append("category", category);
                if (brandingChannels) params.append("brandingChannels", brandingChannels);
                if (creator) params.append("creator", creator);
                return `post-details/?${params.toString()}`;
            },
            providesTags: [{ type: "Post" }],
        }),
        getPost: builder.query({
            query: (postId) => `post-details/${postId}/`,
            providesTags: (result, error) => [{ type: "Post" }],
        }),
        createPost: builder.mutation({
            query: (data) => ({
                url: "posts/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Post" }],
        }),
        editPost: builder.mutation({
            query: (body) => ({
                url: `posts/${body.postId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { postId }) => [{ type: "Post" }],
        }),

        updatePost: builder.mutation({
            query: (body) => {
                const { formData, id } = body;
                return {
                    url: `posts/${id}/`,
                    method: "PATCH",
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { id }) => [{ type: "Post", id }, { type: "Post" }],
        }),
        
        
        deletePost: builder.mutation({
            query: ({ postId }) => ({
                url: `posts/${postId}/`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error) => error ? [] : [{ type: "Post" }],
        }),

        //--------------------------Costs ------------------------------//
        getCostList: builder.query({
            query: () => `costs/`,
            providesTags: [{ type: "Cost" }],
        }),
        getCost: builder.query({
            query: (costId) => `costs/${costId}/`,
            providesTags: (result, error) => [{ type: "Cost" }],
        }),
        createCost: builder.mutation({
            query: (data) => ({
                url: "costs/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Cost" }],
        }),
        editCost: builder.mutation({
            query: (body) => ({
                url: `costs/${body.costId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { costId }) => [{ type: "Cost" }],
        }),
        deleteCost: builder.mutation({
            query: (costId) => ({
                url: `costs/${costId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Cost" }],
        }),

        //--------------------------Metrics ------------------------------//
        getMetricList: builder.query({
            query: () => `metrics/`,
            providesTags: [{ type: "Metric" }],
        }),
        getMetric: builder.query({
            query: (metricId) => `metrics/${metricId}/`,
            providesTags: (result, error) => [{ type: "Metric" }],
        }),
        createMetric: builder.mutation({
            query: (data) => ({
                url: "metrics/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Metric" }],
        }),
        editMetric: builder.mutation({
            query: (body) => ({
                url: `metrics/${body.metricId}/`,
                method: "PATCH",
                body: body,
            }),
            invalidatesTags: (result, error, { metricId }) => [{ type: "Metric" }],
        }),
        deleteMetric: builder.mutation({
            query: (metricId) => ({
                url: `metrics/${metricId}/`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Metric" }],
        }),

        //--------------------------Set Up Brand ------------------------------//
        setUpBrand: builder.query({
            query: () => `set-up-brand/`,
        }),

    }),
});

export const {
    // Branding Channels
    useGetBrandingChannelListQuery,
    useGetBrandingChannelQuery,
    useCreateBrandingChannelMutation,
    useEditBrandingChannelMutation,
    useDeleteBrandingChannelMutation,

    // Categories
    useGetCategoryListQuery,
    useGetCategoryQuery,
    useCreateCategoryMutation,
    useEditCategoryMutation,
    useDeleteCategoryMutation,

    // SubCategories
    useGetSubCategoryListQuery,
    useGetSubCategoryQuery,
    useCreateSubCategoryMutation,
    useEditSubCategoryMutation,
    useDeleteSubCategoryMutation,

    // Comments
    useGetCommentsListQuery,
    useGetCommentsQuery,
    useCreateCommentsMutation,
    useEditCommentsMutation,
    useDeleteCommentsMutation,

    // Creators
    useGetCreatorListQuery,
    useGetCreatorQuery,
    useCreateCreatorMutation,
    useEditCreatorMutation,
    useDeleteCreatorMutation,

    // Platforms
    useGetPlatformListQuery,
    useGetPlatformQuery,
    useCreatePlatformMutation,
    useEditPlatformMutation,
    useDeletePlatformMutation,

    // Statuses
    useGetStatusListQuery,
    useGetStatusQuery,
    useCreateStatusMutation,
    useEditStatusMutation,
    useDeleteStatusMutation,

    // Tags
    useGetTagListQuery,
    useGetTagQuery,
    useCreateTagMutation,
    useEditTagMutation,
    useDeleteTagMutation,

    // MetricTypes
    useGetMetricTypeListQuery,
    useGetMetricTypeQuery,
    useCreateMetricTypeMutation,
    useEditMetricTypeMutation,
    useDeleteMetricTypeMutation,

    // Costs
    useGetCostListQuery,
    useGetCostQuery,
    useCreateCostMutation,
    useEditCostMutation,
    useDeleteCostMutation,

    // Metrics
    useGetMetricListQuery,
    useGetMetricQuery,
    useCreateMetricMutation,
    useEditMetricMutation,
    useDeleteMetricMutation,

    // Posts
    useGetPostListQuery,
    useGetPostDetailsListQuery,
    useGetPostQuery,
    useCreatePostMutation,
    useEditPostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,

    // Set Up Brand
    useSetUpBrandQuery,

} = apiBranding;
