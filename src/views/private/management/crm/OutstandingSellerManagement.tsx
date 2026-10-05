"use client";

import { useGetAllOutstandingListQuery, useGetOutstandingListQuery } from "@/api/Finance/apiPayment";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import SelectColumn from "@/components/Filter/SelectColumn";
import { CreateSellerDebtPayment } from "@/components/FunctionsManagement/CRM/CreateSellerDebtPayment";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import DetailSellerDebtPayment from "@/components/FunctionsManagement/CRM/DetailSellerDebtPayment";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Form, Input, Space, Table, Button, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useWindowSize } from "@/utils/responsiveSm";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";
import { BsFiletypeXls, BsFiletypeCsv, BsFiletypePdf } from 'react-icons/bs';

const { Search } = Input;

interface DataType {
  remaining_balance: any;
  key: React.Key;
  id: number;
  lead: number;
  created: string;
  order_date: string;
  due_date: string;
  ref_code: string;
  order_details_list: any;
  user_str: any;
  customer: any;
  customer_info: any;
  total_paid: any;
  amount_payable: any;
  payment_list: any;
}

export default function OutstandingSellerManagement() {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();

  const params = useParams();
  const [locale, setLocale] = useState(
    params?.locale === "vi" ? "vi-VN" : "en-US"
  );

  const [menuName, setMenuName] = useState<string>("Hành động");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowKeysForExport, setSelectedRowKeysForExport] = useState<React.Key[]>([])

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    if (menuName === t("noficationAddAndUpdate.aLotSelect")) {
      setSelectedRowKeysForExport(newSelectedRowKeys);
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const rowSelection = {
    selectedRowKeys: menuName === t("noficationAddAndUpdate.aLotSelect")
      ? selectedRowKeysForExport
      : selectedRowKeys,
    onChange: onSelectChange,
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ outstanding_seller_management: [] });

  const {
    data: outstandingList,
    refetch,
    isLoading,
    error,
  } = useGetOutstandingListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
  });
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const outstandingSellerData = parsedColumn.outstanding_seller_management;
      const outstandingSellerObject = { outstanding_seller_management: outstandingSellerData };
      setColumnConfig(outstandingSellerObject);
    }
  }, []);

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
  const onSearchChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
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
    outstandingList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

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
      width: 140,
      render: (_, { order_date }) => {
        return <div>{dayjs(order_date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      key: "name",
      render: (_, { customer_info }) => {
        return <CustomerDetail customer={customer_info} />;
      },
      align: "center",
    },
    {
      key: "user",
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
      filters: setupCrmApp?.seller_list
        ? [
          ...setupCrmApp.seller_list.map(
            (item: { last_name: string; first_name: string }) => ({
              text: `${item.last_name} ${item.first_name}`,
              value: `${item.last_name} ${item.first_name}`,
            })
          ),
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
      key: "remaining_amount",
      sorter: (a, b) =>
        Number(a.remaining_balance) - Number(b.remaining_balance),
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.remaining_balance);
      },
      align: "center",
    },
    {
      key: "payment_date",
      sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
      render: (_, { payment_list }) => {
        return (
          <div>
            {payment_list.length > 0 && (
              <DetailSellerDebtPayment
                paymentList={payment_list}
                refetch={refetch}
              />
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      title: ``,
      dataIndex: "",
      fixed: "right",
      width: width > 640 ? 160 : 35,
      key: "x",

      render: (_, { id, customer_info }) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <CreateSellerDebtPayment
              orderId={id}
              refetch={refetch}
              beneficiary={customer_info?.name}
            />
          </div>
        </Space>
      ),
      align: "center",
    },
  ];

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeys.length > 0
      ? data.filter((item: DataType) => selectedRowKeys.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => {
      const paymentDate = item.payment_list && item.payment_list.length > 0
        ? dayjs(item.payment_list[0].payment_date).format("DD/MM/YYYY") // Format ngày thanh toán
        : 'Chưa thanh toán';
      return {
        ...item,
        key: index + 1,
        created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),  // Ngày tạo
        order_date: dayjs(item.order_date).format("DD/MM/YYYY"),  // Ngày đặt hàng
        name: item.customer_info ? item.customer_info.name : 'Chưa xác định',  // Tên khách hàng
        user: item.user_str ? `${item.user_str.last_name} ${item.user_str.first_name}` : 'Chưa xác định',  // Họ tên NVKD
        payment_date: paymentDate,  // Ngày thanh toán
        amount_payable: item?.amount_payable
        ? new Intl.NumberFormat(locale).format(item.amount_payable)
        : "0",
        total_paid: item?.total_paid
          ? new Intl.NumberFormat(locale).format(item.total_paid)
          : "0",
        remaining_balance: item?.remaining_balance
          ? new Intl.NumberFormat(locale).format(item.remaining_balance)
          : "0",
        product: item?.order_details_list?.length > 0
          ? item.order_details_list.map((prod: any) => `${prod?.product?.product_name} (x${prod?.quantity})`).join(", ")
          : "Không có sản phẩm", // Chuyển danh sách sản phẩm thành chuỗi
        };
    });
  };

  const convertedData = convertData(dataSource);

  const fileColumns: ColumnsType<DataType> = [
    { key: 'key', title: 'STT', },
    { key: "created", title: "Ngày tạo", },
    { key: "order_date", title: "Ngày đặt hàng", },
    { key: "name", title: "Tên khách hàng", },
    { key: "user", title: "NVKD", },
    { key: "ref_code", title: "Đơn hàng", },
    { key: "product", title: "Sản phẩm", },
    { key: "amount_payable", title: "Số tiền thanh toán", },
    { key: "total_paid", title: "Đã thanh toán", },
    { key: "remaining_balance", title: "Số tiền còn lại", },
    { key: "payment_date", title: "Ngày đến hạn", },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 25 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 15 },
      10: { cellWidth: 18 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;


  const { data: AllOutstandingList } = useGetAllOutstandingListQuery(undefined, {
    skip: !isExportTriggered,
  });

  useEffect(() => {
    if (isExportTriggered && AllOutstandingList) {
      const newData = AllOutstandingList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllOutstandingList, isExportTriggered]);

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


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "DanhSachCongNo",
    pdfTheme: "striped",
    pdfOptions,
  });

  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "DanhSachCongNo",
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
        { label: "Xuất Excel", key: "5", onClick: () => handleExportAllData(onExcelPrintAllData), },
        { label: "Xuất CSV", key: "6", onClick: () => handleExportAllData(onCsvPrintAllData), },
        { label: "Xuất PDF", key: "7", onClick: () => handleExportAllData(onPdfPrintAllData), },
      ]
    },
    {
      label: "Huỷ",
      key: "6",
      icon: <FcCancel />,
    },
  ];

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.outstanding_seller_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.outstanding_seller_management?.find(
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

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };


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
          {/* <Form.Item className="max-md:w-full">
            <RangePicker
              onChange={onDateChange}
              placeholder={[
                `${t("general.startDate")}`,
                `${t("general.endDate")}`,
              ]}
              className="max-md:w-full"
            />
          </Form.Item> */}
          <Form.Item className="max-md:w-full">
            <Search
              placeholder={t("crm.searchNamePhoneEmail")}
              onChange={onSearchChange}
              className="md:w-[350px]"
            />
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
          // columns={columns}
          bordered
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: outstandingList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
  );
}
