"use client";
import { useEditOrderMutation } from "@/api/CRM/apiOrder";
import { Button, Form, DatePicker, Modal, notification, Select, Tag, } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from 'dayjs';
import { useGetSetupCrmAppQuery } from "@/api/SetUp/apiSetup";
const { Option } = Select;

function UpdateOrderStatus({
    record,
    statusList,
    // refetch,
}: {
    record: any;
    statusList: any[];
    // refetch: any;
}) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const t: any = useTranslations();
    const showModal = () => {
        setIsModalOpen(true);
    };

    const { data: setupCrmApp } = useGetSetupCrmAppQuery();

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [form] = Form.useForm();
    const [editOrderStatus, { isLoading: isLoadingEdit }] = useEditOrderMutation();

    // Set the initial form value when the component mounts or when dueDate changes
    useEffect(() => {
        if (record.status) {
            form.setFieldsValue({ status: record.status });
        }
    }, [record, form]);

    const onEdit = async (values: any) => {
        console.log("values", values);
        try {
            const body = {
                id: record.id, // Giả sử bạn cần ID của đơn hàng để cập nhật
                status: values.status,
            };
            console.log(body)
            let result;
            result = await editOrderStatus(body);
            if (result && "error" in result) {
                notification.error({
                    message: `${t('Cập nhật trạng thái thất bại')}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
            } else {
                notification.success({
                    message: `${t('Cập nhật trạng thái thành công')}`,
                    placement: "bottomRight",
                    className: "h-16",
                });
                setIsModalOpen(false);
                // refetch();
            }
        } catch (error) {
            console.log(error);
            notification.error({
                message: `${t('general.error')}`,
                placement: "bottomRight",
            });
        }
    };

    console.log(record)
    return (
        <>
            <Button type="link" onClick={showModal} className="p-0">
                {record?.status ? (
                    <Tag color={record?.status_info.color}>{record?.status_info.status}</Tag>
                ) : (
                    <Tag color="#87d068">Đã lên đơn</Tag>
                )}
            </Button>


            <Modal
                title={t("Cập nhật trạng thái đơn hàng")}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                width={500}
            >
                <Form onFinish={onEdit} form={form} className="mt-4">
                    <Form.Item name="status" label={t("Trạng thái đơn hàng")} rules={[{ required: true }]} className="w-full">
                        <Select
                            showSearch
                            placeholder={t("Trạng thái đơn hàng")}
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                            }
                        >
                            {statusList?.map((item) => (
                                <Option key={item.id} value={item.id}>
                                    {item.status}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={isLoadingEdit}>
                        {t('general.confirm')}
                    </Button>
                </Form>
            </Modal>
        </>
    );
}

export default UpdateOrderStatus;
