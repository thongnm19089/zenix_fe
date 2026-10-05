import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ToggleComponent from '@/components/ToggleComponent';
import AutoHeightTransition from '@/components/AutoHeightTransition';
import {
  usePortalBussinessQuery,
  usePortalDocumentAddMutation,
  usePortalDocumentGroupsQuery,
  usePortalPaymentAddMutation,
  usePortalServiceDeleteMutation,
  usePortalServiceEditMutation,
  usePortalServicePackageAddMutation,
  usePortalServicePackageDeleteMutation, usePortalServicePackageQuery, usePortalServiceQuery,
  usePortalVideoAddMutation,
  usePortalVideosGroupsQuery,
usePortalVideosQuery
} from '@/api/Project/apiPortal';
import { Business } from './BusinessTable';
import EditBussinessServiceModal from './components/EditServiceModal';
import EditDetailedPackageModal from './components/EditServicePackageModal';
import { IoAddCircleOutline } from 'react-icons/io5';
import {
  FiCreditCard,
  FiPackage, FiVideo
} from 'react-icons/fi';
import { CgFileDocument } from 'react-icons/cg';
import EditPortalVideoModal from './components/EditVideoModal';
import EditDocumentModal from './components/EditDocumentModal';
import EditPaymentScheduleModal from './components/EditPaymentModal';
const { Text } = Typography;

export interface ServicePackage {
  id: number;
  name: string;
  monthly_fee: string;
  cycle: string;
}

export interface BusinessService {
  id: number;
  code: string;
  name: string;
  service_type: string;
  service_type_display: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  business: number;
  created_at: string;
  updated_at: string;
  service_packages: ServicePackage[];
}

// 1. Define the TypeScript interface
export interface DetailedServicePackage {
  id: number;
  portal_service_name: string;
  name: string;
  monthly_fee: string;
  cycle: string;
  description: string;
  benefits: string;
  is_active: boolean;
  portal_service: number;
  created_at: string;
  updated_at: string;
}

// Helpers
const formatCurrency = (amountString: string) => {
  return `${parseFloat(amountString).toLocaleString('vi-VN')} VND`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

function PackageTable({ service }: { service: BusinessService | null }) {
  const [deletePackgeHandle] = usePortalServicePackageDeleteMutation();
  const [editHandle] = usePortalServiceEditMutation();
  const [isOpenModal, setOpenModal] = useState(false);
  const [currentPackage, setCurrentPackge] = useState<DetailedServicePackage | null>(null)
  const [modelOpen, setModelOpen] = useState<"" | "payment">("");
  const [paymentAddHandle] = usePortalPaymentAddMutation();

  const columns: ColumnsType<DetailedServicePackage> = [
    {
      title: 'Thông tin chung',
      key: 'overview',
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{record?.name}</span>
          <span className="text-xs text-blue-600 mt-1">{record?.portal_service_name}</span>
        </div>
      ),
    },
    {
      title: 'Giá cả & Chu kỳ',
      key: 'pricing',
      width: 160,
      render: (_, record) => {
        let cycleColor = 'default';
        if (record.cycle === 'monthly') cycleColor = 'blue';
        if (record.cycle === 'quarterly') cycleColor = 'cyan';
        if (record.cycle === 'yearly') cycleColor = 'purple';

        return (
          <div className="flex flex-col items-start gap-1">
            <span className="font-semibold text-green-600">
              {formatCurrency(record.monthly_fee)}
            </span>
            <Tag color={cycleColor} className="uppercase text-[10px] m-0">
              {record.cycle}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Phúc lợi & mô tả',
      key: 'details',
      width: 350,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-gray-600 italic">
            "{record.description}"
          </span>
          {/* whitespace-pre-line ensures the \r\n in your string renders as actual line breaks */}
          <div className="text-sm text-gray-800 whitespace-pre-line bg-gray-50 p-2 rounded border border-gray-100">
            {record.benefits}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive) => (
        isActive ? <Tag color="success">ACTIVE</Tag> : <Tag color="error">INACTIVE</Tag>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 120,
      render: (dateStr) => <span className="text-sm text-gray-500">{formatDate(dateStr)}</span>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Add payment schedule">
            <Button type="text" icon={<FiCreditCard />} className="text-blue-500"
              onClick={() => {
                setModelOpen("payment");
                setCurrentPackge(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Package">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-green-600"
              onClick={() => {
                setOpenModal(!isOpenModal);
                setCurrentPackge(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                deletePackgeHandle({ id: record.id }).unwrap().then((_) => {
                  message.success('Gói dịch vụ đã bị xóa');
                  setCurrentPackge(null)
                  setOpenModal(false);
                }).catch(() => {
                  message.error('Có lỗi xảy ra');
                  setCurrentPackge(null)
                  setOpenModal(false);
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

  const packageIds = useMemo(() => {
    return service?.service_packages.map(service_pack => service_pack.id) ?? []
  }, [service?.service_packages])

  const getPackage = usePortalServicePackageQuery({ ids: packageIds });

  return (
    <>
      <Table
        className="overflow-x-auto"
        columns={columns}
        dataSource={getPackage.data ?? []}
        rowKey="id"
        scroll={{ x: 1100 }}
        bordered
        pagination={false}
      />
      <EditDetailedPackageModal
        isOpen={isOpenModal}
        initialData={currentPackage}
        onClose={() => {
          setOpenModal(false);
          setCurrentPackge(null);
        }}
        onSubmit={async (record) => {
          await editHandle(record).unwrap()
        }}
        service={service}
      />
      <EditPaymentScheduleModal
        initialData={null}
        isCreating
        isOpen={modelOpen === "payment"}
        onClose={() => {
          setModelOpen("")
        }}
        onSubmit={async (payment) => {
          //@ts-ignore
          await paymentAddHandle({ ...payment, service_package: currentPackage.id, portal_service: currentPackage?.portal_service }).unwrap()
        }}
      />
    </>
  );
}


export default function ServiceTable({ limit, offset, onTotal }: { limit: number, offset: number, onTotal: (total: number) => void }) {
  const [currentService, setService] = useState<BusinessService | null>(null);
  const getServicePortal = usePortalServiceQuery({ limit, offset })
  const [handleDelete] = usePortalServiceEditMutation();

  const [deleteService] = usePortalServiceDeleteMutation();
  const [isOpenEditServiceModal, setOpenEditModal] = useState(false);
  const [editingService, setEditingService] = useState<BusinessService | null>(null);

  const [isOpenPackModal, setOpenPackModal] = useState(false);

  const [modelOpen, setModelOpen] = useState<"" | "video" | "doc" | "pack">("");
  const [addVideoHandle] = usePortalVideoAddMutation();
  const [addDocumentHandle] = usePortalDocumentAddMutation();
  const [packageAddHandle] = usePortalServicePackageAddMutation();
  const videoGroups = usePortalVideosGroupsQuery({});
  const docGroups = usePortalDocumentGroupsQuery({});

  const data = useMemo(() => {
    if (!getServicePortal.isSuccess) {
      return []
    }
    const services: BusinessService[] = getServicePortal.data.results;

    onTotal(getServicePortal.data.count)
    return services;
  }, [getServicePortal.isSuccess, getServicePortal.data])

  const businessIds: number[] = useMemo(() => {
    return data.map((service) => service.business)
  }, [data])

  const getBusinesses = usePortalBussinessQuery({ ids: businessIds });

  const businesses: Business[] = useMemo(() => {
    if (!getBusinesses.isSuccess) {
      return [];
    }

    return getBusinesses.data ?? [];
  }, [getBusinesses.isSuccess, getBusinesses.data])

  const getVideos = usePortalVideosQuery({limit: 0});
  const videos_count = useMemo(() => {
    if (!getVideos.isSuccess) {
      return 0;
    }
    const count: number =  getVideos.data.count;
    return count
  }, [getVideos.isSuccess, getVideos.data])

  const columns: ColumnsType<BusinessService> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      fixed: 'left',
      width: 120,
      render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Doanh nghiệp',
      dataIndex: 'business',
      key: 'business',
      fixed: 'left',
      width: 200,
      render: (business_id) => {
        const business_name = businesses.find(business => business.id === business_id)?.name;

        return (
          <div className="flex flex-col">
            <span className="font-medium">{business_name}</span>
            <span className="font-semibold text-blue-600">#{business_id}</span>
          </div>
        )
      }
    },
    {
      title: 'Thông tin dịch vụ',
      key: 'service_info',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.name}</span>
          {/* Dynamic tag color based on service type */}
          <Tag color={record.service_type === 'ai' ? 'purple' : 'geekblue'} className="w-max mt-1">
            {record.service_type_display}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Phí gói',
      key: 'packages',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          {record.service_packages.map((pkg) => {
            // Format "2000000.00" to "2,000,000"
            const formattedFee = parseFloat(pkg.monthly_fee).toLocaleString('vi-VN');
            return (
              <div key={pkg.id} className="text-sm border-l-2 border-gray-200 pl-2">
                <div className="font-medium text-gray-800">{pkg.name}</div>
                <div className="text-gray-500">
                  {formattedFee} VND / <span className="capitalize">{pkg.cycle}</span>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'timeline',
      width: 200,
      render: (_, record) => {
        // Format dates from YYYY-MM-DD to DD/MM/YYYY
        const formatDate = (dateStr: string) => {
          const [year, month, day] = dateStr.split('-');
          return `${day}/${month}/${year}`;
        };
        return (
          <div className="flex flex-col text-sm">
            <span><Text type="secondary">Start:</Text> {formatDate(record.start_date)}</span>
            <span><Text type="secondary">End:</Text> {formatDate(record.end_date)}</span>
          </div>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (desc) => (
        <Tooltip placement="topLeft" title={desc} overlayInnerStyle={{ maxWidth: 300 }}>
          {desc}
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const color = status === 'active' ? 'success' : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Add Video">
            <Button type="text" icon={<FiVideo />} className="text-blue-500"
              onClick={() => {
                setModelOpen("video");
                setEditingService(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Add Document">
            <Button type="text" icon={<CgFileDocument />} className="text-blue-500"
              onClick={() => {
                setModelOpen("doc");
                setEditingService(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Add package">
            <Button type="text" icon={<FiPackage />} className="text-blue-500"
              onClick={() => {
                setModelOpen("pack");
                setEditingService(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-green-600"
              onClick={() => {
                setEditingService(record);
                setOpenEditModal(!isOpenEditServiceModal);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Bạn có muốn xóa không?"
              description="Hành động này không thể bị thu hồi."
              icon={<QuestionCircleOutlined style={{ color: 'red' }} rev={undefined} />}
              onConfirm={() => {
                if (record.service_packages.length > 0) {
                  message.error("Phải xóa hết các gói dịch vụ");
                  return;
                }
                console.log(record)
                deleteService({ id: record.id }).unwrap().then((_) => {
                  message.success('Dịch vụ đã bị xóa');
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

  useEffect(() => {
    if (currentService) {
      const newCurrent = data.find(ele => ele.id === currentService.id)
      setService(newCurrent ?? null)
    }
  }, [data, getServicePortal.data])

  // 4. Render Table with Pagination setup
  return (
    <div className="flex flex-col gap-2 mx-4 overflow-x-hidden">
      <ToggleComponent className="flex flex-col gap-2" title="Các gói dịch vụ">
        <AutoHeightTransition>
          <PackageTable
            service={currentService}
          />
        </AutoHeightTransition>
      </ToggleComponent>
      <div className="overflow-x-scroll">
        <Table
          columns={columns}
          dataSource={data}
          onRow={(record) => {
            return {
              onClick: (_) => {
                setService(record)
              }
            }
          }}
          rowKey="id"
          scroll={{ x: "max-content" }} // Exact pixel width is safer than max-content for column widths
          bordered
          pagination={false}
        />
      </div>
      <EditBussinessServiceModal
        initialData={editingService}
        isOpen={isOpenEditServiceModal}
        onClose={() => {
          setOpenEditModal(false);
          setEditingService(null);
        }}
        onSubmit={async (record) => {
          await handleDelete(record).unwrap();
        }}
      />

      <EditPortalVideoModal
        isOpen={modelOpen === "video"}
        isAdd
        initialData={{sort_order: videos_count}}
        onSubmit={async (video) => {
          //@ts-ignore
          await addVideoHandle({ portal_service: editingService.id, ...video }).unwrap()
        }}
        //@ts-ignore
        availableGroups={videoGroups.data?.results}
        onClose={() => {
          setModelOpen("")
          setEditingService(null)
        }}
      />
      <EditDocumentModal
        isOpen={modelOpen === "doc"}
        initialData={null}
        isCreating
        onSubmit={async (doc) => {
          //@ts-ignore
          await addDocumentHandle({ portal_service: editingService.id, ...doc }).unwrap()
        }}
        //@ts-ignore
        availableGroups={docGroups.data?.results}
        onClose={() => {
          setModelOpen("")
          setEditingService(null)
        }}
      />
      <EditDetailedPackageModal
        initialData={null}
        isCreate
        isOpen={modelOpen === "pack"}
        onClose={() => {
          setModelOpen("")
          setEditingService(null)
        }}
        service={null}
        onSubmit={async (pack) => {
          //@ts-ignore
          await packageAddHandle({ ...pack, portal_service: editingService.id, }).unwrap();
        }}
      />
    </div>
  );
}
