"use client";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useGetProjectStatusListQuery,
  useGetProjectTypeListQuery,
  useUpdateProjectMutation,
} from "@/api/Project/apiProject";
import ProjectModal from "@/components/FunctionsManagement/Project/ProjectModal";
import {
  CalendarOutlined,
  DownOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";
import Filter from "@/components/Filter/Filter";
import { useGetSetupQuery } from "@/api/SetUp/apiSetup";
import { IoRefresh } from "react-icons/io5";

const { Search } = Input;
const { Title } = Typography;
const initialStateFilter = {
  user: [],
  type: [],
  status: [],
};

interface Project {
  task_assignees_usernames: any;
  status_detail: any;
  type_detail: any;
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: string;
  image?: string;
  status_list: {
    id: number;
    name: string;
    color: string;
  }[];
}

export default function ProjectManagement() {
  const {
    token: { colorPrimary, colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // ------------------------
  // State declarations
  // ------------------------
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [skipApi, setSkipApi] = useState(false);
  const [filterObject, setFilterObject] = useState<{
    user: number[];
    type: number[];
    status: number[];
  }>(initialStateFilter);

  // New state cho bộ lọc deadline (Dropdown).
  const [endDateFilter, setEndDateFilter] = useState<string>("all");

  // ------------------------
  // API queries
  // ------------------------

  // Query phân trang cho hiển thị danh sách.
  const { data, isLoading, refetch, isError, error } = useGetProjectsQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    user: filterObject.user,
    type: filterObject.type,
    status: filterObject.status,
  });

  // Query lấy toàn bộ dự án (sử dụng pageSize lớn) nhằm mục đích đếm tổng số.
  const { data: allProjectsData } = useGetProjectsQuery({
    page: 1,
    pageSize: 10000, // Số lớn để lấy tất cả dự án
    startDate: dateRange[0]?.format("YYYY-MM-DD"),
    endDate: dateRange[1]?.format("YYYY-MM-DD"),
    searchTerm,
    user: filterObject.user,
    type: filterObject.type,
    status: filterObject.status,
  });

  console.log(filterObject);

  const { data: setupList } = useGetSetupQuery();
  const { data: allStatusesData } = useGetProjectStatusListQuery();
  const { data: projectTypeData } = useGetProjectTypeListQuery();

  // ------------------------
  // Effects and Handlers
  // ------------------------
  // Xử lý thay đổi search input.
  const onSearchChange = (e: { target: { value: string } }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
      setPagination({ ...pagination, current: 1 });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const showModal = (project?: Project) => {
    setIsEditMode(!!project);
    setCurrentProject(project || null);
    setIsModalVisible(true);
  };

  const handleOk = async (values: any) => {
    try {
      if (isEditMode && currentProject) {
        await updateProject({ id: currentProject.id, ...values });
      } else {
        await createProject(values);
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject({ id });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const formatDate = (dateString: string): string =>
    dayjs(dateString).format("DD/MM/YYYY");

  // ------------------------
  // Helper function: Xác định deadline của dự án
  // ------------------------
  const getProjectDeadlineType = (
    project: Project
  ): "overdue" | "today" | "tomorrow" | null => {
    const completedStatusNames = [
      // Vietnamese
      "hoàn thành",
      "đã hoàn thiện nội bộ",
      "sales thu tiền",
      "đã hoàn thành",
      "đã xong",
      "hoàn tất",
      "kết thúc",
      "đóng dự án",
      "hoàn thiện",
      // English
      "completed",
      "done",
      "finished",
      "complete",
      "closed",
      // Potential abbreviations
      "ht",
      "done",
      "fin",
    ];
    const statusName = project.status_detail?.name?.toLowerCase() || "";
    const isCompleted = completedStatusNames.some((s) =>
      statusName.includes(s)
    );
    const today = dayjs().startOf("day");
    const endDate = dayjs(project.end_date).startOf("day");
    const diff = endDate.diff(today, "day");

    if (diff < 0 && !isCompleted) return "overdue";
    if (diff === 0 && !isCompleted) return "today";
    if (diff === 1 && !isCompleted) return "tomorrow";
    return null;
  };

  // ------------------------
  // Loading and error handling
  // ------------------------
  if (isLoading)
    return (
      <div style={centerContainerStyle}>
        <Spin size="large" tip="Đang tải dự án..." />
      </div>
    );

  if (error)
    return (
      <div style={pagePaddingStyle}>
        <Alert
          message="Lỗi khi tải dữ liệu"
          description="Không thể tải danh sách dự án. Vui lòng thử lại sau."
          type="error"
          showIcon
          closable
          style={alertStyle}
        />
      </div>
    );

  // ------------------------
  // Xử lý dữ liệu: Phân trang và đếm theo deadline
  // ------------------------

  // Danh sách dự án phân trang từ API.
  const projects: Project[] = Array.isArray(data?.results) ? data?.results : [];

  // Sử dụng toàn bộ dự án (allProjectsData) để tính số lượng dự án theo hạn.
  const allProjects: Project[] = Array.isArray(allProjectsData?.results)
    ? allProjectsData.results
    : [];

  const overdueCount = allProjects.filter(
    (p) => getProjectDeadlineType(p) === "overdue"
  ).length;
  const todayCount = allProjects.filter(
    (p) => getProjectDeadlineType(p) === "today"
  ).length;
  const tomorrowCount = allProjects.filter(
    (p) => getProjectDeadlineType(p) === "tomorrow"
  ).length;

  // Nếu không chọn bộ lọc deadline ("Tất cả") thì dùng dữ liệu phân trang từ API,
  // Ngược lại áp dụng lọc client-side trên toàn bộ dự án và phân trang lại.
  let listProjects: Project[] = [];
  let paginationTotal: number = data?.total || 0;
  if (endDateFilter === "all") {
    listProjects = projects;
  } else {
    const filteredDeadlineProjects = allProjects.filter(
      (p) => getProjectDeadlineType(p) === endDateFilter
    );
    paginationTotal = filteredDeadlineProjects.length;
    listProjects = filteredDeadlineProjects.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );
  }

  const dataArrQuery = [
    {
      id: 1,
      placeholder: "Nhân viên",
      data: setupList?.employee_list,
      displayProps: "username",
      key: "user",
    },
    {
      id: 2,
      placeholder: "Trạng thái",
      data: allStatusesData?.results,
      displayProps: "name",
      key: "status",
    },
    {
      id: 3,
      placeholder: "Loại dự án",
      data: projectTypeData?.results,
      displayProps: "name",
      key: "type",
    },
  ];

  const handleRefresh = () => {
    setDateRange([]);
    setTempSearchTerm("");
    setSearchTerm("");
    setSkipApi(false);
    setFilterObject(initialStateFilter);
    setEndDateFilter("all"); // Reset bộ lọc deadline về "Tất cả"
    if (!skipApi) {
      refetch();
    }
  };

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="px-6">
      <div className="flex justify-end gap-2">
        <Button
          type="primary"
          onClick={() => showModal()}
          style={{ marginBottom: "16px" }}
        >
          Thêm dự án
        </Button>
      </div>

      <div className="flex justify-start gap-2">
        <Form className="flex gap-2 max-md:gap-2 w-100 h-10">
          <Form.Item className="w-full">
            <Search placeholder="Tìm kiếm..." onChange={onSearchChange} />
          </Form.Item>
        </Form>

        <Button
          type="dashed"
          icon={<IoRefresh className="text-blue-500" />}
          className="flex items-center justify-center border-blue-500 text-blue-500"
          onClick={handleRefresh}
        >
          Làm mới
        </Button>

        <Filter
          dataQuery={dataArrQuery}
          objectFilter={filterObject}
          setObjectFilter={setFilterObject}
          setDateRange={setDateRange}
          setPagination={setPagination}
          pagination={pagination}
          isLoading={isLoading}
          initialState={initialStateFilter}
          dateRange={dateRange}
        />

        {/* Dropdown filter cho deadline */}
        <Select
          value={endDateFilter}
          onChange={(value) => {
            // Đặt lại trang về 1 khi thay đổi bộ lọc
            setPagination({ ...pagination, current: 1 });
            setEndDateFilter(value);
          }}
          style={{ width: 130 }} // điều chỉnh độ rộng tùy ý
          
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="overdue">
            <Space>
              Quá hạn
              <Tag color="error" style={{ marginLeft: 4 }}>
                {overdueCount}
              </Tag>
            </Space>
          </Select.Option>
          <Select.Option value="today">
            <Space>
              Hôm nay
              <Tag color="warning" style={{ marginLeft: 4 }}>
                {todayCount}
              </Tag>
            </Space>
          </Select.Option>
          <Select.Option value="tomorrow">
            <Space>
              Ngày mai
              <Tag
                style={{
                  marginLeft: 4,
                  backgroundColor: "orange",
                  borderColor: "orange",
                  color: "#fff",
                }}
              >
                {tomorrowCount}
              </Tag>
            </Space>
          </Select.Option>
        </Select>
      </div>

      {listProjects?.length === 0 ? (
        <Alert
          message="Không có dự án"
          description="Hiện chưa có dự án nào được tạo. Hãy tạo dự án đầu tiên!"
          type="info"
          showIcon
          style={alertStyle}
        />
      ) : (
        <>
          <Row gutter={[24, 24]} justify="start">
            {listProjects.map((project: Project) => (
              <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  style={{
                    ...cardStyle,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                    height: "100%",
                  }}
                  bodyStyle={cardBodyStyle}
                  cover={
                    project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        style={{
                          height: "120px",
                          objectFit: "cover",
                          width: "100%",
                          borderRadius: `${borderRadiusLG}px ${borderRadiusLG}px 0 0`,
                        }}
                      />
                    ) : (
                      <div style={cardHeaderStyle(colorPrimary)}>
                        <ProjectOutlined style={projectIconStyle} rev={undefined} />
                      </div>
                    )
                  }
                  actions={[
                    <Button type="link" onClick={() => showModal(project)}>
                      Chỉnh sửa
                    </Button>,
                    <Popconfirm
                      title="Bạn có chắc muốn xóa dự án này?"
                      onConfirm={() => handleDelete(project.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button type="link" danger>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Link
                    href={`/business/project/list/${project.id}`}
                    style={linkStyle}
                  >
                    <Title level={4} ellipsis style={projectTitleStyle}>
                      {project.name}
                    </Title>

                    <DateInfoItem
                      label="Ngày bắt đầu:"
                      date={formatDate(project.start_date)}
                      colorPrimary={colorPrimary}
                    />

                    <DateInfoItem
                      label="Ngày kết thúc:"
                      date={formatDate(project.end_date)}
                      colorPrimary={colorPrimary}
                      isEndDate={true}
                      rawDate={project.end_date}
                      projectStatus={project?.status_detail?.name}
                    />

                    <div style={descriptionStyle}>{project.description}</div>
                    <div style={{ marginTop: "8px" }}>
                      <Tag color={project?.type_detail?.color}>
                        {project?.type_detail?.name}
                      </Tag>
                      <Tag color={project?.status_detail?.color}>
                        {project?.status_detail?.name}
                      </Tag>
                    </div>
                    {/* Hiển thị danh sách assignees */}
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {project.task_assignees_usernames.map((username: any) => (
                        <Tooltip title={username} key={username}>
                          <Tag style={{ marginBottom: "8px" }}>{username}</Tag>
                        </Tooltip>
                      ))}
                    </div>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>

          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            onChange={(newPage, newPageSize) => {
              setPagination({
                current: newPage,
                pageSize: newPageSize,
              });
            }}
            total={paginationTotal}
            pageSizeOptions={["10", "20", "50", "100", "200"]}
            showSizeChanger
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "center",
            }}
          />
        </>
      )}

      <ProjectModal
        visible={isModalVisible}
        isEditMode={isEditMode}
        project={currentProject}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        projectTypeData={projectTypeData?.results}
        projectStatusData={allStatusesData?.results}
      />
    </div>
  );
}

// ------------------------
// Reusable DateInfoItem component
// ------------------------
const DateInfoItem: React.FC<{
  label: string;
  date: string;
  colorPrimary: string;
  isEndDate?: boolean;
  rawDate?: string;
  projectStatus?: string;
}> = ({ label, date, colorPrimary, isEndDate, rawDate, projectStatus }) => {
  let textColor = colorPrimary;
  let isOverdue = false;
  let isTodayEndDate = false;
  let isTomorrow = false;

  const completedStatusNames = [
    "hoàn thành",
    "đã hoàn thiện nội bộ",
    "sales thu tiền",
    "đã hoàn thành",
    "đã xong",
    "hoàn tất",
    "kết thúc",
    "đóng dự án",
    "hoàn thiện",
    "completed",
    "done",
    "finished",
    "complete",
    "closed",
    "ht",
    "done",
    "fin",
  ];

  const isProjectCompleted = projectStatus
    ? completedStatusNames.some((status) =>
        projectStatus.toLowerCase().includes(status)
      )
    : false;

  if (isEndDate && rawDate) {
    const today = dayjs().startOf("day");
    const endDate = dayjs(rawDate).startOf("day");
    const diff = endDate.diff(today, "day");

    if (diff === 0 && !isProjectCompleted) {
      textColor = "#ff7875";
      isTodayEndDate = true;
    } else if (diff === 1 && !isProjectCompleted) {
      isTomorrow = true;
    } else if (diff < 0 && !isProjectCompleted) {
      textColor = "#f5222d";
      isOverdue = true;
    }
  }

  return (
    <div style={dateItemStyle}>
      <CalendarOutlined
        style={{ marginRight: 8, color: textColor }}
        rev={undefined}
      />
      <span style={{ fontWeight: 500 }}>{label}</span>
      {isOverdue ? (
        <Tag color="error" style={{ marginLeft: 8 }}>
          {date} (Quá hạn)
        </Tag>
      ) : isTodayEndDate ? (
        <Tag
          style={{
            marginLeft: 8,
            background: "#FFFF66",
            borderColor: "orange",
            color: "black",
          }}
        >
          {date} (Hôm nay)
        </Tag>
      ) : isTomorrow ? (
        <Tag
          style={{
            marginLeft: 8,
            background: "orange",
            borderColor: "orange",
            color: "#fff",
          }}
        >
          {date} (Ngày mai)
        </Tag>
      ) : (
        <span style={{ marginLeft: 8 }}>{date}</span>
      )}
    </div>
  );
};

// ------------------------
// Styles
// ------------------------
const pagePaddingStyle: CSSProperties = {
  padding: "24px",
};

const centerContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  padding: "100px",
};

const alertStyle: CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
};

const linkStyle: CSSProperties = {
  height: "100%",
  textDecoration: "none",
};

const cardStyle: CSSProperties = {
  height: "100%",
  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
  transition: "all 0.3s ease",
};

const cardBodyStyle: CSSProperties = {
  padding: "16px",
};

const cardHeaderStyle = (color: string): CSSProperties => ({
  height: "120px",
  background: `linear-gradient(135deg, ${color} 0%, #87d068 100%)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const projectIconStyle: CSSProperties = {
  fontSize: "48px",
  color: "#fff",
};

const projectTitleStyle: CSSProperties = {
  marginBottom: "16px",
};

const dateItemStyle: CSSProperties = {
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
};

const descriptionStyle: CSSProperties = {
  color: "#666",
  lineHeight: 1.6,
  minHeight: "60px",
  maxHeight: "80px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
};

const counterStyle: CSSProperties = {
  background: "red",
  color: "white",
  borderRadius: "10px",
  padding: "2px 6px",
  marginLeft: "8px",
};

