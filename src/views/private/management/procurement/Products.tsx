"use client";

import {
  useDeleteBrandMutation,
  useDeleteCategoryMutation,
  useDeleteProductMutation,
  useGetBrandListQuery,
  useGetCategoryListQuery,
  useGetProductsQuery,
  useGetClassifyListsQuery,
  useDeleteClassifyListMutation,
  useDeleteSkuMutation,
  useGetAllProductQuery,
} from "@/api/Procurement/apiProducts";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateBrand from "@/components/FunctionsManagement/CRM/Products/AddAndUpdateBrand";
import AddAndUpdateCategory from "@/components/FunctionsManagement/CRM/Products/AddAndUpdateCategory";
import AddAndUpdateProductClassification from "@/components/FunctionsManagement/CRM/Products/AddAndUpdateProductClassification";
import LinkProductModal from "@/components/FunctionsManagement/CRM/Products/LinkProductModal";
import UpdateSku from "@/components/FunctionsManagement/CRM/Products/UpdateSku";
import AddSupplier from "@/components/FunctionsManagement/Procurement/AddSupplier";
import { RootState } from "@/store/store";
import { IProduct } from "@/types/productType";
import { Button, Form, Input, List, Popconfirm, Space, Table, Tabs, notification, Dropdown } from "antd";
import type { TabsProps } from "antd";
import { useWindowSize } from "@/utils/responsiveSm";
import ActionTable from "@/components/DropDown/ActionTable";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Image from "next/image";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
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

interface ClassifyItem {
  id: number;
  created: string;
  user: number;
  list: number;
  title: string;
  list_str: string;
}

interface itemClassifyListProps {
  products: any;
  id: number; // ID của ClassifyList
  title: string; // Tiêu đề của ClassifyList
  classify_list: ClassifyItem[]; // Danh sách các Classify liên quan
  onDelete(id: number): void; // Hàm xóa ClassifyList dựa trên ID
  // Bạn có thể thêm các props khác nếu cần thiết
}

interface ListItemProps {
  category_name: string;
  id: number;
  brand_name: string;
  name: string;
}

const initialState = {
  category: [],
};

const { Search } = Input;

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

// sản phẩm
const ProductList = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const { data: categoryList } = useGetCategoryListQuery();

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
  const [columnConfig, setColumnConfig] = useState<any>({ product_list: [] });
  const [skipApi, setSkipApi] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    category: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const { data: productList, isLoading, refetch } = useGetProductsQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
    category: filterObject?.category,
  });

  console.log("productList", productList)

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
      const productListData = parsedColumn.product_list;
      const productListObject = { product_list: productListData };
      setColumnConfig(productListObject);
    }
  }, []);

  const productData = useTransformArray(productList?.results);

  const [deleteProduct, { isLoading: isLoadingDeleteProduct }] = useDeleteProductMutation();
  const [deleteSku, { isLoading: isLoadingDeleteSku }] = useDeleteSkuMutation();

  const onDeleteProduct = async (productId: any) => {
    try {
      await deleteProduct({ productId });
      notification.success({
        message: `${t("noficationDelete.thisProduct")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.failedProduct")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onDeleteSku = async (skuId: any) => {
    try {
      await deleteSku({ skuId });
      notification.success({
        message: `${t("noficationDelete.thisProduct")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.failedProduct")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Danh mục",
      data: categoryList?.results,
      displayProps: "category_name",
      key: "category",
    },
  ];

  const columns: ColumnsType<IProduct> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "product_code",
      sorter: (a, b) =>
        a?.sku?.name?.localeCompare(b?.sku?.name, undefined, {
          sensitivity: "base",
        }),
      render: (_, { sku, product_code, classify_list_list }) => {
        return (
          <div>
            {sku.id ? (
              <UpdateSku
                sku={sku}
                code={sku.sku_code}
                classifyListId={classify_list_list.map((item: { id: number }) => item.id)}
              />
            ) : (
              product_code || ""
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "product_name",
      sorter: (a, b) =>
        a?.product_name?.localeCompare(b?.product_name, undefined, {
          sensitivity: "base",
        }),
      render: (_, { product_name, image_list, sku }) => {
        return (
          <div className=" text-sm font-semibold">
            <div className="flex gap-4 items-center">
              <div>
                <div className="border-2 w-[45px] h-[45px] overflow-hidden">
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
      key: "categories",
      sorter: (a, b) =>
        a?.category_str?.localeCompare(b?.category_str, undefined, {
          sensitivity: "base",
        }),
      dataIndex: "category_str",
      align: "center",
    },
    {
      key: "supplier_info",
      render: (_, { supplier_info, id }) => {
        return <AddSupplier data={supplier_info} productId={id} />;
      },
      align: "center",
    },
    {
      key: "specifications",
      sorter: (a, b) =>
        a?.specifications?.localeCompare(b?.specifications, undefined, {
          sensitivity: "base",
        }),
      dataIndex: "specifications",
      align: "center",
    },
    {
      key: "unit_of_measure",
      dataIndex: "unit_of_measure",
      sorter: (a, b) =>
        a?.unit_of_measure?.localeCompare(b?.unit_of_measure, undefined, {
          sensitivity: "base",
        }),
      align: "center",
    },
    {
      key: "price",
      dataIndex: "skuList",
      render: (_, { base_price, sku }) => {
        return new Intl.NumberFormat("vi-VN").format(base_price + (sku.price || 0));
      },
      sorter: (a, b) => {
        const priceA = a.base_price + (a.sku.price || 0);
        const priceB = b.base_price + (b.sku.price || 0);
        return priceA - priceB;
      },
      align: "center",
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: width > 640 ? 125 : 45,
      fixed: "right",
      render: (_, { id, sku }) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <Button type={width < 640 ? "text" : "primary"}
                    className={` ${width > 640 ? "bg-teal-600 hover:!bg-teal-500" : ""}`}
                    block onClick={() => router.push(`product-list/edit-product/${id}`)} size="small">
                    {t("general.edit")}
                  </Button>
                ),
              },
              {
                key: "2",
                label: (
                  <>
                    <Popconfirm
                      title={t("noficationDelete.thisProduct")}
                      description={t("noficationDelete.deleteThisProduct")}
                      onConfirm={() => (sku.id ? onDeleteSku(sku.id) : onDeleteProduct(id))}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("table.actionValues.canceltext")}
                      placement="left"
                      okButtonProps={{
                        loading: isLoadingDeleteProduct || isLoadingDeleteSku,
                      }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">Xóa</div>
                    </Popconfirm>
                  </>
                ),
              },
            ]}
          />
        </div>
      ),
      align: "center",
    },
  ];

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.product_list?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.product_list?.find(
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
  }

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động"); ``
      setSelectedRowKeys([]);
    }
  };


  const convertData = (data: IProduct[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: IProduct) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData?.map((item: IProduct, index) => ({
      ...item,
      sku_code: item?.sku_list?.length > 0
        ? item.sku_list.map((sku: any) => sku.sku_code).join(", ")
        : item.product_code || "",
        supplier: item?.supplier_info?.length > 0 ? item?.supplier_info.map((sup: any) => sup.name).join(", ") : "",
      product_name: item?.sku_list?.length > 0 ? item?.sku_list.map((sku: any) => sku.product_str).join(", ") : "",
      key: index + 1,
    }));
  };

  const convertedData = convertData(productList?.results);

  const fileColumns: ColumnsType<IProduct> = [
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
      title: 'Danh mục',
      key: 'category_str',
    },
    {
      title: 'Nhà cung cấp',
      key: "supplier",
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
      title: 'Đơn giá',
      key: 'base_price'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 35 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllProduct } = useGetAllProductQuery(undefined, {
    skip: !isExportTriggered,
  })


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "SanPham",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllProduct) {
      const newData = AllProduct.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllProduct, isExportTriggered]);

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
    fileName: "SanPham",
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
      className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-180px)]" : "md:w-[calc(100vw-310px)]"}`}
    >
      <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:gap-3">
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
          <Form.Item className="max-md:w-full w-full">
            <Search className="w-80" placeholder={t("inventory.searchProductCategoryBrandSKUcode")} onChange={onSearchChange} />
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
            isLoading={isLoading}
            initialState={initialState}
            setPagination={setPagination}
            pagination={pagination}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <Button type="primary" onClick={() => router.push("product-list/add-product")} size="middle">
            {t("user.createNewProducts")}
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
          dataSource={productData}
          pagination={{
            ...pagination,
            total: productList?.total || 0,
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

// nhóm phân loại
const ProductClassification = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-black-500" : "bg-yellow-200";
  const { data: classifyListList } = useGetClassifyListsQuery();
  const [deleteClassifyList, { isLoading: isLoadingDelete }] = useDeleteClassifyListMutation();

  // State để quản lý việc hiển thị modal liên kết sản phẩm
  const [classifyListToLink, setClassifyListToLink] = useState<number | null>(null);

  const showLinkProductModal = (classifyListId: number) => {
    setClassifyListToLink(classifyListId);
  };

  const onDelete = async (classifyListId: any) => {
    try {
      await deleteClassifyList({ classifyListId });
      notification.success({
        message: `${t("noficationDelete.deletedSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.deleteFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4">
        <AddAndUpdateProductClassification />
      </div>

      <List<itemClassifyListProps>
        className="w-full mb-4"
        bordered
        itemLayout="horizontal"
        dataSource={classifyListList?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <div className="flex gap-2">
                <ActionTable
                  items={[
                    {
                      key: "1",
                      label: (
                        <AddAndUpdateProductClassification edit={true} classifyListId={item.id} />
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <>
                          <Button type={width < 640 ? "text" : "default"} className={` ${width < 640}`} block onClick={() => showLinkProductModal(item.id)} size="small">
                            {t("admin.link")}
                          </Button>
                        </>
                      ),
                    },
                    {
                      key: "3",
                      label: (
                        <>
                          <Popconfirm
                            title={t("noficationDelete.taxonomyGroup")}
                            description={t("noficationDelete.wantTaxonomyGroup")}
                            onConfirm={() => onDelete(item.id)}
                            onCancel={cancel}
                            okText={t("general.confirm")}
                            cancelText={t("general.confirm")}
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
              </div>
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={
                <>
                  {item.classify_list?.map((classify) => classify.title).join(", ")}
                  {item.products?.length > 0 && (
                    <div className={`${bgColor} font-bold mt-2`}>
                      {t("admin.linkedWith")} {item.products.length} sản phẩm
                    </div>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
      {classifyListToLink !== null && (
        <LinkProductModal classifyListId={classifyListToLink} onClose={() => setClassifyListToLink(null)} />
      )}
    </>
  );
};

// nhãn hiệu
const Brand = () => {
  const t: any = useTranslations();
  const { data: brandList } = useGetBrandListQuery();
  const [deleteBrand, { isLoading: isLoadingDelete }] = useDeleteBrandMutation();

  const onDelete = async (brandId: any) => {
    try {
      await deleteBrand({ brandId });
      notification.success({
        message: `${t("noficationDelete.brandRemovalSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.brandRemovalFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };
  return (
    <>
      <div className="flex justify-end mb-4">
        <AddAndUpdateBrand />
      </div>
      <List<ListItemProps>
        className="w-full mb-4"
        bordered
        itemLayout="horizontal"
        dataSource={brandList?.results || []}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <div className="flex gap-2">
                <ActionTable
                  items={[
                    {
                      key: "1",
                      label: (
                        <AddAndUpdateBrand edit={true} brandId={item.id} brandName={item.brand_name} />
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <>
                          <Popconfirm
                            title={t("noficationDelete.removeThisBrand")}
                            description={t("noficationDelete.wantBrand")}
                            onConfirm={() => onDelete(item.id)}
                            onCancel={cancel}
                            okText={t("general.confirm")}
                            cancelText={t("table.actionValues.canceltext")}
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
              </div>


            ]}
          >
            <List.Item.Meta title={item.brand_name} />
          </List.Item>
        )}
        locale={{ emptyText: `${t("admin.noBrandYet")}` }}
      />
    </>
  );
};

// danh mục
const Category = () => {
  const t: any = useTranslations();
  const { data: categoryList } = useGetCategoryListQuery();
  const [deleteCategory, { isLoading: isLoadingDelete }] = useDeleteCategoryMutation();

  const onDelete = async (categoryId: any) => {
    try {
      await deleteCategory({ categoryId });
      notification.success({
        message: `${t("noficationDelete.directorySuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.deleteCategoryFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };
  return (
    <>
      <div className="flex justify-end mb-4">
        <AddAndUpdateCategory categoryData={categoryList?.results} />
      </div>
      <List<ListItemProps>
        className="w-full mb-4"
        bordered
        itemLayout="horizontal"
        dataSource={categoryList?.results || []}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <div className="flex gap-2">
                <ActionTable
                  items={[
                    {
                      key: "1",
                      label: (
                        <AddAndUpdateCategory
                          edit={true}
                          categoryId={item.id}
                          categoryName={item.category_name}
                          categoryData={categoryList?.results}
                        />
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <>
                          <Popconfirm
                            title={t("noficationDelete.room")}
                            description={t("noficationDelete.roomSure")}
                            onConfirm={() => onDelete(item.id)}
                            onCancel={cancel}
                            okText={t("general.confirm")}
                            cancelText={t("table.actionValues.canceltext")}
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
              </div>


            ]}
          >
            <List.Item.Meta title={item.category_name} />
          </List.Item>
        )}
        locale={{ emptyText: `${t("admin.noBrandYet")}` }}
      />
    </>
  );
};

const Products: React.FC = () => {
  const t: any = useTranslations();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `${t("nav.products")}`,
      children: <ProductList />,
    },
    {
      key: "2",
      label: `${t("admin.classificationGroup")}`,
      children: <ProductClassification />,
    },
    {
      key: "3",
      label: `${t("admin.brand")}`,
      children: <Brand />,
    },
    {
      key: "4",
      label: `${t("table.categories")}`,
      children: <Category />,
    },
  ];

  return (
    <div className="px-3">
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  )
};

export default Products;
