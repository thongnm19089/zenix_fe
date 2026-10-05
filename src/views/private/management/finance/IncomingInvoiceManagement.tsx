"use client";

import {
  useDeleteIncomingInvoiceMutation,
  useGetAllIncomingInvoiceListQuery,
  useGetIncomingInvoiceListQuery,
} from "@/api/Finance/apiInvoice";
import { useGetSetupFinanceAppQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import { useWindowSize } from "@/utils/responsiveSm";
import Filter from "@/components/Filter/Filter";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import AddAndUpdateIncomingInvoice from "@/components/FunctionsManagement/Finance/AddAndUpdateIncomingInvoice";
import { RootState } from "@/store/store";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
  notification,
  Dropdown
} from "antd";
import type { ColumnsType } from "antd/es/table";
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

// Cập nhật DataType
interface DataType {
  key: React.Key;
  id: number;
  created: string;
  user: number;
  invoice_date: string;
  invoice_file: any;
  amount: any;
  seller_name: string;
  seller_mobile: string;
  seller_email: string;
  seller_tax_code: string;
  seller_address: string;
  title: string;
  detail: string;
  rate: number;
  is_valid: boolean;
  user_str: string;
  rate_str: string;
}

const initialState = {
  rate: [],
}

export default function IncomingInvoiceManagement() {
  const [width] = useWindowSize();
  const t: any = useTranslations();
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
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
  const [columnConfig, setColumnConfig] = useState<any>({ incoming_invoice_management: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);

  const [filterObject, setFilterObject] = useState<{
    rate: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: incomingInvoiceList,
    isLoading,
    refetch,
    error,
  } = useGetIncomingInvoiceListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    rate: filterObject?.rate,
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

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const paymentManagementData = parsedColumn.incoming_invoice_management;
      const paymentManagementObject = { incoming_invoice_management: paymentManagementData };
      setColumnConfig(paymentManagementObject);
    }
  }, []);

  const onDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
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

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    incomingInvoiceList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteIncomingInvoice, { isLoading: isLoadingDelete }] =
    useDeleteIncomingInvoiceMutation();
  const { data: setupFinanceApp } = useGetSetupFinanceAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Thuế suất",
      data: setupFinanceApp?.tax_rate_list,
      displayProps: "code",
      key: "rate",
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
            {dayjs(created).format("HH:mm")}{" "}
            {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      key: "invoice_date",
      sorter: (a, b) =>
        dayjs(a.invoice_date).unix() - dayjs(b.invoice_date).unix(),
      render: (_, { invoice_date }) => dayjs(invoice_date).format("DD/MM/YYYY"),
      align: "center",
    },
    {
      key: "amount_of_money",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.amount);
      },
      align: "center",
    },
    {
      key: "seller_information",
      render: (_, record) => (
        <CustomerDetail
          customer={{
            name: record.seller_name,
            mobile: record.seller_mobile,
            email: record.seller_email,
            address: record.seller_address,
          }}
        />
      ),
      align: "center",
    },
    {
      dataIndex: "rate_str",
      key: "rate",
      align: "center",
    },
    {
      key: "is_valid",
      align: "center",
      render: (_, { is_valid }) =>
        is_valid ? (
          <CheckCircleOutlined className="text-center text-green-500" rev={undefined} />
        ) : (
          <CloseCircleOutlined className="text-center text-red-500" rev={undefined} />
        ),
    },
    {
      key: "detail",
      align: "center",
      render: (_, record) =>
        <p>{record?.detail}</p>
    },
    {
      key: "file",
      align: "center",
      render: (_, record) => (
        <div>
          {record?.invoice_file && (
            <a
              href={record?.invoice_file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {t("admin.view")}
            </a>
          )}
        </div>
      )
    },
    {
      title: ``,
      dataIndex: "",
      key: "x",
      fixed: "right",
      width: width > 640 ? 125 : 35,
      render: (_, { id }) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <AddAndUpdateIncomingInvoice edit={true} invoiceId={id} />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={t("noficationDelete.costCategorySure")}
                      description={t("noficationDelete.costCategorySure")}
                      onConfirm={() => onDelete(id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("table.actionValues.canceltext")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">Xóa</div>
                    </Popconfirm>
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

  const onDelete = async (invoiceId: any) => {
    try {
      await deleteIncomingInvoice({ invoiceId });
      notification.success({
        message: `${t("noficationDelete.costCategorySuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.costCategoryError")}`,
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
        const configEntry = columnConfig?.incoming_invoice_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.incoming_invoice_management?.find(
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
      invoice_date: dayjs(item.invoice_date).format("DD/MM/YYYY"),
      amount: new Intl.NumberFormat('vi-VN').format(item.amount),
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
      title: 'Tiêu đề',
      key: 'title'
    },
    {
      title: 'Ngày hóa đơn',
      key: 'invoice_date',
    },
    {
      title: 'Số tiền(VND)',
      key: "amount",
    },
    {
      title: 'Thông tin',
      key: 'seller_name'
    },
    {
      title: 'Thuế suất',
      key: 'rate_str'
    },
    {
      title: 'Hợp lệ',
      key: 'is_valid'
    },
    {
      title: 'Chi tiết',
      key: 'detail'
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

  const { data: AllIncomingInvoiceList } = useGetAllIncomingInvoiceListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "HoaDonDauVao",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllIncomingInvoiceList) {
      const newData = AllIncomingInvoiceList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllIncomingInvoiceList, isExportTriggered]);

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
    fileName: "HoaDonDauVao",
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
      className={`overflow-x-auto w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        } p-6`}
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
          <Form.Item className="max-md:w-full w-1/2 mb-3">
            <Input
              placeholder={t("finance.searchTitleCategoryBeneficiary")}
              onChange={onSearchChange}
            />
          </Form.Item>
        </Form>
        <div className="flex gap-2 items-center ml-auto pr-2">
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
        <div className="flex justify-end text-right max-md:w-full w-1/2 gap-2">
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
          <AddAndUpdateIncomingInvoice />
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
            total: incomingInvoiceList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1300 }}
          bordered
        />
      </div>
    </div>
  );
}
