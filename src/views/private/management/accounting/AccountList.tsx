"use client";

import {
  useDeleteAccountMutation,
  useGetAccountListQuery,
} from "@/api/Accounting/apiAccounting";
import ActionTable from "@/components/DropDown/ActionTable";
import AddAndUpdateAccount from "@/components/FunctionsManagement/Accounting/AddAndUpdateAccount";
import { Button, List, Popconfirm, Tag, notification } from "antd";
import { useTranslations } from "next-intl";
import React from "react";

interface AccountProps {
  title: string;
  account_number: string;
  account_type: string;
  id: number;
}

function AccountList() {
  const { data: accountData } = useGetAccountListQuery();

  const [deleteAccount, { isLoading: isLoadingDelete }] =
    useDeleteAccountMutation();

  const t: any = useTranslations();

  const onDelete = async (accId: any) => {
    try {
      await deleteAccount(accId);
      notification.success({
        message: `Xoá tài khoản thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Xoá tài khoản thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cancel = () => { };

  return (
    <>
      <div className="flex justify-end mb-4 mr-8">
        <AddAndUpdateAccount
          edit={false}
          dataAccount={accountData?.results}
        />
      </div>

      <List<AccountProps>
        className="w-full mt-5"
        bordered
        itemLayout="horizontal"
        dataSource={accountData?.results || []}
        renderItem={(item, index) => (
          <List.Item
            key={index}
            actions={[
              <div className="flex gap-2">
                <ActionTable
                  items={[
                    {
                      key: "1",
                      label: (
                        <AddAndUpdateAccount
                          edit={true}
                          dataAccount={accountData?.results}
                          record={item}
                        />
                      ),
                    },
                   
                  ]}
                />
              </div>
            ]}
          >
            <List.Item.Meta
              title={
                <div>
                  <span>{item.title}</span>
                  <Tag
                    className="text-center ml-2"
                    color={item.account_type === "N" ? "#108ee9" : "#f50"}
                  >
                    {item.account_type === "N" ? " Nợ" : "Có"}
                  </Tag>
                </div>
              }
              description={item.account_number}
            />
          </List.Item>
        )}
      />
    </>
  );
}

export default AccountList;
