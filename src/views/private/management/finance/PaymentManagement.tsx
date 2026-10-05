"use client";

import { useDeletePaymentAccountantMutation, useGetAllPaymentAccountantListQuery, useGetPaymentAccountantListQuery } from "@/api/Finance/apiPayment";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Form, Input, Popconfirm, Space, Table, Tag, notification, Dropdown } from "antd";
import { DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;

interface DataType {
  key: React.Key;
  id: number;
  lead: number;
  created: string;
  user_str: any;
  order_str: any;
  payment_amount: any;
  payment_method: string;
  payment_date: string;
  payment_info: string;
}

const initialState = {
  seller_id: [],
}

export default function PaymentManagement() {
  const t: any = useTranslations();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState(params?.locale === "vi" ? "vi-VN" : "en-US");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ payment_management: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);

  const [filterObject, setFilterObject] = useState<{
    seller_id: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: paymentAccountantList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetPaymentAccountantListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    seller_id: filterObject?.seller_id,
  });

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

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const paymentManagementData = parsedColumn.payment_management;
      const paymentManagementObject = { payment_management: paymentManagementData };
      setColumnConfig(paymentManagementObject);
    }
  }, []);

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      // Ít nhất một trong hai ngày là null, hoặc cả 'dates' là null
      setDateRange([]);
    }

    // Cập nhật pagination
    setPagination({ ...pagination, current: 1 });
  };

  const onSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource = paymentAccountantList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];
  const [deletePaymentAccountant, { isLoading: isLoadingDelete }] = useDeletePaymentAccountantMutation();
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "NVKD",
      data: setupCrmApp?.seller_list,
      displayProps: "first_name",
      key: "seller_id",
    },
  ]

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
      key: "payment_date",
      sorter: (a, b) => dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix(),
      render: (_, { payment_date }) => {
        return (
          <div>
            {dayjs(payment_date).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "customer",
      sorter: (a, b) => a.order_str?.customer?.name.localeCompare(b.order_str?.customer?.name),
      render: (_, { order_str }) => {
        return <CustomerDetail customer={order_str?.customer} />;
      },
      align: "center",
    },
    {
      key: "order",
      render: (_, record) => {
        return <OrderDetail order={record?.order_str} />;
      },
      align: "center",
    },
    {
      key: "product",
      render: (_, record) => {
        return (
          <div>
            {record?.order_str?.order_details_list?.map((item: any, index: number) => (
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
      key: "NVKD",
      sorter: (a, b) =>
        `${a.user_str.last_name} ${a.user_str.first_name}`.localeCompare(
          `${b.user_str.last_name} ${b.user_str.first_name}`
        ),
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
      key: "payment_amount",
      sorter: (a, b) => a?.payment_amount - b?.payment_amount,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record?.payment_amount);
      },
      align: "center",
    },
    {
      key: "x",
      width: 60,
      fixed: "right",
      render: (_, { id }) => (
        <Space size="middle" direction="vertical">
          <Popconfirm
            title={t("noficationDelete.deletePayment")}
            description={t("noficationDelete.deleteThisNotification")}
            onConfirm={() => onDelete(id)}
            onCancel={cancel}
            okText={t("general.confirm")}
            cancelText={t("table.actionValues.canceltext")}
            placement="left"
            okButtonProps={{ loading: isLoadingDelete }}
          >
            <Button danger block size="small">
              {t("general.delete")}
            </Button>
          </Popconfirm>
        </Space>
      ),
      align: "center",
    },
  ];

  const onDelete = async (paymentAccountantId: any) => {
    try {
      await deletePaymentAccountant({ paymentAccountantId });
      notification.success({
        message: `${t("noficationDelete.successfullyDeletedPayment")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.deleteFailedPayments")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const [menuName, setMenuName] = useState<string>("Hành động");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeysForExport, setSelectedRowKeysForExport] = useState<React.Key[]>([])

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

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.payment_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.payment_management?.find(
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
    setFilterObject(initialState);

    if (!skipApi) {
      refetch();
    }
  };

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      customer: `${item?.order_str?.customer?.name || ""}`,
      ref_code: `${item?.order_str?.ref_code || ""}`,
      NVKD: `${item.user_str?.last_name} ${item.user_str?.first_name}`,
      payment_date: dayjs(item.payment_date).format("DD/MM/YYYY"),
      payment_amount: item?.payment_amount
        ? new Intl.NumberFormat(locale).format(item.payment_amount)
        : "0",
      product: item?.order_str?.order_details_list?.length > 0
        ? item?.order_str?.order_details_list.map((prod: any) => `${prod?.product?.product_name} (x${prod?.quantity})`).join(", ")
        : "Không có sản phẩm", // Chuyển danh sách sản phẩm thành chuỗi
      key: index + 1,
    }));
  };

  const convertedData = convertData(dataSource);

  const fileColumns: ColumnsType<DataType> = [
    {
      title: 'STT',
      key: 'key',
    },
    {
      title: 'Ngày tạo',
      key: 'created'
    },
    {
      title: 'Ngày thanh toán',
      key: 'payment_date'
    },
    {
      title: 'Khách hàng',
      key: 'customer'
    },
    {
      title: 'Đơn hàng',
      key: 'ref_code',
    },
    {
      title: 'Sản phẩm',
      key: 'product'
    },
    {
      title: 'NVKD',
      key: "NVKD",
    },
    {
      title: 'Số tiền thanh toán',
      key: 'payment_amount'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 35 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllPaymentAccountantList } = useGetAllPaymentAccountantListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyDoanhThu",
    pdfTheme: "striped",
    pdfOptions,
  });

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };

  useEffect(() => {
    if (isExportTriggered && AllPaymentAccountantList) {
      const newData = AllPaymentAccountantList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllPaymentAccountantList, isExportTriggered]);

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


  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "DanhSachBaoGia",
    pdfTheme: "striped",
    pdfOptions,
  });

  const items: MenuProps["items"] = [
    {
      label: `${t("noficationAddAndUpdate.aLotSelect")}`,
      key: "1",
      icon: <FaFileExport />,
    },
    {
      label: (`${t("noficationAddAndUpdate.exportAllData")}`),
      key: "2",
      children: [
        { label: "Xuất Excel", key: "3", onClick: () => handleExportAllData(onExcelPrintAllData), },
        { label: "Xuất CSV", key: "4", onClick: () => handleExportAllData(onCsvPrintAllData), },
        { label: "Xuất PDF", key: "5", onClick: () => handleExportAllData(onPdfPrintAllData), },
      ]
    },
    {
      label: "Huỷ",
      key: "6",
      icon: <FcCancel />,
    },
  ];

  const renderIcon = (name: string, selectedCount: number) => {
    if (name === `${t("noficationAddAndUpdate.aLotSelect")}`) {
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
    items: [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
      ? items
      : items.splice(0, 2),
    onClick: handleMenuClick,
  };


  return (
    <div
      className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   p-6`}
    >
      <div className="flex justify-between items-center px-2 md:px-5 py-2 mb-4 max-md:flex-col max-md:gap-3">
        <div className="flex justify-center -ml-4 mr-3">
          <Dropdown menu={menuProps}>
            <div
              style={{
                width: "50px",
                borderColor: [
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
        </div>

        <Form layout="inline">
          <Form.Item className="max-md:w-full">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2">
          <div className="flex gap-2 items-center ml-auto">
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypeXls className="text-blue-500" />}
              onClick={onExcelPrint}
            >
              Xuất Excel
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypeCsv className="text-blue-500" />}
              onClick={onCsvPrint}
            >
              Xuất CSV
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500"
              icon={<BsFiletypePdf className="text-blue-500" />}
              onClick={onPdfPrint}
            >
              Xuất PDF
            </Button>
          </div>
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
            setPagination={setPagination}
            pagination={pagination}
            isLoading={isLoading}
            initialState={initialState}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          rowSelection={
            [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          columns={memoizedColumns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: paymentAccountantList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoading}
          scroll={{ x: 1000 }}
          bordered
        />
      </div>
    </div>
  );
}
