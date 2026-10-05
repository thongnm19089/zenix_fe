"use client";

import { useDeleteJobMutation, useGetAllJobListQuery, useGetJobListQuery } from "@/api/HR/apiHRApp";
import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateJob from "@/components/FunctionsManagement/HR/AddAndUpdateJob";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, DatePicker, Form, Input, Popconfirm, Space, Table, notification, Image, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ColumnFilterItem } from "antd/lib/table/interface";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import { BsDownload, BsFiletypeCsv, BsFiletypePdf, BsFiletypeXls } from "react-icons/bs";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

const { RangePicker } = DatePicker;

interface DataType {
  thumbnail: any;
  key: React.Key;
  id: number;
  created: string;
  title: string;
  working_time: string;
  location_str: string[];
  income: string;
  deadline: string;
  desc: string;
  requirement: string;
  benefit: string;
  job_document_file: any;
}

export default function JobManagement() {
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const router = useRouter();
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);

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
    location: [],
  }

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterObject, setFilterObject] = useState<{
    location: number[]
  }>
    (initialStateFilter);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ job_management: [] });
  const {
    data: jobList,
    isLoading,
    refetch,
    isError,
    error,
  } = useGetJobListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    location: filterObject.location,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSkipApi(true);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const jobManagementData = parsedColumn.job_management;
      const jobManagementObject = { job_management: jobManagementData };
      setColumnConfig(jobManagementObject);
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
  const dataSource = jobList?.results.map((record: { id: any }) => ({ ...record, key: record.id })) || [];

  const { data: setupList } = useGetSetupQuery();
  const uniqueCities = [...new Set(setupList?.location_list.map((item: { city: any }) => item.city))];

  const [deleteJob, { isLoading: isLoadingDelete }] = useDeleteJobMutation();

  const dataArrQuery = [
    { id: 1, placeholder: "Địa điểm", data: setupList?.location_list, displayProps: "city", key: "location" },
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
      // title: `${t("table.createdAt")}`,
      // width: 160,
      // dataIndex: "created",
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            {dayjs(created).format("HH:mm")} -{dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      // title: `Phúc lợi`,
      dataIndex: "title",
      key: "title",
      align: "center",
      // width: 160,
    },
    {
      // title: t("table.title"),
      // dataIndex: "title",
      // width: 250,
      key: "picture",
      render: (record) => (
        <div style={{ display: "flex", alignItems: "center" }} className="flex jus p-3 gap-3">
          {record?.thumbnail && (
            <Image
              width={100}
              src={record?.thumbnail}
              alt="Job Thumbnail"
              style={{ marginRight: 10, borderRadius: 10 }}
            />
          )}
        </div>
      ),
      align: "center",
    },
    {
      // title: `${t("table.requirement")}`,
      dataIndex: "requirement",
      // width: 250,
      key: "requirement",
      render: (text) => {
        // Check if the text length exceeds 100 characters
        if (text && text.length > 100) {
          // If it does, display the first 100 characters followed by an ellipsis
          return `${text.substring(0, 100)}...`;
        }
        // Otherwise, display the text as it is
        return text;
      },
      align: "center",
    },

    {
      // title: `Phúc lợi`,
      dataIndex: "benefit",
      key: "benefit",
      align: "center",
      // width: 160,
    },

    {
      key: "income",
      // title: `Thu nhập`,
      dataIndex: "income",
      align: "center",
      // width: 160,
    },

    {
      key: "working",
      // title: `Thời gian làm việc`,
      dataIndex: "working_time",
      align: "center",
      // width: 160,
    },

    {
      // title: `${t("table.deadline")}`,
      key: "deadline",
      // width: 300,
      sorter: (a, b) => dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
      render: (_, { deadline }) => {
        let colorClass = "";
        const today = dayjs();
        if (deadline) {
          const dueDay = dayjs(deadline);
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
            <div className={`text-sm text-center py-1 px-2 rounded-br-full ${colorClass} truncate`}>
              {dayjs(deadline).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      },
      align: "center",
    },

    {
      // title: `${t("table.location")}`,
      // width: 150,
      // dataIndex: "location_str",
      key: "job_location",
      render: (_, { location_str }) => {
        return (
          <div>
            {location_str.map((item) => (
              <div>- {item}</div>
            ))}
          </div>
        );
      },
      align: "center",
    },

    {
      key: "desc",
      dataIndex: "desc",
      align: "center",
      // title: "Ghi chú",
      // width: 250,
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
                    <AddAndUpdateJob edit={true} locationList={setupList?.location_list} jobId={id} />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <>
                      <Popconfirm
                        title={t("table.actionValues.title")}
                        description={t("table.actionValues.jobDescription")}
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
        </Space>
      ),
      align: "center",
    },
  ];



  const onDelete = async (jobId: any) => {
    try {
      await deleteJob({ jobId });
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

  const initialState = {
    location: undefined,
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
        const configEntry = columnConfig?.job_management?.find((entry: { key: number }) => entry.key === column.key);
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.job_management?.find(
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


  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeys.length > 0
      ? data.filter((item: DataType) => selectedRowKeys.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      job_location: item.location_str.map((item) => item),
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
      title: 'Tiêu đề',
      key: 'title',
    },
    {
      title: 'Yêu cầu',
      key: 'requirement'
    },
    {
      title: 'Phúc lợi',
      key: 'benefit'
    },
    {
      title: 'Thu thập',
      key: 'income'
    },
    {
      title: 'Thời gian làm việc',
      key: "working_time",
    },
    {
      title: 'Thời hạn',
      key: 'deadline'
    },
    {
      title: 'Địa điểm',
      key: 'job_location'
    },
    {
      title: 'Mô tả',
      key: 'desc'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 23 },
      2: { cellWidth: 16 },
      3: { cellWidth: 18 },
      4: { cellWidth: 16 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 23 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 },
    }
  }


  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllJobList } = useGetAllJobListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyTuyenDung",
    pdfTheme: "striped",
    pdfOptions,
  });

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "2") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "6") {
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };

  useEffect(() => {
    if (isExportTriggered && AllJobList) {
      const newData = AllJobList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllJobList, isExportTriggered]);

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
    fileName: "QuanLyTuyenDung",
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
      <div className="flex justify-between items-center max-md:flex-col max-md:gap-3 mb-3">
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
            setDateRange={setDateRange}
            dataQuery={dataArrQuery}
            initialState={initialStateFilter}
            dateRange={dateRange}
            setPagination={setPagination}
            objectFilter={filterObject}
            pagination={pagination}
            isLoading={isLoading}
            setObjectFilter={setFilterObject}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          <AddAndUpdateJob locationList={setupList?.location_list} />
        </div>
      </div>


      <div className="overflow-x-auto">
        <Table
          rowSelection={
            [`${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          expandable={{
            expandedRowRender: (record) => (
              <div className="flex gap-5 px-5">
                <div className="w-1/3">
                  <div className="text-md font-semibold mb-2">{t("verticalValues.desc")}:</div>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: record?.desc ? record?.desc.replace(/\n/g, "<br/>") : "No Description",
                    }}
                  />
                  {record?.job_document_file && (
                    <div className="flex gap-3">
                      <div className="text-md font-semibold mb-2">{t("general.file")}:</div>
                      <a
                        href={record?.job_document_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {t("admin.view")}
                      </a>
                    </div>
                  )}
                </div>

                <div className="w-1/3">
                  <div className="text-md font-semibold mb-2">{t("table.requirement")}:</div>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: record?.requirement ? record?.requirement.replace(/\n/g, "<br/>") : "No Requirement",
                    }}
                  />
                </div>

                <div className="w-1/3">
                  <div className="text-md font-semibold mb-2">{t("table.benefit")}:</div>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: record?.benefit ? record?.benefit.replace(/\n/g, "<br/>") : "No Benefit",
                    }}
                  />
                </div>
              </div>
            ),
          }}
          columns={memoizedColumns}
          // columns={columns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: jobList?.total || 0,
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
