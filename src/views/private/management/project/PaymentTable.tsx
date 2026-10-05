import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography, Card, Popconfirm, message } from 'antd';
import Icon, {
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  usePortalPaymentDeleteMutation,
  usePortalPaymentEditMutation,
  usePortalPaymentsQuery,
  usePortalServiceIdsQuery,
  usePortalServicePackageQuery,
  usePortalTransactionAddMutation,
  usePortalTransactionDeleteMutation,
  usePortalTransactionEditMutation,
} from '@/api/Project/apiPortal';
import ToggleComponent from '@/components/ToggleComponent';
import AutoHeightTransition from '@/components/AutoHeightTransition';
import EditTransactionModal from './components/EditTransactionModal';
import EditPaymentScheduleModal from './components/EditPaymentModal';
import { BusinessService,ServicePackage } from './ServiceTable';

const { Text } = Typography;

export interface PaymentSchedule {
  id: number;
  created_at: string;
  updated_at: string;
  period_label: string;
  due_date: string;
  amount: string;
  paid_amount: string;
  status: string;
  note: string;
  portal_service: number;
  service_package: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  schedule_period_label: string;
  schedule_portal_service_name: string;
  created_at: string;
  updated_at: string;
  payment_date: string;
  amount: string;
  method: string;
  transaction_code: string;
  note: string;
  schedule: number;
}

const formatCurrency = (amountString: string) => {
  return `${parseFloat(amountString).toLocaleString('vi-VN')} VND`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

function TransactionTable({ payment, getPayments }: { payment?: PaymentSchedule, getPayments: any }) {
  const [deleteHandle,] = usePortalTransactionDeleteMutation();
  const [editHandle,] = usePortalTransactionEditMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curEdit, setCurEdit] = useState<Transaction | null>(null);

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transaction_code',
      key: 'transaction_code',
      width: 150,
      fixed: 'left',
      render: (text) => <span className="font-semibold text-indigo-600">{text}</span>,
    },
    {
      title: 'Thông tin giao dịch',
      key: 'service_details',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1">
          <span className="font-medium text-gray-800">
            {record.schedule_portal_service_name}
          </span>
          <Tag color="blue">{record.schedule_period_label}</Tag>
        </div>
      ),
    },
    {
      title: 'Thông trả phí',
      key: 'payment_info',
      width: 160,
      render: (_, record) => (
        <div className="flex flex-col items-start gap-1 text-sm">
          <span>{formatDate(record.payment_date)}</span>
          <Tag className="uppercase text-xs" color={record.method === 'bank' ? 'cyan' : 'default'}>
            {record.method}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => (
        <span className="font-semibold text-green-600">
          +{formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Chú ý',
      dataIndex: 'note',
      key: 'note',
      width: 280,
      ellipsis: { showTitle: false },
      render: (note) => (
        <Tooltip placement="topLeft" title={note} overlayInnerStyle={{ maxWidth: 300 }}>
          <Text type="secondary">{note}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined rev={undefined} />} className="text-green-600"
              onClick={() => {
                setCurEdit(record);
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
                  setTimeout(() => {
                    getPayments.refetch()
                  }, 1000)
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

  return (
    <>
      <Table
        columns={columns}
        dataSource={payment?.transactions ?? []}
        rowKey="id"
        scroll={{ x: 1000 }}
        bordered
        pagination={false}
        locale={{
          emptyText: 'Chưa có giao dịch nào'
        }}
      />
      <EditTransactionModal
        isOpen={isOpenModal}
        initialData={curEdit}
        onClose={() => {
          setOpenModel(false);
          setCurEdit(null)
        }}
        onSubmit={async (record) => {
          await editHandle(record).unwrap();
        }}
      />
    </>
  );
}

export default function PaymentTable({ limit, offset, setTotal }: { limit?: number, offset?: number, setTotal: (total: number) => void }) {
  const [deleteHandle,] = usePortalPaymentDeleteMutation();
  const [editHandle] = usePortalPaymentEditMutation();
  const [addTransaction] = usePortalTransactionAddMutation();
  const [isOpenModal, setOpenModel] = useState(false);
  const [curEdit, setCurEdit] = useState<PaymentSchedule | null>(null);
  const getPayments = usePortalPaymentsQuery({ limit, offset });
  const data: PaymentSchedule[] = useMemo(() => {
    if (!getPayments.isSuccess) {
      return [];
    }

    setTotal(getPayments.data.count)
    return getPayments?.data?.results ?? [];
  }, [getPayments.isSuccess, getPayments.data])
  const getServices = usePortalServiceIdsQuery(data.map(ele => ele.portal_service));
  const getPackages = usePortalServicePackageQuery({ids: data.map(ele => ele.service_package)});
  const services: BusinessService[] = useMemo(() => {
    return getServices.data ?? [];
  }, [getServices.data, getServices.isSuccess])

  const packages: ServicePackage[] = useMemo(() => {
    return getPackages.data ?? []
  }, [getPackages.data, getPackages.isSuccess])

  const columns: ColumnsType<PaymentSchedule> = [
    {
      title: 'Period',
      dataIndex: 'period_label',
      key: 'period_label',
      width: 150,
      render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Service',
      dataIndex: 'portal_service',
      key: 'portal_service',
      width: 150,
      render: (portal_service, record) => {
        const service = services.find(ser => ser.id === portal_service)
        const ser_package = packages.find(pack => pack.id === record.service_package)

        return (
          <div className="flex flex-col">
            <span className="font-semibold">Service: {service?.name ?? portal_service}</span>
            <span>Package: {ser_package?.name ?? record.service_package}</span>
          </div>
        )
      }
    },
    {
      title: 'Hết hạn',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Số tiền',
      key: 'billing',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{formatCurrency(record.amount)}</span>
          {/* Show paid amount underneath in a lighter text */}
          <span className="text-xs text-gray-500">
            Paid: {formatCurrency(record.paid_amount)}
          </span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const color = status === 'paid' ? 'success' : 'warning';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: 250,
      ellipsis: { showTitle: false },
      render: (note) => (
        <Tooltip placement="topLeft" title={note}>
          {note}
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 130,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Add Transaction">
            <Button type="text" icon={<CreditCardOutlined rev />} className="text-blue-500"
              onClick={() => {
                setOpenTranModal(true);
                setCurEdit(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Schedule">
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
  const [transactions, setTransactions] = useState<PaymentSchedule | undefined>(undefined);
  const [isOpenTranModal, setOpenTranModal] = useState(false);

  useEffect(() => {
    if (transactions) {
      const currentPayment = data.find(ele => ele.id === transactions.id)
      setTransactions(currentPayment);
    }
  }, [data])

  // 4. Render Table
  return (
    <div className="flex flex-col gap-2 mx-4 overflow-x-hidden">
      <ToggleComponent className="flex flex-col gap-2" title="Các giao dịch">
        <AutoHeightTransition>
          <TransactionTable
            getPayments={getPayments}
            payment={transactions}
          />
        </AutoHeightTransition>
      </ToggleComponent>
      <Table
        className="overflow-x-scroll"
        columns={columns}
        dataSource={data}
        onRow={(record, _rowIndex) => {
          return {
            onClick: (_event) => {
              // console.log('Clicked record:', record);
              // console.log('Row index:', rowIndex);
              setTransactions(record);
            },
          };
        }}
        rowKey="id"
        scroll={{ x: 1200 }}
        bordered
        pagination={false}
      />
      <EditTransactionModal
        isOpen={isOpenTranModal}
        initialData={{
          //@ts-ignore
          schedule_portal_service_name: services.find(ele => ele.id === curEdit?.id)?.name,
          //@ts-ignore
          schedule_period_label: curEdit?.period_label
        }}
        onClose={() => {
          setCurEdit(null)
          setOpenTranModal(false)
        }}
        onSubmit={async (record) => {
          if (!curEdit) {
            throw Error("current Edit wrong");
          }
          //@ts-ignore
          await addTransaction({schedule: curEdit.id, ...record }).unwrap();
          getPayments.refetch();
        }}
      />
      <EditPaymentScheduleModal 
        isOpen={isOpenModal}
        initialData={curEdit}
        onClose={() => {
          setOpenModel(false);
          setCurEdit(null)
        }}
        onSubmit={async (record) => {
          await editHandle(record).unwrap();
          getPayments.refetch()
        }}
      />
    </div>
  );
}
