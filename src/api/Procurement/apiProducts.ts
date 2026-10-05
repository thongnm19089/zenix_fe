import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiProducts = createApi({
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
  reducerPath: "productApi",
  tagTypes: ["Product", "Brand", "Category", "ClassifyList", "ProductImg"],
  endpoints: (builder) => ({
    getProducts: builder.query<any, { page?: number; pageSize?: number; searchTerm?: string; category: number[] }>({
      query: ({ page = 1, pageSize = 10, searchTerm, category }) => {
        let queryString = `product/?page=${page}&pageSize=${pageSize}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (category) queryString += `&category=${category.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Product" }],
    }),
    getAllProduct: builder.query<any,void>({
      query: () => `product/?pageSize=10000`,
      providesTags: [{ type: "Product"}],
    }),

    createProduct: builder.mutation({
      query: (product) => ({
        url: "product/",
        method: "POST",
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),

    createMultiProduct: builder.mutation({
      query: (product) => ({
        url: "product/create-multiple-products/",
        method: "POST",
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),
    // lấy thông tin của 1 sản phẩm
    getProduct: builder.query({
      query: ({ productId }) => `product/${productId}/`,
      providesTags: (result, error, { productId }) => [{ type: "Product", id: productId }],
    }),
    // cập nhật sản phẩm
    editProduct: builder.mutation({
      query: ({ formData, productId }) => ({
        url: `product/${productId}/`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product", id }, { type: "Product" }]),
    }),
    // xóa sản phẩm
    deleteProduct: builder.mutation({
      query: ({ productId }) => ({
        url: `product/${productId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),
    getBrandList: builder.query<any, void>({
      query: () => `brand/`,
      providesTags: [{ type: "Brand" }],
    }),

    createBrand: builder.mutation({
      query: (data) => ({
        url: "brand/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Brand" }]),
    }),
    getBrand: builder.query({
      query: ({ brandId }) => `brand/${brandId}/`,
      providesTags: (result, error, { brandId }) => [{ type: "Brand", id: brandId }],
    }),
    editBrand: builder.mutation({
      query: (body) => ({
        url: `brand/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Brand", id }, { type: "Brand" }]),
    }),
    deleteBrand: builder.mutation({
      query: ({ brandId }) => ({
        url: `brand/${brandId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Brand" }]),
    }),
    getCategoryList: builder.query<any, void>({
      query: () => `category/`,
      providesTags: [{ type: "Category" }],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "category/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Category" }]),
    }),
    getCategory: builder.query({
      query: ({ categoryId }) => `category/${categoryId}/`,
      providesTags: (result, error, { categoryId }) => [{ type: "Category", id: categoryId }],
    }),
    editCategory: builder.mutation({
      query: (body) => ({
        url: `category/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Category", id }, { type: "Category" }]),
    }),
    deleteCategory: builder.mutation({
      query: ({ categoryId }) => ({
        url: `category/${categoryId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Category" }]),
    }),

    // CRUD Classify List
    getClassifyLists: builder.query<any, void>({
      query: () => `classify-list/`,
      providesTags: [{ type: "ClassifyList" }],
    }),
    createClassifyList: builder.mutation({
      query: (data) => ({
        url: "classify-list/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "ClassifyList" }]),
    }),
    getClassifyList: builder.query({
      query: ({ classifyListId }) => `classify-list/${classifyListId}/`,
      providesTags: (result, error, { classifyListId }) => [{ type: "ClassifyList", id: classifyListId }],
    }),
    editClassifyList: builder.mutation({
      query: (body) => ({
        url: `classify-list/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) =>
        error ? [] : [{ type: "ClassifyList", id }, { type: "ClassifyList" }],
    }),
    deleteClassifyList: builder.mutation({
      query: ({ classifyListId }) => ({
        url: `classify-list/${classifyListId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "ClassifyList" }]),
    }),

    getProductImgs: builder.query<any, void>({
      query: () => `product-image/`,
      providesTags: [{ type: "ProductImg" }],
    }),

    createProductImg: builder.mutation({
      query: (data) => ({
        url: "product-image/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "ProductImg" }]),
    }),
    // lấy thông tin của 1 ảnh sản phẩm
    getProductImg: builder.query({
      query: ({ productId }) => `product-image/${productId}/`,
      providesTags: (result, error, { productId }) => [{ type: "ProductImg", id: productId }],
    }),
    // cập nhật ảnh sản phẩm
    editProductImg: builder.mutation({
      query: (body) => ({
        url: `product-image/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "ProductImg", id }, { type: "ProductImg" }]),
    }),
    // xóa ảnh sản phẩm
    deleteProductImg: builder.mutation({
      query: ({ productId }) => ({
        url: `product-image/${productId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "ProductImg" }]),
    }),
    createSku: builder.mutation({
      query: (data) => ({
        url: "sku/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),
    // cập nhật ảnh sản phẩm
    editSku: builder.mutation({
      query: (body) => ({
        url: `sku/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product", id }, { type: "Product" }]),
    }),
    // xóa ảnh sản phẩm
    deleteSku: builder.mutation({
      query: ({ skuId }) => ({
        url: `sku/${skuId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),
    updateSuppliers: builder.mutation({
      query: (data) => ({
        url: `product/${data.id}/update-suppliers/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Product" }]),
    }),
  }),
});

export const {
  // Product
  useGetProductsQuery,
  useGetAllProductQuery,
  useCreateProductMutation,
  useCreateMultiProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
  useGetProductQuery,
  // Brand
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useEditBrandMutation,
  useGetBrandListQuery,
  useGetBrandQuery,
  // Category
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useGetCategoryListQuery,
  useGetCategoryQuery,
  // ClassifyList
  useCreateClassifyListMutation,
  useDeleteClassifyListMutation,
  useEditClassifyListMutation,
  useGetClassifyListsQuery,
  useGetClassifyListQuery,
  // ProductImg
  useGetProductImgsQuery,
  useCreateProductImgMutation,
  useEditProductImgMutation,
  useDeleteProductImgMutation,
  useGetProductImgQuery,
  //SKu
  useCreateSkuMutation,
  useDeleteSkuMutation,
  useEditSkuMutation,
  //uppliers
  useUpdateSuppliersMutation,
} = apiProducts;
