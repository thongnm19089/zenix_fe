"use client";

import {
  useDeleteContractDurationMutation,
  useDeleteContractTypeMutation,
  useGetContractDurationListQuery,
  useGetContractTypeListQuery,
} from "@/api/HR/apiContract";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateContract from "@/components/FunctionsAdmin/AddAndUpdateContract";
import { Button, List, Popconfirm, Tag, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, {  } from "react";

interface HRConfigurationProps {
  title: string;
  status: string;
  color: string;
  id: number;
}

const ContractDuration = () => {
  const t: any = useTranslations();

  const { data: contractDurationList } = useGetContractDurationListQuery();
  const [deleteContractDuration, { isLoading: isLoadingDelete }] = useDeleteContractDurationMutation();

  const onDelete = async (contractDurationId: any) => {
    try {
      await deleteContractDuration(contractDurationId);
      notification.success({
        message: `${t('noficationDelete.contractDurationSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.contractDurationError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContract title={t('admin.contractTerm')} titleLabel={t('admin.contractTerm')} />
      </div>
      <List<HRConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={contractDurationList?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContract
                edit={true}
                title={t('admin.contractTerm')}
                titleLabel={t('admin.contractTerm')}
                contractDurationId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.contractPeriod')}
                description={t('noficationDelete.contractPeriodSure')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('general.close')}
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
        locale={{ emptyText: `${t('noficationDelete.noContractPeriod')}` }}
      />
    </>
  );
};

const ContractType = () => {
  const t: any = useTranslations();
  const { data: ContractTypeList } = useGetContractTypeListQuery();
  const [deleteContractType, { isLoading: isLoadingDelete }] = useDeleteContractTypeMutation();

  const onDelete = async (contractTypeId: any) => {
    try {
      await deleteContractType(contractTypeId);
      notification.success({
        message: `${t('noficationDelete.contractTypeSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.contractTypeError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateContract title={t('hr.contractType')} titleLabel={t('hr.contractType')} isType={true} />
      </div>

      <List<HRConfigurationProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={ContractTypeList?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateContract
                edit={true}
                title={t('hr.contractType')}
                titleLabel={t('hr.contractType')}
                isType={true}
                contractTypeId={item.id}
              />,
              <Popconfirm
                title={t('noficationDelete.contractType')}
                description={t('noficationDelete.contractTypeSure')}
                onConfirm={() => onDelete(item.id)}
                onCancel={cancel}
                okText={t('general.confirm')}
                cancelText={t('general.close')}
                placement="left"
                okButtonProps={{ loading: isLoadingDelete }}
              >
                <Button danger size="small">{t('general.delete')}</Button>
              </Popconfirm>,
              ,
            ]}
          >
            <List.Item.Meta title={<Tag color={item.color}>{item.title}</Tag>} />
          </List.Item>
        )}
      />
    </>
  );
};

const LaborContract: React.FC = () => {
  const t: any = useTranslations();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `${t('admin.contractTerm')}`,
      children: <ContractDuration />,
    },
    {
      key: "2",
      label: `${t('hr.contractType')}`,
      children: <ContractType />,
    },
  ];

  return (
    <>
      <BreadcrumbFunction title={t("nav.laborContract")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )

};

export default LaborContract;
