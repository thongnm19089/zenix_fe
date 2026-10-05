
import React, { useEffect, useState } from "react"
import colorToString from "@/utils/colorToString";
import { Button, ColorPicker, Form, Input, Modal, notification } from "antd";
import { useTranslations } from "next-intl";

interface PropsType {
    edit?: boolean;
    data?: any;
    type: string;
    useEditMutation: () => any;
    useCreateMutation: () => any;
}

export default function AddAndUpdateProjectStatus(props: PropsType) {
    const { edit, data, type, useEditMutation, useCreateMutation } = props;
    const [form] = Form.useForm();
    const t: any = useTranslations();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [createItem, { isLoading: isLoadingAdd }] = useCreateMutation();
    const [editItem, { isLoading: isLoadingEdit }] = useEditMutation();

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    useEffect(() => {
        if (edit && data) {
            form.setFieldsValue({
                name: data.name,
                color: data.color,
            })
        }
    }, [edit, data, form])

    const onFinish = async (values: any) => {
        if (edit) values.id = data.id;
        values.color = colorToString(values.color.metaColor);
        try {
            edit ? await editItem(values) : await createItem(values).unwrap();
            notification.success({
                message: `Cập nhật trạng thái thành công`,
                placement: "bottomRight",
                className: "h-16",
            });
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            notification.error({
                message: `Cập nhật trạng thái thất bại`,
                placement: "bottomRight",
                className: "h-16",
            });
        }
    }

    return (
        <>
            <Button type="primary" onClick={showModal}
                size={edit ? "small" : "middle"}
                className={edit ? "bg-teal-600 hover:!bg-teal-500" : ""}
            >
                {edit ? t("general.edit") : t("general.createNew")}
            </Button>
            <Modal
                title={`${edit ? t("general.edit") : t("general.createNew")} ${type === "status" ? "trạng thái" : "loại dự án"}`}
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
            >
                <div>
                    <Form onFinish={onFinish} form={form} initialValues={{ color: "#39A9FF" }}>
                        <Form.Item
                            name="name"
                            label={type === "status" ? "Trạng thái" : "Loại dự án"}
                            className="my-4"
                            rules={[{ required: true, message: "Vui lòng nhập tên trạng thái!" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item name="color" label={t('admin.color')} className="my-4">
                            <ColorPicker />
                        </Form.Item>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className=" mb-2"
                                loading={edit ? isLoadingEdit : isLoadingAdd}
                            >
                                {t("general.confirm")}
                            </Button>
                            <Button onClick={handleCancel}>{t("general.cancel")}</Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    )
}