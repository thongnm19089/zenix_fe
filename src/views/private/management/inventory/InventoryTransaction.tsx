"use client";

import { useGetInventoryTransactionListQuery, useDeleteInventoryTransactionMutation, useGetWarehouseListQuery, useGetAllInventoryTransactionListQuery } from "@/api/Inventory/apiInventory";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from "@/store/store";
import { Button, DatePicker, Form, Input, Popconfirm, Space, Table, Tag, notification, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import ActionTable from "@/components/DropDown/ActionTable";
import dayjs from "dayjs";
import Image from "next/image";
import { useWindowSize } from "@/utils/responsiveSm";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import UpdateInventoryTransaction from "@/components/FunctionsManagement/Inventory/UpdateInventoryTransaction";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import { useGetProductsQuery } from "@/api/Procurement/apiProducts";
import SelectColumn from "@/components/Filter/SelectColumn";
import { IoRefresh } from "react-icons/io5";
import _ from "lodash";
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
  product: any;
  key: React.Key;
  id: number;
  transaction_type: string;
  warehouse_str: any;
  created: string;
  product_info: { product_name: string; category_str: string; image_list: { image: string; atl_text: string }[] };
  sku_info: { classify1_str: string; classify2_str: string };
  quantity: number;
}

const initialState = {
  order: [],
  warehouse: [],
  product: [],
  sku: [],
  transaction_type: [],
}
export default function InventoryTransaction() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const params = useParams();
  const [locale, setLocale] = useState(params && params.locale === "vi" ? "vi-VN" : "en-US");

  const {
    data: warehouseList,
  } = useGetWarehouseListQuery();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const initialStateFilter = {
    order: [],
    warehouse: [],
    product: [],
    sku: [],
    transaction_type: []
  }

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnConfig, setColumnConfig] = useState<any>({ inventory_transaction: [] });
  const [filterObject, setFilterObject] = useState<{
    warehouse: number[];
    transaction_type: string[];
  }>(initialState);

  // Thêm tham số vào hook query
  const {
    data: inventoryTransactionList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetInventoryTransactionListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    warehouse: filterObject.warehouse,
    transaction_type: filterObject.transaction_type,
  });

  const [dataQuery, setDataQuery] = useState({
    page: 1,
    pageSize: 20,
    searchTerm: "",
    category: [],
  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push('/403/');
    }
  }
  const { data: productList, isLoading: isLoadingProduct } =
    useGetProductsQuery(dataQuery);

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
      const inventoryData = parsedColumn.inventory_transaction;
      const inventoryObject = { inventory_transaction: inventoryData };
      setColumnConfig(inventoryObject);
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
  const dataSource = inventoryTransactionList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const [deleteInventoryTransaction, { isLoading: isLoadingDelete }] = useDeleteInventoryTransactionMutation();

  const data = useMemo(() => {
    return inventoryTransactionList?.results.filter((item: { quantity: number }) => item.quantity > 0);
  }, [inventoryTransactionList?.results]);

  const statusArr = [
    { id: "OUT", transaction_type: "Xuất" },
    { id: "IN", transaction_type: "Nhập" }
  ]

  // const transactionArr = (data: any) => {
  //   const newArr: any = [];
  //   data?.forEach((item: any) => {
  //     newArr.push({
  //       id: item[0]?.transaction_type,
  //       transaction_type: item[0]?.transaction_type === "OUT" ? "Xuất" : "Nhập"
  //     });
  //   });
  //   return newArr;
  // };

  const dataArrQuery = [
    {
      id: 2,
      placeholder: `Kho hàng`,
      data: warehouseList?.results,
      displayProps: "name",
      key: "warehouse"
    },
    {
      id: 4,
      placeholder: `Loại giao dịch`,
      data: statusArr,
      displayProps: "transaction_type",
      key: "transaction_type",
    },
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 35,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "status",
      render: (_, { transaction_type }) => {
        return <Tag color={transaction_type === "OUT" ? "#f50" : "#108ee9"}>{transaction_type === "OUT" ? `${t('table.export')}` : `${t('table.import')}`}</Tag>;
      },
      align: "center",
    },
    {
      key: `date_add_export`,
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
      key: "product_info",
      sorter: (a, b) => a?.product_info?.product_name?.localeCompare(b?.product_info?.product_name, undefined, { sensitivity: 'base' }),
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
                <div className=" font-semibold uppercase">{product_info.product_name}</div>
                <div className=" text-sm">{product_info.category_str}</div>
                <div className=" text-sm">
                  {sku_info?.classify1_str} {sku_info?.classify2_str && "/"} {sku_info?.classify2_str}
                </div>
              </div>
            </div>
          </div>
        );
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
      key: "warehouse",
      sorter: (a, b) => a?.warehouse_str?.localeCompare(b?.warehouse_str, undefined, { sensitivity: 'base' }),
      align: "center",
      render: (_, { warehouse_str }) => (
        <div>
          {warehouse_str ? (
            <Tag className="ml-1" color="#108ee9">
              {warehouse_str}
            </Tag>
          )
            : (
              <Tag className="ml-1 !border-lime-700 !text-lime-700">
                None
              </Tag>
            )
          }
        </div>
      ),

    },
    {
      title: ``,
      dataIndex: "",
      key: "x",
      width: width > 640 ? 85 : 30,
      fixed: "right",
      render: (_, { quantity, id }) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <UpdateInventoryTransaction
                    id={id}
                    quantity={quantity}
                    refetch={refetch}
                  />
                ),
              },
              {
                key: "2",
                label: (
                  <>
                    <Popconfirm
                      title={t('noficationDelete.deleteInventoryTransaction')}
                      description={t('noficationDelete.wantToRemoveInventory')}
                      onConfirm={() => onDelete(id)}
                      onCancel={cancel}
                      okText={t('general.confirm')}
                      cancelText={t('table.actionValues.canceltext')}
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
      ),
      align: "center",
    },
  ];

  const onDelete = async (id: any) => {
    try {
      if (id) {
        await deleteInventoryTransaction(id);
        notification.success({
          message: `${t('noficationDelete.successfullyDeletedStock')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.deleteFailedStock')}`,
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
        const configEntry = columnConfig?.inventory_transaction?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.inventory_transaction?.find(
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
      transaction_type: `${item?.transaction_type === "IN" ? "Nhập" : "Xuất"}`,
      product_name: `${item.product_info.product_name.toUpperCase()} - ${item.product_info.category_str} - ${item.sku_info?.classify1_str || ""}${item.sku_info?.classify2_str ? ` / ${item.sku_info?.classify2_str}` : ""}`,
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
      title: 'Trạng thái',
      key: 'transaction_type'
    },
    {
      title: 'Ngày xuất/nhập',
      key: 'created',
    },
    {
      title: 'Mặt hàng',
      key: "product_name",
    },
    {
      title: 'Số lượng',
      key: 'quantity'
    },
    {
      title: 'Kho hàng',
      key: 'warehouse_str'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 35 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30 },
      5: { cellWidth: 35 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllInventoryTransaction } = useGetAllInventoryTransactionListQuery(undefined, {
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
    if (isExportTriggered && AllInventoryTransaction) {
      const newData = AllInventoryTransaction.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllInventoryTransaction, isExportTriggered]);

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
      <div className="flex justify-between items-center py-2 mb-2 max-md:flex-col max-md:gap-3">
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
          <Form.Item className="max-md:w-full w-1/2">
            <Input placeholder={t('inventory.searchProductCategoryBrandSKUcode')} onChange={onSearchChange} />
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
            total: inventoryTransactionList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1100 }}
          bordered
        />
      </div>

    </div>
  );
}
