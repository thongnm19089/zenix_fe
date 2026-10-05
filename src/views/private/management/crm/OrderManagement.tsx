"use client";

import { useDeleteOrderMutation, useGetExportOrderListQuery, useGetOrderListQuery } from "@/api/CRM/apiOrder";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import Print from "@/components/FunctionsManagement/CRM/Order/Print";
import UpdateOrderDate from "@/components/FunctionsManagement/CRM/UpdateOrderDate";
import UpdateOrderStatus from "@/components/FunctionsManagement/CRM/UpdateOrderStatus";
import { deleteCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Dropdown, Form, Input, Popconfirm, Space, Table, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import OrderModal from "@/components/FunctionsManagement/CRM/Order/OrderModal";
import ModalDelEdit from "@/components/ModalDialog/Modal";
import { useDeleteMultiLeadMarketerMutation, useEditMultiLeadMarketerMutation } from "@/api/CRM/apiLead";
import { MenuProps } from "antd/lib";
import { RiDeleteBin2Line } from "react-icons/ri";
import { FcCancel } from "react-icons/fc";
import { FaFileExport, FaRegEdit } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import SelectColumn from "@/components/Filter/SelectColumn";
import ActionTable from "@/components/DropDown/ActionTable";
import { IoRefresh } from "react-icons/io5";
import { useWindowSize } from "@/utils/responsiveSm";
import useExport from "@/utils/useExport";
import { BsFiletypeXls, BsFiletypeCsv, BsFiletypePdf } from 'react-icons/bs';

interface DataType {
  status_info: any;
  key: React.Key;
  id: number;
  lead: number;
  created: string;
  order_date: string;
  ref_code: string;
  source_str: string;
  order_details_list: any;
  user_str: any;
  customer_info: any;
  total_paid: any;
  amount_payable: any;
  status: string;
}

const { Search } = Input;

const initialStateFilter = {
  user: [],
  source: [],
  status: []
}

export default function OrderManagement() {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderList, setSelectedOrderList] = useState([]);
  const dispatch = useDispatch();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeysForExport, setSelectedRowKeysForExport] = useState<React.Key[]>([])
  const [menuName, setMenuName] = useState<string>("Hành động");


  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    if (menuName === t("noficationAddAndUpdate.aLotSelect")) {
      setSelectedRowKeysForExport(newSelectedRowKeys); // Cập nhật khi dùng cho Export
    } else {
      setSelectedRowKeys(newSelectedRowKeys); // Cập nhật khi dùng cho các trường hợp khác
    }
  };

  const rowSelection = {
    selectedRowKeys: menuName === t("noficationAddAndUpdate.aLotSelect")
      ? selectedRowKeysForExport
      : selectedRowKeys,
    onChange: onSelectChange,
  };

  const params = useParams();
  const [locale, setLocale] = useState(params && params.locale === "vi" ? "vi-VN" : "en-US");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    user: number[];
    source: number[];
    status: number[];
  }>(initialStateFilter);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ order_management: [] });
  const {
    data: orderList,
    isLoading,
    refetch,
    isError,
    error,
  } = useGetOrderListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    user: filterObject.user,
    source: filterObject.source,
    status: filterObject.status,
  });

  const [deleteMultiMarketer, { isLoading: loadingMulti }] =
    useDeleteMultiLeadMarketerMutation();

  const [editMultiMarketer, { isLoading: loadingEditMulti }] =
    useEditMultiLeadMarketerMutation();

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const orderManagementData = parsedColumn.order_management;
      const orderManagementObject = { order_management: orderManagementData };
      setColumnConfig(orderManagementObject);
    }
  }, []);

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  // Xử lý khi thay đổi trang hoặc kích thước trang
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  // Xử lý thay đổi dữ liệu tìm kiếm và ngày
  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    orderList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteOrder, { isLoading: isLoadingDelete }] = useDeleteOrderMutation();
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Nhân viên kinh doanh",
      data: setupCrmApp?.seller_list,
      displayProps: "username",
      key: "user",
    },
    {
      id: 2,
      placeholder: "Nguồn",
      data: setupCrmApp?.lead_source_list,
      displayProps: "title",
      key: "source",
    },
    {
      id: 3,
      placeholder: "Trạng thái",
      data: setupCrmApp?.order_status_list,
      displayProps: "status",
      key: "status",
    },
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            <div>
              {dayjs(created).format("HH:mm")} - {dayjs(created).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "order_date",
      sorter: (a, b) => dayjs(a.order_date).unix() - dayjs(b.order_date).unix(),
      render: (_, record) => {
        return <UpdateOrderDate record={record} />;
      },
      align: "center",
    },
    {
      key: "ref_code",
      render: (_, record) => {
        return <OrderDetail order={record} />;
      },
      align: "center",
    },
    {
      key: "product",
      render: (_, record) => {
        return (
          <div>
            {record?.order_details_list?.map((item: any, index: number) => (
              <div key={index}>
                <span>{item?.product.product_name} (x{item?.quantity})</span>
              </div>
            ))}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "name",
      render: (_, { customer_info }) => {
        return <CustomerDetail customer={customer_info} isOrder={true} />;
      },
      align: "center",
    },
    {
      key: "source",
      dataIndex: "source_str",
      sorter: (a, b) =>
        a?.source_str?.localeCompare(b?.source_str, undefined, {
          sensitivity: "base",
        }),
        align: "center",
    },    
    {
      key: "user",
      dataIndex: "user_str",
      render: (_, { user_str }) => {
        return (
          <span>
            {user_str?.last_name} {user_str?.first_name}
          </span>
        );
      },
      align: "center",
    },
    {
      key: "amount_payable",
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.amount_payable);
      },
      align: "center",
    },
    {
      key: "total_paid",
      sorter: (a, b) => a.total_paid - b.total_paid,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.total_paid);
      },
      align: "center",
    },
    {
      key: "status",
      render: (_, record) => {
        return <UpdateOrderStatus record={record} statusList={setupCrmApp?.order_status_list} />;
      },
      align: "center",
    },
    {
      title: ``,
      dataIndex: "",
      width: width > 640 ? 175 : 35,
      key: "x",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <Button type={width < 640 ? "text" : "primary"}
                      className={` ${width > 640 ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
                      onClick={() => router.push(`order-management/edit-order/${record.id}`)} size="small">
                      {t("general.edit")}
                    </Button>),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={t("noficationDelete.orderTitle")}
                      description={t("noficationDelete.orderDescription")}
                      onConfirm={() => onDelete(record.id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">Xóa</div>
                    </Popconfirm>
                  ),
                },
                {
                  key: "3",
                  label: (
                    <Print order={record} />
                  ),
                },
              ]}
            />
          </div>
        </Space>
      ),
      align: "center",
    },
  ];

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,  // Use the spread operator to copy all properties from the item object
      key: index + 1,  // Số thứ tự (add or override specific fields)
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),  // Ngày tạo
      order_date: dayjs(item.order_date).format("DD/MM/YYYY"),  // Ngày đặt hàng
      name: item.customer_info ? item.customer_info.name : 'Chưa xác định',  // Tên khách hàng
      user: item.user_str ? `${item.user_str.last_name} ${item.user_str.first_name}` : 'Chưa xác định',  // In ra họ + tên NVKD
      status: item.status === null ? 'Đã lên đơn' : (item.status_info?.status || 'Chưa xác định'),  // Trạng thái đơn hàng
      amount_payable: item?.amount_payable
      ? new Intl.NumberFormat(locale).format(item.amount_payable)
      : "0",
      total_paid: item?.total_paid
        ? new Intl.NumberFormat(locale).format(item.total_paid)
        : "0",
      product: item?.order_details_list?.length > 0
      ? item.order_details_list.map((prod: any) => `${prod?.product?.product_name} (x${prod?.quantity})`).join(", ")
      : "Không có sản phẩm", // Chuyển danh sách sản phẩm thành chuỗi
    }));
  };

  const convertedData = convertData(dataSource);

  const fileColumns: ColumnsType<DataType> = [
    { key: 'key', title: 'STT', },
    { key: "created", title: "Ngày tạo", },
    { key: "order_date", title: "Ngày đặt hàng", },
    { key: "ref_code", title: "Đơn hàng", },
    { key: "product", title: "Sản phẩm", },
    { key: "name", title: "Tên khách hàng", },
    { key: "source_str", title: "Nguồn", },
    { key: "user", title: "NVKD", },
    { key: "amount_payable", title: "Số tiền thanh toán", },
    { key: "total_paid", title: "Đã thanh toán", },
    { key: "status", title: "Trạng thái", },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 },
      10: { cellWidth: 15 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: ExportOrderList } = useGetExportOrderListQuery(undefined, {
    skip: !isExportTriggered,
  });

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "DanhSachDonHang",
    pdfTheme: "striped",
    pdfOptions,
  });

  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "DanhSachDonHang",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && ExportOrderList) {
      const newData = ExportOrderList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [ExportOrderList, isExportTriggered]);

  useEffect(() => {
    if (allData.length > 0 && isExportComplete) {
      onExcelPrintAllData();
      setIsExportComplete(false);
    }
  }, [allData, isExportComplete]);

  const handleExportAllData = (exportFn: any) => {
    setIsExportTriggered(true);  // Bắt đầu trạng thái loading khi xuất file
    if (allData.length === 0) {
      setIsExportTriggered(true);
    } else {
      exportFn();
      setIsExportTriggered(false); 
    }
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t("noficationDelete.deleteALot")}`);
    else if (e.key === "2") setMenuName(`${t("noficationAddAndUpdate.aLotUpdate")}`);
    else if (e.key === "3") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "4") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "8") {
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: `${t('noficationDelete.deleteALot')}`,
      key: "1",
      icon: <RiDeleteBin2Line />,
    },
    {
      label: `${t('noficationAddAndUpdate.aLotUpdate')}`,
      key: "2",
      icon: <FaRegEdit />,
    },
    {
      label: `${t("noficationAddAndUpdate.aLotSelect")}`,
      key: "3",
      icon: <FaFileExport />,
    },
    {
      label: (`${t("noficationAddAndUpdate.exportAllData")}`),
      key: "4",
      children: [
        { label: "Xuất Excel", key: "5", onClick: () => handleExportAllData(onExcelPrintAllData), },
        { label: "Xuất CSV", key: "6", onClick: () => handleExportAllData(onCsvPrintAllData), },
        { label: "Xuất PDF", key: "7", onClick: () => handleExportAllData(onPdfPrintAllData), },
      ]
    },
    {
      label: "Huỷ",
      key: "8",
      icon: <FcCancel />,
    },
  ];

  const renderIcon = (name: string, selectedCount: number) => {
    if (name === `${t("noficationDelete.deleteALot")}`) {
      return (
        <Popconfirm
          title={t("noficationDelete.marketingDelete")}
          description={t("noficationDelete.confirmMessageMarketing")}
          onConfirm={() => {
            if (selectedCount > 0) {
              handleClickAction();
            }
          }}
          onCancel={cancel}
          okText={t("general.confirm")}
          cancelText={t("general.cancel")}
          placement="top"
          okButtonProps={{ loading: isLoadingDelete }}
        >
          <div style={{ position: "relative" }}>
            <RiDeleteBin2Line size={20} fill="blue" />
            {selectedCount > 0 && (
              <div
                style={{
                  background: "red",
                  borderRadius: 50,
                  height: 17,
                  width: 17,
                  position: "absolute",
                  right: -5,
                  top: -7,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
              </div>
            )}
          </div>
        </Popconfirm>
      );
    } else if (name === `${t("noficationAddAndUpdate.aLotUpdate")}`) {
      return (
        <div style={{ position: "relative" }}>
          <FaRegEdit
            onClick={() => {
              if (selectedCount > 0) {
                handleClickAction();
              }
            }}
            size={20}
            fill="blue"
          />
          {selectedCount > 0 && (
            <div
              style={{
                background: "red",
                borderRadius: 50,
                height: 17,
                width: 17,
                position: "absolute",
                right: -5,
                top: -7,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
            </div>
          )}
        </div>
      );
    }
    else if (name === `${t("noficationAddAndUpdate.aLotSelect")}`) {
      return (
        <div style={{ position: "relative" }}>
          <FaFileExport
            onClick={() => {
              console.log('select')
            }}
            size={20}
            fill="blue"
          />
          {selectedCount > 0 && (
            <div
              style={{
                background: "red",
                borderRadius: 50,
                height: 17,
                width: 17,
                position: "absolute",
                right: -5,
                top: -7,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
            </div>
          )}
        </div>
      );
    } else if (name === `${t("noficationAddAndUpdate.exportAllData")}`) {
      return (
        <div style={{ position: "relative" }}>
          {selectedCount > 0 && (
            <div
              style={{
                background: "red",
                borderRadius: 50,
                height: 17,
                width: 17,
                position: "absolute",
                right: -5,
                top: -7,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 10 }}>{selectedCount}</span>
            </div>
          )}
        </div>
      );
    } else {
      return <IoMdSettings size={17} fill="gray" />;
    }
  };

  const menuProps = {
    items: [`${t("noficationDelete.deleteALot")}`, `${t("noficationAddAndUpdate.aLotUpdate")}`, `${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
      ? items
      : items.splice(0, 4),
    onClick: handleMenuClick,
  };

  const initialState = {
    marketer_id: undefined,
    source_id: undefined,
  };

  const [updateProps, setUpdateProps] = useState(initialState);

  const handleClickAction = async () => {
    if (menuName === `${t("noficationDelete.deleteALot")}`) {
      try {
        await deleteMultiMarketer(selectedRowKeys);
        setSelectedRowKeys([]);
        notification.success({
          message: `${t("noficationDelete.leadMarketerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } catch (error) {
        notification.error({
          message: `${t("noficationDelete.leadMarketerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } else if (menuName === `${t("noficationAddAndUpdate.aLotUpdate")}`) {
      setOpenModal(true);
    }
  };

  const onDelete = async (orderId: any) => {
    try {
      await deleteOrder({ orderId });
      notification.success({
        message: `${t("noficationDelete.orderSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.orderError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const dataSelectModal = [
    {
      placeholder: "Người tiếp thị",
      displayProps: "username",
      key: "marketer_id",
      data: setupCrmApp?.marketer_list,
    },
    {
      placeholder: "Nguồn lead",
      displayProps: "title",
      key: "source_id",
      data: setupCrmApp?.lead_source_list,
    },
  ];

  const updateMulti = async (body: any, lead_ids: any) => {
    const dataArr = Object.keys(body).filter((props) => body[props]);
    if (dataArr?.length > 0) {
      const newObj: any = {};
      dataArr.forEach((item: string) => {
        newObj[item] = body[item];
      });
      const result = await editMultiMarketer({
        lead_ids: lead_ids,
        ...newObj,
      });
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.editLeadMarketerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setOpenModal(false);
        setSelectedRowKeys([]);
        setUpdateProps(initialState);
        setMenuName("Hành động");
        notification.success({
          message: `${t("noficationAddAndUpdate.editLeadMarketerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    }
    setOpenModal(false);
  };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.order_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.order_management?.find(
            (entry: { key: number }) => entry.key === column.key
          );
          return {
            ...column,
            title: configEntry?.title,
            width: configEntry?.width || column.width,
          };
        }
        return column;
      });
  }, [columnConfig, columns]);

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    setSkipApi(false);
    setFilterObject(initialStateFilter);

    if (!skipApi) {
      refetch();
    }
  };

  return (
    <div
      className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   p-6`}
    >
      <div className="flex justify-between items-center ml-0.5 max-md:flex-col max-md:gap-2">
        <Dropdown menu={menuProps}>
          <div
            style={{
              width: "100px",
              borderColor: [
                `${t("noficationDelete.deleteALot")}`,
                `${t("noficationAddAndUpdate.aLotUpdate")}`,
                `${t("noficationAddAndUpdate.aLotSelect")}`,
                `${t("noficationAddAndUpdate.exportAllData")}`,
              ].includes(menuName)
                ? "blue"
                : "#d9d9d9",
              borderRadius: "6px",
              height: "32px",
            }}
            className="flex items-center justify-center cursor-pointer"
          >
            {renderIcon(menuName, selectedRowKeys?.length)}
          </div>
        </Dropdown>
        <Form className="flex gap-2 max-md:gap-2 w-100 h-10">
          <Form.Item className="w-full">
            <Search placeholder={t("crm.searchNamePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2 mb-2">
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypeXls className="text-blue-500" />}
            onClick={onExcelPrint}>Xuất Excel</Button>
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypeCsv className="text-blue-500" />}
            onClick={onCsvPrint}>Xuất CSV</Button>
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypePdf className="text-blue-500" />}
            onClick={onPdfPrint}>Xuất PDF</Button>
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <Filter
            dataQuery={dataArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setDateRange={setDateRange}
            setPagination={setPagination}
            pagination={pagination}
            isLoading={isLoading}
            initialState={initialStateFilter}
            dateRange={dateRange}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <Button
            type="primary"
            onClick={() => {
              localStorage.setItem("orderLead", "");
              dispatch(deleteCart());
              router.push("order-management/add-order");
            }}
          >
            {t("crm.createOrder")}
          </Button>
        </div>
      </div>


      <div className="overflow-x-auto">
        <Table
          rowSelection={
            [`${t("noficationDelete.deleteALot")}`, `${t("noficationAddAndUpdate.aLotUpdate")}`, `${t("noficationAddAndUpdate.aLotSelect")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          columns={memoizedColumns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: orderList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          bordered
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1400 }}
        />
      </div>
      <OrderModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        order_list={selectedOrderList}
      />

      <ModalDelEdit
        dataEdit={updateProps}
        setDataEdit={setUpdateProps}
        title="Sửa theo các trường"
        open={openModal}
        setOpen={setOpenModal}
        data={dataSelectModal}
        action={() => updateMulti(updateProps, selectedRowKeys)}
      />
    </div>
  );
}
