"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Table, Select, message, Modal } from 'antd';
import dynamic from 'next/dynamic';
import { useGetUserRequestsQuery, useCreateUserRequestMutation } from '@/api/CustomerService/apiCustomerService';

const { Option } = Select;

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Request {
  id: number;
  type: string;
  title: string;
  severity: string;
  description?: string;
  create_time: string;
  admin_request?: {
    feedback: string;
    status: string;
    admin_handle_time: string;
    handled_by: number;
  } | null;
}

const UserRequest: React.FC = () => {
  const { data, refetch, isLoading } = useGetUserRequestsQuery();
  const [createUserRequest, { isLoading: isLoadingAdd }] = useCreateUserRequestMutation();
  const [form] = Form.useForm();

  const [isAddRequestModalVisible, setIsAddRequestModalVisible] = useState(false);
  const [isRequestDetailsModalVisible, setIsRequestDetailsModalVisible] = useState(false);
  const [isAdminDetailsModalVisible, setIsAdminDetailsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const requests: Request[] = data?.results || [];

  const onFinish = async (values: Omit<Request, 'id' | 'create_time' | 'admin_request'>) => {
    try {
      await createUserRequest(values).unwrap();
      message.success('Request added successfully');
      form.resetFields();
      setIsAddRequestModalVisible(false);
      refetch();
    } catch (error) {
      message.error('Failed to add request');
    }
  };

  const showRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsRequestDetailsModalVisible(true);
  };

  const showAdminDetails = (request: Request) => {
    setSelectedRequest(request);
    setIsAdminDetailsModalVisible(true);
  };

  const handleAddRequestModalClose = () => {
    setIsAddRequestModalVisible(false);
  };

  const handleRequestDetailsModalClose = () => {
    setIsRequestDetailsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleAdminDetailsModalClose = () => {
    setIsAdminDetailsModalVisible(false);
    setSelectedRequest(null);
  };

  const HtmlContent = ({ content }: { content: string | undefined }) => {
    return <div dangerouslySetInnerHTML={{ __html: content || '' }} />;
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
    // {
    //   title: 'Admin Status',
    //   dataIndex: ['admin_request', 'status'],
    //   key: 'admin_status',
    //   render: (text: string) => text || 'Pending',
    // },
    {
      title: 'Admin Feedback',
      dataIndex: ['admin_request', 'status'],
      key: 'admin_feedback',
      render: (text: string, record: Request) =>
        text ? (
          <a onClick={() => showAdminDetails(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
            {text}
          </a>
        ) : (
          'Pending !'
        ),
    },
  ];

  return (
    <div>
      <h1>Customer Service</h1>

      <Button type="primary" onClick={() => setIsAddRequestModalVisible(true)} style={{ marginBottom: 16 }}>
        Add New Request
      </Button>

      <Table dataSource={requests} columns={columns} rowKey="id" loading={isLoading} pagination={false} />

      <Modal
        title="Add New Request"
        visible={isAddRequestModalVisible}
        onCancel={handleAddRequestModalClose}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select the request type' }]}
          >
            <Select placeholder="Select a type">
              <Option value="issue">Issue</Option>
              <Option value="bug">Bug</Option>
              <Option value="feature">New Feature</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Severity"
            name="severity"
            rules={[{ required: true, message: 'Please select the severity level' }]}
          >
            <Select placeholder="Select a severity level">
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter the request title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the request description' }]}
          >
            <ReactQuill theme="snow" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoadingAdd}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {selectedRequest && (
        <Modal
          title="Request Details"
          visible={isRequestDetailsModalVisible}
          onCancel={handleRequestDetailsModalClose}
          footer={[
            <Button key="close" onClick={handleRequestDetailsModalClose}>
              Close
            </Button>,
          ]}
        >
          <p><strong>Type:</strong> {selectedRequest.type}</p>
          <p><strong>Severity:</strong> {selectedRequest.severity}</p>
          <p><strong>Created At:</strong> {new Date(selectedRequest.create_time).toLocaleString()}</p>
          <p><strong>Description:</strong> <HtmlContent content={selectedRequest.description} /></p>
        </Modal>
      )}

      {selectedRequest && selectedRequest.admin_request && (
        <Modal
          title="Admin Request Details"
          visible={isAdminDetailsModalVisible}
          onCancel={handleAdminDetailsModalClose}
          footer={[
            <Button key="close" onClick={handleAdminDetailsModalClose}>
              Close
            </Button>,
          ]}
        >
          <p><strong>Admin Status:</strong> {selectedRequest.admin_request.status}</p>
          <p><strong>Admin Feedback:</strong> <HtmlContent content={selectedRequest.admin_request.feedback} /></p>
          <p><strong>Handled By:</strong> {selectedRequest.admin_request.handled_by}</p>
          <p><strong>Handled At:</strong> {new Date(selectedRequest.admin_request.admin_handle_time).toLocaleString()}</p>
        </Modal>
      )}
    </div>
  );
};

export default UserRequest;
