"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Descriptions, Tag, Rate, Tooltip, Typography, Tabs, Button, Card, Col, Row, Drawer, notification, Form, Input, Pagination, Spin } from "antd";
import dynamic from "next/dynamic";
import { useGetUserRequestsForAdminQuery, useGetSurveysForAdminQuery, useDeleteUserRequestForAdminMutation } from "@/api/CustomerService/apiCustomerService";

const { TabPane } = Tabs;
const { Text } = Typography;

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import kiểu dáng cho ReactQuill
import RequestDetail from "@/components/FunctionsManagement/CustomerService/AdminProcess/RequestDetail";
import SurveyDetail from "@/components/FunctionsManagement/CustomerService/AdminProcess/SurveyDetail";
import UpdateRequestStatus from "@/components/FunctionsManagement/CustomerService/AdminProcess/UpdateRequestStatus";
import { useWindowSize } from "@/utils/responsiveSm";
import { useTranslations } from "next-intl";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Filter from "@/components/Filter/Filter";
import dayjs from "dayjs";
import { useGetSetUpCustomerServiceQuery } from "@/api/SetUp/apiSetup";



// Component để render HTML an toàn
const HtmlContent = ({ content }: { content: string | undefined }) => <div dangerouslySetInnerHTML={{ __html: content || '' }} />;

const statusOptions = [
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'in_progress', label: 'Đang xử lý' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'failed', label: 'Thất bại' },
];

const severityOptions = [
  { id: 'low', label: 'Thấp' },
  { id: 'medium', label: 'Trung bình' },
  { id: 'high', label: 'Cao' },
  { id: 'critical', label: 'Nghiêm trọng' },
];
// Hàm xác định màu sắc dựa trên trạng thái
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "failed":
      return "red";
    default:
      return "default"; // Màu mặc định của Ant Design
  }
};

const getStatusTextInVietnamese = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'in_progress':
      return 'Đang xử lý';
    case 'completed':
      return 'Hoàn thành';
    case 'failed':
      return 'Thất bại';
    default:
      return 'Không xác định'; // Trạng thái không xác định
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'green'; // Thấp
    case 'medium':
      return 'orange'; // Trung bình
    case 'high':
      return 'red'; // Cao
    case 'critical':
      return 'volcano'; // Nghiêm trọng
    default:
      return 'default'; // Màu mặc định của Ant Design
  }
};

const getSeverityTextInVietnamese = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'Thấp';
    case 'medium':
      return 'Trung bình';
    case 'high':
      return 'Cao';
    case 'critical':
      return 'Nghiêm trọng';
    default:
      return 'Không xác định';
  }
};

const initialStateFilter = {
  status: [],           // Bộ lọc theo trạng thái
  severity: [],
  created_by_username: [],        // Bộ lọc theo danh mục
};

const AdminProcess = () => {
  const t: any = useTranslations();
  const isCollapse = useSelector(
    (state: RootState) => state.collapse.isCollapse
  );
  const { data: surveyData, isLoading: isLoadingSurveys } = useGetSurveysForAdminQuery();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSurveyItem, setSelectedSurveyItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [width] = useWindowSize();
  const [selectedRequestForStatusUpdate, setSelectedRequestForStatusUpdate] = useState(null);

  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
  });
  const [filterObject, setFilterObject] = useState(initialStateFilter);

  const { data: requestData, isLoading: isLoadingRequests, refetch } = useGetUserRequestsForAdminQuery(
    {
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm,
      status: filterObject.status,
      severity: filterObject.severity,
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      created_by_username: filterObject.created_by_username
    }
  );

  const { data: setUpCustomerService } = useGetSetUpCustomerServiceQuery({});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const onCloseDrawer = () => {
    setSelectedItem(null);
  };

  const onCloseSurveyDrawer = () => {
    setSelectedSurveyItem(null);
  };

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  const dataArrQuery = [
    {
      id: 2,
      placeholder: "Trạng thái",
      data: statusOptions,
      displayProps: "label",
      key: "status",
    },
    {
      id: 3,
      placeholder: "Mức độ nghiêm trọng",
      data: severityOptions,
      displayProps: "label",
      key: "severity",
    },
    {
      id: 4,
      placeholder: "Người Tạo",
      data: setUpCustomerService?.created_by_users,
      displayProps: "last_name",
      key: "created_by_username",
      // creator: "user_profile"
    },
  ];

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  return (
    <div className={`overflow-x-auto w-screen  ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"
      }   p-6`}>
      <Row align="middle" justify="space-between" style={{ marginBottom: '20px' }}>
        <Col className="w-full">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách yêu cầu" key="1">
              <Col className="mb-4">
                <Row gutter={[16, 16]} justify="space-between">
                  <Col span={16}> {/* Adjust span to allocate more width to the input */}
                    <Form layout="inline" className="max-md:gap-2 w-full">
                      <Form.Item className="max-md:w-full w-1/3 mb-3">
                        <Input placeholder={"Tiêu đề, Mô tả"} onChange={onSearchChange} suffix={isLoadingRequests && <Spin />} />
                      </Form.Item>
                    </Form>
                  </Col>
                  <Col>
                    <Filter
                      dataQuery={dataArrQuery}
                      objectFilter={filterObject}
                      setObjectFilter={setFilterObject}
                      setPagination={setPagination}
                      setDateRange={setDateRange}
                      pagination={pagination}
                      initialState={initialStateFilter}
                      dateRange={dateRange}
                    />
                  </Col>
                </Row>
              </Col>
              <Row gutter={[16, 16]}>
                {/** @ts-ignore */}
                {requestData?.results.map(request => (
                  <Col key={request.id} xs={24} sm={12} md={8}>
                    <Card
                      title={<strong>{`Ticket ${request.id.toString().padStart(4, '0')} - ${request.title}` || "Không có tiêu đề"}</strong>}
                      actions={[
                        <Button key="view" type="link" onClick={() => setSelectedItem(request.id)}>
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <p><strong>Ngày đăng:</strong> {new Date(request.created_at).toLocaleString()}</p>
                      <p><strong>Người tạo:</strong> {request.created_by_username}</p>
                      {request.status == "completed" && (
                        <p><strong>Ngày hoàn thành:</strong> {new Date(request?.actual_completion_date).toLocaleString()}</p>
                      )}
                      <div className="tags-container" style={{ marginBottom: "10px" }}>
                        <Tag color={getSeverityColor(request.severity)}>
                          {getSeverityTextInVietnamese(request.severity)}
                        </Tag>
                        <Tag
                          color={getStatusColor(request.status)}
                        >
                          {getStatusTextInVietnamese(request.status)}
                        </Tag>
                        {request?.function_category_name && (
                          <Tag>
                            {request.function_category_name}
                          </Tag>
                        )}
                        {request?.detail_function_name && (
                          <Tag>
                            {request.detail_function_name}
                          </Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={requestData?.total}
                onChange={(page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize });
                }}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                style={{ marginTop: "20px", textAlign: "center" }}
              />
            </TabPane>

            <TabPane tab="Khảo sát" key="2">
              <Row gutter={[16, 16]}>
                {/** @ts-ignore */}
                {surveyData?.results.map(item => (
                  <Col key={item.id} xs={24} sm={12} md={8}>
                    <Card
                      title={`Khảo sát từ ${item.created_by_username}`}
                      actions={[
                        <Button key="view" type="link" onClick={() => setSelectedSurveyItem(item)}>
                          Chi tiết
                        </Button>,
                      ]}
                    >
                      <p><strong>Ý kiến đóng góp:</strong> {item.building_comment}</p>
                      <div className="survey-stats">
                        <p>
                          <Tag color={item.recommend_to_others ? "green" : "red"}>
                            {item.recommend_to_others ? "Được đề xuất" : "Không được đề xuất"}
                          </Tag>
                          <Tag color={item.follow_up_needed ? "yellow" : "blue"}>
                            {item.follow_up_needed ? "Cần theo dõi thêm" : "Không cần theo dõi thêm"}
                          </Tag>
                        </p>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={requestData?.total} // Ensure `total` is being returned from your API
                onChange={(page, pageSize) => {
                  setPagination({ ...pagination, current: page, pageSize });
                  // You can refetch the data here if needed
                }}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                style={{ marginTop: "20px", textAlign: "center", marginBottom: "20px" }}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Drawer hiển thị chi tiết yêu cầu */}
      <Drawer
        title="Chi Tiết Yêu Cầu"
        width={width > 768 ? "65%" : "100%"}
        open={!!selectedItem}
        onClose={onCloseDrawer}
        destroyOnClose
      >
        {selectedItem && (
          <Suspense fallback={<Spin />}>
            <RequestDetail requestId={selectedItem} isAdminSolution={true} onClose={onCloseDrawer} refetch={refetch} />
          </Suspense>
        )}
      </Drawer>

      {/* Drawer hiển thị chi tiết khảo sát */}
      <Drawer
        title="Chi Tiết Khảo Sát"
        width={width > 768 ? "65%" : "100%"}
        open={!!selectedSurveyItem}
        onClose={onCloseSurveyDrawer}
        destroyOnClose
      >
        {selectedSurveyItem && <SurveyDetail survey={selectedSurveyItem} />}
      </Drawer>
    </div>
  );
};

export default AdminProcess;
