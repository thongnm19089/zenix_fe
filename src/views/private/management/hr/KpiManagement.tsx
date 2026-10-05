"use client";

import { useDeleteKpiMutation, useGetAllKpiListQuery, useGetKpiListQuery } from "@/api/HR/apiHRApp";
import { useGetSetupQuery, useGetSetupHrAppQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateKpi from "@/components/FunctionsManagement/HR/AddAndUpdateKpi";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  notification,
  Dropdown
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BsFiletypeCsv, BsFiletypePdf, BsFiletypeXls } from "react-icons/bs";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
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
  user_info: any;
  kpi_type_info: any;
  target: any;
  calculate_kpi_result: number;
  get_absolute_result: any;
  get_percentage_result: any;
  start_date: string;
  end_date: string;
  note: string;
}

export default function KpiManagement() {
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

  const initialStateFilter = {
    kpi_type: [],
    user: [],
  };

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterObject, setFilterObject] = useState<{
    kpi_type: number[];
    user: number[];
  }>(initialStateFilter);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ kpi_management: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
  const {
    data: kpiList,
    isLoading,
    refetch,
    isError,
    error,
  } = useGetKpiListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    kpi_type: filterObject.kpi_type,
    user: filterObject.user,
  });

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const kpiManagementData = parsedColumn.kpi_management;
      const kpiManagementObject = { kpi_management: kpiManagementData };
      setColumnConfig(kpiManagementObject);
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
    kpiList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteKpi, { isLoading: isLoadingDelete }] = useDeleteKpiMutation();
  const { data: setupList } = useGetSetupQuery();
  const { data: setupHRList } = useGetSetupHrAppQuery();

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Loại Kpi",
      data: setupHRList?.kpi_type_list,
      displayProps: "name",
      key: "kpi_type",
    },
    {
      id: 2,
      placeholder: "Người thực hiện",
      data: setupList?.employee_list,
      displayProps: "username",
      key: "user",
    },
  ];


  const columns: ColumnsType<DataType> = [
    {
      title: "STT",
      key: "index",
      width: 45,
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
      key: "type",
      render: (_, { kpi_type_info }) => {
        return <span>{kpi_type_info?.name}</span>;
      },
      align: "center",
    },
    {
      key: "user",
      render: (_, { user_info }) => {
        return (
          <span>
            {user_info?.last_name} {user_info?.first_name}
          </span>
        );
      },
      align: "center",
    },
    {
      key: "kpitarget",
      dataIndex: "target",
      sorter: (a, b) => a.target - b.target,
      render: (text) => text.toLocaleString("en-US"),
      align: "center",
    },
    {
      dataIndex: "calculate_kpi_result",
      key: "calculate",
      sorter: (a, b) => a.calculate_kpi_result - b.calculate_kpi_result,
      render: (_, record) => (
        <div>
          {Object.keys(record).includes("calculate_kpi_result")
            ? record["calculate_kpi_result"]
            : "100%"}
        </div>
      ),
      align: "center",
    },
    {
      key: "details",
      render: (text, record) => {
        return Object.keys(record).includes("get_absolute_result") ? (
          <>
            {record.get_absolute_result !== null && (
              <div>
                {`Số tuyệt đối: ${
                  typeof record.get_absolute_result === "number"
                    ? record.get_absolute_result.toLocaleString("en-US")
                    : record.get_absolute_result
                }`}
              </div>
            )}
            {record.get_percentage_result !== null && (
              <div>{`Tỷ lệ: ${record.get_percentage_result}`}</div>
            )}
          </>
        ) : (
          <div>79%</div>
        );
      },
      align: "center",
    },
    {
      key: "start_date",
      sorter: (a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix(),
      render: (_, { start_date }) => {
        return <div>{dayjs(start_date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      key: "end_date",
      sorter: (a, b) => dayjs(a.end_date).unix() - dayjs(b.end_date).unix(),
      render: (_, { end_date }) => {
        return <div>{dayjs(end_date).format("DD/MM/YYYY")}</div>;
      },
      align: "center",
    },
    {
      dataIndex: "note",
      key: "note",
      align: "center",
      render: (_, record) => (
        <div>
          {Object.keys(record).includes("note") ? record["note"] : "Ghi chú"}
        </div>
      ),
    },
    {
      title: ``,
      dataIndex: "",
      key: "x",
      width: width > 640 ? 120 : 40,
      fixed: "right",
      render: (_, { id }) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: <AddAndUpdateKpi edit={true} kpiId={id} />,
              },
              {
                key: "2",
                label: (
                  <>
                    <Popconfirm
                      title={t("noficationDelete.deleteKpi")}
                      description={t("noficationDelete.wantToDeleteKpi")}
                      onConfirm={() => onDelete(id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("table.actionValues.canceltext")}
                      placement="left"
                      okButtonProps={{ loading: isLoadingDelete }}
                    >
                      <Button danger size="small" className="max-sm:hidden">
                        {t("general.delete")}
                      </Button>
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

  const onDelete = async (kpiId: any) => {
    try {
      await deleteKpi({ kpiId });
      notification.success({
        message: `${t("noficationDelete.kpiSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.kpiError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => {};

  const initialState = {
    kpi_type: undefined,
    user: undefined,
  };

  const [updateProps, setUpdateProps] = useState(initialState);

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    setFilterObject(initialStateFilter);
    refetch();
  };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.kpi_management?.find(
          (entry: { key: number }) => entry.key === column.key
        );
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.kpi_management?.find(
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
      type: item?.kpi_type_info?.name,
      user: `${item?.user_info?.first_name || ""}${item?.user_info?.last_name ? `, ${item?.user_info?.last_name}` : ""}`,
      target: item?.target?.toLocaleString("en-US") || '0',
      absolute_result: typeof item.get_absolute_result === "number"
        ? item.get_absolute_result.toLocaleString("en-US")
        : item.get_absolute_result || 'No result', // Handle absolute result
      percentage_result: item.get_percentage_result !== null
        ? `${item.get_percentage_result}%`
        : 'No percentage',
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
      title: 'Loại KPI',
      key: 'type'
    },
    {
      title: 'Người thực hiện',
      key: 'user'
    },
    {
      title: 'Mục tiêu',
      key: "target",
    },
    {
      title: 'Tỷ lệ hoàn thành',
      key: 'calculate_kpi_result'
    },
    {
      title: 'Kết quả chi tiết',
      key: 'absolute_result'
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
      3: { cellWidth: 20 },
      4: { cellWidth: 23 },
      5: { cellWidth: 15 },
      6: { cellWidth: 20 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 20 },
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllKpiList } = useGetAllKpiListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyKPI",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllKpiList) {
      const newData = AllKpiList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllKpiList, isExportTriggered]);

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
    fileName: "QuanLyKPI",
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
      className={`overflow-x-auto w-screen ${
        isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
      }   min-h-[calc(100vh-138px)] pl-6 mt-4`}
    >
      <div className="flex justify-between items-center max-md:flex-col max-md:gap-3 mb-5">
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
        <Form layout="inline" className="max-md:gap-2 w-full ">
          {/* <Form.Item className="max-md:w-full">
            <RangePicker
              onChange={onDateChange}
              placeholder={[`${t("general.startDate")}`, `${t("general.endDate")}`]}
              className="max-md:w-full max-md:mb-auto mb-2"
            />
          </Form.Item> */}
          <Form.Item className="max-md:w-full mb-2">
            <Input
              placeholder={t("crm.namePhoneEmail")}
              onChange={onSearchChange}
            />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2">
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
            setDateRange={setDateRange}
            initialState={initialStateFilter}
            setPagination={setPagination}
            pagination={pagination}
            dateRange={dateRange}
            isLoading={isLoading}
          />
          <SelectColumn
            dataColumn={columnConfig}
            setDataColumn={setColumnConfig}
          />
          <AddAndUpdateKpi />
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
            total: kpiList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          bordered
          scroll={{ x: 1300 }}
        />
      </div>
    </div>
  );
}
