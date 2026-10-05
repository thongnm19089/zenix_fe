"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetCreatorListQuery, useDeleteCreatorMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateCreator from "./AddAndUpdate/AddAndUpdateCreator";

const CreatorSetup = () => {
  const t: any = useTranslations();
  const { data: creators, isLoading, error, refetch } = useGetCreatorListQuery({});
  const [deleteCreator, { isLoading: isLoadingDelete }] = useDeleteCreatorMutation();

  const onDelete = async (creatorId: any) => {
    try {
      await deleteCreator(creatorId);
      notification.success({
        message: t('noficationDelete.creatorSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
      refetch();
    } catch (error) {
      notification.error({
        message: t('noficationDelete.creatorError'),
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };
  const cancel = () => { };


  return (
    <>
      <div className="px-3 mb-10">
        <div className="flex justify-end mb-4">
          <AddAndUpdateCreator title={t("setup.addCreator")} />
        </div>
        <List
          bordered
          dataSource={creators?.results || []}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <AddAndUpdateCreator edit={true} creatorId={item.id} title={t("setup.editCreator")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteCreator')}
                  description={t('noficationDelete.deleteCreatorSure')}
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
                title={<span>{item?.user_info?.last_name} {item?.user_info?.first_name} ({item?.user_info?.username})</span>}
                description={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Tag color={item.color} style={{ marginRight: "8px" }}>{item?.color}</Tag>
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

export default CreatorSetup;
