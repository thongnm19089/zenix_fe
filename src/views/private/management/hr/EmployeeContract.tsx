"use client";

import {
  useDeleteEmployeeContractMutation,
  useGetAllEmployeeContractListQuery,
  useGetEmployeeContractListQuery,
} from "@/api/HR/apiHRApp";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateEmployeeContract from "@/components/FunctionsManagement/HR/AddAndUpdateEmployeeContract";
import { RootState } from "@/store/store";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  notification,
  Dropdown
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BsDownload, BsFiletypeCsv, BsFiletypePdf, BsFiletypeXls } from "react-icons/bs";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useWindowSize } from "@/utils/responsiveSm";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;

interface DataType {
  key: React.Key;
  id: number;
  created: string;
  type_str: string;
  type_color: string;
  duration_str: string;
  duration_color: string;
  employee_type: any;
  employee_info: any;
  start_date: string;
  end_date: string;
  contract_type_list: any;
  contract_duration_list: any;
  is_active: boolean;
  note: string;
  file: any;
}

const initialState = {
  employee: [],
  type: [],
  duration: []
}

export default function EmployeeContract() {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

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
  const [skipApi, setSkipApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterObject, setFilterObject] = useState<{
    employee: number[];
    type: number[];
    duration: number[];
  }>(initialState);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ employee_contract: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
  const {
    data: employeeContractList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetEmployeeContractListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    employee: filterObject.employee,
    type: filterObject.type,
    duration: filterObject.duration
  });

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const employeeContractData = parsedColumn.employee_contract;
      const employeeContractObject = { employee_contract: employeeContractData };
      setColumnConfig(employeeContractObject);
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
    employeeContractList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];
  const { data: setupList } = useGetSetupQuery();
  const { data: setupHRList } = useGetSetupHrAppQuery();
  const [deleteEmployeeContract, { isLoading: isLoadingDelete }] =
    useDeleteEmployeeContractMutation();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Nhân viên",
      data: setupList?.employee_list,
      displayProps: "username",
      key: "employee",
    },
    {
      id: 2,
      placeholder: "Loại hợp đồng",
      data: setupHRList?.contract_type_list,
      displayProps: "title",
      key: "type",
    },
    {
      id: 3,
      placeholder: "Khoảng thời gian",
      data: setupHRList?.contract_duration_list,
      displayProps: "title",
      key: "duration",
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
            <div>{dayjs(created).format("HH:mm")} {""}
              {dayjs(created).format("DD/MM/YYYY")}</div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "employee",
      // title: `${t("hr.employee")}`,
      // dataIndex: "employee_info",
      render: (_, { employee_info }) => {
        return (
          <div className="text-sm">
            <p>
              <strong>{t("user.fullName")}:</strong> {employee_info?.first_name}{" "}
              {employee_info?.last_name}
            </p>
            <p>
              <strong>{t("user.division")}:</strong>{" "}
              {employee_info?.user_profile?.division?.title}
            </p>
            <p>
              <strong>{t("user.position")}:</strong>{" "}
              {employee_info?.user_profile?.position?.title}
            </p>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "type",
      // title: `${t("hr.contractType")}`,
      // dataIndex: "type_str",
      sorter: (a, b) => {
        // Handle possible null or undefined values
        const typeA = a.type_str || "";
        const typeB = b.type_str || "";
        return typeA.localeCompare(typeB);
      },
      render: (_, { type_str, type_color, is_active }) => {
        return (
          <div className="flex gap-2">
            <Tag color={type_color} className="rounded-full">
              {type_str}
            </Tag>
            <div className="flex gap-2">
              <span className="text-sm font-medium">{t("hr.is_active")}:</span>
              {is_active ? (
                <CheckCircleOutlined
                  style={{ color: "green", fontSize: "16px" }}
                  rev={undefined}
                />
              ) : (
                <CloseCircleOutlined
                  style={{ color: "red", fontSize: "16px" }}
                  rev={undefined}
                />
              )}
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "duration",
      // title: `${t("hr.duration")}`,
      // dataIndex: "duration_str",
      sorter: (a, b) => a.duration_str.localeCompare(b.duration_str),
      render: (_, { duration_str, duration_color }) => {
        return (
          <Tag bordered={false} color={duration_color}>
            {duration_str}
          </Tag>
        );
      },
      align: "center",
    },
    {
      key: "start_date",
      // title: `${t("general.startDate")}`,
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
      dataIndex: "start_date",
      align: "center",
    },
    {
      key: "end_date",
      // title: `${t("general.endDate")}`,
      sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
      // dataIndex: "end_date",
      render: (_, { end_date }) => {
        let colorClass = "";
        const today = dayjs();
        if (end_date) {
          const dueDay = dayjs(end_date);
          if (dueDay.isBefore(today, "day")) {
            colorClass = "bg-red-600 text-white"; // Quá hạn
          } else if (dueDay.isSame(today, "day")) {
            colorClass = "bg-yellow-600 text-white"; // Trong ngày hôm nay
          } else {
            colorClass = "bg-green-600 text-white"; // Chưa đến hạn
          }
        }
        return (
          <div>
            <div
              className={`text-sm text-center py-1 px-2 rounded-br-full ${colorClass} truncate`}
            >
              <div>{dayjs(end_date).format("DD/MM/YYYY")}</div>
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "note",
      render: (_, record) => {
        return (
          <p>{record?.note}</p>
        )
      },
      align: "center",
    },
    {
      key: "x",
      width: width > 640 ? 115 : 95,
      fixed: "right",
      render: (_, { id, file }) => (
        <Space size="middle" direction="vertical" className="text-center">
          <div className="flex gap-2">
            <ActionTable
              items={[
                {
                  key: "1",
                  label: (
                    <AddAndUpdateEmployeeContract edit={true} employeeContractId={id} />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <>
                      <Popconfirm
                        title={t("noficationDelete.personnelRecords")}
                        description={t("noficationDelete.wantToDeletPersonnel")}
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
                    </>
                  ),
                },
              ]}
            />
          </div>
          {file && (
            <a href={file} download target="_blank" rel="noopener noreferrer">
              <Button block>{t("nav.contract")}</Button>
            </a>
          )}
        </Space>
      ),
      align: "center",
    },
  ];

  const onDelete = async (employeeContractId: any) => {
    try {
      if (employeeContractId) {
        await deleteEmployeeContract({ employeeContractId });
        notification.success({
          message: `${t("noficationDelete.personnelRecordsSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.personnelRecordsError")}`,
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
        const configEntry = columnConfig?.employee_contract?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.employee_contract?.find(
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
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeys.length > 0
      ? data.filter((item: DataType) => selectedRowKeys.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      employee: item?.employee_info?.first_name,
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
      key: 'created',
    },
    {
      title: 'Nhân viên',
      key: 'employee'
    },
    {
      title: 'Loại hợp đồng',
      key: 'type_str'
    },
    {
      title: 'Khoảng thời gian',
      key: "duration_str",
    },
    {
      title: 'Ngày bắt đầu',
      key: 'start_date'
    },
    {
      title: 'Ngày kết thúc',
      key: 'end_date'
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
      2: { cellWidth: 23 },
      3: { cellWidth: 25 },
      4: { cellWidth: 23 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllEmployeeContractList } = useGetAllEmployeeContractListQuery(undefined, {
    skip: !isExportTriggered,
  })


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "HoSoNhanSu",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllEmployeeContractList) {
      const newData = AllEmployeeContractList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllEmployeeContractList, isExportTriggered]);

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
    fileName: "HoSoNhanSu",
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
      className={`overflow-x-auto w-[calc(100vw-44px)]  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-70px)] p-6`}
    >
      <div className="flex justify-between items-center max-md:flex-col max-md:gap-3">
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
          <Form.Item className="max-md:w-full mb-2">
            <Input
              placeholder={t("crm.namePhoneEmail")}
              onChange={onSearchChange}
            />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2 mb-2">
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500"
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <div className="flex justify-end text-right w-full gap-2">
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
              icon={<BsFiletypeXls className="text-blue-500" />}
              onClick={onExcelPrint}
            >
              Xuất Excel
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
              icon={<BsFiletypeCsv className="text-blue-500" />}
              onClick={onCsvPrint}
            >
              Xuất CSV
            </Button>
            <Button
              type="dashed"
              className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
              icon={<BsFiletypePdf className="text-blue-500" />}
              onClick={onPdfPrint}
            >
              Xuất PDF
            </Button>
          </div>
          <Filter
            dataQuery={dataArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setDateRange={setDateRange}
            isLoading={isLoading}
            dateRange={dateRange}
            setPagination={setPagination}
            pagination={pagination}
            initialState={initialState}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />

          <AddAndUpdateEmployeeContract />
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
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: employeeContractList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          scroll={{ x: 1400 }}
        />
      </div>
    </div>
  );
}
