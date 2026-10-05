"use client";

import {
  useDeleteCostCategoryMutation,
  useDeleteSubCostCategoryMutation,
  useDeleteTaxRateMutation,
  useDeleteTaxTypeMutation,
  useGetCostCategoryListQuery,
  useGetSubCostCategoryListQuery,
  useGetTaxRateListQuery,
  useGetTaxTypeListQuery
} from "@/api/Finance/apiCost";
import { useGetDivisionsQuery } from "@/api/SetUp/apiDivision";
import BreadcrumbFunction from "@/components/Breadcrumb/BreadcrumbFunction";
import BreadcrumbAdmin from "@/components/Breadcrumb/BreadcrumbFunction";
import AddAndUpdateCost from "@/components/FunctionsAdmin/AddAndUpdateCost";
import { Button, List, Popconfirm, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

interface CostProps {
  title: string;
  division: string;
  code: string;
  subcode: string;
  category_str: string;
  id: number;
}

const CostCategorys = () => {
  const t: any = useTranslations();

  const { data: costCategoryData } = useGetCostCategoryListQuery();
  const { data: divisionsData } = useGetDivisionsQuery();
  const [deleteCostCategory, { isLoading: isLoadingDelete }] = useDeleteCostCategoryMutation();

  const onDelete = async (costCategoryId: any) => {
    try {
      await deleteCostCategory({ costCategoryId });
      notification.success({
        message: `${t('noficationDelete.costCategorySuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.costCategoryError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateCost
          title={t("admin.costCategorys")}
          titleLabel={t("admin.costCategorys")}
          isTab="CC"
          divisionsData={divisionsData?.results}
        />
      </div>
      <List<CostProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={costCategoryData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateCost
                edit={true}
                title={t("admin.costCategorys")}
                titleLabel={t("admin.costCategorys")}
                costCategoryId={item.id}
                isTab="CC"
                divisionsData={divisionsData?.results}
              />,
              <Popconfirm
                title={t('noficationDelete.costCategory')}
                description={t('noficationDelete.costCategorySure')}
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
            <List.Item.Meta
              title={item.title}
              description={
                `${divisionsData?.results.find((division: { id: string; title: string }) => division.id === item.division)?.title} - ${item.code}`
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

const SubCostCategorys = () => {
  const t: any = useTranslations();

  const { data: subCostCategoryData } = useGetSubCostCategoryListQuery();
  const { data: costCategoryData } = useGetCostCategoryListQuery();

  const [deleteSubCostCategory, { isLoading: isLoadingDelete }] = useDeleteSubCostCategoryMutation();

  const onDelete = async (subCostCategoryId: any) => {
    try {
      await deleteSubCostCategory({ subCostCategoryId });
      notification.success({
        message: `${t('noficationDelete.subCostCategorySuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.subCostCategoryError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };
  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateCost
          title={t("admin.subCostCategorys")}
          titleLabel={t("admin.subCostCategorys")}
          isTab="SCC"
          costCategoryListData={costCategoryData?.results}
        />
      </div>
      <List<CostProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={subCostCategoryData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateCost
                edit={true}
                title={t("admin.subCostCategorys")}
                titleLabel={t("admin.subCostCategorys")}
                subCostCategoryId={item.id}
                isTab="SCC"
                costCategoryListData={costCategoryData?.results}
              />,
              <Popconfirm
                title={t('noficationDelete.subCostCategory')}
                description={t('noficationDelete.subCostCategorySure')}
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
            <List.Item.Meta
              title={item.title}
              description={
                `${item.category_str} - ${item.subcode}`
              }
            />
          </List.Item>
        )}
      />
    </>
  );
};

const TaxRates = () => {
  const t: any = useTranslations();

  const { data: taxRateData } = useGetTaxRateListQuery();
  const [deleteTaxRate, { isLoading: isLoadingDelete }] = useDeleteTaxRateMutation();

  const onDelete = async (taxRateId: any) => {
    try {
      await deleteTaxRate({ taxRateId });
      notification.success({
        message: `${t('noficationDelete.taxRatesSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.taxRatesError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateCost title={t("s")} titleLabel={t("admin.taxRatess")} isTab="TR" />
      </div>
      <List<CostProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={taxRateData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateCost
                edit={true}
                title={t("admin.taxRatess")}
                titleLabel={t("admin.taxRatess")}
                taxRateId={item.id}
                isTab="TR"
              />,
              <Popconfirm
                title={t('noficationDelete.taxRates')}
                description={t('noficationDelete.taxRatesSure')}
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
            <List.Item.Meta title={item.code} />
          </List.Item>
        )}
      />
    </>
  );
};

const TaxType = () => {
  const t: any = useTranslations();

  const { data: taxTypeData } = useGetTaxTypeListQuery();
  const [deleteTaxType, { isLoading: isLoadingDelete }] = useDeleteTaxTypeMutation();

  const onDelete = async (taxTypeId: any) => {
    try {
      await deleteTaxType({ taxTypeId });
      notification.success({
        message: `${t('noficationDelete.taxRatesSuccess')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.taxRatesError')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateCost title={t("admin.taxList")} titleLabel={t("admin.taxRatess")} isTab="TR" />
      </div>
      <List<CostProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={taxTypeData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdateCost
                edit={true}
                title={t("admin.taxRatess")}
                titleLabel={t("admin.taxRatess")}
                taxRateId={item.id}
                isTab="TR"
              />,
              <Popconfirm
                title={t('noficationDelete.taxRates')}
                description={t('noficationDelete.taxRatesSure')}
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
            <List.Item.Meta title={item.code} />
          </List.Item>
        )}
      />
    </>
  );
};

const Cost: React.FC = () => {
  const t: any = useTranslations();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("admin.costCategorys"),
      children: <CostCategorys />,
    },
    {
      key: "2",
      label: t("admin.subCostCategorys"),
      children: <SubCostCategorys />,
    },
    {
      key: "3",
      label: t("admin.taxRatess"),
      children: <TaxRates />,
    },
    {
      key: "4",
      label: t("admin.taxList"),
      children: <TaxType />,
    },
  ];

  return (
    <>
      <BreadcrumbFunction title={t("admin.cost")} functionName={t("admin.administrator")} />
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )
};

export default Cost;
