//----------------------Analytics API------------------//
import { apiAccounting as accountingApi } from "@/api/Accounting/apiAccounting";
import { apiAnalytics as analyticsApi } from "@/api/Analytics/apiAnalytics";
//----------------------CRM API------------------//
import { apiContactConfiguration as contactConfigurationApi } from "@/api/CRM/apiContactConfiguration";
import { apiLead as leadApi } from "@/api/CRM/apiLead";
import { apiOrder as orderApi } from "@/api/CRM/apiOrder";
import { apiProducts as productApi } from "@/api/Procurement/apiProducts";
import { apiQuotation as quotationApi } from "@/api/CRM/apiQuotation";
//----------------------Finance API------------------//
import { apiCost as costApi } from "@/api/Finance/apiCost";
import { apiInvoice as invoiceApi } from "@/api/Finance/apiInvoice";
import { apiPayment as paymentApi } from "@/api/Finance/apiPayment";
//----------------------HR API------------------//
import { apiContract as contractApi } from "@/api/HR/apiContract";
import { apiHRApp as hrAppApi } from "@/api/HR/apiHRApp";
//----------------------Inventory API------------------//
import { apiInventory as inventoryApi } from "@/api/Inventory/apiInventory";
//----------------------Procurement API------------------//
import { apiProcurement as procurementApi } from "@/api/Procurement/apiProcurement";
import { apiAccount as accountApi } from "@/api/SetUp/apiAccount";
import { apiBranch as branchApi } from "@/api/SetUp/apiBranch";
import { apiCompany as companyApi } from "@/api/SetUp/apiCompany";
import { apiDivision as divisionApi } from "@/api/SetUp/apiDivision";
import { apiFunction as functionApi } from "@/api/SetUp/apiFunction";
import { apiHRConfiguration as hrConfigurationApi } from "@/api/SetUp/apiHRConfiguration";
import { apiLocation as locationApi } from "@/api/SetUp/apiLocation";
import { apiLogin as loginApi } from "@/api/SetUp/apiLogin";
import { apiNotification as notificationApi } from "@/api/SetUp/apiNotification";
//----------------------Set Up API------------------//
import { apiSetup as setupApi } from "@/api/SetUp/apiSetup";
//----------------------Task API------------------//
import { apiTask as taskApi } from "@/api/Task/apiTask";
import authReducer from "@/features/authSlice";
import cartReducer from "@/features/cartSlice";
import collapseReducer from "@/features/collapseSlice";
import searchParamsReducer from "@/features/searchParamsSlice";
import { configureStore } from "@reduxjs/toolkit";
//----------------------Chat API------------------//
import { apiChat } from "@/api/Chat/apiAppChat";
//----------------------Learning API------------------//
import { apiLearning as learningApi } from "@/api/Learning/apiLearning";
//----------------------Request API------------------//
import { apiCustomerService as customerServiceApi } from "@/api/CustomerService/apiCustomerService";
//----------------------App-Project API------------------//
import { apiProject as projectApi } from "@/api/Project/apiProject";
import { apiPortal as portalApi } from "@/api/Project/apiPortal";
//----------------------App-Branding API------------------//
import { apiBranding as brandingApi } from "@/api/Branding/apiBranding";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    collapse: collapseReducer,
    searchParams: searchParamsReducer,
    [divisionApi.reducerPath]: divisionApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [hrConfigurationApi.reducerPath]: hrConfigurationApi.reducer,
    [locationApi.reducerPath]: locationApi.reducer,
    [branchApi.reducerPath]: branchApi.reducer,
    [functionApi.reducerPath]: functionApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [procurementApi.reducerPath]: procurementApi.reducer,
    [contactConfigurationApi.reducerPath]: contactConfigurationApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [costApi.reducerPath]: costApi.reducer,
    [invoiceApi.reducerPath]: invoiceApi.reducer,
    [contractApi.reducerPath]: contractApi.reducer,
    [leadApi.reducerPath]: leadApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [hrAppApi.reducerPath]: hrAppApi.reducer,
    [setupApi.reducerPath]: setupApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [accountingApi.reducerPath]: accountingApi.reducer,
    [quotationApi.reducerPath]: quotationApi.reducer,
    [apiChat.reducerPath]: apiChat.reducer,
    [learningApi.reducerPath]: learningApi.reducer,
    [customerServiceApi.reducerPath]: customerServiceApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [portalApi.reducerPath]: portalApi.reducer,
    [brandingApi.reducerPath]: brandingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      accountApi.middleware,
      loginApi.middleware,
      divisionApi.middleware,
      hrConfigurationApi.middleware,
      locationApi.middleware,
      branchApi.middleware,
      functionApi.middleware,
      companyApi.middleware,
      productApi.middleware,
      inventoryApi.middleware,
      procurementApi.middleware,
      contactConfigurationApi.middleware,
      paymentApi.middleware,
      costApi.middleware,
      invoiceApi.middleware,
      contractApi.middleware,
      leadApi.middleware,
      taskApi.middleware,
      hrAppApi.middleware,
      setupApi.middleware,
      orderApi.middleware,
      analyticsApi.middleware,
      notificationApi.middleware,
      accountingApi.middleware,
      quotationApi.middleware,
      apiChat.middleware,
      learningApi.middleware,
      customerServiceApi.middleware,
      projectApi.middleware,
      portalApi.middleware,
      brandingApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
