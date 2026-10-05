"use client"
import React, { useState } from "react"
import { Button, List, notification, Popconfirm, Tabs, TabsProps, Tag } from "antd"
import AddAndUpdateProjectStatus from "@/components/FunctionsManagement/Project/AddAndUpdateProjectStatus";
import {
    useCreateProjectStatusMutation,
    useCreateProjectTypeMutation,
    useDeleteProjectStatusMutation,
    useDeleteProjectTypeMutation,
    useGetProjectStatusListQuery,
    useGetProjectTypeListQuery,
    useUpdateProjectStatusMutation,
    useUpdateProjectTypeMutation
} from "@/api/Project/apiProject";

interface PropsType {
    type: string;
    useGetListQuery: () => any;
    useDeleteMutation: () => any;
    useEditMutation: () => any;
    useCreateMutation: () => any;
}

export default function SettingManagement() {
    const [activateTabs, setActivateTabs] = useState<string>("status");
    const items: TabsProps["items"] = [
        {
            key: "status",
            label: "Trạng thái",
            children: (
                <StatusSetting
                    type={activateTabs}
                    useGetListQuery={useGetProjectStatusListQuery}
                    useDeleteMutation={useDeleteProjectStatusMutation}
                    useEditMutation={useUpdateProjectStatusMutation}
                    useCreateMutation={useCreateProjectStatusMutation}
                />
            ),
        },
        {
            key: "type",
            label: "Loại dự án",
            children: (
                <StatusSetting
                    type={activateTabs}
                    useGetListQuery={useGetProjectTypeListQuery}
                    useDeleteMutation={useDeleteProjectTypeMutation}
                    useEditMutation={useUpdateProjectTypeMutation}
                    useCreateMutation={useCreateProjectTypeMutation}
                />
            ),
        },
    ];
    return <Tabs defaultActiveKey={"1"} items={items} onChange={(key: string) => setActivateTabs(key)} />
}

export function StatusSetting(props: PropsType) {
    const { type, useGetListQuery, useDeleteMutation, useEditMutation, useCreateMutation } = props;

    const { data: dataSources, isLoading } = useGetListQuery();
    const [deleteItem, { isLoading: isLoadingDelete }] = useDeleteMutation();

    const onDelete = async (id: number) => {
        try {
            await deleteItem(id);
            notification.success({
                message: "Xóa thành công",
                placement: "bottomRight",
                className: "h-16",
            });
        } catch (error) {
            notification.error({
                message: "Xóa thất bại",
                placement: "bottomRight",
                className: "h-16",
            });
        }
    }

    return (
        <>
            <div className="px-3 mb-10">
                <div className="flex justify-end mb-4">
                    <AddAndUpdateProjectStatus
                        type={type}
                        useEditMutation={useEditMutation}
                        useCreateMutation={useCreateMutation}
                    />
                </div>
                <List
                    bordered
                    loading={isLoading}
                    dataSource={dataSources?.results || []}
                    renderItem={(item: { id: number, name: string, color: string, }) => (
                        <List.Item
                            actions={[
                                <AddAndUpdateProjectStatus
                                    edit
                                    data={item}
                                    type={type}
                                    useEditMutation={useEditMutation}
                                    useCreateMutation={useCreateMutation}
                                />,
                                <Popconfirm
                                    title="Xóa"
                                    description="Bạn có chắc muốn xóa?"
                                    onConfirm={() => onDelete(item.id)}
                                    onCancel={() => { }}
                                    okText="xác nhận"
                                    cancelText="Hủy"
                                    placement="left"
                                    okButtonProps={{ loading: isLoadingDelete }}
                                >
                                    <Button size="small" danger>Xóa</Button>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Tag color={item.color}>{item.name}</Tag>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </>
    )
}