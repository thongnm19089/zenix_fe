import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiInventory = createApi({
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
  reducerPath: "inventoryApi",
  tagTypes: ["Warehouse", "Inventory"],
  endpoints: (builder) => ({
    getWarehouseList: builder.query<any, void>({
      query: () => `warehouse/`,
      providesTags: [{ type: "Warehouse" }],
    }),

    createWarehouse: builder.mutation({
      query: (data) => ({
        url: "warehouse/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Warehouse" }]),
    }),

    getWarehouse: builder.query({
      query: ({ warehouseId }) => `warehouse/${warehouseId}/`,
      providesTags: (result, error, { warehouseId }) => [{ type: "Warehouse", id: warehouseId }],
    }),

    editWarehouse: builder.mutation({
      query: (body) => ({
        url: `warehouse/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Warehouse", id }, { type: "Warehouse" }]),
    }),
    deleteWarehouse: builder.mutation({
      query: ({ warehouseId }) => ({
        url: `warehouse/${warehouseId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Warehouse" }]),
    }),
    getInventoryByProduct: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        searchTerm?: string;
        brand?: number[];
        category?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        searchTerm,
        brand,
        category }) => {
        let queryString = `inventory-by-product/?page=${page}&pageSize=${pageSize}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (brand) queryString += `&brand=${brand.toString()}`;
        if (category) queryString += `&category=${category.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Inventory" }],
    }),

    getAllInventoryByProduct: builder.query<any,void>({
      query: () => `inventory-by-product/?pageSize=10000`,
      providesTags: [{type: "Inventory"}],
    }),
    
    getInventoryByWarehouse: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        isBelowAlert?: number;
        searchTerm?: string;
        skip?: boolean
        brand?: number[];
        category?: number[];
        product?: number[];
        sku?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        searchTerm,
        isBelowAlert,
        brand,
        category,
        product,
        sku
      }) => {
        let queryString = `inventory-by-warehouse/?page=${page}&pageSize=${pageSize}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (isBelowAlert) queryString += `&is_below_alert=${isBelowAlert}`;
        if (brand) queryString += `&brand=${brand.toString()}`;
        if (category) queryString += `&category=${category.toString()}`;
        if (product) queryString += `&product=${product.toString()}`;
        if (sku) queryString += `&sku=${sku.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Inventory" }],
    }),
    getInventoryList: builder.query<any, void>({
      query: () => `inventory/`,
      providesTags: [{ type: "Inventory" }],
    }),
    createInventory: builder.mutation({
      query: (data) => ({
        url: "inventory/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Inventory" }, { type: "Inventory" }],
    }),
    editInventory: builder.mutation({
      query: (data) => ({
        url: `inventory/${data.id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "Inventory" }, { type: "Warehouse" }],
    }),
    getStockEntriesList: builder.query<
      any,
      { page?: number; pageSize?: number; startDate?: string; endDate?: string; searchTerm?: string,warehouse?:number[] }
    >({
      query: ({ page = 1, pageSize = 10, startDate, endDate, searchTerm,warehouse }) => {
        let queryString = `stock-entries/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (warehouse) queryString += `&warehouse=${warehouse.toString()}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        return queryString;
      },
      providesTags: [{ type: "Inventory" }],
    }),

    getAllStockEntriesList: builder.query<any, void>({
      query: () => `stock-entries/?pageSize=10000`,
      providesTags: [{ type: "Inventory"}],
    }),


    createStockEntries: builder.mutation({
      query: (data) => ({
        url: "stock-entries/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Inventory" }, { type: "Inventory" }],
    }),

    getStockOutList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        user?: number[];
        source?: number[];
        status?: number[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        user,
        source,
        status,

      }) => {
        let queryString = `stock-out/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (user) queryString += `&user=${user.toString()}`;
        if (source) queryString += `&source=${source.toString()}`;
        if (status) queryString += `&status=${status.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Inventory" }],
    }),
    getAllStockOutList: builder.query<any,void>({
      query: () => `stock-out/?pageSize=10000`,
      providesTags: [{ type: "Inventory"}],
    }),
    deleteStockOut: builder.mutation({
      query: ({ stockOutId }) => ({
        url: `stock-out/${stockOutId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Inventory" }]),
    }),
    getInventoryTransactionList: builder.query<
      any,
      {
        page?: number;
        pageSize?: number;
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
        warehouse?: number[];
        transaction_type?: string[];
      }
    >({
      query: ({
        page = 1,
        pageSize = 10,
        startDate,
        endDate,
        searchTerm,
        warehouse,
        transaction_type,
      }) => {
        let queryString = `inventory-transactions/?page=${page}&pageSize=${pageSize}`;
        if (startDate) queryString += `&startDate=${startDate}`;
        if (endDate) queryString += `&endDate=${endDate}`;
        if (searchTerm) queryString += `&searchTerm=${encodeURIComponent(searchTerm)}`;
        if (warehouse) queryString += `&warehouse=${warehouse.toString()}`;
        if (transaction_type) queryString += `&transactionType=${transaction_type.toString()}`;
        return queryString;
      },
      providesTags: [{ type: "Inventory" }],
    }),

    getAllInventoryTransactionList: builder.query<any,void>({
      query: () => `inventory-transactions/?pageSize=10000`,
      providesTags: [{ type: "Inventory"}],
    }),

    createStockOut: builder.mutation({
      query: (data) => ({
        url: "inventory-transactions/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Inventory" }, { type: "Inventory" }],
    }),
    editInventoryTransaction: builder.mutation({
      query: (body) => ({
        url: `inventory-transactions/${body.id}/`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => (error ? [] : [{ type: "Inventory", id }, { type: "Inventory" }]),
    }),
    deleteInventoryTransaction: builder.mutation({
      query: (id) => ({
        url: `inventory-transactions/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Inventory" }],
    }),
  }),
});

export const {
  //Warehouse
  useCreateWarehouseMutation,
  useDeleteWarehouseMutation,
  useEditWarehouseMutation,
  useGetWarehouseListQuery,
  useGetWarehouseQuery,
  //Inventory By Product
  useGetInventoryByProductQuery,
  useGetAllInventoryByProductQuery,
  //Inventory By Warehouse
  useGetInventoryByWarehouseQuery,
  // Nhập kho
  useCreateInventoryMutation,
  useGetInventoryListQuery,
  useEditInventoryMutation,
  //
  useCreateStockEntriesMutation,
  useGetStockEntriesListQuery,
  useGetAllStockEntriesListQuery,
  // Stock Out
  useGetStockOutListQuery,
  useGetAllStockOutListQuery,
  useDeleteStockOutMutation,
  // Inventory Transaction
  useGetInventoryTransactionListQuery,
  useGetAllInventoryTransactionListQuery,
  useCreateStockOutMutation,
  useEditInventoryTransactionMutation,
  useDeleteInventoryTransactionMutation,
} = apiInventory;