"use client";

import {
  useDeleteLeadMarketerMutation,
  useDeleteMultiLeadMarketerMutation,
  useEditMultiLeadMarketerMutation,
  useGetAllLeadMarketerListQuery,
  useGetLeadMarketerListQuery,
} from "@/api/CRM/apiLead";
import { useGetSetupCrmAppQuery, useGetSetupFinanceAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import StatusFilter from "@/components/Filter/StatusFilter";
import AddAndUpdateLead from "@/components/FunctionsManagement/CRM/AddAndUpdateLead";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderModal from "@/components/FunctionsManagement/CRM/Order/OrderModal";
import ModalDelEdit from "@/components/ModalDialog/Modal";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { CheckCircleOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Button, Dropdown, Form, Input, Modal, Popconfirm, Space, Table, Tag, Timeline, Typography, notification } from "antd";
import { DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MenuProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import { FaRegEdit, FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { IoMdSettings } from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import useExport from "@/utils/useExport";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import CustomerDuplicateLead from "@/components/FunctionsManagement/CRM/CustomerDuplicateList";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DataType {
  key: React.Key;
  id: number;
  created: string;
  stage_color: string;
  source_str: string;
  stage_str: string;
  marketer_str: any;
  seller_str: any;
  is_ordered: boolean;
  order_list: any[];
  location_str: string;
  stage?: any;
  note: string;
  name: string;
  mobile: string;
  email: string;
  product_str: string[];
  followers: any[];
  is_duplicate_within_company: any,
}

const StatusList = ({ data }: { data: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Tag color={data[0]?.stage_color} onClick={showModal}>
        {data[0]?.stage_str}
      </Tag>

      <Modal title="Trạng thái" open={isModalOpen} onOk={handleOk} footer={null} onCancel={handleCancel} width={300}>
        <Timeline
          className="mt-6"
          items={data?.map((item: any) => ({
            color: "green",
            children: (
              <div>
                <div className="flex gap-2">
                  {dayjs(item.created).format("HH:mm")} - {dayjs(item.created).format("DD/MM/YYYY")}
                  {item.contact_type && (
                    <Tag bordered={false} color={item.stage_color} className="mb-1">
                      {item.contact_type_str}
                    </Tag>
                  )}
                </div>
                <div>{item.note}</div>
              </div>
            ),
          }))}
        />
      </Modal>
    </>
  );
};

export default function MarketingManagement() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const [width, height] = useWindowSize();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderList, setSelectedOrderList] = useState([]);
  const showOrderModal = (orderList: any) => {
    setSelectedOrderList(orderList);
    setIsModalOpen(true);
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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const initialStateFilter = {
    stage: [],
    source: [],
    marketer: [],
    seller: [],
    product: [],
  };

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    stage: number[];
    source: number[];
    marketer: number[];
    seller: number[];
    product: number[];
  }>(initialStateFilter);

  // Thêm tham số vào hook query
  const [columnConfig, setColumnConfig] = useState<any>({ marketing_management: [] });
  const {
    data: LeadMarketerList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetLeadMarketerListQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    stage: filterObject.stage,
    source: filterObject.source,
    marketer: filterObject.marketer,
    seller: filterObject.seller,
    product: filterObject.product,
  });


  const [deleteMultiMarketer, { isLoading: loadingMulti }] = useDeleteMultiLeadMarketerMutation();

  const [editMultiMarketer, { isLoading: loadingEditMulti }] = useEditMultiLeadMarketerMutation();

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const marketingManagementData = parsedColumn.marketing_management;
      const marketingManagementObject = { marketing_management: marketingManagementData };
      setColumnConfig(marketingManagementObject);
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

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    LeadMarketerList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];


  const [deleteLeadMarketer, { isLoading: isLoadingDelete }] = useDeleteLeadMarketerMutation();
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();
  const { data: setupList } = useGetSetupQuery();

  const onDelete = async (marketerId: any) => {
    try {
      await deleteLeadMarketer({ marketerId });
      notification.success({
        message: `${t("noficationDelete.leadMarketerSuccess")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("noficationDelete.leadMarketerError")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  const productFilters =
    setupCrmApp?.product_list?.map((product: { product_name: any }) => ({
      text: product.product_name,
      value: product.product_name,
    })) || [];

  productFilters.push({ text: "Null", value: "null" });

  const dataMktArrQuery = [
    {
      id: 2,
      placeholder: `${t("table.seller")}`,
      data: setupCrmApp?.seller_list,
      displayProps: "username",
      key: "seller",
    },
    {
      id: 3,
      placeholder: `${t("table.marketer")}`,
      data: setupCrmApp?.marketer_list,
      displayProps: "username",
      key: "marketer",
    },
    {
      id: 4,
      placeholder: `${t("admin.sources")}`,
      data: setupCrmApp?.lead_source_list,
      displayProps: "title",
      key: "source",
    },
    {
      id: 5,
      placeholder: `${t("nav.products")}`,
      data: setupCrmApp?.product_list,
      displayProps: "product_name",
      key: "product",
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
      // title: `${t("table.createdAt")}`,
      // dataIndex: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            <div>
              {dayjs(created).format("HH:mm")}- {dayjs(created).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      // title: `${t("table.customer")}`,
      // dataIndex: "name",
      key: "name",
      render: (_, { name, mobile, email, is_duplicate_within_company, id }) => {
        const customerInfo = { name, mobile, email };
        return (
          <>
            {/* <CustomerDetail customer={customerInfo} />; */}
            {/* <div>
              <div>
                {is_duplicate_within_company ? (
                  <Tag className="text-sm" style={{ backgroundColor: '#ff4d4f', color: 'white' }}>
                    <CustomerDuplicateLead name={name} id={id} isMarketer={true} />
                  </Tag>
                ) : (
                  <Text className="text-sm">{name}</Text>
                )}
              </div>
              <div>
                <a href={`tel:${mobile}`}>{mobile}</a>
              </div>
              <div>
                <a href={`mailto:${email}`} target="_blank">
                  {email}
                </a>
              </div>
            </div> */}
            <div>
              <Space direction="vertical">
                <div>
                  {is_duplicate_within_company ? (
                    <Tag className="text-sm" style={{ backgroundColor: '#ff4d4f', color: 'white' }}>
                      <CustomerDuplicateLead name={name} id={id} isMarketer={true} />
                    </Tag>
                  ) : (
                    <Text className="text-sm">{name}</Text>
                  )}
                </div>
                <div>
                  <a href={`tel:${mobile}`}>{mobile}</a>
                </div>
                <div>
                  <a href={`mailto:${email}`} target="_blank">
                    {email}
                  </a>
                </div>
              </Space>
            </div>
          </>
        );
      },
      align: "center",
    },
    {
      // title: `${t("general.status")}`,
      // dataIndex: "stage_str",
      key: "stage",
      sorter: (a, b) => {
        // Giả định rằng stage_str có thể là undefined hoặc null
        const stageA = a.followers[0]?.stage_str || "";
        const stageB = b.followers[0]?.stage_str || "";
        // So sánh chuỗi, bạn có thể thay đổi logic so sánh nếu cần
        return stageA.localeCompare(stageB);
      },
      render: (_, record) => {
        let latestContact = null;

        if (record?.followers && record.followers.length > 0) {
          latestContact = record.followers.reduce((latest, current) => {
            return new Date(latest.created) > new Date(current.created) ? latest : current;
          });
        }
        return (
          <>
            {record?.stage ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col w-100 cursor-pointer">
                    <StatusList data={record.followers} />
                    {record?.is_ordered && (
                      <Tag
                        icon={<CheckCircleOutlined rev={undefined} />}
                        color="success"
                        onClick={() => showOrderModal(record.order_list)}
                      >
                        {t("noficationAddAndUpdate.orderCreated")}
                      </Tag>
                    )}
                  </div>
                </div>
                {record?.followers.length > 0 && latestContact && (
                  <>
                    {latestContact.user_str}: {latestContact.note.length > 100 ? latestContact.note.substring(0, 100) + "..." : latestContact.note}
                  </>
                )}
              </>
            ) : (
              <Tag>
                Chưa liên hệ
              </Tag>
            )}
          </>
        );
      },
      align: "center",
    },
    {
      // title: `${t("table.seller")}`,
      key: "seller",
      dataIndex: "seller_str",
      align: "center",
    },
    {
      // title: `${t("table.marketer")}`,
      key: "marketer",
      dataIndex: "marketer_str",
      align: "center",
    },
    {
      // title: `${t("admin.sources")}`,
      key: "source",
      dataIndex: "source_str",
      align: "center",
    },
    {
      key: "product",
      dataIndex: "product_str",
      render: (_, { product_str }) => {
        return (
          <div>
            {product_str.map((product, index) => (
              <span key={index}>
                {product}
                {index !== product_str.length - 1 && ", "}
              </span>
            ))}
          </div>
        );
      },
      align: "center",
    },
    {
      // title: `${t("crm.customerNote")}`,
      key: "note",
      dataIndex: "note",
      align: "center",
      // width: 200,
    },
    {
      title: ``,
      dataIndex: "",
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
                    <AddAndUpdateLead
                      edit={true}
                      leadId={id}
                      isMarketer={true}
                      stageList={setupCrmApp?.lead_stage_list}
                      sourceList={setupCrmApp?.lead_source_list}
                      productList={setupCrmApp?.product_list}
                      locationList={setupList?.location_list}
                      sellerList={setupCrmApp?.seller_list}
                    />
                  ),
                },
                {
                  key: "2",
                  label: (
                    <Popconfirm
                      title={t("noficationDelete.location")}
                      description={t("noficationDelete.confirmMessage")}
                      onConfirm={() => onDelete(id)}
                      onCancel={cancel}
                      okText={t("general.confirm")}
                      cancelText={t("general.cancel")}
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
              ]}
            />
          </div>
        </Space>
      ),
      align: "center",
    },
  ];

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
      created: dayjs(item.created).format("DD/MM/YYYY HH:mm"),
      stage_str: item.stage_str ? item.stage_str : 'Chưa xác định',
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
      title: 'Khách hàng',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      key: 'stage_str'
    },
    {
      title: 'Người bán',
      key: 'seller_str'
    },
    {
      title: 'Người tiếp thị',
      key: 'marketer_str'
    },
    {
      title: 'Nguồn',
      key: 'source_str'
    },
    {
      title: 'Sản phẩm',
      key: 'product_str'
    },
    {
      title: 'Ghi chú',
      key: 'note'
    },
  ];

  const [allData, setAllData] = useState<any[]>([]);
  const [isExportTriggered, setIsExportTriggered] = useState(false);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const isLoadingData = isLoading || isExportTriggered;

  const { data: AllLeadMarketerList } = useGetAllLeadMarketerListQuery(undefined, {
    skip: !isExportTriggered,
  });

  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyMarketing",
    pdfTheme: "striped",
  });

  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "QuanLyMarketing",
    pdfTheme: "striped",
  });


  useEffect(() => {
    if (isExportTriggered && AllLeadMarketerList) {
      const newData = AllLeadMarketerList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllLeadMarketerList, isExportTriggered]);

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


  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "1") setMenuName(`${t("noficationDelete.deleteALot")}`);
    else if (e.key === "2") setMenuName(`${t("noficationAddAndUpdate.aLotUpdate")}`);
    else if (e.key === "3") setMenuName(`${t('noficationAddAndUpdate.aLotSelect')}`);
    else if (e.key === "4") setMenuName(`${t('noficationAddAndUpdate.exportAllData')}`);
    else if (e.key === "8") {
      setMenuName("Hành động");
      setSelectedRowKeys([]);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: `${t("noficationDelete.deleteALot")}`,
      key: "1",
      icon: <RiDeleteBin2Line />,
    },
    {
      label: `${t("noficationAddAndUpdate.aLotUpdate")}`,
      key: "2",
      icon: <FaRegEdit />,
    },
    {
      label: `${t("noficationAddAndUpdate.aLotSelect")}`,
      key: "3",
      icon: <FaFileExport />,
    },
    {
      label: (`${t("noficationAddAndUpdate.exportAllData")}`),
      key: "4",
      children: [
        { label: "Xuất Excel", key: "5", onClick: () => handleExportAllData(onExcelPrintAllData), },
        { label: "Xuất CSV", key: "6", onClick: () => handleExportAllData(onCsvPrintAllData), },
        { label: "Xuất PDF", key: "7", onClick: () => handleExportAllData(onPdfPrintAllData), },
      ]
    },
    {
      label: "Huỷ",
      key: "8",
      icon: <FcCancel />,
    },
  ];

  const renderIcon = (name: string, selectedCount: number) => {
    if (name === `${t("noficationDelete.deleteALot")}`) {
      return (
        <Popconfirm
          title={t("noficationDelete.marketingDelete")}
          description={t("noficationDelete.confirmMessageMarketing")}
          onConfirm={() => {
            if (selectedCount > 0) {
              handleClickAction();
            }
          }}
          onCancel={cancel}
          okText={t("general.confirm")}
          cancelText={t("general.cancel")}
          placement="top"
          okButtonProps={{ loading: isLoadingDelete }}
        >
          <div style={{ position: "relative" }}>
            <RiDeleteBin2Line size={20} fill="blue" />
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
        </Popconfirm>
      );
    } else if (name === `${t("noficationAddAndUpdate.aLotUpdate")}`) {
      return (
        <div style={{ position: "relative" }}>
          <FaRegEdit
            onClick={() => {
              if (selectedCount > 0) {
                handleClickAction();
              }
            }}
            size={20}
            fill="blue"
          />
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
    }
    else if (name === `${t("noficationAddAndUpdate.aLotSelect")}`) {
      return (
        <div style={{ position: "relative" }}>
          <FaFileExport
            onClick={() => {
              console.log('select')
            }}
            size={20}
            fill="blue"
          />
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
    items: [`${t("noficationDelete.deleteALot")}`, `${t("noficationAddAndUpdate.aLotUpdate")}`, `${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
      ? items
      : items.splice(0, 4),
    onClick: handleMenuClick,
  };

  const initialState = {
    marketer_id: undefined,
    seller_id: undefined,
    source_id: undefined,
  };

  const [updateProps, setUpdateProps] = useState(initialState);

  const handleClickAction = async () => {
    if (menuName === `${t("noficationDelete.deleteALot")}`) {
      try {
        await deleteMultiMarketer(selectedRowKeys);
        setSelectedRowKeys([]);
        notification.success({
          message: `${t("noficationDelete.leadMarketerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } catch (error) {
        notification.error({
          message: `${t("noficationDelete.leadMarketerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } else if (menuName === `${t("noficationAddAndUpdate.aLotUpdate")}`) {
      setOpenModal(true);
    }
  };

  const dataSelectModal = [
    {
      placeholder: "Người bán",
      displayProps: "username",
      key: "seller_id",
      data: setupCrmApp?.seller_list,
    },
    {
      placeholder: "Người tiếp thị",
      displayProps: "username",
      key: "marketer_id",
      data: setupCrmApp?.marketer_list,
    },
    {
      placeholder: "Nguồn lead",
      displayProps: "title",
      key: "source_id",
      data: setupCrmApp?.lead_source_list,
    },
  ];

  const updateMulti = async (body: any, lead_ids: any) => {
    const dataArr = Object.keys(body).filter((props) => body[props]);
    if (dataArr?.length > 0) {
      const newObj: any = {};
      dataArr.forEach((item: string) => {
        newObj[item] = body[item];
      });
      const result = await editMultiMarketer({
        lead_ids: lead_ids,
        ...newObj,
      });
      if (result && "error" in result) {
        notification.error({
          message: `${t("noficationAddAndUpdate.editLeadMarketerError")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setOpenModal(false);
        setSelectedRowKeys([]);
        setUpdateProps(initialState);
        setMenuName("Hành động");
        notification.success({
          message: `${t("noficationAddAndUpdate.editLeadMarketerSuccess")}`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    }
    setOpenModal(false);
  };
  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.marketing_management?.find(
          (entry: { key: number }) => entry.key === column.key
        );
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.marketing_management?.find(
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

  return (
    <div
      className={`lg:overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
        }   min-h-[calc(100vh-152px)] p-6`}
    >
      <div className="flex justify-between items-center pt-2 max-md:flex-col max-md:gap-2 mb-1 ">
        <Form layout="inline" className="max-md:gap-2 w-full">
          <Form.Item className="max-md:w-full">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right gap-2 max-sm:hidden">
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypeXls className="text-blue-500" />}
            onClick={onExcelPrint}>Xuất Excel</Button>
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypeCsv className="text-blue-500" />}
            onClick={onCsvPrint}>Xuất CSV</Button>
          <Button
            type="dashed"
            className="flex items-center justify-center border-blue-500 text-blue-500 max-sm:hidden"
            icon={<BsFiletypePdf className="text-blue-500" />}
            onClick={onPdfPrint}>Xuất PDF</Button>
          <Filter
            dataQuery={dataMktArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setDateRange={setDateRange}
            initialState={initialStateFilter}
            setPagination={setPagination}
            pagination={pagination}
            dateRange={dateRange}
            isLoading={isLoading}
          />
          <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
        </div>
      </div>
      <div className="flex gap-2 items-center mb-1 max-sm:flex-wrap-reverse max-sm:justify-end max-sm:mt-3">
        <div className="flex justify-center">
          <Dropdown menu={menuProps}>
            <div
              style={{
                width: "50px",
                // borderWidth: "1px",
                borderColor: [
                  `${t("noficationDelete.deleteALot")}`,
                  `${t("noficationAddAndUpdate.aLotUpdate")}`,
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
        <div className="flex-1">

          <StatusFilter data={LeadMarketerList?.lead_stage_list} setFilter={setFilterObject} />
        </div>
        <div className="flex gap-2">
          <div className="flex justify-end text-right gap-2 sm:hidden">
            <Filter
              dataQuery={dataMktArrQuery}
              objectFilter={filterObject}
              setObjectFilter={setFilterObject}
              setDateRange={setDateRange}
              initialState={initialStateFilter}
              setPagination={setPagination}
              pagination={pagination}
              dateRange={dateRange}
              isLoading={isLoading}
            />
            <SelectColumn dataColumn={columnConfig} setDataColumn={setColumnConfig} />
          </div>
          <Button
            type="dashed"
            icon={<IoRefresh className="text-blue-500" />}
            className="flex items-center justify-center border-blue-500 text-blue-500 "
            onClick={handleRefresh}
          >
            {t("general.refreshThePage")}
          </Button>
          <AddAndUpdateLead
            stageList={setupCrmApp?.lead_stage_list}
            sourceList={setupCrmApp?.lead_source_list}
            productList={setupCrmApp?.product_list}
            locationList={setupList?.location_list}
            sellerList={setupCrmApp?.seller_list}
            isMarketer={true}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table
          rowSelection={
            [`${t("noficationDelete.deleteALot")}`, `${t("noficationAddAndUpdate.aLotUpdate")}`, `${t("noficationAddAndUpdate.aLotSelect")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          columns={memoizedColumns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: LeadMarketerList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData}
          scroll={{ x: 1300, y: 810 }}
          bordered
        />
      </div>

      <OrderModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} order_list={selectedOrderList} />

      <ModalDelEdit
        dataEdit={updateProps}
        setDataEdit={setUpdateProps}
        title="Sửa theo các trường"
        open={openModal}
        setOpen={setOpenModal}
        data={dataSelectModal}
        action={() => updateMulti(updateProps, selectedRowKeys)}
      />
    </div>
  );
}
