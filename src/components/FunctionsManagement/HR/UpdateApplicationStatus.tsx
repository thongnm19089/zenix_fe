"use client";
import {
    useEditApplicationMutation,
} from "@/api/HR/apiHRApp";
import { Button, Form, DatePicker, Modal, notification, Select, Tag, } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import dayjs from 'dayjs';
import { useGetSetupCrmAppQuery, useGetSetupHrAppQuery } from "@/api/SetUp/apiSetup";
const { Option } = Select;

function UpdateApplicationStatus({
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
    const { data: setupHRList } = useGetSetupHrAppQuery();

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const [form] = Form.useForm();
    const [editApplication, { isLoading: isLoadingEdit }] = useEditApplicationMutation();

    // Set the initial form value when the component mounts or when dueDate changes
    useEffect(() => {
        if (record.status) {
            form.setFieldsValue({ status: record.status });
        }
    }, [record, form]);

    const onEdit = async (values: any) => {
        const formData = new FormData();
        formData.append("status", values.status);
        const applicationId = record.id;

        try {

            let result;
            result = await editApplication({ id: applicationId, formData }).unwrap();

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
    return (
        <>
            <Button type="link" onClick={showModal} className="p-0">
                {record?.status_str ? (
                    <Tag color={record?.status_color}>{record?.status_str}</Tag>
                ) : (
                    <Tag color="#87d068">Đang xử lý</Tag>
                )}
            </Button>

            <Modal
                title={t("noficationAddAndUpdate.editStatus")}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
                width={500}
            >
                <Form onFinish={onEdit} form={form} className="mt-4">
                    <Form.Item name="status" label={t("general.status")} rules={[{ required: true }]} className="w-full">
                        <Select
                            showSearch
                            placeholder={t("general.status")}
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

export default UpdateApplicationStatus;
