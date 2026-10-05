"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetTagListQuery, useDeleteTagMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateTag from "./AddAndUpdate/AddAndUpdateTag";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";

const TagSetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: tags, isLoading, error } = useGetTagListQuery({});
  const [deleteTag, { isLoading: isLoadingDelete }] = useDeleteTagMutation();

  const onDelete = async (tagId: any) => {
    try {
      await deleteTag(tagId);
      notification.success({
        message: t('noficationDelete.tagSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.tagError'),
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
          <AddAndUpdateTag title={t("setup.addTag")} />
        </div>
        <List
          bordered
          dataSource={tags?.results || []}
          renderItem={(item: { id: number, name: string, color: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateTag edit={true} tagId={item.id} title={t("setup.editTag")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteTag')}
                  description={t('noficationDelete.deleteTagSure')}
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

export default TagSetup;
