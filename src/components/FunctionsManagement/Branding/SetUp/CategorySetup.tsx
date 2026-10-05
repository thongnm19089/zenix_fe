"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetCategoryListQuery, useDeleteCategoryMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateCategory from "./AddAndUpdate/AddAndUpdateCategory";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const CategorySetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: categories, isLoading, error } = useGetCategoryListQuery({});
  const [deleteCategory, { isLoading: isLoadingDelete }] = useDeleteCategoryMutation();

  const onDelete = async (categoryId: any) => {
    try {
      await deleteCategory(categoryId);
      notification.success({
        message: t('noficationDelete.categorySuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.categoryError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error && "status" in error) {
    const fetchError = error as FetchBaseQueryError;
    if (fetchError.status === 403) {
      router.push("/403/");
    }
  }

  return (
    <>
      <div className="px-3 mb-10">
        <div className="flex justify-end mb-4">
          <AddAndUpdateCategory title={t("setup.addCategory")} />
        </div>
        <List
          bordered
          dataSource={categories?.results || []}
          renderItem={(item: { id: number, name: string, color: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateCategory edit={true} categoryId={item.id} title={t("setup.editCategory")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteCategory')}
                  description={t('noficationDelete.deleteCategorySure')}
                  onConfirm={() => onDelete(item.id)}
                  onCancel={cancel}
                  okText={t('general.confirm')}
                  cancelText={t('general.cancel')}
                  placement="left"
                  okButtonProps={{ loading: isLoadingDelete }}
                >
                  <Button size="small" danger>{t('general.delete')}</Button>
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
