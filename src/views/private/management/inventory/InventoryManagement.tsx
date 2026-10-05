"use client";

import { useGetAllInventoryByProductQuery, useGetInventoryByProductQuery } from "@/api/Inventory/apiInventory";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import CreateStockEntry from "@/components/FunctionsManagement/Inventory/CreateStockEntry";
import StockEntryDetail from "@/components/FunctionsManagement/Inventory/StockEntryDetail";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import ActionTable from "@/components/DropDown/ActionTable";
import { Form, Input, Table, Button, Dropdown } from "antd";
import { ColumnsType } from "antd/lib/table";
import dayjs from "dayjs";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useGetBrandListQuery, useGetCategoryListQuery } from "@/api/Procurement/apiProducts";
import { useParams, useRouter } from "next/navigation";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
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

interface DataType {
  specifications: any;
  unit_of_measure: any;
  id: number;
  image_list: { image: string; atl_text: string }[];
  product_name: string;
  product_code: string | null;
  category_str: string;
  total_quantity: number;
  brand_str: string;
  sku_list: {
    id: number;
    classify1_str: string;
    classify2_str: string;
    sku_code: string;
    total_quantity: number;
  }[];
  sku: {
    id: number;
    name: string;
    sku_code: string;
    classify1_str: string;
    classify2_str: string;
    total_quantity: number
  };
}

const initialState = {
  brand: [],
  category: [],
}

const useTransformArray = (data: any) => {
  return useMemo(() => {
    return data?.flatMap((item: any) => {
      if (item.sku_list.length === 0) {
        return [{ ...item, sku: { id: null, name: "" }, key: item.id }];
      } else {
        return item.sku_list.map((skuItem: any) => ({
          ...item,
          sku: skuItem,
          key: item.id
        }));
      }
    });
  }, [data]);
};

const { Search } = Input;

export default function InventoryManagement() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const { data: categoryList } = useGetCategoryListQuery();
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
  const [columnConfig, setColumnConfig] = useState<any>({ inventory_management: [] });
  const [filterObject, setFilterObject] = useState<{
    brand: number[];
    category: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: productList,
    isLoading,
    isError,
    error,
  } = useGetInventoryByProductQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
    brand: filterObject.brand,
    category: filterObject.category,
  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push('/403/');
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
      const inventoryData = parsedColumn.inventory_management;
      const inventoryObject = { inventory_management: inventoryData };
      setColumnConfig(inventoryObject);
    }
  }, []);

  const onSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  const productData = useTransformArray(productList?.results);

  const categoryFilters =
    categoryList?.results?.map((category: { category_name: any }) => ({
      text: category.category_name,
      value: category.category_name,
    })) || [];

  categoryFilters.push({ text: "Null", value: "null" });
  const { data: brandList } = useGetBrandListQuery();
  const dataArrQuery = [
    {
      id: 1,
      placeholder: `${t("admin.brand")}`,
      data: brandList?.results,
      displayProps: "brand_name",
      key: "brand"
    },
    {
      id: 2,
      placeholder: `${t('table.categories')}`,
      data: categoryList?.results,
      displayProps: "category_name",
      key: "category"
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
      key: "product_code",
      sorter: (a, b) => a?.sku?.sku_code?.localeCompare(b?.sku?.sku_code, undefined, { sensitivity: 'base' }),
      render: (_, { sku, product_code }) => {
        return (
          <div>
            {sku.id ? (
              <div className="font-semibold">{sku.sku_code}</div>
            ) : (
              <div className="font-semibold">{product_code || ""}</div>
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "product_name",
      sorter: (a, b) => a?.product_name?.localeCompare(b?.product_name, undefined, { sensitivity: 'base' }),
      render: (_, { product_name, image_list, sku }) => {
        return (
          <div className=" text-sm font-semibold">
            <div className="flex gap-4 items-center">
              <div>
                <div className="border-2 w-[50px] h-[50px] overflow-hidden">
                  <Image
                    src={image_list[0]?.image}
                    className="object-cover"
                    width={50}
                    height={50}
                    alt={image_list[0]?.atl_text}
                  />
                </div>
              </div>
              <div>
                <div className=" font-semibold uppercase">{product_name}</div>
                <div className=" text-sm">
                  {sku?.classify1_str} {sku?.classify2_str && "/"} {sku?.classify2_str}
                </div>
              </div>
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "brand",
      dataIndex: "brand_str",
      align: "center",
    },
    {
      key: "categories",
      sorter: (a, b) => a?.category_str?.localeCompare(b?.category_str, undefined, { sensitivity: 'base' }),
      dataIndex: "category_str",
      align: "center",
    },
    {
      key: "specifications",
      sorter: (a, b) => a?.specifications?.localeCompare(b?.specifications, undefined, { sensitivity: 'base' }),
      dataIndex: "specifications",
      align: "center",
    },
    {
      key: "unit_of_measure",
      dataIndex: "unit_of_measure",
      sorter: (a, b) => a?.unit_of_measure?.localeCompare(b?.unit_of_measure, undefined, { sensitivity: 'base' }),
      align: "center",
    },
    {
      key: "quantity",
      sorter: (a, b) => {
        // Lấy số lượng của SKU hoặc số lượng tổng cộng nếu không có SKU
        const quantityA = a.sku && a.sku.total_quantity ? a.sku.total_quantity : a.total_quantity;
        const quantityB = b.sku && b.sku.total_quantity ? b.sku.total_quantity : b.total_quantity;
        return quantityA - quantityB;
      },
      render: (_, record) => {
        // Tương tự như trên, hiển thị số lượng của SKU hoặc số lượng tổng cộng
        const quantity = record.sku.id ? record.sku.total_quantity : record.total_quantity;
        return new Intl.NumberFormat(locale).format(quantity);
      },
      align: "center",
    },
    {
      width: width > 640 ? 165 : 35,
      key: "x",
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <CreateStockEntry productId={record.id} skuId={record.sku.id} />
                ),
              },
              {
                key: "2",
                label: (
                  <StockEntryDetail data={record} />
                ),
              },
            ]}
          />


        </div>
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
        const configEntry = columnConfig?.inventory_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.inventory_management?.find(
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

    return filteredData?.map((item: DataType, index) => ({
      ...item,
      sku_code: item?.sku_list?.length > 0
        ? item.sku_list.map((sku: any) => sku.sku_code).join(", ")
        : item.product_code || "",
      product_name: item?.sku_list?.length > 0 ? item?.sku_list.map((sku: any) => sku.product_str).join(", ") : "",
      key: index + 1,
    }));
  };

  const convertedData = convertData(productList?.results);

  const fileColumns: ColumnsType<DataType> = [
    {
      title: 'STT',
      key: 'key',
    },
    {
      title: 'Mã sản phẩm',
      key: 'sku_code'
    },
    {
      title: 'Tên sản phẩm',
      key: 'product_name'
    },
    {
      title: 'Thương hiệu',
      key: 'brand_str',
    },
    {
      title: 'Danh mục',
      key: "category_str",
    },
    {
      title: 'Quy cách',
      key: 'specifications'
    },
    {
      title: 'Đơn vị tính',
      key: 'unit_of_measure'
    },
    {
      title: 'Số lượng',
      key: 'total_quantity'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllInventoryByProduct } = useGetAllInventoryByProductQuery(undefined, {
    skip: !isExportTriggered,
  })


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyTonKho",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllInventoryByProduct) {
      const newData = AllInventoryByProduct.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllInventoryByProduct, isExportTriggered]);

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
    fileName: "QuanLyTonKho",
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
          <Form.Item className="max-md:w-full w-full">
            <Search placeholder={t('inventory.searchProductCategoryBrandSKUcode')} onChange={onSearchChange} />
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
            children={undefined}
            setPagination={setPagination}
            pagination={pagination}
            isLoading={isLoading}
            initialState={initialState}
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
          dataSource={productData}
          pagination={{
            ...pagination,
            total: productList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          scroll={{ x: 700 }}
        />
      </div>
    </div>
  );
}
