"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useGetSubCategoryListQuery, useDeleteSubCategoryMutation } from "@/api/Learning/apiLearning";
import AddAndUpdateSubCategory from "./AddAndUpdate/AddAndUpdateSubCategory";

const SubCategorySetup = () => {
  const t: any = useTranslations();
  const { data: subcategories } = useGetSubCategoryListQuery({});
  const [deleteSubCategory, { isLoading: isLoadingDelete }] = useDeleteSubCategoryMutation();

  const onDelete = async (subCategoryId: any) => {
    try {
      await deleteSubCategory(subCategoryId);
      notification.success({
        message: t('notificationDelete.subCategorySuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('notificationDelete.subCategoryError'),
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
          <AddAndUpdateSubCategory title={t("setup.addSubCategory")} />
        </div>
        <List
          bordered
          dataSource={subcategories?.results || []}
          renderItem={(item: {
            category_str: string; id: number, name: string, color: string
          }) => (
            <List.Item
              actions={[
                <AddAndUpdateSubCategory edit={true} subCategoryId={item.id} />,
                <Popconfirm
                  title={t('notificationDelete.deleteSubCategory')}
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
                title={
                  <div>
                    <span>{item.name}</span>
                    <div style={{ fontSize: "14px", color: "gray" }}>
                      {item.category_str}
                    </div>
                  </div>
                }
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

export default SubCategorySetup;
