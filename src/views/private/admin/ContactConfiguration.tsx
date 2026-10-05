"use client";

import BreadcrumbAdmin from "../../../components/Breadcrumb/BreadcrumbFunction";
import {
  useDeleteLeadContactTypeMutation,
  useDeleteLeadSourceMutation,
  useDeleteLeadStageMutation,
  useDeleteOrderStatusMutation,
  useGetLeadContactTypesQuery,
  useGetLeadSourcesQuery,
  useGetLeadStagesQuery,
  useGetOrderStatusesQuery,
} from "@/api/CRM/apiContactConfiguration";
import AddAndUpdateContactConfiguration from "@/components/FunctionsAdmin/AddAndUpdateContactConfiguration";
import { Button, List, Popconfirm, Tag, notification } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import BreadcrumbFunction from "../../../components/Breadcrumb/BreadcrumbFunction";

interface ContactConfigurationProps {
  is_active: boolean;
  status: string;
  title: string;
  stage: string;
  color: string;
  id: number;
}

//nguồn khách hàng
const Sources = () => {
  const t: any = useTranslations();

  const { data: sources } = useGetLeadSourcesQuery();
  const [deleteLeadSource, { isLoading: isLoadingDelete }] = useDeleteLeadSourceMutation();

  const onDelete = async (sourceId: any) => {
    try {
      await deleteLeadSource({ sourceId });
      notification.success({
        message: `${t('noficationDelete.sourcedeletedSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.sourceFailed')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContactConfiguration
          title={t("admin.sources")}
          titleLabel={t("admin.sources")}
          isTab="source" />
      </div>
      <List<ContactConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={sources?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContactConfiguration
                edit={true}
                title={t("admin.sources")}
                titleLabel={t("admin.sources")}
                sourceId={item.id}
                isTab="source"
              />,
              <Popconfirm
                title={t("noficationDelete.deleteSource")}
                description={t("noficationDelete.wantDeleteSource")}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('table.actionValues.canceltext')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={<Tag color={item.color}>{item.title}</Tag>} />
          </List.Item>
        )}
        locale={{ emptyText: `${t('noficationDelete.wantDeleteSource')}` }}
      />
    </>
  );
};

//trạng thái tư vấn
const Stage = () => {
  const t: any = useTranslations();
  const { data: stages } = useGetLeadStagesQuery();
  const [deleteLeadStage, { isLoading: isLoadingDelete }] = useDeleteLeadStageMutation();

  const onDelete = async (stageId: any) => {
    try {
      await deleteLeadStage({ stageId });
      notification.success({
        message: `${t('noficationDelete.successContactStatus')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.failedContactStatus')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContactConfiguration
          title={t('noficationAddAndUpdate.solidarity')}
          titleLabel={t('noficationAddAndUpdate.solidarity')}
          isTab="stage" />
      </div>

      <List<ContactConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={stages?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContactConfiguration
                edit={true}
                title={t('noficationAddAndUpdate.solidarity')}
                titleLabel={t('noficationAddAndUpdate.solidarity')}
                isTab="stage"
                stageId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.deleteContactStatus')}
                description={t('noficationDelete.wantToContactStatus')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('table.actionValues.canceltext')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
              ,
            ]}
          >
            {/* <List.Item.Meta title={<Tag color={item.color}>{item.stage} - {item.is_active}</Tag>} />
            </List.Item> */}

            <List.Item.Meta
            title={
              <span>
                <Tag color={item.color}>{item.stage}</Tag>
                {item.is_active ? (
                  <CheckCircleOutlined style={{ color: 'green', marginLeft: 8 }} rev={undefined} />
                ) : (
                  <CloseCircleOutlined style={{ color: 'red', marginLeft: 8 }} rev={undefined} />
                )}
              </span>
            }
            />
            </List.Item>
        )}
      />
    </>
  );
};

//các loại hình liên hệ chính
const ContactType = () => {
  const t: any = useTranslations();
  const { data: contactTypesData } = useGetLeadContactTypesQuery();
  const [deleteLeadContactType, { isLoading: isLoadingDelete }] = useDeleteLeadContactTypeMutation();

  const onDelete = async (contactTypeId: any) => {
    try {
      await deleteLeadContactType({ contactTypeId });
      notification.success({
        message: `${t('noficationDelete.successContactType')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.failedContactType')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContactConfiguration
          title={t('admin.contactType')}
          titleLabel={t('admin.contactType')}
          isTab="contactType" />
      </div>

      <List<ContactConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={contactTypesData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContactConfiguration
                edit={true}
                title={t('admin.contactType')}
                titleLabel={t('admin.contactType')}
                isTab="contactType"
                contactTypeId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.deleteContactType')}
                description={t('noficationDelete.wantToDeleteContactType')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('table.actionValues.canceltext')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
              ,
            ]}
          >
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
      />
    </>
  );
};

//trạng thái đơn hàng
const OrderStatus = () => {
  const t: any = useTranslations();
  const { data: orderStatusData } = useGetOrderStatusesQuery();
  const [deleteOrderStatus, { isLoading: isLoadingDelete }] = useDeleteOrderStatusMutation();

  const onDelete = async (orderStatusId: any) => {
    try {
      await deleteOrderStatus({ orderStatusId });
      notification.success({
        message: `${t("Xóa trạng thái thành công")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t("Xóa trạng thái thất bại")}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContactConfiguration
          title={t('noficationAddAndUpdate.solidarity')}
          titleLabel={t('noficationAddAndUpdate.solidarity')}
          isTab="orderStatus"
        />
      </div>

      <List<ContactConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={orderStatusData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContactConfiguration
                edit={true}
                title={t('noficationAddAndUpdate.solidarity')}
                titleLabel={t('noficationAddAndUpdate.solidarity')}
                isTab="orderStatus"
                orderStatusId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.deleteContactStatus')}
                description={t('noficationDelete.wantToContactStatus')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('table.actionValues.canceltext')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta title={<Tag color={item.color}>{item.status}</Tag>} />
          </List.Item>
        )}
      />
    </>
  );
};

const ContactConfiguration: React.FC = () => {
  const t: any = useTranslations();

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `${t('admin.leadStages')}`,
      children: <Stage />,
    },
    {
      key: "2",
      label: `${t('admin.leadSources')}`,
      children: <Sources />,
    },
    {
      key: "3",
      label: `${t('admin.leadContactTypes')}`,
      children: <ContactType />,
    },
    {
      key: "4",
      label: `${"Trạng thái đơn hàng"}`,
      children: <OrderStatus />,
    },
  ];

  return (
    <>
      <BreadcrumbFunction title={t("nav.contactConfiguration")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )
};

export default ContactConfiguration;
