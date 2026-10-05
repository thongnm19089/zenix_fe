import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography, Card, Popconfirm, message } from 'antd';
import Icon, {
  EditOutlined,
  DeleteOutlined,
  LinkOutlined, MenuOutlined, PlayCircleOutlined, QuestionCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  usePortalServiceIdsQuery,
  usePortalVideoDeleteMutation,
  usePortalVideoEditMutation,
  usePortalVideoGroupAddMutation,
  usePortalVideoGroupDeleteMutation,
  usePortalVideoGroupEditMutation,
  usePortalVideosGroupsQuery, usePortalVideosQuery
} from '@/api/Project/apiPortal';
import ToggleComponent from '@/components/ToggleComponent';
import AutoHeightTransition from '@/components/AutoHeightTransition';
import EditVideoGroupModal from './components/EditVideoGroupModal';
import EditPortalVideoModal from './components/EditVideoModal';
import { BusinessService } from './ServiceTable';

const { Text } = Typography;

export interface PortalVideo {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  video_file: string | null;
  video_url: string | null;
  thumbnail: string | null;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
  portal_service: number;
  group: number;
}

export interface VideoGroup {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  sort_order: number;
}

// Helper to convert seconds to MM:SS format
const formatDuration = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

function VideoGroupTable({ data }: { data: VideoGroup[] }) {
  const [deleteHandle] = usePortalVideoGroupDeleteMutation();
  const [editHandle] = usePortalVideoGroupEditMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curGroup, setCurGroup] = useState<VideoGroup | null>(null);

  // 2. Define the Columns
  const columns: ColumnsType<VideoGroup> = [
    {
      title: 'Trình tự',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
      render: (order) => (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <MenuOutlined className="cursor-grab hover:text-blue-500" title="Drag to reorder" rev={undefined} />
          <span>{order}</span>
        </div>
      ),
    },
    {
      title: 'Tên Nhóm',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (desc) => <Text type="secondary">{desc}</Text>,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Group">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-blue-600"
              onClick={() => {
                setCurGroup(record)
                setOpenModel(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                deleteHandle({ id: record.id }).then((_) => {
                  message.success('Xóa thành công');
                }).catch(() => {
                  message.error('Có lỗi xảy ra');
                })
              }} // Fires when "Yes" is clicked
              okText="Có"
              cancelText="Không"
              placement="topRight"
            >
              <Button danger type="text" icon={<DeleteOutlined rev={undefined} />}>
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  const [isOpenCreate, setOpenCreate] = useState(false);
  const [addVideoGroup] = usePortalVideoGroupAddMutation();

  // 4. Render Table
  return (
    <>
      <Table
        className="overflow-auto"
        columns={columns}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 800 }}
        bordered
        pagination={false}
        footer={() => (
          <Button
            type="dashed"
            onClick={() => {
              setOpenCreate(true)
            }}
            block // Makes the button span the entire width of the table
            icon={<PlusOutlined rev />}
            className="h-10 text-gray-500 hover:text-blue-600 border-gray-300"
          >
            Add New Record
          </Button>
        )}
      />
      <EditVideoGroupModal
        isCreate={false}
        isOpen={isOpenModal}
        initialData={curGroup}
        onClose={() => {
          setOpenModel(false);
          setCurGroup(null);
        }}
        onSubmit={async (record) => {
          if (record.sort_order) {
            record.sort_order = Math.min(record.sort_order, data.length)
          }
          await editHandle(record).unwrap()
        }}
      />
      <EditVideoGroupModal
        isCreate
        isOpen={isOpenCreate}
        //@ts-ignore
        initialData={{sort_order: data.length}}
        onClose={() => {
          setOpenCreate(false);
        }}
        onSubmit={async (record) => {
          //@ts-ignore
          await addVideoGroup(record).unwrap()
        }}
      />
    </>
  );
}

export default function VideoTable({ limit, offset, setTotal }: { limit?: number, offset?: number, setTotal: (total: number) => void }) {
  const [deleteHandle] = usePortalVideoDeleteMutation();
  const [editHandle] = usePortalVideoEditMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curEdit, setCurEdit] = useState<PortalVideo | null>(null);

  const getVideos = usePortalVideosQuery({ limit, offset });
  const getVideoGroups = usePortalVideosGroupsQuery({});
  const [data, videos_count] = useMemo(() => {
    if (!getVideos.isSuccess) {
      return [[], 0];
    }
    const videos: PortalVideo[] =  getVideos.data.results;
    const count: number =  getVideos.data.count;
    return [videos, count]
  }, [getVideos.isSuccess, getVideos.data])

  const groups: VideoGroup[] = useMemo(() => {
    if (!getVideoGroups.isSuccess) {
      return [];
    }
    return getVideoGroups.data.results
  }, [getVideoGroups.isSuccess, getVideoGroups.data])

  const getServiceIds = usePortalServiceIdsQuery(data.map(ele => ele.portal_service))
  const services: BusinessService[] = useMemo(() => {
    if (!getServiceIds.isSuccess) {
      return []
    }

    return getServiceIds.data ?? [];
  }, [getServiceIds.isSuccess, getServiceIds.data])

  // 2. Define the Columns
  const columns: ColumnsType<PortalVideo> = [
    {
      title: 'Trình tự',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      align: 'center',
      render: (order) => (
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <MenuOutlined className="cursor-grab hover:text-blue-500" title="Drag to reorder" rev={undefined} />
          <span>{order}</span>
        </div>
      ),
    },
    {
      title: 'Thông tin video',
      key: 'video_details',
      width: 280,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.title}</span>
          <span className="text-gray-500 text-sm truncate max-w-[250px]" title={record.description}>
            {record.description}
          </span>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      width: 100,
      render: (seconds) => (
        <Tag color="default" className="font-mono">
          {formatDuration(seconds)}
        </Tag>
      ),
    },
    {
      title: 'Đường đẫn',
      key: 'media',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.video_file && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined rev={undefined} />}
              href={record.video_file}
              target="_blank"
              className="p-0 text-blue-600 h-auto"
            >
              Play Video
            </Button>
          )}
          {record.video_url && (
            <Button
              type="link"
              size="small"
              icon={<LinkOutlined rev={undefined} />}
              href={record.video_url}
              target="_blank"
              className="p-0 text-indigo-500 h-auto"
            >
              External Link
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: 'Routing',
      key: 'routing',
      width: 240,
      render: (_, record) => (
        <div className="flex flex-col text-sm text-gray-600 gap-1">
          <span><Text type="secondary">Service: </Text> {services.find(ser => ser.id === record.portal_service)?.name ?? record.portal_service}</span>
          <span><Text type="secondary">Group: </Text> {groups.find(g => g.id === record.group)?.name ?? record.group}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        isActive ? <Tag color="success">ACTIVE</Tag> : <Tag color="error">INACTIVE</Tag>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Video">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-green-600"
              onClick={() => {
                setOpenModel(true);
                setCurEdit(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                deleteHandle({ id: record.id }).then((_) => {
                  message.success('Xóa thành công');
                }).catch(() => {
                  message.error('Có lỗi xảy ra');
                })
              }} // Fires when "Yes" is clicked
              okText="Có"
              cancelText="Không"
              placement="topRight"
            >
              <Button danger type="text" icon={<DeleteOutlined rev={undefined} />}>
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  // 4. Render Table
  return (
    <div className="flex flex-col gap-2 mx-4 overflow-x-hidden">
      <ToggleComponent className="flex flex-col gap-2" title="Loại Video">
        <AutoHeightTransition>
          <VideoGroupTable
            data={groups}
          />
        </AutoHeightTransition>
      </ToggleComponent>
      <Table
        className="overflow-x-scroll"
        columns={columns}
        dataSource={data}
        rowKey="id"
        scroll={{ x: 1200 }}
        bordered
        pagination={false}
      />
      <EditPortalVideoModal
        isOpen={isOpenModal}
        initialData={curEdit}
        availableGroups={groups}
        onClose={() => {
          setOpenModel(false);
          setCurEdit(null);
        }}
        onSubmit={async (record) => {
          await editHandle({...record, sort_order: Math.min(record.sort_order ?? videos_count, videos_count)}).unwrap();
        }}
      />
    </div>
  );
}
