"use client";

import React, { useEffect } from 'react';
import { Modal, Form, Select, notification } from 'antd';
import { useEditPostMutation, useSetUpBrandQuery } from '@/api/Branding/apiBranding';

interface UpdatePostStatusProps {
    visible: boolean;
    onClose: () => void;
    post: any | null;
    refetch: () => void;
}

const UpdatePostStatus: React.FC<UpdatePostStatusProps> = ({ visible, onClose, post, refetch }) => {
    const [form] = Form.useForm();
    const { data: setupData, isLoading: isLoadingSetup } = useSetUpBrandQuery({});
    const [editPostStatus, { isLoading: isUpdatingStatus }] = useEditPostMutation();

    useEffect(() => {
        if (post) {
            form.setFieldsValue({
                status: post.status, // Đặt giá trị mặc định là trạng thái hiện tại của bài viết
            });
        }
    }, [post, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await editPostStatus({ postId: post.id, status: values.status });
            notification.success({
                message: 'Post status updated successfully!',
            });
            onClose();
            form.resetFields();
            refetch();
        } catch (error) {
            notification.error({
                message: 'Failed to update post status!',
            });
        }
    };

    return (
        <Modal
            title="Update Post Status"
            open={visible}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={isUpdatingStatus}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="status"
                    label="Select New Status"
                    rules={[{ required: true, message: 'Please select a status!' }]}
                >
                    <Select placeholder="Select status" loading={isLoadingSetup}>
                        {setupData?.status_list.map((status: { id: number, name: string }) => (
                            <Select.Option key={status.id} value={status.id}>
                                {status.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdatePostStatus;
