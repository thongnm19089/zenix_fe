"use client";

import PurchaseOrderCart from "./PurchaseOrderCart";
import { useGetAllOrderListQuery } from "@/api/CRM/apiOrder";
import {
  useCreateMultiPurchaseOrderMutation,
  useCreatePurchaseOrderMutation,
  useGetPurchaseOrderQuery,
  useGetSupplierListQuery,
} from "@/api/Procurement/apiProcurement";
import { useGetSetupProcurementAppQuery } from "@/api/SetUp/apiSetup";
import ProductList from "@/components/FunctionsManagement/CRM/Order/ProductList";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import SearchCustomer from "@/components/Search/SearchCustomer";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { PURCHASE_ORDER_EXCEL_FILE } from "@/constants/excelFile/purchaseOrderExcelFile";
import { addToCart, deleteCart, updateCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { Button, Col, DatePicker, Form, Input, Radio, Row, Select, notification } from "antd";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { useParams } from "next/navigation";
import React, { useLayoutEffect, useState, useMemo } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";

const { Option } = Select;

interface bodyDataPO {
  supplier: number;
  sale_order: number;
  purchase_order_date: string;
  ref_code: string;
  expected_delivery_date: string;
  shipment_status: number;
  discount_purchase_order: number[];
  total_price: number;
  tax_amount: number;
  discount_amount: number;
  amount_payable: number;
  due_date: string;
  note: string;
}

function AddAndUpdatePurchaseOrder() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<any>();
  const { data: setupProcurement } = useGetSetupProcurementAppQuery();
  const [createPurchaseOrder, { isLoading: isLoadingAdd }] = useCreatePurchaseOrderMutation();
  const [createMultiPurchaseOrder, { isLoading: isLoadingAddMulti }] = useCreateMultiPurchaseOrderMutation();
  const { data: supplierList } = useGetSupplierListQuery({
    page: 1,
    pageSize: 100,
    searchTerm: searchValue,
  });
  const [edit, setEdit] = useState(false);
  const [supplierId, setSupplierId] = useState<number>(0);
  const t: any = useTranslations();
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | null>(null);
  const [purchaseOrderExcel, setPurchaseOrderExcel] = useState<bodyDataPO[]>([]);
  const [selectCheckbox, setSelectCheckbox] = useState<string>("Nhập thông tin");
  const [paid, setPaid] = useState<number>(0);
  const paramsName = useParams();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const dispatch = useDispatch();
  const { data: orderList } = useGetAllOrderListQuery({
    page: 1,
    pageSize: 100,
  });
  const { data: orderDetail, isLoading } = useGetPurchaseOrderQuery(
    { purchaseOrderId: paramsName?.slug[1] },
    { skip: paramsName?.slug[1] ? false : true }
  );

  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [fileData, setFileData] = useState<{ name: string }>();

  useLayoutEffect(() => {
    const orderLeadLocalStorage = localStorage.getItem("orderLead");
    if (paramsName?.slug[1]) {
      setEdit(true);

      form.setFieldsValue({
        fee_list: orderDetail?.fee_list,
        supplier: orderDetail?.supplier,
        purchase_order_date: dayjs(orderDetail?.purchase_order_date),
        expected_delivery_date: dayjs(orderDetail?.expected_delivery_date),
        sale_order: orderDetail?.sale_order,
        shipment_status: orderDetail?.shipment_status,
        note: orderDetail?.note,
        amount_payable: orderDetail?.amount_payable,
        total_paid: orderDetail?.total_paid,
      });

      dispatch(deleteCart());

      orderDetail?.purchase_order_item_list
        .map((item: any) => ({ ...item, product: item.product }))
        .forEach((item: any) => {
          dispatch(
            addToCart({
              ...item.product_info,
              quantity: item.quantity,
              sku: { id: item.sku },
            })
          );
          dispatch(
            updateCart({
              id: item.product_info.id,
              skuId: item.sku,
              price: item.price,
              purchase_discount: item.discount,
              tax_list: item.tax_list,
            })
          );
        });
    } else {
      const orderLead = orderLeadLocalStorage ? JSON.parse(orderLeadLocalStorage) : null;
      setPurchaseOrderId(orderLead?.id || null);
      form.setFieldsValue({
        name: orderLead?.name,
        mobile: orderLead?.mobile,
        email: orderLead?.email,
      });
    }
  }, [paramsName]);

  const orderListData = useMemo(() => {
    return orderList?.results.map(
      (item: {
        id: number;
        ref_code: string;
        user_str: { first_name: string; last_name: String };
        customer: { name: string; mobile: string };
      }) => ({
        label:
          item.ref_code +
          " | " +
          item.user_str.first_name +
          " " +
          item.user_str.last_name +
          " | " +
          item.customer.name +
          "-" +
          item.customer.mobile,
        value: item.id,
      })
    );
  }, [orderList?.results]);

  const onFinish = async (values: any) => {
    const {
      supplier,
      shipment_status,
      note,
      purchase_order_item_list,
      fee_list,
      tax_amount,
      total_price,
      total_paid,
      discount_amount,
      expected_delivery_date,
      purchase_order_date,
      sale_order,
      amount_payable,
    } = values;

    const body = {
      sale_order,
      supplier: supplierId,
      shipment_status,
      purchase_order_date: dayjs(purchase_order_date).format("YYYY-MM-DD"),
      expected_delivery_date: dayjs(expected_delivery_date).format("YYYY-MM-DD"),
      note: note || "",
      purchase_order_item_list,
      fee_list,
      tax_amount,
      total_price,
      total_paid,
      discount_amount,
      amount_payable,
    };
    try {
      const result = await createPurchaseOrder(body);
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.addingANewOrderFailed")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        router.push("/business/procurement/purchase-order");
        dispatch(deleteCart());
        notification.success({
          message: `${t("noficationAddAndUpdate.orderAddedSuccessfully")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const handleChangeFile = () => {
  //   const inputFile = document.getElementById("file");
  //   inputFile?.click();
  // };

  // const handleFileUpload = (e: any) => {
  //   const file = e.target.files[0];
  //   setFileData(file);
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsBinaryString(file);
  //     reader.onload = (e) => {
  //       const data = e.target?.result;
  //       const workbook = XLSX.read(data, { type: "binary" });
  //       const sheetName = workbook.SheetNames[0];
  //       const sheet = workbook.Sheets[sheetName];
  //       const parseData = XLSX.utils.sheet_to_json(sheet);
  //       parseData?.forEach((item: any) => {
  //         const newPO = {
  //           supplier: item?.supplier ? item?.supplier : 1,
  //           sale_order: item?.sale_order,
  //           purchase_order_date: item?.purchase_order_date,
  //           ref_code: item?.ref_code,
  //           expected_delivery_date: item?.expected_delivery_date,
  //           shipment_status: item?.shipment_status,
  //           discount_purchase_order: [],
  //           total_price: item?.total_price,
  //           tax_amount: item?.tax_amount,
  //           discount_amount: item?.discount_amount,
  //           amount_payable: item?.amount_payable,
  //           due_date: item?.due_date,
  //           note: item?.note,
  //         };
  //         setPurchaseOrderExcel((purchaseOrderExcel) => [
  //           ...purchaseOrderExcel,
  //           newPO,
  //         ]);
  //       });
  //     };
  //   }
  // };

  // const createDataByExcel = async (data: bodyDataPO[], checkBox: string) => {
  //   if (data && checkBox === "Tải lên file excel") {
  //     try {
  //       const result = await createMultiPurchaseOrder(data);
  //       if (result && "error" in result) {
  //         notification.error({
  //           message: `${t("noficationAddAndUpdate.addingANewOrderFailed")}`,
  //           placement: "bottomRight",
  //           className: "h-16",
  //         });
  //       } else {
  //         console.log(result);
  //         router.push("/business/procurement/purchase-order");
  //         setModalDialog({
  //           ...modalDialog,
  //           open: true,
  //           success: result?.data?.purchase_orders_created,
  //           error: result?.data?.errors,
  //         });
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  return (
    <div
      className={`overflow-x-auto w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-70px)] p-6`}
    >
      {/* <Radio.Group
        value={selectCheckbox}
        onChange={(e) => setSelectCheckbox(e.target.value)}
        style={{ width: "100%" }}
      >
        <Radio className="mb-2" value={"Nhập thông tin"}>
          Nhập thông tin
        </Radio> */}
      <div className="flex flex-col gap-5 pt-5 ">
        <Form disabled={selectCheckbox === "Tải lên file excel"} form={form} layout="vertical" onFinish={onFinish}>
          <div className="flex gap-5">
            <div className="flex w-full flex-col md:w-1/2 ">
              <h2 className="text-lg font-bold">{t("noficationAddAndUpdate.listOfProducts")}</h2>
              <ProductList isPurchase={true} />
            </div>
            <div className="flex w-full flex-col md:w-1/2">
              <h2 className="text-lg font-bold">{t("card.orderInformation")}</h2>
              <Form.Item name="supplier" label={t("nav.supplier")} required>
                {/* <Select placeholder={t("nav.supplierList")} allowClear>
                    {setupProcurement?.supplier_list.map(
                      (item: { id: number; name: string }) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      )
                    )}
                  </Select> */}
                <SearchCustomer
                  customerList={supplierList}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  placeholder={"Nhập tên nhà cung cấp"}
                  setCustomerId={setSupplierId}
                  disable={false}
                />
              </Form.Item>
              <Form.Item name="shipment_status" label="Trạng thái đơn hàng" required>
                <Select placeholder="Danh sách trạng thái" allowClear>
                  {setupProcurement?.shipment_status_list.map((item: { id: number; status_name: string }) => (
                    <Option key={item.id} value={item.id}>
                      {item.status_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label={t("table.orderDate")} name="purchase_order_date">
                <DatePicker className="w-full" defaultValue={dayjs()} />
              </Form.Item>
              <Form.Item label={t("table.expectedDateOfDelivery")} name="expected_delivery_date">
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item label={t("table.orderInAdvance")} name="sale_order">
                <Select
                  className="w-full"
                  showSearch
                  placeholder={t("nav.listOfOrders")}
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.label ? String(option.label).includes(input) : false)}
                  filterSort={(optionA, optionB) =>
                    String(optionA?.label).toLowerCase().localeCompare(String(optionB?.label).toLowerCase())
                  }
                  options={orderListData || []}
                />
              </Form.Item>
              <div className="flex w-full  flex-col gap-4">
                <Form.Item name="note" label={t("general.note")}>
                  <Input.TextArea />
                </Form.Item>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-1 flex-col">
            <h2 className="text-center text-lg font-bold ">{t("crm.cart")}</h2>
            <PurchaseOrderCart form={form} />
          </div>
        </Form>
      </div>
      {/* {!paramsName.slug[1] && (
          <>
            <Radio className="mb-2 mt-2" value={"Tải lên file excel"}>
              Tải lên file excel
              <span
                className="cursor-pointer underline italic text-primary"
                onClick={() =>
                  dowloadFileExcel(
                    PURCHASE_ORDER_EXCEL_FILE,
                    "Mẫu-thông-tin-đơn-mua-hàng.xlsx"
                  )
                }
              >
                {" "}
                (Click vào đây để tải file mẫu và hướng dẫn)
              </span>
            </Radio>
            <div className="flex justify-center items-center w-100%">
              <Input
                id="file"
                hidden
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                onClick={(e: any) => (e.target.value = "")}
                disabled={selectCheckbox === "Nhập thông tin"}
              />
              <SiMicrosoftexcel
                onClick={handleChangeFile}
                fill="green"
                size={60}
                cursor={"pointer"}
              />
            </div>
          </>
        )} */}
      {/* </Radio.Group> */}
      {/* {!paramsName.slug[1] && (
        <div className="flex w-100% justify-center mb-2">
          {!fileData ? (
            <div>Không có file nào được tải lên</div>
          ) : (
            <div className="flex justify-center items-center">
              <div>{fileData.name}</div>
              <IoIosCloseCircleOutline
                className="cursor-pointer ml-1"
                onClick={() => setFileData(undefined)}
                size={20}
              />
            </div>
          )}
        </div>
      )} */}
      <div className="flex gap-3">
        <Button
          type="primary"
          block
          onClick={
            () => form.submit()
            // if (selectCheckbox === "Nhập thông tin") {
            //   form.submit();
            // } else {
            //   createDataByExcel(purchaseOrderExcel, selectCheckbox);
            // }
          }
          loading={isLoadingAdd || isLoadingAddMulti}
        >
          {t("crm.makeAnApplication")}
        </Button>
        <Button
          block
          onClick={() => {
            router.push("/business/procurement/purchase-order");
            dispatch(deleteCart());
          }}
          loading={isLoadingAdd}
        >
          {t("crm.comeBack")}
        </Button>
      </div>
      {/* <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Các đơn bán"
      /> */}
    </div >
  );
}

export default AddAndUpdatePurchaseOrder;
