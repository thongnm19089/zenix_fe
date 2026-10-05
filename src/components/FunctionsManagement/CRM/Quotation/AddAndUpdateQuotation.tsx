"use client";

import AddProduct from "./AddProduct";
import QuotaitonCart from "./QuotationCart";
import { useGetCustomerListQuery } from "@/api/CRM/apiLead";
import { useCreateOrderMutation, useGetOrderQuery, useUpdateCustomOrderMutation } from "@/api/CRM/apiOrder";
import {
  useCreateMultiQuotationMutation,
  useCreateQuotationMutation,
  useEditQuotationMutation,
} from "@/api/CRM/apiQuotation";
import AddressForm from "@/components/FunctionsManagement/CRM/Order/AddressForm";
import CustomerForm from "@/components/FunctionsManagement/CRM/Order/CustomerForm";
import { addToCart, deleteCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { Button, DatePicker, Form, Input, Radio, Spin, notification } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { useParams } from "next/navigation";
import React, { useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface bodyDataQuotation {
  customer_name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  quotation_date: string;
  tax: number;
  discount: number;
  total_price: number;
  lead: number;
}

function AddAndUpdateQuotation() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [productListTable, setProductListTable] = useState([]);

  const [createQuotation, { isLoading: isLoadingAdd }] = useCreateQuotationMutation();
  const [editQuotation, { isLoading: isLoadingUpdate }] = useEditQuotationMutation();
  const [edit, setEdit] = useState(false);

  const t: any = useTranslations();

  const [orderLeadId, setOrderLeadId] = useState<string | null>(null);
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const paramsName = useParams();
  const dispatch = useDispatch();
  const [customerType, setCustomerType] = useState("individual");
  const [searchCus, setSearchCus] = useState<any>();
  const [customerId, setCustomerId] = useState<number>(0);

  const { data: orderDetail, isLoading } = useGetOrderQuery(
    { orderId: paramsName?.slug[1] },
    { skip: paramsName?.slug[1] ? false : true }
  );

  const { data: customerList } = useGetCustomerListQuery({
    customerType: "individual",
    searchTerm: searchCus,
  });

  useLayoutEffect(() => {
    const orderLeadLocalStorage = localStorage.getItem("orderLead");
    if (paramsName?.slug[1]) {
      setEdit(true);

      form.setFieldsValue({
        name: orderDetail?.customer.name,
        mobile: orderDetail?.customer.mobile,
        email: orderDetail?.customer.email,
        city: orderDetail?.customer.city,
        ward: orderDetail?.customer.ward,
        district: orderDetail?.customer.district,
        address: orderDetail?.customer.address,
        quotation_date: dayjs(orderDetail?.quotation_date),
      });

      dispatch(deleteCart());

      orderDetail?.order_details_list
        .map((item: any) => ({ ...item, product: item.product }))
        .forEach((item: any) => {
          dispatch(
            addToCart({
              ...item.product,
              quantity: item.quantity,
              sku: item.product.sku_list.length > 0 ? item.product.sku_list[0] : {},
            })
          );
        });
    }
    // else {
    //   const orderLead = orderLeadLocalStorage ? JSON.parse(orderLeadLocalStorage) : null;
    //   setOrderLeadId(orderLead?.id || null);
    //   form.setFieldsValue({
    //     name: orderLead?.name,
    //     mobile: orderLead?.mobile,
    //     email: orderLead?.email,
    //   });
    // }
    else if (customerId > 0) {
      const customerInfo = customerList?.results?.find((item: { id: number }) => item.id === customerId);
      form.setFieldsValue({
        name: customerInfo?.name,
        email: customerInfo?.email,
        city: customerInfo?.city,
        ward: customerInfo?.ward,
        district: customerInfo?.district,
        address: customerInfo?.address,
        mobile: customerInfo?.mobile ? customerInfo?.mobile : customerInfo?.short_name,
      });
    }
  }, [paramsName, customerId]);

  const onFinish = async (values: any) => {
    const {
      name,
      mobile,
      email,
      address,
      ward,
      district,
      city,
      quotation_date,
      product_list,
      tax,
      discount,
      total_price,
      amount_payable,
    } = values;

    const body = {
      name,
      mobile,
      email,
      city,
      district,
      ward,
      address,
      quotation_date: dayjs(quotation_date).format("YYYY-MM-DD"),
      product_list,
      tax: tax || 0,
      discount: discount || 0,
      total_price,
      amount_payable,
    };

    try {
      const result = await createQuotation(body);
      if (result && "error" in result) {
        notification.error({
          message: `Tạo báo giá thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        router.push("/business/crm/quotation");
        notification.success({
          message: `Tạo báo giá thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto w-[calc(100vw-44px)]  ${
        isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
      }   min-h-[calc(100vh-70px)] p-6`}
    >
      <div className="flex flex-1 flex-col gap-5 pt-5 lg:flex-row">
        <div className="flex w-full flex-col ">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={(changedValues, allValues) => {
              if (changedValues.hasOwnProperty("product_list")) {
                setProductListTable(allValues.product_list);
              }
            }}
          >
            <div className="flex w-full  flex-col gap-4">
              <h2 className="text-lg font-bold">{t("crm.infoCustomer")}</h2>
              <CustomerForm
                customerType={customerType}
                setCustomerType={setCustomerType}
                customerList={customerList}
                searchValue={searchCus}
                setSearchValue={setSearchCus}
                setCustomerId={setCustomerId}
                disable={false}
              />
              <div className="flex w-full flex-col gap-4">
                <Form.Item label="Ngày báo giá" name="quotation_date">
                  <DatePicker className="w-full" defaultValue={dayjs()} />
                </Form.Item>
              </div>
              <h2 className="text-lg font-bold">{t("crm.deliveryAddress")}</h2>
              <AddressForm />
            </div>
            <div className="flex flex-1 flex-col">
              <QuotaitonCart
                form={form}
                edit={edit}
                productListTable={productListTable}
                setProductListTable={setProductListTable}
              />
            </div>
          </Form>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="primary" block onClick={() => form.submit()} loading={isLoadingAdd}>
          In và lưu
        </Button>
        <Button
          type="primary"
          block
          onClick={() => {
            form.submit();
          }}
          loading={isLoadingAdd}
        >
          Lưu
        </Button>
        <Button
          block
          onClick={() => {
            router.push("/business/crm/quotation");
            dispatch(deleteCart());
          }}
          loading={isLoadingUpdate}
        >
          {t("crm.comeBack")}
        </Button>
      </div>
    </div>
  );
}

export default AddAndUpdateQuotation;
