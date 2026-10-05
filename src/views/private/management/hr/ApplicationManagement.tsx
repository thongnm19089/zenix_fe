"use client";

import {
  useDeleteApplicationMutation,
  useDeleteApplicationNoteMutation,
  useGetAllApplicationListQuery,
  useGetApplicationListQuery,
  useGetJobListQuery,
} from "@/api/HR/apiHRApp";
import { useGetSetupHrAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ExcelExport from "@/components/Download/ExcelExport";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import AddAndUpdateApplication from "@/components/FunctionsManagement/HR/AddAndUpdateApplication";
import AddAndUpdateInterview from "@/components/FunctionsManagement/HR/AddAndUpdateInterview";
import CandidateDetail from "@/components/FunctionsManagement/HR/CandidateDetail";
import UpdateApplicationNote from "@/components/FunctionsManagement/HR/UpdateApplicationNote";
import UpdateApplicationStatus from "@/components/FunctionsManagement/HR/UpdateApplicationStatus";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Button,
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { BsFiletypeCsv, BsFiletypePdf } from "react-icons/bs";
import { IoRefresh } from "react-icons/io5";
import { useSelector } from "react-redux";
import useExport from "@/utils/useExport";
import { MenuProps } from "antd/lib";
import { FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";

interface DataType {
  hunter_str: string;
  handler_str: string;
  location_str: string;
  cover_letter: any;
  paid: boolean;
  key: React.Key;
  id: number;
  created: string;
  job: string;
  job_info: {
    title: string;
  };
  yob: string;
  file: any;
  name: string;
  mobile: string;
  email: string;
  status_str: string;
  status_color: string;
  source_str: string;
  source_color: string;
  application_interview_schedule_list: any;
  application_note_list: any;
  note: string;
}

const initialState = {
  job: [],
  status: [],
  source: [],
  location: [],
  hunter: [],
  handler: [],
};

export default function ApplicationManagement() {
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );

  const t: any = useTranslations();
  const router = useRouter();
  const [width] = useWindowSize();

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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowExcel, setRowExcel] = useState(10);
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    job: number[];
    status: number[];
    source: number[];
    location: number[];
    hunter: number[];
    handler: number[];
  }>(initialState);


  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({
    application_management: [],

  });
  const {
    data: applicationList,
    isLoading,
    refetch,
    error,
  } = useGetApplicationListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    job: filterObject.job,
    status: filterObject.status,
    source: filterObject.source,
    location: filterObject.location,
    hunter: filterObject.hunter,
    handler: filterObject.handler,
  });

  const { data: applicationExcel } = useGetApplicationListQuery(
    {
      page: 1,
      pageSize: rowExcel,
    },
    { skip: !openExcelModal }
  );


  useEffect(() => {
    const storageColumn = localStorage.getItem("column");

    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const candidateManagementData = parsedColumn.application_management;
      const candidateManagementObject = {
        application_management: candidateManagementData,
      };
      setColumnConfig(candidateManagementObject);
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

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    applicationList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];

  const [deleteApplication, { isLoading: isLoadingDelete }] =
    useDeleteApplicationMutation();
  const { data: setupList } = useGetSetupQuery();
  const { data: setupHRList } = useGetSetupHrAppQuery();

  const [paginationJob, setPaginationJob] = useState({
    current: 1,
    pageSize: 200,
  });

  // Thêm tham số vào hook query
  const { data: jobList } = useGetJobListQuery({
    page: paginationJob.current,
    pageSize: paginationJob.pageSize,
  });

  const [deleteApplicationNote, { isLoading: isLoadingDeleteApplicationNote }] = useDeleteApplicationNoteMutation();

  const renderRecontactData = (record: DataType) => {
    const deleteRecontactDate = async () => {
      try {
        await deleteApplicationNote({ lead_id: record.id });
        notification.success({
          message: t("noficationDelete.noteSuccess"),
          placement: "bottomRight",
          className: "h-16",
        });
      } catch (error) {
        notification.error({
          message: t("noficationDelete.noteError"),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    };

    const applicationNoteList = record?.application_note_list?.filter((follower: any) => follower?.created);
    const sortedCreated = applicationNoteList?.sort(
      (a: any, b: any) => {
        const dateA: any = new Date(a.created);
        const dateB: any = new Date(b.created);
        return dateB - dateA;
      }
    );
    const mostRecentNote = sortedCreated?.[0];

    return (
      <div className="text-left">
        <div
          className={`text-sm py-1 text-left px-2 rounded-tr-full bg-yellow-600 text-white truncate cursor-pointer`}
        >
          <UpdateApplicationNote
            applicationId={record.id}
            applicationNote={record.application_note_list}
            refetch={refetch}
            title="Thêm ghi chú"
          />
        </div>
        {mostRecentNote && mostRecentNote.note && (
          <div key={mostRecentNote.id}>
            <li>
              <b className="text-slate-400">{`${mostRecentNote.user_str}: ${mostRecentNote.note}`}</b>
            </li>
          </div>
        )}
      </div>
    );
  };

  //Tạo mảng gồm thuộc tính và dữ liệu truyền vào filter

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Vị trí tuyển dụng",
      data: jobList?.results,
      displayProps: "title",
      key: "job",
    },
    {
      id: 2,
      placeholder: "Trạng thái",
      data: setupHRList?.application_status_list,
      displayProps: "status",
      key: "status",
    },
    {
      id: 3,
      placeholder: "Nguồn",
      data: setupHRList?.application_source_list,
      displayProps: "title",
      key: "source",
    },
    {
      id: 4,
      placeholder: "Địa điểm",
      data: setupList?.location_list,
      displayProps: "city",
      key: "location",
    },
    {
      id: 5,
      placeholder: "Người phỏng vấn",
      data: setupList?.employee_list,
      displayProps: "username",
      key: "handler",
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
        return (
          <div>
            {dayjs(created).format("HH:mm")}{" "}
            {dayjs(created).format("DD/MM/YYYY")}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "name",
      render: (_, record) => {
        return Object.keys(record).includes("name") ? (
          <CandidateDetail candidate={record} />
        ) : (
          "Nguyễn Văn A"
        );
      },
      align: "center",
    },
    {
      key: "job",
      render: (_, { job_info }) => {
        return <div className="flex">{job_info?.title}</div>;
      },
      align: "center",
    },
    {
      key: "user",
      dataIndex: "hunter_str",
      render: (_, record) => {
        return (
          <div className="flex">
            {Object.keys(record).includes("hunter_str")
              ? record["hunter_str"]
              : "Nguyễn Văn B"}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "handler",
      dataIndex: "handler_str",
      render: (_, record) => {
        return (
          <div className="flex">
            {Object.keys(record).includes("handler_str")
              ? record["handler_str"]
              : "Nguyễn Văn C"}
          </div>
        );
      },
      align: "center",
    },
    {
      key: "info",
      render: (_, record) => {
        let colorClass = "";
        const today = dayjs();
        if (
          Object.keys(record).includes("application_interview_schedule_list")
        ) {
          if (
            record.application_interview_schedule_list &&
            record.application_interview_schedule_list.length > 0
          ) {
            const dueDay = dayjs(
              record.application_interview_schedule_list[0]?.start_time
            ); // Đảm bảo 'start_time' có giá trị
            if (dueDay.isBefore(today, "minute")) {
              colorClass = "bg-red-600 text-white"; // Quá hạn
            } else if (dueDay.isSame(today, "minute")) {
              colorClass = "bg-yellow-600 text-white"; // Trong ngày hôm nay
            } else {
              colorClass = "bg-green-600 text-white"; // Chưa đến hạn
            }
          }
          return (
            <div>
              {record.application_interview_schedule_list &&
                record.application_interview_schedule_list.length === 0 ? (
                <AddAndUpdateInterview id={record.id} />
              ) : (
                record.application_interview_schedule_list?.map(
                  (result: any) => (
                    <div className="flex gap-2">
                      {/* <div key={result.id} className={`flex text-sm text-center px-2 py-2 rounded-br-full ${colorClass} `}>
                      <div>{result?.start_time && dayjs(result?.start_time).format("HH:mm")}</div> -
                      <div>{result?.start_time && dayjs(result?.start_time).format("DD/MM/YYYY")} </div>
                    </div> */}
                      <AddAndUpdateInterview
                        edit={true}
                        id={record.id}
                        data={result}
                      />
                    </div>
                  )
                )
              )}
            </div>
          );
        }
      },
      align: "center",
    },
    {
      key: "status",
      render: (_, record) => {
        return (
          <UpdateApplicationStatus
            record={record}
            statusList={setupHRList?.application_status_list}
          />
        );
      },
      align: "center",
    },
    {
      key: "source",
      render: (_, { source_str, source_color }) => {
        return <Tag color={source_color}>{source_str}</Tag>;
      },
      align: "center",
    },
    {
      key: "location",
      dataIndex: "location_str",
      align: "center",
    },
    {
      key: "note",
      render: (_, record) => renderRecontactData(record),
      align: "center",
    },
    {
      title: ``,
      dataIndex: "",
      key: "x",
      fixed: "right",
      width: width > 640 ? 160 : 35,
      render: (_, { id, file }) => (
        <div className="flex gap-2">
          <ActionTable
            items={[
              {
                key: "1",
                label: (
                  <AddAndUpdateApplication edit={true} applicationId={id} />
                ),
              },
              {
                key: "2",
                label: (
                  <Popconfirm
                    title={t("table.deleteCandidates")}
                    description={t("table.appDescription")}
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
                ),
              },
              {
                key: "3",
                label: (
                  <Link href={`${file}`} target="_blank">
                    <Button size="small" className="text-primary max-sm:hidden">
                      File
                    </Button>
                    <div className="sm:hidden text-center">File</div>
                  </Link>
                )
              }
            ]}
          />
        </div>
      ),
      align: "center",
    },
  ];

  const onDelete = async (applicationId: any) => {

    try {
      await deleteApplication({ applicationId });
      notification.success({
        message: `${t("noficationDelete.applicationSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.applicationFailed")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const rowSelection = {
    selectedRowKeys: menuName === t("noficationAddAndUpdate.aLotSelect")
      ? selectedRowKeysForExport
      : selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      onSelectChange(selectedRowKeys); // Gọi hàm onSelectChange
    },
    getCheckboxProps: (record: DataType) => ({
      // disabled: record.title === "Disabled User",
      name: record?.job_info?.title,
    }),
  };

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    setFilterObject(initialState);
    refetch();
  };

  const memoizedColumns = useMemo(() => {

    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.application_management?.find(
          (entry: { key: number }) => entry.key === column.key
        );
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.application_management?.find(
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

    return filteredData.map((item: DataType, index) => {
      const latestNote = [...(item.application_note_list || [])].sort((a: any, b: any) => dayjs(b.created).diff(dayjs(a.created)))[0]?.note || '';

      return {
        ...item,
        created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
        job: item.job_info?.title,
        application_interview_schedule_list: item.application_interview_schedule_list?.map((schedule: any) => {
          return `Start: ${dayjs(schedule.start_time).format("DD/MM/YYYY HH:mm")}, End: ${dayjs(schedule.end_time).format("DD/MM/YYYY HH:mm")}`;
        }).join('; ') || 'Phỏng vấn',
        note: latestNote,
        key: index + 1,
      };
    });
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
      title: 'Thông tin ứng viên',
      key: 'name',
    },
    {
      title: 'Email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      key: 'mobile',
    },
    // {
    //   title: 'File',
    //   key: 'file',
    // },
    {
      title: 'Vị trí tuyển dụng',
      key: 'job'
    },
    {
      title: 'Người tìm kiếm',
      key: 'hunter_str'
    },
    {
      title: 'Người phỏng vấn',
      key: "handler_str",
    },
    {
      title: 'Thông tin phỏng vấn',
      key: 'application_interview_schedule_list'
    },
    {
      title: 'Trạng thái',
      key: 'status_str'
    },
    {
      title: 'Nguồn',
      key: 'source_str'
    },
    {
      title: 'Địa điểm',
      key: 'location_str'
    },
    {
      title: 'Ghi chú',
      key: 'note'
    },
  ];

  const pdfOptions = {
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 15 },
      2: { cellWidth: 15 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 13 },
      6: { cellWidth: 14 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { cellWidth: 15 },
      10: { cellWidth: 15 },
      11: { cellWidth: 15 },
      12: { cellWidth: 15 },
      13: { cellWidth: 12 }
    }
  }

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllApplicationList } = useGetAllApplicationListQuery(undefined, {
    skip: !isExportTriggered,
  })

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyUngVien",
    pdfTheme: "striped",
    pdfOptions,
  });

  useEffect(() => {
    if (isExportTriggered && AllApplicationList) {
      const newData = AllApplicationList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllApplicationList, isExportTriggered]);

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

  const transformedExcelData = React.useMemo(() => {
    if (!applicationExcel?.results) return [];

    return applicationExcel.results.map((item: any) => ({
      ...item,
      // Replace job ID with job title
      job: item.job_info?.title || '',
      // Add more transformations as needed
    }));
  }, [applicationExcel?.results]);

  return (
    <div
      className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-70px)] p-6`}
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
        <Form layout="inline" className="max-md:gap-2 w-full">
          <Form.Item className="max-md:w-full mb-3">
            <Input placeholder="Tìm kiếm ứng viên" onChange={onSearchChange} />
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
          <ExcelExport
            open={openExcelModal}
            setOpen={setOpenExcelModal}
            data={transformedExcelData}
            pageSize={rowExcel}
            setPageSize={setRowExcel}
          />
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
          <SelectColumn
            dataColumn={columnConfig}
            setDataColumn={setColumnConfig}
          />

          <AddAndUpdateApplication />
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
            total: applicationList?.total || 0,
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
