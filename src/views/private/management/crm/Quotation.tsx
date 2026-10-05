"use client";

import { useDeleteQuotationMutation, useGetAllQuotationListQuery, useGetQuotationListQuery } from "@/api/CRM/apiQuotation";
import QuotationDetail from "@/components/FunctionsManagement/CRM/Quotation/QuotationDetail";
import PrintQuotation from "@/components/FunctionsManagement/CRM/Quotation/PrintQuotation";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, DatePicker, Form, Input, Popconfirm, Space, Table, Tag, notification, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import SelectColumn from "@/components/Filter/SelectColumn";
import ActionTable from "@/components/DropDown/ActionTable";
import { useWindowSize } from "@/utils/responsiveSm";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";
import { RiDeleteBin2Line } from "react-icons/ri";
import { TimeRangePickerProps } from "antd/lib";

const { RangePicker } = DatePicker;

interface DataType {
  cert_no: any;
  origin: any;
  product: any;
  cost_per_item: any;
  key: React.Key;
  id: number;
  quotation_date: string;
  sku_info: { classify1_str: string; classify2_str: string };
  total_price: number;
  discount: number;
  tax: number;
  address: string;
  ward: string;
  district: string;
  city: string;
}


const Quotation = () => {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const params = useParams();

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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ sales_consulting_management: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
  const {
    data: quotationList,
    isLoading,
    isError,
    error,
  } = useGetQuotationListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
  });

  const [deleteQuotation, { isLoading: isLoadingDelete }] = useDeleteQuotationMutation();

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const quotationData = parsedColumn.quotation;
      const quotationObject = { quotation: quotationData };
      setColumnConfig(quotationObject);
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
  const dataSource =
    quotationList?.results.map((record: { id: any }) => ({
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
      // dataIndex: "quotation_date",
      sorter: (a, b) => dayjs(a.quotation_date).unix() - dayjs(b.quotation_date).unix(),
      render: (_, { quotation_date }) => {
        return <div>{dayjs(quotation_date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
      // width: 100,
    },
    {
      key: "ref_code",
      // title: `Báo giá`,
      // width: 200,
      sorter: (a, b) => a.discount - b.discount,
      render: (_, record) => {
        return <QuotationDetail quotation={record} />;
      },
      align: "center",
    },
    {
      key: "name",
      // title: `Khách hàng`,
      dataIndex: "customer_name",
      align: "center",
      // width: 300,
    },
    {
      key: "mobile",
      // title: `Số điện thoại`,
      dataIndex: "mobile",
      align: "center",
    },
    {
      key: "email",
      // title: `Email`,
      dataIndex: "email",
      align: "center",
    },

    {
      key: "address",
      // title: `${t("user.address")}`,
      // dataIndex: "address",
      render: (_, { address, ward, district, city }) => {
        return (
          <div>
            {address} {ward && "," + ward} {district && "," + district} {city && "," + city}
          </div>
        );
      },
      align: "center",
    },

    {
      key: "price",
      // title: `Thành tiền`,
      // dataIndex: "total_price",
      width: 150,
      sorter: (a, b) => a.total_price - b.total_price,

      render: (_, record) => {
        return new Intl.NumberFormat("vi").format(record.total_price);
      },
      align: "right",
    },
    {
      title: "",
      dataIndex: "",
      key: "action", // Changed from "x" to "action" for clarity
      width: width > 640 ? 160 : 35,
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
                      onClick={() => router.push(`quotation/edit-quotation/${record.id}`)} size="small">
                      {t("general.edit")}
                    </Button>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title="Xóa báo giá"
                      description="Bạn có chắc chắn muốn xóa báo giá"
                      onConfirm={() => onDelete(record.id)}
                      okText={t("general.confirm")}
                      cancelText={t("general.cancel")}
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
                    <PrintQuotation detail={record} />

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

  const onDelete = async (id: any) => {
    try {
      await deleteQuotation(id);
      notification.success({
        message: `Xóa báo giá thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Xóa báo giá thật bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.quotation?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.quotation?.find(
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
      setMenuName("Hành động");``
      setSelectedRowKeys([]);
    }
  };

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      total_price: Math.floor(item.total_price),
      quotation_date: dayjs(item.quotation_date).format("DD/MM/YYYY"),
      address: `${item.address || ""}${item.ward ? `, ${item.ward}` : ""}${item.district ? `, ${item.district}` : ""}${item.city ? `, ${item.city}` : ""}`,
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
      title: 'Ngày báo giá',
      key: 'quotation_date'
    },
    {
      title: 'Mã báo giá',
      key: 'ref_code'
    },
    {
      title: 'Khách hàng',
      key: 'customer_name',
    },
    {
      title: 'Số điện thoại',
      key: "mobile",
    },
    {
      title: 'Email',
      key: 'email'
    },
    {
      title: 'Địa chỉ',
      key: 'address'
    },
    {
      title: 'Thành tiền',
      key: 'total_price'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 },
      8: { cellWidth: 50 },
      9: { cellWidth: 30 },
    }
  }


  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllQuotationList } = useGetAllQuotationListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "DanhSachBaoGia",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllQuotationList) {
      const newData = AllQuotationList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllQuotationList, isExportTriggered]);

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

  const rangePresets: TimeRangePickerProps['presets'] = [
    { label: `${t("rangePreset.Last 7 days")}`, value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: `${t("rangePreset.Last Month")}`, value: [dayjs().add(-1, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last three Months")}`, value: [dayjs().add(-3, 'month'), dayjs()] },
    { label: `${t("rangePreset.Last Year")}`, value: [dayjs().add(-1, 'year'), dayjs()] },
    { label: `${t("rangePreset.Last two Year")}`, value: [dayjs().add(-2, 'year'), dayjs()] },
  ];

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
      <div className="flex justify-between items-center px-2 md:px-3 py-2 mb-4">
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

        <Form layout="inline" className="flex gap-2 w-full items-center">
          <Form.Item className="flex-grow">
            <RangePicker
              presets={rangePresets}
              onChange={onDateChange}
              placeholder={[`${t("general.startDate")}`, `${t("general.endDate")}`]}
              className="w-full"
            />
          </Form.Item>
          <Form.Item className="flex-grow">
            <Input
              placeholder={t("inventory.searchProductCategoryBrandSKUcode")}
              onChange={onSearchChange}
              className="w-full"
            />
          </Form.Item>

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
            <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
            <Button type="primary" onClick={() => router.push("quotation/add-quotation")} size="middle">
              {t("noficationAddAndUpdate.createQuotation")}
            </Button>
          </div>
        </Form>
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
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: quotationList?.total || 0,
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
};

export default Quotation;
