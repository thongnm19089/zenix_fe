import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography,Card,Popconfirm,message } from 'antd';
import Icon, { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  LinkOutlined ,
  MenuOutlined,
  QuestionCircleOutlined,
PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePortalDocumentDeleteMutation,
usePortalDocumentEditMutation,
usePortalDocumentGroupAddMutation,
usePortalDocumentGroupDeleteMutation,
usePortalDocumentGroupEditMutation,
usePortalDocumentGroupsQuery, usePortalDocumentQuery, 
usePortalServiceIdsQuery} from '@/api/Project/apiPortal';
import ToggleComponent from '@/components/ToggleComponent';
import AutoHeightTransition from '@/components/AutoHeightTransition';
import EditDocumentGroupModal from './components/EditDocumentGroupModal';
import EditDocumentModal from './components/EditDocumentModal';
import { UndoIcon } from 'lucide-react';
import { BusinessService } from './ServiceTable';

const { Text } = Typography;

// 1. Define the data interface
export interface PortalDocument {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  usage_function: string;
  doc_type: string;
  file: string | null;
  url: string | null;
  view_count: number;
  is_active: boolean;
  portal_service: number;
  group: number;
}

// 1. Define the data interface
export interface DocumentGroup {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

function DocumentGroupTable({data}: {data: DocumentGroup[]}) {
  const [deleteGroupHandle] = usePortalDocumentGroupDeleteMutation();
  const [editHandle] = usePortalDocumentGroupEditMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curGroup, setCurGroup] = useState<DocumentGroup | null>(null);


  const columns: ColumnsType<DocumentGroup> = [
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
      title: 'Tên',
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
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => (
        isActive ? <Tag color="success">ACTIVE</Tag> : <Tag color="error">INACTIVE</Tag>
      ),
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
                setCurGroup(record);
                setOpenModel(!isOpenModal);
              }}
            />
          </Tooltip>
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                deleteGroupHandle({ id: record.id }).then((_) => {
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
        </Space>
      ),
    },
  ];
  const[isOpenCreate, setOpenCreate] = useState(false);
  const [addDocGroupHandle] = usePortalDocumentGroupAddMutation();

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
      <EditDocumentGroupModal
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
      <EditDocumentGroupModal
        isCreating
        isOpen={isOpenCreate}
        //@ts-ignore
        initialData={{sort_order: data.length}}
        onClose={() => {
          setOpenCreate(false);
        }}
        onSubmit={async (record) => {
          //@ts-ignore
          await addDocGroupHandle(record).unwrap()
        }}
      />
    </>
  );
}

export default function DocumentTable({ limit, offset, setTotal }: {limit?: number, offset?: number, setTotal: (total: number) => void}) {
  const [deleteDocumentHandle] = usePortalDocumentDeleteMutation();
  const [editHandle] = usePortalDocumentEditMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curEdit, setCurEdit] = useState<PortalDocument | null>(null);
  const getDocuments = usePortalDocumentQuery({limit, offset});

  const data: PortalDocument[] = useMemo(() => {
    if (!getDocuments.isSuccess) {
      return []
    }
    setTotal(getDocuments.data.count);
    return getDocuments.data.results ?? [];
  }, [getDocuments.data, getDocuments.isSuccess])

  const getServiceIds = usePortalServiceIdsQuery(data.map(ele => ele.portal_service))
  const services: BusinessService[] = useMemo(() => {
    if (!getServiceIds.isSuccess) {
      return []
    }

    return getServiceIds.data ?? [];
  }, [getServiceIds.isSuccess, getServiceIds.data])

  const getDocumentGroups = usePortalDocumentGroupsQuery({});
  const groups: DocumentGroup[] = useMemo(() => {
    if (!getDocumentGroups.isSuccess) {
      return []
    }

    return getDocumentGroups.data.results ?? [];
  }, [getDocumentGroups.data, getDocumentGroups.isSuccess])
  // 2. Define the Columns
  const columns: ColumnsType<PortalDocument> = [
    {
      title: 'Tên tài liệu',
      key: 'title_desc',
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.title}</span>
          <span className="text-gray-500 text-sm truncate max-w-xs" title={record.description}>
            {record.description}
          </span>
        </div>
      ),
    },
    {
      title: 'Loại tài liệu',
      key: 'type_usage',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1">
          <Tag color="cyan" className="uppercase text-xs">{record.doc_type}</Tag>
          <span className="text-sm text-gray-600 truncate max-w-[180px]" title={record.usage_function}>
            {record.usage_function}
          </span>
        </div>
      ),
    },
    {
      title: 'Đường link',
      key: 'resources',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.file && (
            <Button 
              type="link" 
              size="small" 
              icon={<DownloadOutlined rev={undefined} />} 
              href={record.file} 
              target="_blank"
              className="p-0 text-blue-600 h-auto"
            >
              Download File
            </Button>
          )}
          {record.url && (
            <Button 
              type="link" 
              size="small" 
              icon={<LinkOutlined rev={undefined} />} 
              href={record.url} 
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
      title: 'Thông số',
      key: 'metrics',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col text-sm text-gray-600 gap-1">
          <span><EyeOutlined className="mr-1" rev={undefined} /> {record.view_count} views</span>
          <span><Text type="secondary">Service:</Text> {services.find(s => s.id === record.portal_service)?.name ?? record.portal_service}</span>
          <span><Text type="secondary">Group:</Text> {groups.find(g => g.id === record.group)?.name ?? record.group}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => {
        return isActive 
          ? <Tag color="success">ACTIVE</Tag> 
          : <Tag color="error">INACTIVE</Tag>;
      },
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'created_at',
      key: 'created_at',
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
          <Tooltip title="Edit Document">
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
                deleteDocumentHandle({ id: record.id }).then((_) => {
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
      <ToggleComponent className="flex flex-col gap-2" title="Nhóm tài liệu">
        <AutoHeightTransition>
          <DocumentGroupTable
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
      <EditDocumentModal
        isOpen={isOpenModal}
        initialData={curEdit}
        onClose={() => {
          setCurEdit(null);
          setOpenModel(!isOpenModal);
        }}
        availableGroups={groups}
        onSubmit={async (record) => {
          const payload = { ...record };
          if (payload?.file && typeof payload.file === "string") {
            //@ts-ignore
            delete payload.file;
          }
          if (!payload.url) {
            //@ts-ignore
            delete payload.url;
          }
          await editHandle(payload).unwrap()
        }}
      />
    </div>
  );
}
