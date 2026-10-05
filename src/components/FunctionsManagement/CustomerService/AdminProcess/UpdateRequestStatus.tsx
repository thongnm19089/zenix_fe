"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Select, notification } from 'antd';
import { useSetUpBrandQuery } from '@/api/Branding/apiBranding';
import { useUpdateUserRequestForAdminMutation } from '@/api/CustomerService/apiCustomerService';

interface UpdateRequestStatusProps {
    visible: boolean;
    onClose: () => void;
    request: any | null;
    refetch?: () => void;
    onStatusChange?: (status: any) => void | undefined;
    status: string;
}

interface StatusType {
    value: string;
    label: string;
}

export const StatusEnum: { [key: string]: StatusType } = {
    PENDING: { value: 'pending', label: 'Chờ xử lý' },
    IN_PROGRESS: { value: 'in_progress', label: 'Đang xử lý' },
    COMPLETED: { value: 'completed', label: 'Hoàn thành' },
    ON_HOLD: { value: 'on_hold', label: 'Tạm hoãn' },
    INVALID: { value: 'invalid', label: 'Không hợp lệ' },
};



const UpdateRequestStatus: React.FC<UpdateRequestStatusProps> = ({ visible, onClose, request, refetch, onStatusChange, status }) => {
    const [form] = Form.useForm();
    const [editRequestStatus, { isLoading: isUpdatingStatus }] = useUpdateUserRequestForAdminMutation();

    useEffect(() => {
        if (request) {
            form.setFieldsValue({
                status: request.status,
            });
        }
    }, [request, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // await editRequestStatus({ id: request.id, data: { status: values.status } });
            onStatusChange?.(values.status)
            notification.success({
                message: 'Request status updated successfully!',
            });
            onClose();
            form.resetFields();
            // refetch();
        } catch (error) {
            notification.error({
                message: 'Failed to update post status!',
            });
        }
    };

    console.log('check status in Update status', status)

    return (
        <Modal
            title="Update Request Status"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={isUpdatingStatus}
        >
            <Form form={form} layout="vertical" initialValues={{ status: status }}>
                <Form.Item
                    name="status"
                    label="Select New Status"
                    rules={[{ required: true, message: 'Please select a status!' }]}
                >
                    <Select placeholder="Select status">
                        {Object.keys(StatusEnum).map((key) => (
                            <Select.Option key={StatusEnum[key].value} value={StatusEnum[key].value}>
                                {StatusEnum[key].label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateRequestStatus;