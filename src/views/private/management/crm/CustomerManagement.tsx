"use client";

import { useDeleteCustomerMutation, useGetAllCustomerListQuery, useGetCustomerListQuery } from "@/api/CRM/apiLead";
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateCustomer from "@/components/FunctionsManagement/CRM/AddAndUpdateCustomer";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import { deleteCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { User } from "@/types/userTypes";
import { useWindowSize } from "@/utils/responsiveSm";
import useExport from "@/utils/useExport";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, DatePicker, Form, Input, Popconfirm, Space, Table, Tabs, notification, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TabsProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { IoRefresh } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { MenuProps } from "antd/lib";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs"; 
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;
interface CustomerBusiness {
  key: string;
  title: string;
  checked: boolean;
  length: number;
}
interface DataType {
  city: any;
  district: any;
  name: any;
  key: React.Key;
  id: number;
  created: string;
  address: string;
  ward: string;
  note: any;
  mobile?: string;
  email?: string;
  contact_person?: string;
  user_info: { first_name: string; last_name: string; username: string };
}

const RenderTextWithNewLines = ({ text }: { text: string }) => {
  if (text) {
    return (
      <ul className="pl-0">
        {text.split("\n").map((line, index) => (
          <li key={index} className="list-none pl-0">
            {" "}
            <span className="mr-2">-</span> {line}
          </li>
        ))}
      </ul>
    );
  } else {
    return <></>;
  }
};

const BusinessCustomer = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const dispatch = useDispatch();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

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

  const initialStateFilter = {
    seller: []
  }

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    seller: number[];
  }>(initialStateFilter);

  const [columnConfig, setColumnConfig] = useState<any>({ customer_business: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
    const {
      data: customerList,
      isLoading,
      isError,
      refetch,
      error,
    } = useGetCustomerListQuery({
      customerType: "business",
      page: pagination.current,
      pageSize: pagination.pageSize,
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      searchTerm,
      seller: filterObject.seller,

    });

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const customerBusinessData = parsedColumn.customer_business;
      const customerBusinessObject = { customer_business: customerBusinessData };
      setColumnConfig(customerBusinessObject);
    }
  }, []);

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  const initialState = {
    marketer_id: undefined,
    seller_id: undefined,
    source_id: undefined,
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
      setDateRange([]);
    }

    setPagination({ ...pagination, current: 1 });
  };

  const onSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  const dataSource =
    customerList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteCustomer, { isLoading: isLoadingDelete }] = useDeleteCustomerMutation();

  const onDelete = async (customerId: any) => {
    try {
      await deleteCustomer({ customerId });
      notification.success({
        message: `${t("noficationDelete.customerSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.customerError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const onOrder = (data: any) => {
    data["id"] = null;
    localStorage.setItem("orderLead", JSON.stringify(data));
    dispatch(deleteCart());
    router.push("/business/crm/order-management/add-order");
  };


  const { data: setupCrmApp } = useGetSetupCrmAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: `${t("table.seller")}`,
      data: setupCrmApp?.seller_list,
      displayProps: "first_name",
      key: "seller",
    },
  ];

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 40,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            {dayjs(created).format("HH:mm")} {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "name",
      render: (_, record) => {
        return <CustomerDetail customer={record} isOrder={true} />;
      },
      align: "center",
    },
    {
      key: "manage",
      align: "center",
    },
    {
      key: "user",
      render: (_, { user_info }) => {
        return (
          <div>
            {user_info?.last_name} {user_info?.first_name}
          </div>
        );
      },
      align: "center",
    },
    {
      key: `cskh`,
      align: "center",
    },
    {
      dataIndex: "contact_person",
      key: "contact_person",
      render: (text) => <RenderTextWithNewLines text={text} />,
      align: "center",
    },
    {
      key: "note",
      dataIndex: "note",
      render: (text) => <RenderTextWithNewLines text={text} />,
      align: "center",
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: width > 640 ? 110 : 30,
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
                      className={` ${width < 640}`} onClick={() => onOrder(record)} block size="small">
                      {t("crm.createOrder")}
                    </Button>),
                },
                {
                  key: "2",
                  label: (
                    <AddAndUpdateCustomer edit={true} customerId={record?.id} customerType="business" />

                  ),
                },
                {
                  key: "3",
                  label: (
                    <Popconfirm
                      title={t("noficationDelete.orderTitle")}
                      description={t("noficationDelete.orderDescription")}
                      onConfirm={() => onDelete(record.id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
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

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.customer_business?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.customer_business?.find(
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
    setFilterObject(initialStateFilter);

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
    return data.map((item: DataType, index) => ({
      ...item, // Sao chép tất cả thuộc tính ban đầu của đối tượng khách hàng
      key: index + 1, // Số thứ tự
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      name: item.name || 'Chưa xác định', // Thông tin công ty (Tên công ty)
      user: item.user_info ? `${item.user_info.last_name} ${item.user_info.first_name}` : 'Chưa xác định', // NVKD (Họ và tên NVKD)
      contact_person: item.contact_person || 'Không có', // Người liên hệ
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
      title: 'Thông tin công ty',
      key: 'name'
    },
    {
      title: 'Quản lý',
      key: 'manage',
    },
    {
      title: 'NVKD',
      key: "name",
    },
    {
      title: 'CSKH',
      key: 'cskh'
    },
    {
      title: 'Người liên hệ',
      key: 'contact_person'
    },
    {
      title: 'Ghi chú',
      key: 'note'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 24 },
      3: { cellWidth: 16 },
      4: { cellWidth: 24 },
      5: { cellWidth: 16 },
      6: { cellWidth: 24 },
      7: { cellWidth: 40 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllQuotationList, refetch: refetchAllCustomerList } = useGetAllCustomerListQuery(
    { customerType: "business" },
    { skip: !isExportTriggered }
  );

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "DanhSachKhachHangDoanhNghiep",
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
    fileName: "DanhSachKhachHangDoanhNghiep",
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
      <div className="flex justify-between items-center flex-1 pt-2  max-md:flex-col max-md:gap-3">
        <Form layout="inline" className="max-md:gap-2 w-full">
          {/* <Form.Item className="w-full md:col-span-1">
    <RangePicker
      onChange={onDateChange}
      placeholder={[`${t("general.startDate")}`, `${t("general.endDate")}`]}
      className="w-full max-md:mb-auto mb-3"
    />
  </Form.Item> */}

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

          <Form.Item className="max-md:w-full mb-3">
            <Input
              placeholder="khách hàng, MST, tên viết tắt, ghi chú, người liên hệ..."
              onChange={onSearchChange}
            />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2">
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
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <Filter dataQuery={dataArrQuery} objectFilter={filterObject} setObjectFilter={setFilterObject} isLoading={isLoading}
            initialState={initialStateFilter} setPagination={setPagination} pagination={pagination} dateRange={dateRange} setDateRange={setDateRange}

            children={undefined} />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateCustomer customerType="business" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={memoizedColumns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: customerList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          scroll={{ x: 1400 }}
        // rowSelection={rowSelection}
        />
      </div>
    </div>
  );
};

const IndividualCustomer = () => {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const dispatch = useDispatch();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  
  const onOrder = (data: any) => {
    data["id"] = null;
    localStorage.setItem("orderLead", JSON.stringify(data));
    dispatch(deleteCart());
    router.push("/business/crm/order-management/add-order");
  };
  
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

  const initialStateFilter = {
    seller: []
  }

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    seller: number[];
  }>(initialStateFilter);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ customer_business: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
  const {
    data: customerList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetCustomerListQuery({
    customerType: "individual",
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    seller: filterObject.seller,

  });

  // Redirect to custom 403 page if there's a 403 error
  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const individualBusinessData = parsedColumn.individual_business;
      const individualBusinessObject = { individual_business: individualBusinessData };
      setColumnConfig(individualBusinessObject);
    }
  }, []);

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
    customerList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteCustomer, { isLoading: isLoadingDelete }] = useDeleteCustomerMutation();

  const onDelete = async (customerId: any) => {
    try {
      await deleteCustomer({ customerId });
      notification.success({
        message: `${t("noficationDelete.customerSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.customerError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const { data: setupCrmApp } = useGetSetupCrmAppQuery();
  const dataArrQuery = [
    {
      id: 1,
      placeholder: `${t("table.seller")}`,
      data: setupCrmApp?.seller_list,
      displayProps: "first_name",
      key: "seller",
    },
  ];

  const initialState = {
    marketer_id: undefined,
    seller_id: undefined,
    source_id: undefined,
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      // title: `${t("table.createdAt")}`,
      key: "created",
      width: 110,
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            <div>{dayjs(created).format("HH:mm")}</div>
            <div>{dayjs(created).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      // title: `${t("crm.NVKD")}`,
      key: "user",
      render: (_, { user_info }) => {
        return (
          <div>
            {user_info?.last_name} {user_info?.first_name}
          </div>
        );
      },
      align: "center",
    },
    {
      // title: `${t("table.customerName")}`,
      key: "name",
      render: (_, record) => {
        return <CustomerDetail customer={record} isOrder={true} />;
      },
      width: 200,
      align: "center",
    },
    {
      key: "manage",
      align: "center",
    },
    {
      key: "mobile",
      // title: `${t("user.phone")}`,
      dataIndex: "mobile",
      width: 110,
      align: "center",
    },
    {
      // title: `${t("auth.email")}`,
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      // title: `${t("auth.note")}`,
      dataIndex: "note",
      key: "note",
      align: "center",
    },
    {
      // title: `${t("user.address")}`,
      key: "address",
      // dataIndex: "address",
      render: (_, { address, ward }) => {
        return (
          <div>
            {address}, {ward}
          </div>
        );
      },
      align: "center",
    },

    {
      // title: `${t("table.district")}`,
      key: "district",
      dataIndex: "district",
      sorter: (a, b) => a?.district?.localeCompare(b?.district),
      align: "center",
    },
    {
      // title: `${t("table.city")}`,
      key: "city",
      dataIndex: "city",
      sorter: (a, b) => a?.city?.localeCompare(b?.city),
      align: "center",
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: width > 640 ? 230 : 30,
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
                      className={` ${width < 640}`} onClick={() => onOrder(record)} block size="small">
                      {t("crm.createOrder")}
                    </Button>),
                },
                {
                  key: "2",
                  label: (
                    <AddAndUpdateCustomer edit={true} customerId={record?.id} customerType="individual" />
                  ),
                },
                {
                  key: "3",
                  label: (
                    <Popconfirm
                      title={t("noficationDelete.customerTitle")}
                      description={t("noficationDelete.customerDescription")}
                      onConfirm={() => onDelete(record?.id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("general.close")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">{t("general.delete")}</Button>
                      <div className="sm:hidden text-center">{t("general.delete")}</div>
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
  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.individual_business?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.individual_business?.find(
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
    setFilterObject(initialStateFilter);

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
    return data.map((item: DataType, index) => ({
      ...item,  // Sao chép tất cả các thuộc tính từ item
      index: index + 1, // Ghi đè số thứ tự
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"), // Format lại ngày tạo
      user: item.user_info ? `${item.user_info.last_name} ${item.user_info.first_name}` : 'Chưa xác định', // NVKD (Họ và tên NVKD)
      note: item.note || 'Không có ghi chú', // Ghi chú, nếu không có thì mặc định là "Không có ghi chú"
      address: item.address || 'Chưa xác định', // Địa chỉ
      district: item.district || 'Chưa xác định', // Quận/Huyện
      city: item.city || 'Chưa xác định', // Thành phố
    }));
  };

  const convertedData = convertData(dataSource);

  const fileColumns: ColumnsType<DataType> = [
    { "key": "index", "title": "STT" },
    { "key": "created", "title": "Ngày tạo" },
    { "key": "user", "title": "NVKD" },
    { "key": "name", "title": "Tên khách hàng" },
    { "key": "mobile", "title": "Số điện thoại" },
    { "key": "email", "title": "Email" },
    { "key": "note", "title": "Ghi chú" },
    { "key": "address", "title": "Địa chỉ" },
    { "key": "district", "title": "Quận/Huyện" },
    { "key": "city", "title": "Thành phố" }
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 23 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 25 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 20 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllQuotationList, refetch: refetchAllCustomerList } = useGetAllCustomerListQuery(
    { customerType: "individual" },
    { skip: !isExportTriggered }
  );

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "DanhSachKhachHang",
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

  const menuProps = {
    items: [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
      ? items
      : items.splice(0, 2),
    onClick: handleMenuClick,
  };

  return (
    <div className={` w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"}   px-6`}>
      <div className="flex justify-between items-center  pt-2  max-md:flex-col max-md:gap-3">
        <Form layout="inline" className="max-md:gap-2 w-full">
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
          {/* <Form.Item className="max-md:w-full">
            <RangePicker
              onChange={onDateChange}
              placeholder={[`${t("general.startDate")}`, `${t("general.endDate")}`]}
              className="max-md:w-full max-md:mb-auto mb-3"
            />
          </Form.Item> */}
          <Form.Item className="max-md:w-full mb-3">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2">
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
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <Filter dateRange={dateRange}
            dataQuery={dataArrQuery} objectFilter={filterObject} isLoading={isLoading}
            setPagination={setPagination} pagination={pagination} setDateRange={setDateRange}
            initialState={initialStateFilter} setObjectFilter={setFilterObject} children={undefined} />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateCustomer customerType="individual" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={memoizedColumns}
          // columns={columns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: customerList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          scroll={{ x: 1400 }}
        // rowSelection={rowSelection}
        />
      </div>
    </div>
  );
};

export default function CustomerManagement() {
  const t: any = useTranslations();
  const [customerMainType, setCustomerMainType] = useState("individual");
  const [activeTabKey, setActiveTabKey] = useState("1");

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const parsedUserData: User | null = JSON.parse(userDataString);
      const customerType = parsedUserData?.user_profile?.company?.customer_type || "individual";
      setCustomerMainType(customerType);
      setActiveTabKey(customerType === "business" ? "2" : "1");
    }
  }, []);

  const individualCustomerTab = {
    key: "1",
    label: t("crm.individualCustomers"),
    children: <IndividualCustomer />,
  };

  const businessCustomerTab = {
    key: "2",
    label: t("crm.businessesCustomers"),
    children: <BusinessCustomer />,
  };

  const items: TabsProps["items"] =
    customerMainType === "business"
      ? [businessCustomerTab, individualCustomerTab]
      : [individualCustomerTab, businessCustomerTab];

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  return <Tabs activeKey={activeTabKey} onChange={handleTabChange} items={items} />;
}
