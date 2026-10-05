"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Table, Select, message, Modal } from 'antd';
import dynamic from 'next/dynamic';
import { useGetUserRequestsQuery, useCreateAdminProcessMutation } from '@/api/CustomerService/apiCustomerService';

const { Option } = Select;

// Load ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css'; // Import the styles for ReactQuill

// HtmlContent component to render HTML safely
const HtmlContent = ({ content }: { content: string | undefined }) => {
  return <div dangerouslySetInnerHTML={{ __html: content || '' }} />;
};

interface Request {
  id: number;
  type: string;
  title: string;
  severity ?: string;
  description?: string;
  create_time: string;
  admin_request?: {
    feedback: string;
    status: string;
    admin_handle_time: string;
    handled_by: number;
  } | null;
}

const AdminProcess: React.FC = () => {
  const { data, isLoading, refetch } = useGetUserRequestsQuery();  // Added refetch
  const [createAdminRequest, { isLoading: isLoadingAdd }] = useCreateAdminProcessMutation();
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalType, setModalType] = useState<'view' | 'handle'>('view');

  const requests: Request[] = data?.results || [];

  const onFinish = async (values: { feedback: string; status: string }) => {
    if (!selectedRequest) return;

    try {
      const adminRequestData = {
        user_request: selectedRequest.id,
        feedback: values.feedback,
        newStatus: values.status,
      };

      await createAdminRequest(adminRequestData).unwrap();
      message.success('Feedback added successfully');
      setIsModalVisible(false);
      setSelectedRequest(null);
      refetch();  // Refetch data after successful submission
    } catch (error) {
      message.error('Failed to add feedback');
    }
  };

  const showRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setModalType('view');
    setIsModalVisible(true);
  };

  const showAdminStatus = (request: Request) => {
    setSelectedRequest(request);
    setIsStatusModalVisible(true);
  };

  const handleAdminRequest = (request: Request) => {
    setSelectedRequest(request);
    setModalType('handle');
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setIsStatusModalVisible(false);
    setSelectedRequest(null);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Request) => (
        <a onClick={() => showRequestDetails(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
    },
    {
      title: 'Created At',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Admin Feedback',
      dataIndex: 'admin_request',
      key: 'admin_feedback',
      render: (admin_request :any, record: Request) =>
        admin_request ? (
          <>
            <a onClick={() => showAdminStatus(record)} style={{ cursor: 'pointer', color: 'red' }}>
              {admin_request.status}
            </a>
            <br />
           
          </>
        ) : (
          <a onClick={() => handleAdminRequest(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
            Add Feedback
          </a>
        ),
    },
  ];

  return (
    <div>
      <h1>Admin Handle Request</h1>

      <Table dataSource={requests} columns={columns} rowKey="id" loading={isLoading} pagination={false} />

      {selectedRequest && (
        <>
          <Modal
            title={modalType === 'view' ? 'Request Details' : 'Add Admin Feedback'}
            visible={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
          >
            {modalType === 'view' ? (
              <>
                <p><strong>Title:</strong> {selectedRequest.title}</p>
                <p><strong>Type:</strong> {selectedRequest.type}</p>
                <p><strong>Severity:</strong> {selectedRequest.severity || 'Not set'}</p>
                <p><strong>Description:</strong> <HtmlContent content={selectedRequest.description} /></p>
                <p><strong>Created At:</strong> {new Date(selectedRequest.create_time).toLocaleString()}</p>
               
              </>
            ) : (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Status"
                  name="status"
                  initialValue={selectedRequest.admin_request?.status}
                  rules={[{ required: true, message: 'Please select the request status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="in_progress">Đang xử lý</Option>
                    <Option value="resolved">Đã xử lý</Option>
                    <Option value="on_hold">Hoãn</Option>
                    <Option value="invalid">Không hợp lệ</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Feedback"
                  name="feedback"
                  initialValue={selectedRequest.admin_request?.feedback}
                  rules={[{ required: true, message: 'Please provide your feedback' }]}
                >
                  <ReactQuill theme="snow" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={isLoadingAdd} >
                    {selectedRequest.admin_request ? 'Update Feedback' : 'Submit Feedback'}
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Modal>

          <Modal
            title="Admin Request Details"
            visible={isStatusModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Close
              </Button>,
            ]}
          >
            {selectedRequest?.admin_request && (
              <>
                <p><strong>Status:</strong> {selectedRequest.admin_request.status}</p>
                <p><strong>Feedback:</strong><HtmlContent content={selectedRequest.admin_request.feedback} /></p>
                <p><strong>Handled By:</strong> {selectedRequest.admin_request.handled_by}</p>
                <p><strong>Handled At:</strong> {new Date(selectedRequest.admin_request.admin_handle_time).toLocaleString()}</p>
              </>
            )}
          </Modal>

        </>
      )}
    </div>
  );
};

export default AdminProcess;
