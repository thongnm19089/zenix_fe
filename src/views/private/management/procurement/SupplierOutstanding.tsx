"use client";

import { useGetSupplierOutstandingListQuery } from "@/api/Procurement/apiProcurement";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateSupplierOutstandingDueDate from "@/components/FunctionsManagement/Procurement/AddAndUpdateSupplierOutstandingDueDate";
import CreateCost from "@/components/FunctionsManagement/Procurement/CreateCost";
import { CreateDebtPayment } from "@/components/FunctionsManagement/Procurement/CreateDebtPayment";
import DetailDebtPayment from "@/components/FunctionsManagement/Procurement/DetailDebtPayment";
import PurchaseOrderDetail from "@/components/FunctionsManagement/Procurement/PurchaseOrderDetail";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Form, Input, Table, Button, Dropdown } from "antd";
import { DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
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
  supplier_outstanding_date: string;
  due_date: string;
  ref_code: string;
  user_str: any;
  supplier_str: any;
  total_paid: any;
  amount_payable: any;
  payment_list: any;
}
const initialState = {
  brands: [],
  payment_term: [],
};

export default function SupplierOutstanding() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();

  const params = useParams();
  const [locale, setLocale] = useState( params && params.locale === "vi" ? "vi-VN" : "en-US");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ supplier_outstanding: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterObject, setFilterObject] = useState<{
    brands: number[];
    payment_term: number[];
  }>(initialState);
  // Thêm tham số vào hook query
  const {
    data: supplierOutstandingList,
    refetch,
    isLoading,
    error,
  } = useGetSupplierOutstandingListQuery({
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
      const supplierOutstandingData = parsedColumn.supplier_outstanding;
      const supplierOutstandingObject = { supplier_outstanding: supplierOutstandingData };
      setColumnConfig(supplierOutstandingObject);
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
  const dataSource =
    supplierOutstandingList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

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
      key: `purchase_date`,
      sorter: (a, b) => dayjs(a.supplier_outstanding_date).unix() - dayjs(b.supplier_outstanding_date).unix(),
      render: (_, { supplier_outstanding_date }) => {
        return (
          <div>
            <div>{dayjs(supplier_outstanding_date).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: `supplier`,
      sorter: (a, b) => a.supplier_str.localeCompare(b.supplier_str),
      dataIndex: "supplier_str",
      align: "center",
    },
    {
      key: `purchase_order`,
      render: (_, record) => {
        return <PurchaseOrderDetail purchaseOrder={record} />;
      },
      align: "center",
    },
    {
      key: `payment_amount`,
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.amount_payable);
      },
      align: "center",
    },
    {
      key: `paid`,
      sorter: (a, b) => a.total_paid - b.total_paid,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.total_paid);
      },
      align: "center",
    },
    {
      key: `remaining_balance`,
      sorter: (a, b) => Number(a.remaining_balance) - Number(b.remaining_balance),
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.remaining_balance);
      },
      align: "center",
    },
    {
      key: "due_date",
      sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
      render: (_, { payment_list }) => {
        return (
          <div>{payment_list.length > 0 && <DetailDebtPayment paymentList={payment_list} refetch={refetch} />}</div>
        );
      },
      align: "center",
    },
    {
      width: 160,
      key: "x",
      fixed: "right",
      render: (_, { id, supplier_str }) => (
        <CreateDebtPayment purchaseOrderId={id} refetch={refetch} beneficiary={supplier_str} />
      ),
      align: "center",
    },
  ];


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
        const configEntry = columnConfig?.supplier_outstanding?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.supplier_outstanding?.find(
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
    setFilterObject(initialState);
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
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      supplier_date: dayjs(item?.supplier_outstanding_date).format("DD/MM/YYYY"),
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
      key: 'supplier_date'
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
    {
      title: 'Ngày đến hạn',
      key: 'purchase_order_date'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 25 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;


  const { data: GetAllSupplierOutstandingList } = useGetSupplierOutstandingListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyCongNoNhaCungCap",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && GetAllSupplierOutstandingList) {
      const newData = GetAllSupplierOutstandingList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [GetAllSupplierOutstandingList, isExportTriggered]);

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
    fileName: "QuanLyCongNoNhaCungCap",
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
        }   px-6`}
    >
      <div className="flex justify-between items-center  py-2 mb-2 max-md:flex-col max-md:gap-3">
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
        <Form layout="inline" className="max-md:gap-2 w-full">
          <Form.Item className="w-70">
            <Search placeholder={t("crm.searchNamePhoneEmail")} onChange={onSearchChange} className="md:w-[300px]" />
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
            total: supplierOutstandingList?.total || 0,
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
