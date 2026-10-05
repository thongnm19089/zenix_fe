"use client";

import React from "react";
import { List, Button, Popconfirm, notification, Tag, Spin } from "antd";
import { useTranslations } from "next-intl";
import { useGetBrandingChannelListQuery, useDeleteBrandingChannelMutation } from "@/api/Branding/apiBranding";
import AddAndUpdateBrandingChannel from "./AddAndUpdate/AddAndUpdateBrandingChannel";
import { useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const BrandingChannelSetup = () => {
  const t: any = useTranslations();
  const router = useRouter();
  const { data: brandingChannels, isLoading, error } = useGetBrandingChannelListQuery({});
  const [deleteBrandingChannel, { isLoading: isLoadingDelete }] = useDeleteBrandingChannelMutation();

  const onDelete = async (brandingChannelId: any) => {
    try {
      await deleteBrandingChannel(brandingChannelId);
      notification.success({
        message: t('noficationDelete.brandingChannelSuccess'),
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: t('noficationDelete.brandingChannelError'),
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
          <AddAndUpdateBrandingChannel title={t("setup.addBrandingChannel")} />
        </div>
        <List
          bordered
          dataSource={brandingChannels?.results || []}
          renderItem={(item: { id: number, name: string, type: string, color: string, platform_name: string }) => (
            <List.Item
              actions={[
                <AddAndUpdateBrandingChannel edit={true} brandingChannelId={item.id} title={t("setup.editBrandingChannel")} />,
                <Popconfirm
                  title={t('noficationDelete.deleteBrandingChannel')}
                  description={t('noficationDelete.deleteBrandingChannelSure')}
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
                title={
                  <div>
                    <span style={{ color: item.color }}>{item?.type} - {item.name}</span>
                  </div>
                }
                description={
                  <Tag>{item.platform_name}</Tag>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default BrandingChannelSetup;
