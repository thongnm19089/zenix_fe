"use client";

import { useGetCustomerListQuery } from "@/api/CRM/apiLead";
import { useGetAllStockOutListQuery, useGetStockOutListQuery } from "@/api/Inventory/apiInventory";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import ActionTable from "@/components/DropDown/ActionTable";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import CreateStockOut from "@/components/FunctionsManagement/Inventory/CreateStockOut";
import PrintStockOut from "@/components/FunctionsManagement/Inventory/PrintStockOut";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Form, Input, Space, Table, Button, Dropdown } from "antd";
import { DatePicker } from "antd";
import { useWindowSize } from "@/utils/responsiveSm";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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

interface DataType {
  key: React.Key;
  id: number;
  lead: number;
  created: string;
  order_date: string;
  ref_code: string;
  order_details_list: any;
  user_str: any;
  customer: any;
  total_paid: any;
  amount_payable: any;
  inventory_transactions: any;
  product: { id: number };
  sku: { id: number };
  quantity: number;
  customer_info: any;
}

const initialState = {
  user: [],
  source: [],
  status: [],
}
export default function StockOut() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

  const t: any = useTranslations();
  const router = useRouter();
  const [width] = useWindowSize();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ stock_out: [] });
  const [skipApi, setSkipApi] = useState(false);

  const [filterObject, setFilterObject] = useState<{
    user: number[];
    source: number[];
    status: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: orderList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetStockOutListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    user: filterObject.user,
    source: filterObject.source,
    status: filterObject.status,

  }, {
    skip: skipApi
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
      const stockOutData = parsedColumn.stock_out;
      const stockOutObject = { stock_out: stockOutData };
      setColumnConfig(stockOutObject);
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
  const dataSource = orderList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();
  const {
    data: customerList,
  } = useGetCustomerListQuery({
    customerType: "individual",
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const dataArrQuery = [
    {
      id: 1,
      placeholder: `Khách hàng`,
      data: customerList?.results,
      displayProps: "name",
      key: "user"
    },
    {
      id: 2,
      placeholder: `${t("admin.sources")}`,
      data: setupCrmApp?.lead_source_list,
      displayProps: "title",
      key: "source",
    },
    {
      id: 2,
      placeholder: `${t("general.status")}`,
      data: setupCrmApp?.order_status_list,
      displayProps: "status",
      key: "status"
    },
  ];
  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 45,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            {dayjs(created).format("HH:mm")} - {""}
            {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "order_date",
      sorter: (a, b) => dayjs(a.order_date).unix() - dayjs(b.order_date).unix(),
      render: (_, { order_date }) => {
        return (
          <div>
            <div>{dayjs(order_date).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "order",
      render: (_, record) => {
        return <OrderDetail order={record} />;
      },
      align: "center",
    },
    {
      key: "customer",
      // sorter: (a, b) => a.customer.name.localeCompare(b.customer.name),
      render: (_, customer) => {
        return <CustomerDetail customer={customer} />;
      },
      align: "center",
    },
    {
      key: "source",
      dataIndex: "source_str",
      align: "center",
    },
    {
      key: "NVKD",
      dataIndex: "user_str",
      render: (_, { user_str }) => {
        return (
          <span>
            {user_str?.last_name} {user_str?.first_name}
          </span>
        );
      },
      filters: setupCrmApp?.seller_list
        ? [
          ...setupCrmApp.seller_list.map((item: { last_name: string; first_name: string }) => ({
            text: `${item.last_name} ${item.first_name}`,
            value: `${item.last_name} ${item.first_name}`,
          })),
          { text: "Null", value: "null" },
        ]
        : [],
      onFilter: (value, record) => {
        const fullName = `${record.user_str?.last_name} ${record.user_str?.first_name}`;
        return fullName === value || (value === "null" && !fullName);
      },
      align: "center",
    },
    {
      key: `payment_amount`,
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return new Intl.NumberFormat("vi-VN").format(record.amount_payable);
      },
      align: "center",
    },
    {
      key: `paid`,
      sorter: (a, b) => a.total_paid - b.total_paid,
      render: (_, record) => {
        return new Intl.NumberFormat("vi-VN").format(record.total_paid);
      },align: "center",
    },
    {
      title: ``,
      dataIndex: "",
      key: "x",
      width: width > 640 ? 130 : 40,
      
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <CreateStockOut order={record} refetch={refetch} />
                ),
              },
              {
                key: "2",
                label: (
                  <>
                    {record?.inventory_transactions.length > 0 && <PrintStockOut order={record} />}
                  </>
                ),
              },
            ]}
          />


        </div>

      ),
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
        const configEntry = columnConfig?.stock_out?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.stock_out?.find(
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
      order_date: dayjs(item.order_date).format("DD/MM/YYYY"),
      NVKD: `${item?.user_str?.last_name || ""} ${item?.user_str?.first_name || ""}`,
      customer: item?.customer_info?.name,
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
      title: 'Ngày đặt hàng',
      key: 'order_date'
    },
    {
      title: 'Đơn hàng',
      key: 'ref_code',
    },
    {
      title: 'Khách hàng',
      key: "customer",
    },
    {
      title: 'Nguồn',
      key: 'source_str'
    },
    {
      title: 'NVKD',
      key: 'NVKD'
    },
    {
      title: 'Số tiền thanh toán',
      key: 'amount_payable'
    },
    {
      title: 'Đ ã thanh toán',
      key: 'total_paid'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 22 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllStockOut } = useGetAllStockOutListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "XuatKho",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllStockOut) {
      const newData = AllStockOut.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllStockOut, isExportTriggered]);

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
    fileName: "NhapKho",
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
      <div className="flex justify-between items-center pt-2 max-md:flex-col max-md:gap-2 mb-2">
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
        <Form layout="inline" className=" w-full md:w-1/2">
          <Form.Item className="max-md:w-full">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
        </Form>

        <div className="flex justify-end text-right max-md:w-full w-1/2 gap-2">
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
            total: orderList?.total || 0,
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
