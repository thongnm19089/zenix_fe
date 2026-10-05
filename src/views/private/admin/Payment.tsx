"use client";

import BreadcrumbAdmin from "../../../components/Breadcrumb/BreadcrumbFunction";
import {
  useDeleteBankAccountMutation,
  useDeletePaymentMethodMutation,
  useDeletePaymentStatusMutation,
  useGetBankAccountListQuery,
  useGetPaymentMethodListQuery,
  useGetPaymentStatusListQuery,
} from "@/api/Finance/apiPayment";
import AddAndUpdatePayment from "@/components/FunctionsAdmin/AddAndUpdatePayment";
import { Button, List, Popconfirm, Tag, notification } from "antd";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import BreadcrumbFunction from "../../../components/Breadcrumb/BreadcrumbFunction";
import { useDeletePaymentTermMutation, useGetPaymentTermsQuery } from "@/api/Procurement/apiProcurement";

interface PaymentProps {
  title: string;
  stage: string;
  color: string;
  id: number;
}

const PaymentMethod = () => {
  const t: any = useTranslations();
  const { data: paymentMethodData } = useGetPaymentMethodListQuery();
  const [deletePaymentMethod, { isLoading: isLoadingDelete }] = useDeletePaymentMethodMutation();

  const onDelete = async (paymentMethodId: any) => {
    try {
      await deletePaymentMethod({ paymentMethodId });
      notification.success({
        message: `${t('noficationDelete.deletedPaymentMethod')}`,
        placement: "bottomRight",
        className: "h-[86px]",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.removeFailedPaymentMethod')}`,
        placement: "bottomRight",
        className: "h-[86px]",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdatePayment title={t("admin.paymentMethod")} titleLabel={t("admin.paymentMethod")} isTab="PM" />
      </div>
      <List<PaymentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={paymentMethodData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdatePayment
                edit={true}
                title={t("admin.paymentMethod")}
                titleLabel={t("admin.paymentMethod")}
                paymentMethodId={item.id}
                isTab="PM"
              />,
              <Popconfirm
                title={t("noficationDelete.removePaymentMethod")}
                description={t("noficationDelete.youWantPaymentMethod?")}
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
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
      />
    </>
  );
};

const BankAccount = () => {
  const t: any = useTranslations();
  const { data: bankAccountData } = useGetBankAccountListQuery();
  const [deleteBankAccount, { isLoading: isLoadingDelete }] = useDeleteBankAccountMutation();

  const onDelete = async (bankAccountId: any) => {
    try {
      await deleteBankAccount({ bankAccountId });
      notification.success({
        message: `${t('noficationDelete.successBankAccount')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.bankAccountFailed')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };
  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdatePayment title={t("admin.bankAccount")} titleLabel={t("admin.bankAccount")} isTab="BA" />
      </div>

      <List<PaymentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={bankAccountData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdatePayment
                edit={true}
                title={t("admin.bankAccount")}
                titleLabel={t("admin.bankAccount")}
                bankAccountId={item.id}
                isTab="BA"
              />,
              <Popconfirm
                title={t('noficationDelete.deleteBankAccount')}
                description={t('noficationDelete.areYouSure')}
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
            <List.Item.Meta title={item.title} />
          </List.Item>
        )}
      />
    </>
  );
};

const PaymentStatus = () => {
  const t: any = useTranslations();
  const { data: paymentStatusData } = useGetPaymentStatusListQuery();
  const [deletePaymentStatus, { isLoading: isLoadingDelete }] = useDeletePaymentStatusMutation();

  const onDelete = async (paymentStatusId: any) => {
    try {
      await deletePaymentStatus({ paymentStatusId });
      notification.success({
        message: `${t('noficationDelete.successPaymentStatus')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.failedPaymentStatus')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdatePayment title={t("admin.paymentStatus")} titleLabel={t("admin.paymentStatus")} isTab="PS" />
      </div>
      <List<PaymentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={paymentStatusData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdatePayment
                edit={true}
                title={t("admin.paymentStatus")}
                titleLabel={t("admin.paymentStatus")}
                paymentStatusId={item.id}
                isTab="PS"
              />,
              <Popconfirm
                title={t('noficationDelete.clearPaymentStatus')}
                description={t('noficationDelete.wantPaymentStatus')}
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
      />
    </>
  );
};

const PaymentTerms = () => {
  const t: any = useTranslations();
  const { data: paymentTerms } = useGetPaymentTermsQuery();
  const [deletePaymentTerm, { isLoading: isLoadingDelete }] = useDeletePaymentTermMutation();

  const onDelete = async (id: any) => {
    try {
      await deletePaymentTerm({ id });
      notification.success({
        message: `${t('noficationDelete.successPaymentTerm')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `${t('noficationDelete.failedPaymentTerm')}`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdatePayment title={t("admin.paymentTerm")} titleLabel={t("admin.paymentTerm")} isTab="PT" />
      </div>
      <List<PaymentProps>
        className="w-full"
        bordered
        itemLayout="horizontal"
        dataSource={paymentTerms?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <AddAndUpdatePayment
                edit={true}
                title={t("admin.paymentTerm")}
                titleLabel={t("admin.paymentTerm")}
                paymentTermId={item.id}
                isTab="PT"
              />,
              <Popconfirm
                title={t('noficationDelete.clearPaymentTerm')}
                description={t('noficationDelete.wantPaymentTerm')}
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
      />
    </>
  );
}

const Cost: React.FC = () => {
  const t: any = useTranslations();
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("admin.bankAccount"),
      children: <BankAccount />,
    },
    {
      key: "2",
      label: t("admin.paymentMethod"),
      children: <PaymentMethod />,
    },
    {
      key: "3",
      label: t("admin.paymentStatus"),
      children: <PaymentStatus />,
    },
    {
      key: "4",
      label: "Điều khoản thanh toán",
      children: <PaymentTerms/>
    }
  ];

  return (
    <>
      <BreadcrumbFunction title={t("admin.payment")} functionName={t("admin.administrator")} />
      <Tabs className="mt-6" defaultActiveKey="1" items={items} onChange={onChange} />
    </>
  )

};

export default Cost;
