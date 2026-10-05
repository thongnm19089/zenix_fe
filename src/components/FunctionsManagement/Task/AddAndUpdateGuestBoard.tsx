import { useEditBoardMutation, useGetTypeBoardListQuery } from '@/api/Task/apiTask';
import { IBoard } from '@/types/taskTypes';
import { Form, Modal, notification, Select, Button } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react'
import { FiEdit } from "react-icons/fi";

export default function AddAndUpdateGuestBoard({
    board,
}: {
    board?: IBoard;
}) {
    const t: any = useTranslations();
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editBoard, { isLoading: isLoadingEdit }] = useEditBoardMutation();
    const { data: typeBoardList } = useGetTypeBoardListQuery();


    useEffect(() => {
        if(board){
            const mappedTypeNames = board?.type_name?.map((name: string) =>
                typeBoardList?.results.find((type: any) => type.name === name)?.id
            );

            form.setFieldsValue({
                type_name: mappedTypeNames,
            });
        }
    }, [isModalOpen, board, typeBoardList]);

    const onFinish = async (values: any) => {
        try {
            if (!board) {
                throw new Error("Board is not defined");
            }
            const body = {
                type_ids: values.type_name || [],
            };
            await editBoard({ boardId: board.id, body });
            setIsModalOpen(false);
            notification.success({
                message: `${t("noficationAddAndUpdate.editBoardSuccess")}`,
                placement: "bottomRight",
                className: "h-16",
            });
        } catch (error) {
            notification.error({
                message: `${t("noficationAddAndUpdate.editBoardError")}`,
                placement: "bottomRight",
                className: "h-16",
            });
        }
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div onClick={showModal}>
                <FiEdit className="inline-block mr-2" />
                {t("general.edit")}
            </div>
            <Modal
                title="Sửa không gian của khách"
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
                centered
                className="max-w-xl mx-auto my-auto"
            >
                <div className="p-4">
                    <Form onFinish={onFinish} form={form} initialValues={{ remember: false }}>
                        <Form.Item
                            name="type_name"
                            label={t("Chọn loại bảng")}
                            className="my-4"
                        >
                            <Select
                                placeholder={t("Chọn loại bảng")}
                                mode="multiple"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {typeBoardList?.results.map((type: any) => (
                                    <Select.Option key={type.id} value={type.id}>
                                        {type.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <div className="flex justify-end gap-2">
                            <Button type="primary" htmlType="submit" className="mb-2" loading={isLoadingEdit}>
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
