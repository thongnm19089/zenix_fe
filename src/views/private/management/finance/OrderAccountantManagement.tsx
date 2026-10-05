"use client";

import { useGetAllOrderAccountantListQuery, useGetOrderAccountantListQuery } from "@/api/Finance/apiPayment";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import Print from "@/components/FunctionsManagement/CRM/Order/Print";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Form, Input, Table, Tag, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import { BsFiletypeXls, BsFiletypeCsv, BsFiletypePdf } from 'react-icons/bs';
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

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
  status: any;
}

const initialState = {
  status: [],
  source: [],
  seller_id: [],
}

const { Search } = Input;

export default function OrderAccountantManagement() {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const t: any = useTranslations();
  const router = useRouter();

  const params = useParams();
  const [locale, setLocale] = useState(
    params?.locale === "vi" ? "vi-VN" : "en-US"
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [columnConfig, setColumnConfig] = useState<any>({ order_accountant_business: [] });

  const [filterObject, setFilterObject] = useState<{
    source: number[];
    status: number[];
    seller_id: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: orderAccountantList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetOrderAccountantListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    source: filterObject?.source,
    seller_id: filterObject?.seller_id,
    status: filterObject?.status,
  });


  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

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


  // Xử lý khi thay đổi trang hoặc kích thước trang
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  // Xử lý thay đổi dữ liệu tìm kiếm và ngày
  const onSearchChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const orderAccountantBusinessData = parsedColumn.order_accountant_business;
      const orderAccountantBusinessObject = { order_accountant_business: orderAccountantBusinessData };
      setColumnConfig(orderAccountantBusinessObject);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    orderAccountantList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Nguồn",
      data: setupCrmApp?.lead_source_list,
      displayProps: "title",
      key: "source",
    },
    {
      id: 2,
      placeholder: "NVKD",
      data: setupCrmApp?.seller_list,
      displayProps: `first_name`,
      key: "seller_id",
    },
    {
      id: 2,
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
            <div>
              {dayjs(created).format("HH:mm")} -{" "}
              {dayjs(created).format("DD/MM/YYYY")}
            </div>
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
      key: "customer",
      sorter: (a, b) =>
        a.customer_info.name.localeCompare(b.customer_info.name),
      render: (_, { customer_info }) => {
        return <CustomerDetail customer={customer_info} />;
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
      key: "NVKD",
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
      key: "status",
      render: (_, record) => {
        return (
          <>
            {record?.status ? (
              <Tag color={record?.status_info.color}>{record?.status_info.status}</Tag>
            ) : (
              <Tag color="#87d068">Đã lên đơn</Tag>
            )}
          </>
        );
      },
      align: "center",
    },
    {
      width: 65,
      fixed: "right",
      key: "x",
      render: (_, record) => (
        <div className="flex gap-2">
          <Print order={record} />
        </div>
      ),
      align: "center",
    },
  ];

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.order_accountant_business?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.order_accountant_business?.find(
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
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      order_date: dayjs(item.order_date).format("DD/MM/YYYY"),
      customer: `${item?.customer_info?.name}`,
      NVKD: `${item?.user_str?.last_name || ""} ${item?.user_str?.first_name || ""}`,
      status: `${item?.status_info?.status || "Đã lên đơn"}`,
      amount_payable: new Intl.NumberFormat('vi-VN').format(item.amount_payable),
      total_paid: new Intl.NumberFormat('vi-VN').format(item.total_paid),
      product: item?.order_details_list?.length > 0
      ? item.order_details_list.map((prod: any) => `${prod?.product?.product_name} (x${prod?.quantity})`).join(", ")
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
      title: 'Ngày đặt hàng',
      key: 'order_date'
    },
    {
      title: 'Đơn hàng',
      key: 'ref_code',
    },
    {
      title: 'Sản phẩm',
      key: 'product',
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
      title: 'Đã thanh toán',
      key: 'total_paid'
    },
    {
      title: 'Trạng thái',
      key: 'status'
    },
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

  const { data: AllOrderAccountantList } = useGetAllOrderAccountantListQuery(undefined, {
    skip: !isExportTriggered,
  })


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyDonHang",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllOrderAccountantList) {
      const newData = AllOrderAccountantList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllOrderAccountantList, isExportTriggered]);

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
    fileName: "QuanLyDonHang",
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
          <Form.Item className="max-md:w-full">
            <Search
              placeholder={t("crm.searchNamePhoneEmail")}
              onChange={onSearchChange}
            />
          </Form.Item>
        </Form>
       
        <div className="flex justify-end text-right w-full gap-2">
          <div className="flex gap-2 items-centerz">
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
            total: orderAccountantList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          bordered
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
  );
}
