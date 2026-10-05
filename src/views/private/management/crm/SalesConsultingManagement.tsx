"use client";

import {
  useDeleteLeadSellerMutation,
  useGetLeadSellerListQuery,
  useDeleteMultiLeadSellerMutation,
  useEditMultiLeadSellerMutation,
  useDeteleReContactDateMutation,
  useGetAllLeadSellerListQuery,
} from "@/api/CRM/apiLead";
import { useGetSetupCrmAppQuery, useGetSetupQuery } from "@/api/SetUp/apiSetup";
import ActionTable from "@/components/DropDown/ActionTable";
import Filter from "@/components/Filter/Filter";
import SelectColumn from "@/components/Filter/SelectColumn";
import StatusFilter from "@/components/Filter/StatusFilter";
import AddAndUpdateLead from "@/components/FunctionsManagement/CRM/AddAndUpdateLead";
import CustomerDetail from "@/components/FunctionsManagement/CRM/CustomerDetail";
import OrderDetail from "@/components/FunctionsManagement/CRM/Order/OrderDetail";
import OrderModal from "@/components/FunctionsManagement/CRM/Order/OrderModal";
import UpdateNoteLead from "@/components/FunctionsManagement/CRM/UpdateNoteLead";
import ModalDelEdit from "@/components/ModalDialog/Modal";
import { addToCart, deleteCart } from "@/features/cartSlice";
import { RootState } from "@/store/store";
import { useWindowSize } from "@/utils/responsiveSm";
import { CheckCircleOutlined } from "@ant-design/icons";
import { BsFiletypeXls } from 'react-icons/bs';
import { BsFiletypeCsv } from "react-icons/bs";
import { BsFiletypePdf } from "react-icons/bs";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {
  Button,
  Dropdown,
  Divider,
  Input,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  notification,
  Timeline,
} from "antd";
import { DatePicker, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MenuProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsCartPlus } from "react-icons/bs";
import { FaRegClock, FaRegEdit, FaSearch, FaFileExport } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { FiTrash2 } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { IoRefresh } from "react-icons/io5";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import useExport from "@/utils/useExport";
import CustomerDuplicateLead from "@/components/FunctionsManagement/CRM/CustomerDuplicateList";

const { Option } = Select;

const { RangePicker } = DatePicker;

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
  note: string;
  name: string;
  mobile: string;
  email: string;
  deadline_recontact_date: any;
  latest_recontact_date: any;
  next_contact_type_str: any;
  is_duplicate_within_company: boolean;
  product_str: string[];
  followers: any[];
  stage?: any;
}

export default function SalesConsultingManagement() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const t: any = useTranslations();
  const [width, height] = useWindowSize();
  const dispatch = useDispatch();
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
  const [recontactDeadline, setRecontactDeadline] = useState("");
  const [filterObject, setFilterObject] = useState<{
    stage: number[];
    source: number[];
    marketer: number[];
    seller: number[];
    product: number[];
  }>(initialStateFilter);
  const [columnConfig, setColumnConfig] = useState<any>({ sales_consulting_management: [] });
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const {
    data: LeadSellerList,
    isLoading,
    isError,
    refetch,
    error,
  } = useGetLeadSellerListQuery({
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
    recontactDeadline,
  });

  const [deleteMultiSeller, { isLoading: loadingMulti }] = useDeleteMultiLeadSellerMutation();

  const [editMultiSeller, { isLoading: loadingEditMulti }] = useEditMultiLeadSellerMutation();

  useEffect(() => {
    const storageColumn = localStorage.getItem("column");
    if (storageColumn) {
      const parsedColumn = JSON.parse(storageColumn);
      const salesConsultingData = parsedColumn.sales_consulting_management;
      const salesConsultingObject = { sales_consulting_management: salesConsultingData };
      setColumnConfig(salesConsultingObject);
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
    setIsTableLoading(true);
    setPagination(newPagination);

    refetch().finally(() => {
      setIsTableLoading(false);
    });
  };

  // Xử lý thay đổi dữ liệu tìm kiếm và ngày
  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  const handleRecontactDeadlineChange = (value: any) => {
    setRecontactDeadline(value);
    setPagination({ ...pagination, current: 1 });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 4500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  // Đảm bảo rằng mỗi bản ghi có một key duy nhất
  const dataSource =
    LeadSellerList?.results.map((record: { id: any }) => ({
      ...record,
      key: record.id,
    })) || [];


  const [deteleReContactDate, { isLoading: isLoadingDelete }] = useDeteleReContactDateMutation();
  const { data: setupCrmApp } = useGetSetupCrmAppQuery();
  const { data: setupList } = useGetSetupQuery();


  // Hàm trợ giúp để xác định và hiển thị thông tin ngày liên hệ lại
  const renderRecontactStatus = (record: DataType) => {

    return (
      <div className="text-center">
        {record?.stage ? (
          <Tag color={record.followers[0]?.stage_color}>{record.followers[0]?.stage_str}</Tag>
        ) : (
          <Tag>Chưa liên hệ</Tag>
        )}
      </div>
    );
  };

  const renderRecontactData = (record: DataType) => {
    const deleteRecontactDate = async () => {
      try {
        await deteleReContactDate({ lead_id: record.id }); // Gọi API xóa ngày liên hệ lại
        // Thông báo thành công
        notification.success({
          message: t("noficationDelete.recontactDateSuccess"),
          placement: "bottomRight",
          className: "h-16",
        });
      } catch (error) {
        // Thông báo lỗi
        notification.error({
          message: t("noficationDelete.recontactDateError"),
          placement: "bottomRight",
          className: "h-16",
        });
      }
    };

    return (
      <div className="text-left">
        <Timeline
          mode="left"
          className="pt-5"
          items={[
            {
              // label: record.followers[0]?.re_contact_date,
              children: (
                <div>
                  <UpdateNoteLead
                    leadId={record.id}
                    followers={record?.followers}
                    stageList={setupCrmApp?.lead_stage_list}
                    title={
                      <>
                        <div className="h-8">
                          <span style={{ color: dayjs(record.latest_recontact_date).isBefore(dayjs()) ? 'red' : 'black' }}>
                            {record.latest_recontact_date
                              ? dayjs(record.latest_recontact_date).format("DD/MM/YYYY")
                              : "Chưa có ngày liên hệ lại"}
                          </span>
                          {record.followers[0]?.next_contact_type_str && (
                            <span>
                              {"  " + record.followers[0]?.next_contact_type_str}
                            </span>
                          )}
                        </div>
                      </>
                    }
                    contactTypeList={setupCrmApp?.lead_contact_type_list}
                  />
                </div>
              ),
              dot: <FaRegClock />,
              color:
                record.deadline_recontact_date === "CDH"
                  ? "green"
                  : record.deadline_recontact_date === "QH"
                    ? "red"
                    : "yellow",
            },
            {
              children: (
                <div>
                  <div style={{ color: dayjs(record.followers[0]?.created).isBefore(dayjs()) ? 'red' : 'black' }}>
                    {dayjs(record.followers[0]?.created).format("DD/MM/YYYY")} {record.followers[0]?.contact_type_str}
                  </div>
                  <div className="font-semibold">
                    <span className="font-semibold">{record.followers[0]?.user_str}</span>:{" "}
                    <span>{record.followers[0]?.note.length > 100 ? record.followers[0]?.note.substring(0, 100) + "......" : record.followers[0]?.note}</span>
                  </div>
                </div>
              ),
            },
          ]}
        />
        {/* <div
          className={`text-sm py-1 text-left px-2 rounded-tr-full bg-${
            record.deadline_recontact_date === "CDH"
              ? "green"
              : record.deadline_recontact_date === "QH"
              ? "red"
              : "yellow"
          }-600 text-white truncate cursor-pointer`}
        >
          <UpdateNoteLead
            leadId={record.id}
            followers={record?.followers}
            stageList={setupCrmApp?.lead_stage_list}
            title={
              (record.latest_recontact_date ? record.latest_recontact_date : "Chưa có ngày liên hệ lại") +
              (record.followers[0]?.next_contact_type_str ? " " + " " + record.followers[0]?.next_contact_type_str : "")
            }
            contactTypeList={setupCrmApp?.lead_contact_type_list}
          />
        </div>
        {top3RecentFollowers?.map((follower) => (
          <div key={follower.id}>
            {follower.re_contact_date && (
              <li>
                <b className="text-slate-400">{`${follower.user_str}: ${follower.re_contact_date}`}</b>
              </li>
            )}
          </div>
        ))} */}
      </div>
    );
  };

  const cancel = () => { };

  const productFilters =
    setupCrmApp?.product_list?.map((product: { product_name: any }) => ({
      text: product.product_name,
      value: product.product_name,
    })) || [];

  productFilters.push({ text: "Null", value: "null" }); // Thêm lựa chọn "Null"

  const dataArrQuery = [
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
      fixed: width < 640 ? false : "left",
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "",
      key: "index",
      width: 130,
      align: "center",
      fixed: width < 640 ? false : "left",
      render: (_, { id, is_ordered, order_list }) => {
        return (
          <>
            {" "}
            <Space size="middle" direction="vertical" className="text-center">
              <ActionTable
                items={[
                  {
                    key: "1",
                    label: (
                      <>
                        {is_ordered ? (
                          <OrderDetail order={order_list[0]} islead={true} />
                        ) : (
                          <>
                            <Button
                              className="flex items-center justify-center border-blue-500 text-blue-500"
                              onClick={() => onOrder(id)}
                              block
                              size="small"
                            >
                              Tạo đơn nhanh
                            </Button>
                          </>
                        )}
                      </>
                    ),
                  },
                ]}
              />
            </Space>
          </>
        );
      },
    },
    {
      key: "name",
      title: " Khách hàng",
      width: 200,
      fixed: width < 640 ? false : "left",
      render: (_, { name, id, is_duplicate_within_company }) => {
        return (
          <div className="flex flex-col gap-2 items-start">
            <AddAndUpdateLead
              edit={true}
              leadId={id}
              stageList={setupCrmApp?.lead_stage_list}
              sourceList={setupCrmApp?.lead_source_list}
              productList={setupCrmApp?.product_list}
              locationList={setupList?.location_list}
              sellerList={setupCrmApp?.seller_list}
              titleName={name}
            />
            {is_duplicate_within_company && <CustomerDuplicateLead name={name} id={id} isMarketer={false} />}
          </div>
        );
      },
      align: "center",
    },
    {
      title: "Số điện thoại",
      width: 110,
      key: "mobile",
      fixed: width < 640 ? false : "left",
      render: (_, { mobile }) => {
        return (
          <div>
            <a href={`tel:${mobile}`}>{mobile}</a>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "email",
      fixed: width < 640 ? false : "left",
      render: (_, { email }) => {
        return (
          <div>
            <a href={`mailto:${email}`} target="_blank">
              {email}
            </a>
          </div>
        );
      },
      align: "center",
    },
    {
      key: "created",
      sorter: (a, b) => dayjs(a.created).unix() - dayjs(b.created).unix(),
      render: (_, { created }) => {
        return (
          <div>
            <div>
              {dayjs(created).format("HH:mm")} {dayjs(created).format("DD/MM/YYYY")}
            </div>
          </div>
        );
      },
      align: "center",
    },

    // Cột 'reContactData'
    {
      title: `${t("crm.contactStatus")}`,
      dataIndex: "contactStatus",
      key: "stage",
      render: (_, record) => renderRecontactStatus(record),
      align: "center",
    },
    {
      title: `${t("crm.reContactData")}`,
      dataIndex: "reContactData",
      key: "re_contact_date",
      sorter: (a, b) => {
        const dateA = a.latest_recontact_date ? new Date(a.latest_recontact_date).getTime() : 0;
        const dateB = b.latest_recontact_date ? new Date(b.latest_recontact_date).getTime() : 0;
        return dateA - dateB;
      },
      render: (_, record) => renderRecontactData(record),
      align: "center",
    },
    {
      key: "seller",
      // title: `${t("table.seller")}`,
      dataIndex: "seller_str",
      align: "center",
      // width: 140,
    },
    {
      key: "marketers",
      dataIndex: "marketer_str",
      align: "center",
    },
    {
      key: "source",
      // title: `${t("admin.sources")}`,
      dataIndex: "source_str",
      align: "center",
      // width: 130,
    },
    {
      key: "products",
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
      key: "note",
      // title: `${t("crm.customerNote")}`,
      dataIndex: "note",
      align: "center",
      // width: 200,
    },
  ];

  const convertData = (data: DataType[]) => {
    const filteredData = selectedRowKeysForExport.length > 0
      ? data.filter((item: DataType) => selectedRowKeysForExport.includes(item.id))
      : data;

    return filteredData.map((item: DataType, index) => ({
      ...item,
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
      title: 'Khách hàng',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      key: 'mobile'
    },
    {
      title: 'Email',
      key: 'email'
    },
    {
      title: 'Trạng thái liên hệ',
      key: "stage_str",
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

  const { data: AllLeadSellerList, isLoading: isLoadingAllLeadSellerList } = useGetAllLeadSellerListQuery(undefined, {
    skip: !isExportTriggered,
  });


  const { onExcelPrint, onCsvPrint, onPdfPrint } = useExport({
    columns: fileColumns,
    data: convertedData,
    fileName: "QuanLyTuVanBanHang",
    pdfTheme: "striped",
    pdfOptions,
  });


  const { onExcelPrint: onExcelPrintAllData, onCsvPrint: onCsvPrintAllData, onPdfPrint: onPdfPrintAllData } = useExport({
    columns: fileColumns,
    data: convertData(allData),
    fileName: "QuanLyTuVanBanHang",
    pdfTheme: "striped",
    pdfOptions,
  });


  useEffect(() => {
    if (isExportTriggered && AllLeadSellerList) {
      const newData = AllLeadSellerList.results.map((record: any) => ({
        ...record,
        key: record.id,
      }));
      setAllData(newData);
      setIsExportComplete(true);
      setIsExportTriggered(false);
    }
  }, [AllLeadSellerList, isExportTriggered]);

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
      label: `${t('noficationDelete.deleteALot')}`,
      key: "1",
      icon: <RiDeleteBin2Line />,
    },
    {
      label: `${t('noficationAddAndUpdate.aLotUpdate')}`,
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
            <RiDeleteBin2Line size={17} fill="blue" />
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
            size={17}
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
    } else if (name === `${t("noficationAddAndUpdate.aLotSelect")}`) {
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
        await deleteMultiSeller(selectedRowKeys);
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
      const result = await editMultiSeller({
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

  const onOrder = (id: number) => {
    const leadData = LeadSellerList?.results?.find((item: { id: number }) => item.id === id);
    localStorage.setItem("orderLead", JSON.stringify(leadData));
    const productData = setupCrmApp?.product_list.filter((item: { id: number }) =>
      leadData?.product?.includes(item.id)
    );

    dispatch(deleteCart());

    productData.forEach((product: any) => {
      dispatch(
        addToCart({
          ...product,
          quantity: 1,
          sku: product.sku_list && product.sku_list.length > 0 ? product.sku_list[0] : {},
        })
      );
    });
    router.push("/business/crm/order-management/add-order");
  };

  const memoizedColumns = useMemo(() => {
    return columns
      .filter((column) => {
        if (column.width) return true;
        const configEntry = columnConfig?.sales_consulting_management?.find(
          (entry: { key: number }) => entry.key === column.key
        );
        return configEntry && configEntry.checked;
      })
      .map((column) => {
        if (!column.title) {
          const configEntry = columnConfig?.sales_consulting_management?.find(
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
          <Form.Item className="max-md:w-full w-1/2 mb-3">
            <Input placeholder={t("crm.namePhoneEmail")} onChange={onSearchChange} />
          </Form.Item>
          <Form.Item className="max-md:w-full mb-3">
            <Select placeholder={t("crm.reContactStatus")} onChange={handleRecontactDeadlineChange} allowClear>
              <Option value="QH">{t("crm.statusOverdue")}</Option>
              <Option value="CDH">{t("crm.statusUpcoming")}</Option>
              <Option value="TN">{t("crm.statusToday")}</Option>
            </Select>
          </Form.Item>
        </Form>
        <div className="flex justify-end text-right w-full gap-2 mr-2">
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
        <div className="flex justify-end text-right gap-2 max-sm:hidden">
          <Filter
            dataQuery={dataArrQuery}
            objectFilter={filterObject}
            setObjectFilter={setFilterObject}
            setDateRange={setDateRange}
            isLoading={isLoading}
            initialState={initialStateFilter}
            setPagination={setPagination}
            pagination={pagination}
            dateRange={dateRange}
          // children={
          //   <Dropdown menu={menuProps}>
          //     <div
          //       style={{
          //         width: "48px",
          //         borderWidth: "1px",
          //         borderColor: ["Xoá nhiều", "Cập nhật nhiều"].includes(menuName)
          //           ? "blue"
          //           : "#d9d9d9",
          //         borderRadius: "6px",
          //         height: "32px",
          //       }}
          //       className="flex items-center justify-center cursor-pointer"
          //     >
          //       {renderIcon(menuName, selectedRowKeys?.length)}
          //     </div>
          //   </Dropdown>
          // }
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
          <StatusFilter data={LeadSellerList?.lead_stage_list} setFilter={setFilterObject} />
        </div>
        <div className="flex gap-2">
          <div className="flex justify-end text-right gap-2 sm:hidden">
            <Filter
              dataQuery={dataArrQuery}
              objectFilter={filterObject}
              setObjectFilter={setFilterObject}
              setDateRange={setDateRange}
              isLoading={isLoading}
              initialState={initialStateFilter}
              setPagination={setPagination}
              pagination={pagination}
              dateRange={dateRange}
            // children={
            //   <Dropdown menu={menuProps}>
            //     <div
            //       style={{
            //         width: "48px",
            //         borderWidth: "1px",
            //         borderColor: ["Xoá nhiều", "Cập nhật nhiều"].includes(menuName)
            //           ? "blue"
            //           : "#d9d9d9",
            //         borderRadius: "6px",
            //         height: "32px",
            //       }}
            //       className="flex items-center justify-center cursor-pointer"
            //     >
            //       {renderIcon(menuName, selectedRowKeys?.length)}
            //     </div>
            //   </Dropdown>
            // }
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
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table
          rowSelection={
            [`${t("noficationDelete.deleteALot")}`, `${t("noficationAddAndUpdate.aLotUpdate")}`, `${t("noficationAddAndUpdate.aLotSelect")}`, `${t("noficationAddAndUpdate.exportAllData")}`].includes(menuName)
              ? rowSelection
              : undefined
          }
          columns={memoizedColumns}
          // columns={columns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            total: LeadSellerList?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100", "200"],
          }}
          onChange={handleTableChange}
          loading={isLoadingData || isTableLoading}
          scroll={{ x: 2000, y: 800 }}
          // rowSelection={rowSelection}
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
