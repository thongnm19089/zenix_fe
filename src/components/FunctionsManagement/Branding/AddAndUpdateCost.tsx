import React, { useState } from "react";
import { Button, Modal, Form, Input, Select, DatePicker, notification } from "antd";
import { useCreateCostMutation, useEditCostMutation } from "@/api/Branding/apiBranding";
import dayjs from "dayjs";

const { Option } = Select;

export default function AddAndUpdateCost({ post, refetch, costId }: any) {
    const [visible, setVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

    const [createCost] = useCreateCostMutation();
    const [editCost] = useEditCostMutation();

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                post: post.id,
                date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : null,
                amount: values.amount,
                currency: values.currency || "VND", // Default to VND if not selected
                description: values.description,
            };

            if (costId) {
                await editCost({ costId: costId, ...data });
                notification.success({ message: "Cost updated successfully" });
            } else {
                await createCost(data);
                notification.success({ message: "Cost added successfully" });
            }

            setVisible(false);
            form.resetFields();
            refetch();
        } catch (error) {
            notification.error({ message: "Error adding or updating cost" });
        }
    };

    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    return (
        <>
            <Button type="default" onClick={showModal} style={{ marginTop: "4px", width: "100%", borderRadius: "8px", backgroundColor:"red" }}>
                Add Cost
            </Button>
            <Modal
                title={costId ? "Update Cost" : "Add Cost"}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" initialValues={{ currency: "VND" }}>
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: "Please select a date" }]}
                    >
                        <DatePicker placeholder="Select date" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: "Please enter an amount" }]}
                    >
                        <Input type="number" placeholder="Enter amount" />
                    </Form.Item>
                    <Form.Item
                        name="currency"
                        label="Currency"
                        rules={[{ required: true, message: "Please select a currency" }]}
                    >
                        <Select placeholder="Select currency">
                            <Option value="VND">VND</Option>
                            <Option value="USD">USD</Option>
                            {/* Add more currency options here if needed */}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea placeholder="Enter description" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
