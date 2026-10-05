"use client";

import {
  useCreateAccountMutation,
  useCreateMultiAccountMutation,
  useEditAccountMutation,
} from "@/api/Accounting/apiAccounting";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import UploadExcel from "@/components/Upload/UploadExcel";
import { accountList } from "@/constants/accountList";
import { ACCOUNT_EXCEL_FILE } from "@/constants/excelFile/accountExcelFile";
import { useWindowSize } from "@/utils/responsiveSm";
import { Button, Col, Form, Input, Modal, Radio, Row, Table, Tabs, Tag, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TabsProps } from "antd/lib";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

interface bodyDataType {
  account_type: string;
  account_number: string;
  title: string;
}

function AddAndUpdateAccount({ edit, dataAccount, record }: { edit?: boolean; dataAccount?: any; record?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [accountExcel, setAccountExcel] = useState<bodyDataType[]>([]);
  const [disableButton, setDisableButton] = useState(false);
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });
  const [createMultiAccount, { isLoading: isLoadingAddMulti }] = useCreateMultiAccountMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const createAccountByExcel = async (data: bodyDataType[]) => {
    if (data) {
      try {
        const result = await createMultiAccount(data);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm tài khoản thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setIsModalOpen(false);
          setModalDialog({
            ...modalDialog,
            open: true,
            success: result?.data?.accounts_created,
            error: result?.data?.errors,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const dataType = {
    title: "",
    account_number: "",
    account_type: "",
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Danh mục tài khoản",
      children: <AccountList dataAccount={dataAccount} setIsModalOpen={setIsModalOpen} />,
    },
    {
      key: "2",
      label: edit ? "Sửa tài khoản" : "Tạo tài khoản mới",
      children: <AddAccount record={record} edit={edit} setIsModalOpen={setIsModalOpen} />,

    },
    {
      key: "3",
      label: "Tải file excel",
      children: (
        <>
          <UploadExcel
            dataType={dataType}
            dataExcel={accountExcel}
            setDataExcel={setAccountExcel}
            fileName="Mẫu-thông-tin-tài-khoản-kế-toán.xlsx"
            fileBase64={ACCOUNT_EXCEL_FILE}
            setDisableButton={setDisableButton}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)} block>
              Huỷ
            </Button>
            <Button
              type="primary"
              onClick={() => createAccountByExcel(accountExcel)}
              loading={isLoadingAddMulti}
              block
              disabled={disableButton}
            >
              Xác nhận
            </Button>
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Button type={width < 640 && edit ? "text" : "primary"}
        className={` ${edit && width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`} onClick={showModal} size={`${edit ? "small": "middle"}`}>
        {edit ? t("general.edit") : "Tạo tài khoản"}
      </Button>

      <Modal title="" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} width={630}>
        <Tabs defaultActiveKey={edit ? "2" : "1"} items={edit ? items.splice(1, 1) : items} />
      </Modal>
      <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Các tài khoản"
      />
    </>
  );
}

export default AddAndUpdateAccount;

interface DataType {
  key: React.Key;
  account_type: string;
  account_number: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Tài khoản",
    dataIndex: "account_number",
    width: 90,
    filters: [
      { text: "Tk 3 chữ số", value: 1 },
      { text: "Tk 4 chữ số", value: 2 },
      { text: "Tk đầu 1", value: 3 },
      { text: "Tk đầu 2", value: 4 },
      { text: "Tk đầu 3", value: 5 },
    ],
    // Define a filter function that will return true if the record's source_str matches the filter value or if the filter is for null values
    onFilter: (value, record) => {
      switch (Number(value)) {
        case 1:
          return record.account_number.toString().length === 3;
        case 2:
          return record.account_number.toString().length === 4;
        case 3:
          return record.account_number.toString().charAt(0) === "1";
        case 4:
          return record.account_number.toString().charAt(0) === "2";
        case 5:
          return record.account_number.toString().charAt(0) === "3";
        default:
          return true;
      }
    },
    filterMultiple: false,
  },
  {
    title: "",
    dataIndex: "title",
  },
  {
    title: "Trạng thái",
    dataIndex: "account_type",
    render: (_, { account_type }) => {
      return (
        <div className="text-center">
          <Tag className="text-center" color={account_type === "N" ? "#108ee9" : "#f50"}>
            {account_type === "N" ? " Nợ" : "Có"}
          </Tag>
        </div>
      );
    },
    width: 90,
  },
];

const AddAccount = ({
  setIsModalOpen,
  edit,
  record,
}: {
  setIsModalOpen: (params: boolean) => void;
  edit?: boolean;
  record?: any;
}) => {
  const t: any = useTranslations();
  const [form] = Form.useForm();
  const [createAccount, { isLoading: isLoadingAdd }] = useCreateAccountMutation();

  const [editAccount, { isLoading: isLoadingUpdate }] = useEditAccountMutation();

  const onFinish = async (values: any) => {
    const bodyData = {
      title: values?.title,
      account_number: values?.account_number,
      account_type: values?.account_type,
    };
    try {
      const result = await createAccount(bodyData);
      if (result && "error" in result) {
        notification.error({
          message: `Thêm tài khoản thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setIsModalOpen(false);
        form.resetFields();
        notification.success({
          message: `Thêm tài khoản thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onEdit = async (values: any) => {
    const bodyData = {
      title: values?.title,
      account_number: values?.account_number,
      account_type: values?.account_type,
      company: 1,
    };
    try {
      const result = await editAccount({ id: record?.id, account: bodyData });
      if (result && "error" in result) {
        notification.error({
          message: `Cập nhật tài khoản thất bại`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setIsModalOpen(false);
        notification.success({
          message: `Cập nhât tài khoản thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (edit && record) {
      form.setFieldsValue({
        title: record.title,
        account_type: record.account_type,
        account_number: record.account_number,
      });
    }
  }, [edit, record]);

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={edit ? onEdit : onFinish}
        initialValues={{
          title: "",
          account_number: "",
          account_type: "",
        }}
      >
        <Row gutter={16}>
          <Col>
            <Form.Item
              label={"Tài khoản"}
              name="account_number"
              rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col className="">
            <Form.Item label={"Trạng thái"} name="account_type" rules={[{ required: true }]}>
              <Radio.Group style={{ width: "100%" }}>
                <Radio value={"N"}>Nợ</Radio>
                <Radio value={"C"}>Có</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={"Tiêu đề"}
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập mô tả tài khoản" }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
      <div className="flex justify-end gap-2">
        <Button onClick={() => setIsModalOpen(false)} block>
          Huỷ
        </Button>
        <Button type="primary" onClick={() => form.submit()} loading={isLoadingAdd} block>
          Xác nhận
        </Button>
      </div>
    </>
  );
};

const { Search } = Input;

const AccountList = ({
  dataAccount,
  setIsModalOpen,
}: {
  dataAccount: any;
  setIsModalOpen: (params: boolean) => void;
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const t: any = useTranslations();

  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [createMultiAccount, { isLoading: isLoadingAddAccount }] = useCreateMultiAccountMutation();

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onFinish = async (values: any) => {
    if (values) {
      const bodyData: any[] = [];
      values?.forEach((item: React.Key) => {
        const newAccount = accountList.find((account) => account.account_number === item);
        bodyData.push({
          title: newAccount?.title,
          account_number: newAccount?.account_number.toString(),
          account_type: newAccount?.account_type.toString(),
        });
      });
      try {
        const result = await createMultiAccount(bodyData);
        if (result && "error" in result) {
          notification.error({
            message: `Thêm tài khoản thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          setIsModalOpen(false);
          setSelectedRowKeys([]);
          notification.success({
            message: `Thêm tài khoản thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const disableRows = (record: any): string => {
    const check = dataAccount?.find((item: any) => item.account_number === record.account_number.toString());
    if (check) {
      return "bg-[#dedcdc] pointer-events-none";
    } else {
      return "";
    }
  };

  const onSearchChange = (e: { target: { value: React.SetStateAction<string> } }) => {
    setTempSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(tempSearchTerm);
    }, 500); // Debounce thời gian 500ms

    return () => clearTimeout(timeoutId);
  }, [tempSearchTerm]);

  const filterAccountList = useMemo(() => {
    if (searchTerm.trim())
      return accountList.filter(
        (item) =>
          item.account_number.toString().includes(searchTerm) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return accountList;
  }, [searchTerm]);

  return (
    <>
      <div className="flex justify-between mb-2">
        <Search className="w-55" placeholder={"Nhập số, tiêu đề tài khoản"} onChange={onSearchChange} />
        <Button type="primary" onClick={() => onFinish(selectedRowKeys)}>
          Thêm
        </Button>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filterAccountList}
        scroll={{ y: 600 }}
        pagination={false}
        rowClassName={(record) => disableRows(record)}
      />
    </>
  );
};
