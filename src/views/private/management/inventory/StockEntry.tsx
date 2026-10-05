"use client";

import {
  useGetAllStockEntriesListQuery,
  useGetStockEntriesListQuery,
  useGetWarehouseListQuery,
} from "@/api/Inventory/apiInventory";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import UpdateWarehouse from "@/components/FunctionsManagement/Inventory/UpdateWarehouse";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { DatePicker, Form, Input, Table, Tag, Button, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import Image from "next/image";
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
  cert_no: any;
  origin: any;
  product: any;
  cost_per_item: any;
  key: React.Key;
  id: number;
  date_received: string;
  created: string;
  warehouse_str: string;
  product_info: {
    product_name: string;
    category_str: string;
    image_list: { image: string; atl_text: string }[];
  };
  sku_info: { classify1_str: string; classify2_str: string };
  quantity: number;
}

const initialState = {
  warehouse: [],
};

const StockEntry = () => {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const t: any = useTranslations();
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState(
    params && params.locale === "vi" ? "vi-VN" : "en-US"
  );
  const { data: warehouseList } = useGetWarehouseListQuery();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ stock_entry: [] });

  const [filterObject, setFilterObject] = useState<{
    warehouse: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: stockEntriesList,
    isLoading,
    isError,
    error,
  } = useGetStockEntriesListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    warehouse: filterObject?.warehouse,
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
      const stockEntryData = parsedColumn.stock_entry;
      const stockEntryObject = { stock_entry: stockEntryData };
      setColumnConfig(stockEntryObject);
    }
  }, []);

  const onDateChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    formatString: [string, string]
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

  const onSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    stockEntriesList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Kho hàng",
      data: stockEntriesList?.results,
      displayProps: "warehouse_str",
      key: "warehouse",
    },
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 35,
      align: "center",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return <div>{dayjs(created).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      key: "product",
      sorter: (a, b) =>
        a?.product_info?.product_name?.localeCompare(
          b?.product_info?.product_name,
          undefined,
          { sensitivity: "base" }
        ),
      render: (_, { product_info, sku_info }) => {
        return (
          <div className="mx-3 text-sm font-semibold">
            <div className="flex gap-4 items-center">
              <div>
                <div className="border-2 w-[50px] h-[50px] overflow-hidden">
                  <Image
                    src={product_info.image_list[0]?.image}
                    className="object-cover"
                    width={50}
                    height={50}
                    alt={product_info.image_list[0]?.atl_text}
                  />
                </div>
              </div>
              <div>
                <div className=" font-semibold uppercase">
                  {product_info.product_name}
                </div>
                <div className=" text-sm">{product_info.category_str}</div>
                <div className=" text-sm">
                  {sku_info?.classify1_str} {sku_info?.classify2_str && "/"}{" "}
                  {sku_info?.classify2_str}
                </div>
              </div>
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "warehouse",
      sorter: (a, b) =>
        a?.warehouse_str?.localeCompare(b?.warehouse_str, undefined, {
          sensitivity: "base",
        }),
      render: (_, { warehouse_str }) => (
        <div>
          {warehouse_str ? (
            <Tag className="ml-1" color="#108ee9">
              {warehouse_str}
            </Tag>
          ) : (
            <Tag className="ml-1 !border-lime-700 !text-lime-700">None</Tag>
          )}
        </div>
      ),
      align: "center",
    },
    {
      key: "origin",
      dataIndex: "origin",
      sorter: (a, b) =>
        a?.origin?.localeCompare(b?.origin, undefined, { sensitivity: "base" }),
      align: "center",
    },
    {
      key: "cost_per_item",
      sorter: (a, b) => a.cost_per_item - b.cost_per_item,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.cost_per_item);
      },
      align: "center",
    },
    {
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (_, record) => {
        return new Intl.NumberFormat(locale).format(record.quantity);
      },
      align: "center",
    },
    {
      key: "cert_no",
      dataIndex: "cert_no",
      sorter: (a, b) =>
        a?.cert_no?.localeCompare(b?.cert_no, undefined, {
          sensitivity: "base",
        }),
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
        const configEntry = columnConfig?.stock_entry?.find(
          (entry: { key: number }) => entry.key === column.key
        );
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.stock_entry?.find(
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
      title: 'Kho hàng',
      key: 'warehouse_str'
    },
    {
      title: 'Nguồn gốc',
      key: 'origin',
    },
    {
      title: 'Đơn giá nhập',
      key: "cost_per_item",
    },
    {
      title: 'Số lượng',
      key: 'quantity'
    },
    {
      title: 'Số chứng từ',
      key: 'cert_no'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllStockEntries } = useGetAllStockEntriesListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "NhapKho",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllStockEntries) {
      const newData = AllStockEntries.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllStockEntries, isExportTriggered]);

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
      className={`overflow-x-auto w-screen  ${
        isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-280px)]"
      }   p-6`}
    >
      <div className="flex justify-between items-center px-2 md:px-3 py-2 mb-4 max-md:flex-col max-md:gap-3">
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
          <Form.Item className="max-md:w-full"></Form.Item>
          <Form.Item className="max-md:w-full w-1/2">
            <Input
              placeholder={t("inventory.searchProductCategoryBrandSKUcode")}
              onChange={onSearchChange}
            />
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
          <SelectColumn
            dataColumn={columnConfig}
            setDataColumn={setColumnConfig}
          />
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
            total: stockEntriesList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 700 }}
          bordered
        />
      </div>
    </div>
  );
};

export default StockEntry;
