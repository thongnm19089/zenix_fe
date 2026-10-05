import React, { useState } from "react";
import { Button, Modal, Form, Input, Select, DatePicker, notification } from "antd";
import { useCreateMetricMutation, useEditMetricMutation, useSetUpBrandQuery } from "@/api/Branding/apiBranding";
import dayjs from "dayjs";

const { Option } = Select;

export default function AddAndUpdateMeasure({ post, refetch, metricId }: any) {
    const [visible, setVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

    const [createMetric] = useCreateMetricMutation();
    const [editMetric] = useEditMetricMutation();
    const { data: setupData, isLoading: isLoadingSetup } = useSetUpBrandQuery({});

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const data = {
                post: post.id,
                metric_type: values.metric_type,
                value: values.value,
                start_date: values.start_date ? dayjs(values.start_date).format('YYYY-MM-DD') : null,
                end_date: values.end_date ? dayjs(values.end_date).format('YYYY-MM-DD') : null,
            };

            if (metricId) {
                await editMetric({ metricId: metricId, ...data });
                notification.success({ message: "Measure updated successfully" });
            } else {
                await createMetric(data);
                notification.success({ message: "Measure added successfully" });
            }

            setVisible(false);
            form.resetFields();
            refetch();
        } catch (error) {
            notification.error({ message: "Error adding or updating measure" });
        }
    };

    const handleCancel = () => {
        setVisible(false);
        form.resetFields();
    };

    return (
        <>
            <Button type="primary" onClick={showModal} style={{ marginTop: "4px", width: "100%", borderRadius: "8px" }}>
                Add Measure
            </Button>
            <Modal
                title={metricId ? "Update Measure" : "Add Measure"}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="metric_type"
                        label="Metric Type"
                        rules={[{ required: true, message: "Please select a metric type" }]}
                    >
                        <Select placeholder="Select a metric type" loading={isLoadingSetup}>
                            {setupData?.metric_type_list.map((metricType: { id: number, name: string }) => (
                                <Option key={metricType.id} value={metricType.id}>
                                    {metricType.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="Value"
                        rules={[{ required: true, message: "Please enter a value" }]}
                    >
                        <Input type="number" placeholder="Enter value" />
                    </Form.Item>
                    <Form.Item
                        name="start_date"
                        label="Start Date"
                        rules={[{ required: true, message: "Please select a start date" }]}
                    >
                        <DatePicker placeholder="Select start date" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="end_date"
                        label="End Date"
                        rules={[{ required: true, message: "Please select an end date" }]}
                    >
                        <DatePicker placeholder="Select end date" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}
