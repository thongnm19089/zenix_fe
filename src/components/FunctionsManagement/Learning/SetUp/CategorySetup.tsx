"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useGetCategoryListQuery, useDeleteCategoryMutation } from "@/api/Learning/apiLearning";
import AddAndUpdateCategory from "./AddAndUpdate/AddAndUpdateCategory";

const CategorySetup = () => {
  const t: any = useTranslations();
  const { data: categories } = useGetCategoryListQuery({});
  const [deleteCategory, { isLoading: isLoadingDelete }] = useDeleteCategoryMutation();

  const onDelete = async (categoryId: any) => {
    try {
      await deleteCategory(categoryId);
      notification.success({
        message: t('notificationDelete.categorySuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('notificationDelete.categoryError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="px-3">
        <div className="flex justify-end mb-4">
          <AddAndUpdateCategory title={t("setup.addCategory")} />
        </div>
        <List
          bordered
          dataSource={categories?.results || []}
          renderItem={(item: { id: number, name: string, color: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateCategory edit={true} categoryId={item.id} />,
                <Popconfirm
                  title={t('notificationDelete.deleteCategory')}
                  onConfirm={() => onDelete(item.id)}
                  onCancel={cancel}
                  okText={t('general.confirm')}
                  cancelText={t('general.cancel')}
                  placement="left"
                  okButtonProps={{ loading: isLoadingDelete }}
                >
                  <Button danger>{t('general.delete')}</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<span>{item.name}</span>}
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Tag color={item.color} style={{ marginRight: "8px" }}>{item.color}</Tag>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default CategorySetup;
