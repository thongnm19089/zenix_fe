"use client";

import { useGetAllOutstandingAccountantListQuery, useGetOutstandingAccountantListQuery } from "@/api/Finance/apiPayment";
import { useDeleteStockOutMutation } from "@/api/Inventory/apiInventory";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import DetailDebtPayment from "@/components/FunctionsManagement/Procurement/DetailDebtPayment";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Form, Input, Popconfirm, Space, Table, notification, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { IoRefresh } from "react-icons/io5";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

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
  customer_info: any;
  total_paid: any;
  amount_payable: any;
  payment_list: any;
}

const initialState = {
  seller_id: [],
}

export default function OutstandingManagement() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState(params?.locale === "vi" ? "vi-VN" : "en-US");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [columnConfig, setColumnConfig] = useState<any>({ outstanding_business: [] });

  const [filterObject, setFilterObject] = useState<{
    seller_id: number[];
  }>(initialState);

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

  // Thêm tham số vào hook query
  const {
    data: outstandingList,
    refetch,
    isLoading,
    error,
  } = useGetOutstandingAccountantListQuery({
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
      const costBusinessData = parsedColumn.outstanding_business;
      const costBusinessObject = { outstanding_business: costBusinessData };
      setColumnConfig(costBusinessObject);
    }
  }, []);

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource = outstandingList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const [deleteOrder, { isLoading: isLoadingDelete }] = useDeleteStockOutMutation();
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
      key: "customer",
      sorter: (a, b) => a.customer_info.name.localeCompare(b.customer_info.name),
      render: (_, { customer_info }) => {
        return <CustomerDetail customer={customer_info} />;
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
      key: "payment_amount",
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return (
          <>
            <div>{new Intl.NumberFormat(locale).format(record.amount_payable)}</div>
          </>
        );
      },
      align: "center",
    },
    {
      key: "paid",
      sorter: (a, b) => a.amount_payable - b.amount_payable,
      render: (_, record) => {
        return (
          <>
            <div>{new Intl.NumberFormat(locale).format(record.total_paid)}</div>
          </>
        );
      },
      align: "center",
    },
    {
      key: "remaining_amount",
      sorter: (a, b) => Number(a.remaining_balance) - Number(b.remaining_balance),
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.remaining_balance);
      },
      align: "center",
    },
    {
      key: "date_of_maturity",
      sorter: (a, b) => dayjs(a.due_date).unix() - dayjs(b.due_date).unix(),
      render: (_, { payment_list }) => {
        return (
          <div>
            {payment_list.length > 0 && (
              <DetailDebtPayment paymentList={payment_list} refetch={refetch} showActions={false} />
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      width: 60,
      dataIndex: "",
      key: "x",
      fixed: "right",
      render: (_, { id }) => (
        <Space size="middle">
          <Popconfirm
            title={t("noficationDelete.deleteDebt")}
            description={t("noficationDelete.debt")}
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

  // Lưu ý: Do phân quyền nên xóa phải dùng qua api của xuất kho.
  const onDelete = async (stockOutId: any) => {
    try {
      await deleteOrder({ stockOutId });
      refetch();
      notification.success({
        message: `${t("noficationDelete.successfullyClearedDebt")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.debtDeletionFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.outstanding_business?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.outstanding_business.find(
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

    return filteredData.map((item: DataType, index) => {
      const dateOfMaturity = item.payment_list && item.payment_list.length > 0
        ? dayjs(item.payment_list[0].payment_date).format("DD/MM/YYYY") // Format ngày thanh toán
        : 'Chưa thanh toán';
      return {
        ...item,
        created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
        order_date: dayjs(item.order_date).format("DD/MM/YYYY"),
        customer: `${item?.customer_info?.name || ""}`,
        order_str: `${item?.order_details_list?.order_str || ""}`,
        date_of_maturity: dateOfMaturity,  // Ngày đến hạn
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
        NVKD: `${item?.user_str?.last_name || ""} ${item?.user_str?.first_name || ""}`,
        key: index + 1,
      };
    });
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
      title: 'NVKD',
      key: 'NVKD',
    },
    {
      title: 'Khách hàng',
      key: "customer",
    },
    {
      title: 'Đơn hàng',
      key: 'ref_code'
    },
    {
      title: 'Sản phẩm',
      key: 'product'
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
      title: "Ngày đến hạn",
      key: "date_of_maturity",
    },
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

  const { data: AllOutstandingAccountantList } = useGetAllOutstandingAccountantListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyCongNo",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllOutstandingAccountantList) {
      const newData = AllOutstandingAccountantList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllOutstandingAccountantList, isExportTriggered]);

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
    fileName: "QuanLyCongNo",
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
    <div className={` w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"}   px-6`}>
      <div className="flex justify-between items-center  py-2 mb-2 max-md:flex-col max-md:gap-3">
        <div className="flex items-center justify-center mb-4">
          <div className="mr-2">
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
            <Form.Item>
              <Input
                placeholder={t("crm.namePhoneEmail")}
                onChange={onSearchChange}
                style={{ width: "300px" }} // Adjust width based on your preference
              />
            </Form.Item>
          </Form>
        </div>
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
            total: outstandingList?.total || 0,
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
