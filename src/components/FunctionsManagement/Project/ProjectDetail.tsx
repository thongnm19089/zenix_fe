'use client';
import {
  useGetProjectDetailQuery,
  useDeleteSheetMutation,
  useDeleteTaskMutation,
  useUpdateProjectMutation,
  useGetProjectStatusListQuery,
} from '@/api/Project/apiProject';
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  Tabs,
  Tag,
} from 'antd';
import { useEffect, useState } from 'react';
import AddSheets from './AddSheets';
import { useParams } from 'next/navigation';
import { Option } from 'antd/es/mentions';
import AddTasks from './AddTasks';
import EditTaskModal from './EditTaskModal';
import Link from 'next/link';
import { useGetSetupQuery } from '@/api/SetUp/apiSetup';
import { ColumnType } from 'antd/es/table';
import AddTaskStatusToProject from './AddTaskStatusToProject';
import AddTaskPriorityToProject from './AddTaskPriorityToProject';
import AddTaskDifficultyToProject from './AddTaskDifficultyToProject';
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import { useWindowSize } from "@/utils/responsiveSm"; // Import useWindowSize
import dayjs from 'dayjs';

interface Sheet {
  id: string;
  name: string;
  data: any[];
}

interface ProjectDetail {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  user: string;
  team_members: string[];
}

function ProjectDetail() {
  const isCollapse = useSelector((state: RootState) => state.collapse.isCollapse);
  const { id } = useParams();
  const projectId = Array.isArray(id) ? id[0] : id;
  const { data: projectDetail, error, isLoading, refetch: refetchProject } =
    useGetProjectDetailQuery(projectId);
  const [updateProject] = useUpdateProjectMutation();
  const [deleteSheet] = useDeleteSheetMutation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddTasksModalOpen, setIsAddTasksModalOpen] = useState<boolean>(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [sheetsId, setSheetsId] = useState<string>('common-task');
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [deleteTask] = useDeleteTaskMutation();
  const { data: allStatusesData } = useGetProjectStatusListQuery();

  const sheetsData = projectDetail?.sheet_list;
  const tasksData = projectDetail?.task_list;
  const { data: setupList } = useGetSetupQuery();

  const [isProjectInfoVisible, setIsProjectInfoVisible] = useState(true); // Default visibility is true (visible)
  const toggleProjectInfo = () => {
    setIsProjectInfoVisible(prevState => !prevState); // Toggle visibility
  };

  // Lấy danh sách sheets
  useEffect(() => {
    // Giả sử sheetsData đã chứa dữ liệu của tất cả các sheet trong dự án hiện tại
    setSheets(sheetsData || []); // Lưu trực tiếp sheetsData vào state sheets
  }, [sheetsData]);  // Khi sheetsData thay đổi, state sheets sẽ được cập nhật  

  // Lấy danh sách tasks
  useEffect(() => {
    setTasksList(() => {
      return tasksData?.filter(
        (item: any) => String(sheetsId) === String(item.sheet)
      );
    });
  }, [sheetsId, tasksData]);

  // Sử dụng useWindowSize để lấy chiều rộng của cửa sổ
  const [width] = useWindowSize();

  useEffect(() => {
    // Kiểm tra kích thước màn hình ngay khi component được render
    if (width > 0 && width <= 768) {
      setIsProjectInfoVisible(false);  // Mặc định ẩn phần thông tin dự án trên mobile
    }
  }, [width]);  // Mỗi khi chiều rộng cửa sổ thay đổi, effect sẽ được gọi lại

  const filteredTasks = tasksData?.filter(
    (task: any) => String(task.project) === String(projectId)
  );
  // Xóa task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ id: taskId });
      message.success('Task đã được xóa.');
      refetchProject();
    } catch (error) {
      message.error('Xóa task thất bại.');
    }
    refetchProject();
  };

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Xử lý khi thay đổi trang hoặc kích thước trang
  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination);
  };

  const columns: ColumnType<any>[] = [
    {
      title: 'Công việc',
      dataIndex: 'title',
      width: '20%',
      // fixed: 'left',
      align: "center",
      render: (_, record) => (
        <>
          <p>{record.title}</p>
          <p className='text-[#646262] font-normal text-[13px]'>
            {record.user_name} {" / "}
            {dayjs(record.created).format("DD-MM-YYYY HH:mm")}
          </p>
        </>
      ),
    },
    {
      title: 'Người phụ trách',
      dataIndex: 'assignees_names',  // Use 'assignees_names' directly for the column data
      width: '15%',
      align: "center",
      render: (text: string[]) => {
        return text.map((assigneeName: string, index: number) => (
          <Tag key={index} color="blue">
            {assigneeName}  {/* Display the assignee's name */}
          </Tag>
        ));
      },
      // Add a filter for 'Người phụ trách'
      filters: setupList?.employee_list?.map((employee: any) => ({
        text: employee.username,
        value: employee.username,
      })),
      onFilter: (value: any, record: any) =>
        record.assignees_names.some((name: string) => name.toLowerCase().includes(value.toLowerCase())),  // Filter based on assignee username
      filterSearch: true,  // Enabling search inside the filter dropdown
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      width: '20%',
      align: "center",
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created',
      width: '10%',
      align: "center",
      render: (text: string) => {
        const date = new Date(text);
        return date.toLocaleDateString('vi-VN');
      },
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'deadline',
      width: '10%',
      align: "center",
      render: (text: string) => {
        if (text) {
          const date = new Date(text);
          return date.toLocaleDateString('vi-VN');
        } else {
          return null;  // Hoặc có thể để trống, tùy vào yêu cầu của bạn
        }
      },
      sorter: (a: any, b: any) => {
        // Nếu không có ngày thì giả sử null hoặc "" là một ngày muộn nhất
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        return dateA - dateB; // Sắp xếp theo thứ tự tăng dần
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_detail',
      align: "center",
      render: (text: any) => {
        return <Tag color={text?.color}>{text?.name}</Tag>;
      },
      width: '10%',
      // Add a filter for 'Trạng thái'
      filters: projectDetail?.status_list.map((status: any) => ({
        text: status.name,
        value: status.id,
      })),
      onFilter: (value: string | number | boolean, record: any) =>
        record.status === value,  // Filter by status ID
    },
    // Thêm cột priority nếu có priority_list
    ...(projectDetail?.priority_list?.length > 0
      ? [
        {
          title: 'Ưu tiên',
          dataIndex: 'priority_detail',
          width: '10%',
          align: "center" as "center",
          render: (text: any) => {
            return <Tag color={text?.color}>{text?.name}</Tag>;
          },
          // Add a filter for 'ưu tiên'
          filters: projectDetail?.priority_list.map((priority: any) => ({
            text: priority.name,
            value: priority.id,
          })),
          onFilter: (value: string | number | boolean, record: any) =>
            record.priority === value,  // Filter by priority ID
        },
      ]
      : []),
    // Thêm cột difficulty nếu có difficulty_list
    ...(projectDetail?.difficulty_list?.length > 0
      ? [
        {
          title: 'Mức độ khó',
          dataIndex: 'difficulty_detail',
          width: '10%',
          align: "center" as "center",
          render: (text: any) => {
            return <Tag color={text?.color}>{text?.name}</Tag>;
          },
          // Add a filter for 'mức độ khó'
          filters: projectDetail?.difficulty_list.map((difficulty: any) => ({
            text: difficulty.name,
            value: difficulty.id,
          })),
          onFilter: (value: string | number | boolean, record: any) =>
            record.difficulty === value,  // Filter by difficulty ID
        },
      ]
      : []),
    // Check if sheetsId is not 'common-task'
    ...(sheetsId !== 'common-task'
      ? [
        {
          dataIndex: 'action',
          fixed: "right" as any,
          align: "center" as "center",
          width: 80,
          render: (text: string, record: any) => (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                type='text'
                onClick={() => {
                  setSelectedTask(record);
                  setIsEditTaskModalOpen(true);
                }}
                icon={<EditOutlined rev={undefined} />}
              ></Button>
              <Popconfirm
                title='Bạn có chắc chắn muốn xóa task này không?'
                onConfirm={() => handleDeleteTask(record.id)}
                okText='Yes'
                cancelText='No'
              >
                <Button type='text' danger icon={<DeleteOutlined rev={undefined} />}></Button>
              </Popconfirm>
            </div>
          ),
        },
      ]
      :
      [
        {
          title: 'Sheet',
          dataIndex: 'sheet_str',
          align: "center" as "center",
          width: '10%',
          // Add a filter for 'sheet'
          filters: projectDetail?.sheet_list.map((sheet: any) => ({
            text: sheet.name,
            value: sheet.id,
          })),
          onFilter: (value: string | number | boolean, record: any) =>
            record.sheet === value,  // Filter by sheet ID
        },
      ]),
  ];

  // Mục tabs trong project detail
  const items: TabsProps['items'] = [
    {
      key: 'common-task',
      label: 'Công việc chung',
    },
    ...(sheets?.map((sheet: Sheet) => ({
      key: sheet.id,
      label: sheet.name,
      children: (
        <div>
          <Popconfirm
            title='Bạn có chắc chắn muốn xóa sheet này không?'
            onConfirm={() => handleDeleteSheet(sheet.id)}
            okText='Yes'
            cancelText='No'
          >
            <Button type='primary' danger icon={<DeleteOutlined rev={undefined} />}>
              Xóa Sheet
            </Button>
          </Popconfirm>
        </div>
      ),
    })) || []),
    {
      key: 'settings',
      label: <SettingOutlined rev={undefined} />,
      children:
        <>
          <div className='mb-3'>
            <AddTaskStatusToProject
              projectId={id}
              taskStatusData={projectDetail?.status_list}
              refetchProject={refetchProject}
            />
          </div>
          <div className='mb-3'>
            <AddTaskPriorityToProject
              projectId={id}
              taskPriorityData={projectDetail?.priority_list}
              refetchProject={refetchProject}
            />
          </div>
          <div className='mb-3'>
            <AddTaskDifficultyToProject
              projectId={id}
              taskDifficultyData={projectDetail?.difficulty_list}
              refetchProject={refetchProject}
            />
          </div>
        </>
      ,
    },
    {
      key: sheetsId,
      label: (
        <>
          {isProjectInfoVisible ?
            <FaRegEyeSlash onClick={toggleProjectInfo} size={17} className='mr-3' />
            :
            <FaRegEye onClick={toggleProjectInfo} size={17} className='mr-3' />
          }
        </>
      ),
    },
  ];

  // Gọi modal thêm sheet
  const addSheet = () => {
    setIsModalOpen(true);
  };

  // Gọi modal thêm tasks
  const addTasks = () => {
    setIsAddTasksModalOpen(true);
  };

  // Xóa sheet
  const handleDeleteSheet = async (sheetId: string) => {
    try {
      await deleteSheet({ id: sheetId });
      message.success('Sheet đã được xóa.');
      setSheets((prev) => prev.filter((sheet) => sheet.id !== sheetId));
    } catch (error) {
      message.error('Xóa sheet thất bại.');
    }
  };

  const handleStatusChange = async (value: number) => {
    try {
      await updateProject({ id: Number(projectId), status: Number(value) });
      message.success('Trạng thái dự án đã được cập nhật.');
    } catch (error) {
      message.error('Cập nhật trạng thái dự án thất bại.');
    }
  };

  if (isLoading)
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}
      >
        <Spin size='large' tip='Đang tải chi tiết dự án...' />
      </div>
    );

  if (error)
    return (
      <Alert
        message='Lỗi khi tải dự án'
        description='Không thể tải thông tin dự án. Vui lòng thử lại sau.'
        type='error'
        showIcon
        closable
        style={{ maxWidth: '800px', margin: '40px auto' }}
      />
    );

  console.log("isProjectInfoVisible", isProjectInfoVisible);

  return (
    <div className={`w-screen ${isCollapse ? "md:w-[calc(100vw-124px)]" : "md:w-[calc(100vw-300px)]"} px-2 mt-4`}>
      <Row gutter={24}>
        {/* Phần tabs và công việc */}
        <Col span={isProjectInfoVisible ? 16 : 24}> {/* Adjust the column span dynamically */}
          <Tabs
            defaultActiveKey='common-task'
            items={items}
            className='mb-3'
            onChange={(key) => setSheetsId(key)}
            tabBarExtraContent={
              <>
                <Button
                  type='primary'
                  icon={<PlusOutlined rev={undefined} />}
                  style={{ marginRight: '10px' }}
                  onClick={addSheet}
                >
                  Thêm Sheet
                </Button>
                <AddSheets
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  setSheets={setSheets}
                  projectId={projectId}
                />
                {sheetsId !== 'common-task' && sheetsId !== 'settings' && (
                  <Button
                    type='primary'
                    icon={<PlusOutlined rev={undefined} />}
                    onClick={addTasks}
                  >
                    Thêm tasks
                  </Button>
                )}
                <AddTasks
                  isAddTasksModalOpen={isAddTasksModalOpen}
                  setIsAddTasksModalOpen={setIsAddTasksModalOpen}
                  sheetsId={sheetsId}
                  projectId={projectId}
                  taskStatusList={projectDetail?.status_list}
                  refetchProject={refetchProject}
                  taskPriorityData={projectDetail?.priority_list}
                  taskDifficultyData={projectDetail?.difficulty_list}
                />
              </>
            }
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {sheetsId === 'settings' ? (
            <></>
          ) : sheetsId === 'common-task' ? (
            <Table columns={columns}
              dataSource={filteredTasks}
              pagination={{
                ...pagination,
                total: filteredTasks?.length || 0,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100", "200"],
              }}
              scroll={{ x: 1200 }}
              bordered
              onChange={handleTableChange}
              loading={isLoading}
            />
          ) : (
            <Table columns={columns}
              dataSource={tasksList}
              scroll={{ x: 1200 }}
              pagination={{
                ...pagination,
                total: tasksList?.length || 0,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100", "200"],
              }}
              bordered
              onChange={handleTableChange}
              loading={isLoading}
            />
          )}
        </Col>

        {/* Phần thông tin dự án */}
        {isProjectInfoVisible && (
          <Col xs={24} lg={8} className="hidden lg:block">
            <Card
              title={
                <>
                  <AppstoreOutlined rev={undefined} /> Thông tin dự án
                </>
              }
              bordered={false}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label='Tên dự án'>
                  {projectDetail?.name}
                </Descriptions.Item>
                <Descriptions.Item label='Thời gian'>
                  {projectDetail?.start_date} - {projectDetail?.end_date}
                </Descriptions.Item>
                <Descriptions.Item label='Mô tả'>
                  {projectDetail?.description}
                </Descriptions.Item>
                <Descriptions.Item label='Người tạo'>
                  {projectDetail?.user_str}
                </Descriptions.Item>
                <Descriptions.Item label='Trạng thái'>
                  <Select
                    value={projectDetail?.status}
                    placeholder='Chọn trạng thái dự án'
                    onChange={handleStatusChange}
                    style={{ width: '100%' }}
                  >
                    {allStatusesData?.results.map((status: any) => (
                      <Option key={status.id} value={status.id}>
                        {status.name}
                      </Option>
                    ))}
                  </Select>
                </Descriptions.Item>
              </Descriptions>
              <Link href={`/business/project/list`}>
                <Button type="link" className='mt-2'>Quay lại danh sách dự án</Button>
              </Link>
            </Card>
          </Col>
        )}
      </Row>
      <EditTaskModal
        visible={isEditTaskModalOpen}
        onClose={() => setIsEditTaskModalOpen(false)}
        task={selectedTask}
        projectId={projectId}
        sheetId={sheetsId}
        taskStatusList={projectDetail?.status_list}
        refetchProject={refetchProject}
        taskPriorityData={projectDetail?.priority_list}
        taskDifficultyData={projectDetail?.difficulty_list}
      />
    </div>
  );
}

export default ProjectDetail;
