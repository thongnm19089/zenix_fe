"use client";

import { useGetPurchaseOrderListQuery, useDeletePurchaseOrderMutation, useGetAllPurchaseOrderListQuery } from "@/api/Procurement/apiProcurement";
import { useGetSetupProcurementAppQuery } from "@/api/SetUp/apiSetup";
import PurchaseOrderDetail from "@/components/FunctionsManagement/Procurement/PurchaseOrderDetail";
import PurchaseOrderPrint from "@/components/FunctionsManagement/Procurement/PurchaseOrderPrint";
import SupplierDetail from "@/components/FunctionsManagement/Procurement/SupplierDetail";
import { RootState } from "@/store/store";
import ActionTable from "@/components/DropDown/ActionTable";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Form, Input, Popconfirm, Space, Table, Tag, notification, Dropdown } from "antd";
import { DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useWindowSize } from "@/utils/responsiveSm";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import SelectColumn from "@/components/Filter/SelectColumn";
import { IoRefresh } from "react-icons/io5";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;
const { Search } = Input;

interface DataType {
  remaining_balance: any;
  key: React.Key;
  id: number;
  lead: number;
  created: string;
  purchase_order_date: string;
  due_date: string;
  ref_code: string;
  user_str: any;
  supplier_str: any;
  total_paid: any;
  amount_payable: any;
}
const initialState = {
  category: [],
}
export default function PurchaseOrder() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();
  const [width] = useWindowSize();

  const params = useParams();
  const [locale, setLocale] = useState( params && params.locale === "vi" ? "vi-VN" : "en-US");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ purchase_order: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    category: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: purchaseOrderList,
    refetch,
    isLoading,
    error,
  } = useGetPurchaseOrderListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
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
      const supplierData = parsedColumn.purchase_order;
      const supplierObject = { purchase_order: supplierData };
      setColumnConfig(supplierObject);
    }
  }, []);

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      // Cả hai ngày đều không phải là null
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange([]);
    }

    // Cập nhật pagination
    setPagination({ ...pagination, current: 1 });
  };

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource = purchaseOrderList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const [deletePurchaseOrder, { isLoading: isLoadingDelete }] = useDeletePurchaseOrderMutation();

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
            {dayjs(created).format("HH:mm")} - {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "purchase_date",
      sorter: (a, b) => dayjs(a.purchase_order_date).unix() - dayjs(b.purchase_order_date).unix(),
      render: (_, { purchase_order_date }) => {
        return (
          <div>
            <div>{dayjs(purchase_order_date).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "supplier",
      render: (_, record) => {
        return <SupplierDetail supplier={record} />;
      },
      align: "center",
    },
    {
      key: "purchase_order",
      render: (_, record) => {
        return <PurchaseOrderDetail purchaseOrder={record} />;
      },
      align: "center",
    },
    {
      key: "payment_amount",
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.amount_payable);
      },
      align: "center",
    },
    {
      key: "paid",
      sorter: (a, b) => a.total_paid - b.total_paid,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.total_paid);
      },
      align: "center",
    },
    {
      key: "remaining_balance",
      sorter: (a, b) => Number(a.remaining_balance) - Number(b.remaining_balance),
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.remaining_balance);
      },
      align: "center",
    },
    {
      width: width > 640 ? 120 : 40,
      key: "x",
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <Button type={width < 640 ? "text" : "primary"}
                    className={` ${width > 640 ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
                    onClick={() => router.push(`purchase-order/edit-order/${record.id}`)} size="small">
                    {t("general.edit")}
                  </Button>
                ),
              },
              {
                key: "2",
                label: (
                  <>
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
                  </>
                ),
              },
            ]}
          />
          {/* <PurchaseOrderPrint purchase_order={record} /> */}
        </div>
      ),
      align: "center",
    },
  ];

  const onDelete = async (id: any) => {
    try {
      await deletePurchaseOrder({ id });
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
        const configEntry = columnConfig?.purchase_order?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.purchase_order?.find(
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

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động"); ``
      setSelectedRowKeys([]);
    }
  };

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item?.created).format("DD/MM/YYYY HH:mm"),
      purchase_date: dayjs(item?.purchase_order_date).format("DD/MM/YYYY"),
      amount_payable: new Intl.NumberFormat('vi-VN').format(item.amount_payable),
      total_paid: new Intl.NumberFormat('vi-VN').format(item.total_paid),
      remaining_balance: new Intl.NumberFormat('vi-VN').format(item.remaining_balance),
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
      title: 'Ngày mua hàng',
      key: 'purchase_date'
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier_str',
    },
    {
      title: 'Đơn mua hàng',
      key: "ref_code",
    },
    {
      title: 'Số tiền thanh toán',
      key: 'amount_payable'
    },
    {
      title: 'Đã thanh toán',
      key: 'total_paid'
    },
    {
      title: 'Số tiền còn lại',
      key: 'remaining_balance'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllPurchaseOrderList } = useGetAllPurchaseOrderListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyMuaHang",
    pdfTheme: "striped",
    pdfOptions,
  });


  useEffect(() => {
    if (isExportTriggered && AllPurchaseOrderList) {
      const newData = AllPurchaseOrderList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllPurchaseOrderList, isExportTriggered]);

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
    fileName: "QuanLyMuaHang",
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
      <div className="flex justify-between items-center max-md:flex-col max-md:gap-3">
        <div className="flex justify-center -ml-2 mr-3">
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
        <Form className="flex md:flex-col lg:flex-row gap-2 max-md:gap-2 w-full h-10">
          <Form.Item className="max-md:w-full">
            <Search placeholder={"Tìm kiếm theo tên nhà cung cấp, ..."} onChange={onSearchChange} />
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
          
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <Button type="primary" onClick={() => router.push("purchase-order/add-order")} size="middle">
            {t("crm.createOrder")}
          </Button>

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
            total: purchaseOrderList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1400 }}
          bordered
        />
      </div>
    </div>
  );
}
