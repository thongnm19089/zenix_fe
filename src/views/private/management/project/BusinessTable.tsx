import React, { useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePortalBussinessAddMutation,
usePortalBussinessDeleteMutation, usePortalBussinessEditMutation, usePortalBussinessesQuery, usePortalServiceAddMutation } from '@/api/Project/apiPortal';
import EditBusinessModal from './components/EditBusinessModal';
import { IoAddCircleOutline } from 'react-icons/io5';
import EditBussinessServiceModal from './components/EditServiceModal';
import { UndoIcon } from 'lucide-react';
import { FcServices } from 'react-icons/fc';

// 1. Define the data shape (Great for Next.js/TypeScript projects)
export interface Business {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  tax_code: string;
  phone: string;
  email: string;
  address: string;
  contact_person: string;
  status: string;
  note: string;
  user: number;
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Hoạt động';
    case 'inactive': return 'Không hoạt động';
    case 'pending': return 'Chờ xử lý';
    default: return status.toUpperCase();
  }
};


export default function BussinessTable({ limit, offset, onTotal }: { limit: number, offset: number, onTotal: (total: number) => void }) {
  const [deleteBussinessHandle] = usePortalBussinessDeleteMutation();
  const [addServiceHandle] = usePortalServiceAddMutation();
  const [addBusinessHandle] = usePortalBussinessAddMutation();
  const [editBusinessPortal] = usePortalBussinessEditMutation();

  const [isOpenEditModal, setOpenEditModel] = useState(false);
  const [isOpenChildModal, setOpenChildModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Business | null>(null)
  const [isCreating, setCreating] = useState(false);

  const normalizeBusinessPayload = (record: Partial<Business>) => {
    return Object.fromEntries(
      Object.entries(record).filter(([, value]) => value !== undefined && value !== "")
    );
  };

  // 2. Upgraded Columns with Sorting, Filtering, and Actions
  const columns: ColumnsType<Business> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 150,
      render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Công ty',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name), // Alphabetical sorting
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.name}</span>
          {record.tax_code && <span className="text-xs text-gray-500">{record.tax_code}</span>}
        </div>
      ),
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 180,
    },
    {
      title: 'Thông tin liên lạc',
      key: 'contact_info',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col text-sm">
          <span>{record.phone}</span>
          <span className="text-gray-500">{record.email}</span>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
        { text: 'Chờ xử lý', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
        return <Tag color={color}>{getStatusText(status)}</Tag>;
      },
    },
    {
      title: 'Tạo vào',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (dateString) => {
        const date = new Date(dateString);
        return (
          <div className="flex flex-col text-sm">
            <span>{date.toLocaleDateString('en-GB')}</span>
            <span className="text-gray-400 text-xs">{date.toLocaleTimeString('en-GB')}</span>
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right', // Pins actions to the right side
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Add service">
            <Button type="text" icon={<FcServices />} className="text-blue-500"
              onClick={() => {
                setOpenChildModal(true);
                setEditingRecord(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-green-600"
              onClick={() => {
                setOpenEditModel(true);
                setEditingRecord(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                deleteBussinessHandle({ id: record.id }).then((_) => {
                  message.success('Doanh nghiệp đã bị xóa');
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

  const getBussinessPortal = usePortalBussinessesQuery({ limit, offset })
  const data: Business[] = useMemo(() => {
    if (!getBussinessPortal.isSuccess) {
      return []
    }
    const bussinessData = getBussinessPortal?.data;

    onTotal(bussinessData.count)
    return getBussinessPortal?.data?.results ?? []
  }, [getBussinessPortal.isSuccess, getBussinessPortal.data])

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-hidden">
      {/* Add Business Button */}
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          icon={<PlusOutlined rev={undefined} />}
          onClick={() => {
            setEditingRecord(null);
            setCreating(true);
            setOpenEditModel(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Thêm doanh nghiệp
        </Button>
      </div>
      {/* 2. The Table */}
      <div className="overflow-x-scroll">
        <Table
          className="mx-2"
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 'main-content' }} // Exact pixel width is safer than max-content for column widths
          bordered
          pagination={false}
        />
      </div>
      <EditBussinessServiceModal
        isAdd
        isOpen={isOpenChildModal}
        initialData={null}
        onClose={() => {
          setOpenChildModal(false);
          setEditingRecord(null);
        }}
        onSubmit={async (record) => {
          if (!editingRecord?.id) {
            throw Error("Business id not found");
          }
          //@ts-ignore
          await addServiceHandle({ ...record, business: editingRecord.id }).unwrap()
        }}
      />
      <EditBusinessModal
        isOpen={isOpenEditModal}
        isAdd={isCreating}
        initialData={editingRecord}
        onClose={() => {
          setOpenEditModel(false);
          setCreating(false);
          setEditingRecord(null);
        }}
        onSubmit={async (record) => {
          if (isCreating) {
            const payload = normalizeBusinessPayload(record);
            await addBusinessHandle(payload as Omit<Business, 'id'>).unwrap();
          } else {
            const payload = normalizeBusinessPayload(record);
            await editBusinessPortal(payload).unwrap();
          }
        }}
      />
    </div>
  );
}
