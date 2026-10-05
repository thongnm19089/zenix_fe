"use client";

import { useGetCustomerListQuery } from "@/api/CRM/apiLead";
import {
  useCreateMultiOrderMutation,
  useCreateOrderMutation,
  useGetOrderQuery,
  useUpdateCustomOrderMutation,
} from "@/api/CRM/apiOrder";
import AddressForm from "@/components/FunctionsManagement/CRM/Order/AddressForm";
import CustomerForm from "@/components/FunctionsManagement/CRM/Order/CustomerForm";
import OrderCart from "@/components/FunctionsManagement/CRM/Order/OrderCart";
import ProductList from "@/components/FunctionsManagement/CRM/Order/ProductList";
import { addToCart, deleteCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { User } from "@/types/userTypes";
import { Button, DatePicker, Form, Input, Spin, Tabs, notification } from "antd";
import { TabsProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface bodyDataOrder {
  customer: number;
  order_date: string;
  ref_code: string;
  total_price: number;
  tax_amount: number;
  discount_amount: number;
  amount_payable: number;
  due_date: string;
  note: string;
}

function AddAndUpdateOrderTabContainer() {
  const [createMultiOrder, { isLoading: isLoadingAddMulti }] =
    useCreateMultiOrderMutation();

  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });

  const [orderExcel, setOrderExcel] = useState<bodyDataOrder[]>([]);

  const paramsName = useParams();

  const [disableButton, setDisableButton] = useState(true);

  const router = useRouter();

  const t: any = useTranslations();

  const dataType = {
    customer: 0,
    order_date: "",
    ref_code: "",
    total_price: 0,
    tax_amount: 0,
    discount_amount: 0,
    amount_payable: 0,
    due_date: "",
    note: "",
  };

  const createDataByExcel = async (data: bodyDataOrder[]) => {
    try {
      const result = await createMultiOrder(data);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.addingANewOrderFailed")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setModalDialog({
          ...modalDialog,
          open: true,
          success: result?.data?.orders_created,
          error: result?.data?.errors,
        });
        router.push("/business/crm/order-management");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Nhập thông tin",
      children: <AddAndUpdateOrder />,
    },
    // {
    //   key: "2",
    //   label: "Tải lên bằng excel",
    //   children: (
    //     <>
    //       <UploadExcel
    //         dataType={dataType}
    //         dataExcel={orderExcel}
    //         setDataExcel={setOrderExcel}
    //         fileName="Mẫu-thông-tin-đơn-hàng.xlsx" 
    //         fileBase64={ORDER_EXCEL_FILE}
    //         setDisableButton={setDisableButton}
    //       />
    //       <div className="flex justify-center">
    //         <div className="flex w-500 justify-between gap-3">
    //           <Button
    //             type="primary"
    //             block
    //             onClick={() => createDataByExcel(orderExcel)}
    //             loading={isLoadingAddMulti}
    //             disabled={disableButton}
    //           >
    //             {t("crm.makeAnApplication")}
    //           </Button>
    //           <Button
    //             block
    //             onClick={() => {
    //               router.push("/business/crm/order-management");
    //             }}
    //           >
    //             {t("crm.comeBack")}
    //           </Button>
    //         </div>
    //       </div>
    //     </>
    //   ),
    // },
  ];

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <>
      {/* {paramsName.slug[1] ? ( */}
      <AddAndUpdateOrder />
      {/* ) : (
        <>
          <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
          <ModalDialog
            open={modalDialog.open}
            setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
            success={modalDialog.success}
            error={modalDialog.error}
            object_str="Các đơn hàng"
          />
        </>
      )} */}
    </>
  );
}

function AddAndUpdateOrder() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [createOrder, { isLoading: isLoadingAdd }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isLoadingUpdate }] =
    useUpdateCustomOrderMutation();
  const [edit, setEdit] = useState(false);
  const [customerType, setCustomerType] = useState("individual");

  const [searchCus, setSearchCus] = useState<any>();

  const [customerId, setCustomerId] = useState<number>(0);

  const [disabled, setDisabled] = useState<any>();

  const [customerData, setCustomerData] = useState<any>({
    individual: null,
    business: null,
  });

  const { data: customerList } = useGetCustomerListQuery({
    customerType: customerType,
    searchTerm: searchCus,
  });

  const t: any = useTranslations();

  const [orderLeadId, setOrderLeadId] = useState<string | null>(null);
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const paramsName = useParams();
  const dispatch = useDispatch();

  const { data: orderDetail, isLoading } = useGetOrderQuery(
    { orderId: paramsName?.slug[1] },
    { skip: paramsName?.slug[1] ? false : true }
  );
  useEffect(() => {
    const orderLeadLocalStorage = localStorage.getItem("orderLead");
    if (paramsName?.slug[1]) {
      setEdit(true);
      setDisabled(false);
      form.setFieldsValue({
        name: orderDetail?.customer_info.name,
        email: orderDetail?.customer_info.email,
        city: orderDetail?.customer_info.city,
        ward: orderDetail?.customer_info.ward,
        district: orderDetail?.customer_info.district,
        address: orderDetail?.customer_info.address,
        order_date: dayjs(orderDetail?.order_date),
        mobile: orderDetail?.customer_info.mobile
          ? orderDetail?.customer_info.mobile
          : orderDetail?.customer_info.short_name,
        contact_person: orderDetail?.customer_info.contact_person,
        note: orderDetail?.customer_info.note,
      });
      setCustomerType(orderDetail?.customer_info?.customer_type);
      dispatch(deleteCart());

      orderDetail?.order_details_list
        .map((item: any) => ({ ...item, product: item.product }))
        .forEach((item: any) => {
          dispatch(
            addToCart({
              ...item.product,
              quantity: item.quantity,
              sku:
                item.product.sku_list.length > 0
                  ? item.product.sku_list[0]
                  : {},
            })
          );
        });
    } else if (customerId > 0) {
      const customerInfo = customerList?.results?.find(
        (item: { id: number }) => item.id === customerId
      );
      setCustomerData({ ...customerData, [customerType]: customerInfo });
    } else if (orderLeadLocalStorage) {
      const orderLead = orderLeadLocalStorage
        ? JSON.parse(orderLeadLocalStorage)
        : null;
      setOrderLeadId(orderLead?.id || null);
      setSearchCus(orderLead?.name);
      setDisabled(true)
      form.setFieldsValue({
        name: orderLead?.name,
        mobile: orderLead?.mobile,
        email: orderLead?.email,
        city: orderLead?.city,
        ward: orderLead?.ward,
        district: orderLead?.district,
        address: orderLead?.address,
        order_date: dayjs(orderLead?.order_date),
      });
      if (!orderLead?.id) {
        setCustomerType(orderLead?.customer_type);
      } else {
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
          const parsedUserData: User | null = JSON.parse(userDataString);
          const customer_type = parsedUserData?.user_profile?.company?.customer_type || "individual";
          setCustomerType(customer_type);
        }
      }
    } else {

      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const parsedUserData: User | null = JSON.parse(userDataString);
        const customer_type = parsedUserData?.user_profile?.company?.customer_type || "individual";
        setCustomerType(customer_type);
      }

      // const user_info = localStorage.getItem("user");
      // const user_info_json = user_info ? JSON.parse(user_info) : null;
      // const customer_type =
      //   user_info_json?.user_profile?.company?.customer_type;
      // setCustomerType(customer_type);

      setDisabled(false)
      setCustomerData({ ...customerData, [customerType]: {} });
      form.resetFields();
    }
  }, [orderDetail, customerId]);

  useEffect(() => {
    const data = customerData[customerType];
    const orderLeadLocalStorage = localStorage.getItem("orderLead");
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        email: data?.email,
        city: data?.city,
        ward: data?.ward,
        district: data?.district,
        address: data?.address,
        mobile: data?.mobile ? data?.mobile : data?.short_name,
        contact_person: data?.contact_person,
        note: data?.note,
      });
      setSearchCus(data?.name);
    }
  }, [customerType, customerData]);

  const onFinish = async (values: any) => {
    const {
      name,
      mobile,
      MST,
      contact_person,
      short_name,
      email,
      address,
      ward,
      district,
      city,
      order_date,
      order_list,
      tax,
      discount,
      fee_list,
      total_price,
      paid,
      note,
      amount_payable,
    } = values;

    const body = {
      id: paramsName?.slug[1] || null,
      customer_type: customerType,
      order_lead: orderLeadId,
      name,
      mobile: mobile || short_name,
      MST,
      contact_person,
      short_name,
      email,
      city,
      district,
      ward,
      address,
      order_date: dayjs(order_date).format("YYYY-MM-DD"),
      order_list,
      tax,
      discount,
      total_price,
      paid: paid || 0,
      note,
      fee_list,
      amount_payable: amount_payable ? amount_payable : 0,
    };
    try {
      if (total_price === 0) {
        notification.error({
          message: `${"Không có sản phẩm nào trong giỏ"}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        if (paramsName?.slug[1]) {
          const result = await updateOrder(body);
          if (result && "error" in result) {
            notification.error({
              message: `${t("noficationAddAndUpdate.fixNewFailedOrder")}`,
              placement: "bottomRight",
              className: "h-16",
            });
          } else {
            form.resetFields();
            router.push("/business/crm/order-management");
            localStorage.removeItem("orderLead");
            dispatch(deleteCart());
            notification.success({
              message: `${t("noficationAddAndUpdate.orderEditedSuccessfully")}`,
              placement: "bottomRight",
              className: "h-16",
            });
          }
        } else {
          const result = await createOrder(body);
          if (result && "error" in result) {
            notification.error({
              message: `${t("noficationAddAndUpdate.addingANewOrderFailed")}`,
              placement: "bottomRight",
              className: "h-16",
            });
          } else {
            form.resetFields();
            router.push("/business/crm/order-management");
            localStorage.removeItem("orderLead");
            dispatch(deleteCart());
            notification.success({
              message: `${t("noficationAddAndUpdate.orderAddedSuccessfully")}`,
              placement: "bottomRight",
              className: "h-16",
            });
          }
        }
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

  // console.log("customerType", customerType);

  return (
    <div
      className={`overflow-x-auto w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-70px)] p-6`}
    >
      <div className="flex flex-1 flex-col gap-5 pt-5 lg:flex-row">
        <div className="flex w-full flex-col md:w-1/2">
          <h2 className="text-lg font-bold">
            {t("noficationAddAndUpdate.listOfProducts")}
          </h2>
          <ProductList />
        </div>

        <div className="flex w-full flex-col md:w-1/2">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="flex w-full  flex-col gap-4">
              <h2 className="text-lg font-bold">{t("crm.infoCustomer")}</h2>
              <CustomerForm
                edit={edit}
                isBusiness={true}
                customerType={customerType}
                setCustomerId={setCustomerId}
                searchValue={searchCus}
                customerList={customerList}
                setSearchValue={setSearchCus}
                setCustomerType={setCustomerType}
                disable={disabled}
                leadId={orderLeadId}
              />
              <div className="flex w-full flex-col gap-4">
                <Form.Item label={t("table.orderDate")} name="order_date">
                  <DatePicker className="w-full" defaultValue={dayjs()} />
                </Form.Item>
              </div>
              <h2 className="text-lg font-bold">{t("crm.deliveryAddress")}</h2>
              <AddressForm />
            </div>
            <div className="flex w-full flex-col gap-4">
              <Form.Item name="note" label={t("general.note")}>
                <Input.TextArea />
              </Form.Item>
            </div>
            <div className="flex w-full flex-1 flex-col">
              <h2 className="text-center text-lg font-bold ">
                {t("crm.cart")}
              </h2>
              <OrderCart form={form} orderDetail={orderDetail} edit={edit} />
            </div>
          </Form>
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <Button
          type="primary"
          block
          onClick={() => form.submit()}
          loading={isLoadingAdd}
        >
          {t("crm.makeAnApplication")}
        </Button>
        <Button
          block
          onClick={() => {
            router.back();
            dispatch(deleteCart());
            localStorage.removeItem("orderLead");
          }}
          loading={isLoadingUpdate}
        >
          {t("crm.comeBack")}
        </Button>
      </div>
    </div>
  );
}

export default AddAndUpdateOrderTabContainer;
