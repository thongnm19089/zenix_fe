"use client";

import {
  useGetSupplierListQuery,
  useDeleteSupplierMutation,
  useGetPaymentTermsQuery,
  useGetAllSupplierListQuery,
} from "@/api/Procurement/apiProcurement";
import { useGetBrandListQuery } from "@/api/Procurement/apiProducts";
import { useGetSetupProcurementAppQuery } from "@/api/SetUp/apiSetup";
import Filter from "@/components/Filter/Filter";
import AddAndUpdateSupplierManagement from "@/components/FunctionsManagement/Procurement/AddAndUpdateSupplierManagement";
import { RootState } from "@/store/store";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Form, Input, Space, Table, Popconfirm, DatePicker, Button, notification, Tag, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useWindowSize } from "@/utils/responsiveSm";
import ActionTable from "@/components/DropDown/ActionTable";
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

// Cập nhật DataType

interface DetailedRating {
  criteria_title: string;
  score: string;
  comment: string;
}

interface PaymentTermInfo {
  id: number;
  created: string;
  title: string;
  color: string;
  user: number;
}

interface DataType {
  key: React.Key;
  id: number;
  created: string;
  user: number;
  name: string;
  short_name: string;
  MST: string; // Ma So Thue
  logo: string | null;
  address: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  mobile: string;
  payment_term: number | null;
  payment_term_info: PaymentTermInfo | null; // Cập nhật ở đây
  banking_account: string | null;
  brands: any;
  user_info: string;
  brand_info: any;
  average_rating: number | null;
  detailed_ratings: DetailedRating | null;
}

const initialState = {
  brands: [],
  payment_term: [],
};

export default function SupplierManagement() {
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
  const [columnConfig, setColumnConfig] = useState<any>({ supplier_management: [] });

  const [filterObject, setFilterObject] = useState<{
    brands: number[];
    payment_term: number[];
  }>(initialState);

  const {
    data: supplierList,
    isLoading,
    refetch,
    error,
  } = useGetSupplierListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    payment_term: filterObject?.payment_term,
    brands: filterObject?.brands,
  });

  console.log("supplierList", supplierList)

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const supplierData = parsedColumn.supplier_management;
      const supplierObject = { supplier_management: supplierData };
      setColumnConfig(supplierObject);
    }
  }, []);

  const onDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, formatString: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange([]);
    }
    setPagination({ ...pagination, current: 1 });
  };

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource = supplierList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const [deleteSupplier, { isLoading: isLoadingDelete }] = useDeleteSupplierMutation();
  const { data: paymentTermList } = useGetPaymentTermsQuery();
  const { data: brandList } = useGetBrandListQuery();
  const { data: setUpProcurementApp } = useGetSetupProcurementAppQuery();
  const [skipApi, setSkipApi] = useState(false);
  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Thương hiệu",
      data: brandList?.results,
      displayProps: "brand_name",
      key: "brands",
    },
    {
      id: 1,
      placeholder: "Điều khoản thanh toán",
      data: setUpProcurementApp?.payment_term_list,
      displayProps: "title",
      key: "payment_term",
    },
  ];

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
            {dayjs(created).format("HH:mm")} - {""}
            {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      dataIndex: "name",
      key: "supplier_name",
      align: "center",
    },
    {
      dataIndex: "MST",
      key: "MST",
      align: "center",
    },
    {
      dataIndex: "short_name",
      key: "short_name",
      align: "center",
    },
    {
      key: 'seller_information',
      render: (_, record) => (
        <div>
          <p>{record?.mobile}</p>
          <p>{record?.email}</p>
        </div>
      ),
      align: "center",
    },
    {
      key: "brand",
      render: (_, record) => {
        return (
          <div>
            {record.brand_info && record.brand_info.length > 0 ? (
              record.brand_info.map((brand: any, index: any) => (
                <div key={index}>- {brand.brand_name}</div>
              ))
            ) : (
              null // Hiển thị khi không có thông tin thương hiệu
            )}
          </div>
        );
      },
      align: "center",
    },
    {
      dataIndex: "address",
      key: "address",
      align: "center",
    },
    {
      dataIndex: "ward",
      key: "ward",
      align: "center",
    },
    {
      dataIndex: "district",
      key: "district",
      align: "center",
    },
    {
      dataIndex: "city",
      key: "city",
      align: "center",
    },
    {
      key: "banking_account",
      dataIndex: "banking_account",
      align: "center",
    },
    {
      key: "payment_term_info",
      render: (_, record) => {
        if (record.payment_term_info) {
          return (
            <div>
              <Tag color={record.payment_term_info.color} className="rounded-full">
                {record.payment_term_info.title}
              </Tag>
            </div>
          );
        }
        return null; // Hoặc trả về một phần tử mặc định khác khi không có thông tin
      },
      align: "center",
    },
    {
      key: "x",
      width: width > 640 ? 120 : 40,
      fixed: "right",
      render: (_, { id }) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <AddAndUpdateSupplierManagement edit={true} brandList={brandList?.results} paymentTermList={paymentTermList?.results} id={id} />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <>
                      <Popconfirm
                        title={t('noficationDelete.deleteProvider')}
                        description={t('noficationDelete.wantToRemoveProvider')}
                        onConfirm={() => onDelete(id)}
                        onCancel={cancel}
                        okText={t('general.confirm')}
                        cancelText={t('table.actionValues.canceltext')}
                        placement="left"
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
        </Space>
      ),
      align: "center",
    },
  ];

  const onDelete = async (id: any) => {
    try {
      await deleteSupplier({ id });
      notification.success({
        message: `${t("noficationDelete.recruitmentInformationSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.recruitmentInformationError")}`,
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
        const configEntry = columnConfig?.supplier_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.supplier_management?.find(
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
      city: `${item.ward || ""}${item.district ? `, ${item.district}` : ""}${item.city ? `, ${item.city}` : ""}`,
      seller_information: `${item.mobile || ""}${item.email ? `, ${item.email}` : ""}`,
      brand: item?.brand_info?.length > 0 ? item.brand_info.map((item: any) => item.brand_name).join(", ") : "", 
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
      title: 'Nhà công cấp',
      key: 'name'
    },
    {
      title: 'MST',
      key: 'MST',
    },
    {
      title: 'Tên viết tắt',
      key: "short_name",
    },
    {
      title: 'Thông tin',
      key: 'seller_information'
    },
    {
      title: 'Thương hiệu',
      key: 'brand'
    },
    {
      title: 'Địa chỉ',
      key: 'address'
    },
    {
      title: 'Thành Phố',
      key: 'city'
    },
    {
      title: 'Thông tin tài khoản',
      key: 'banking_account'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 18 },
      3: { cellWidth: 17 },
      4: { cellWidth: 16 },
      5: { cellWidth: 25 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 18 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllSupplierList } = useGetAllSupplierListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyNhaCungCap",
    pdfTheme: "striped",
    pdfOptions,
  });


  useEffect(() => {
    if (isExportTriggered && AllSupplierList) {
      const newData = AllSupplierList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllSupplierList, isExportTriggered]);

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
    fileName: "QuanLyNhaCungCap",
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
          <Form.Item className="max-md:w-full w-1/2 ">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
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
            dateRange={dateRange}
            setDateRange={setDateRange}
            setPagination={setPagination}
            pagination={pagination}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateSupplierManagement brandList={brandList?.results} paymentTermList={paymentTermList?.results} />
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
            total: supplierList?.total || 0,
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
