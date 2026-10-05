import {
  useCreateJournalEntryMutation,
  useCreateMultiJournalEntryMutation,
  useEditJournalEntryMutation,
  useGetAccountListQuery,
} from "@/api/Accounting/apiAccounting";
import ModalDialog from "@/components/ModalDialog/ModalDialog";
import { dowloadFileExcel } from "@/constants/excelFile/dowloadFileExcel";
import { ENTRY_EXCEL_FILE } from "@/constants/excelFile/entryExcelFile";
import { useWindowSize } from "@/utils/responsiveSm";
import { Button, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Tabs, notification } from "antd";
import { TabsProps } from "antd/lib";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { SiMicrosoftexcel } from "react-icons/si";
import * as XLSX from "xlsx";

interface bodyDataType {
  date: string;
  invoice_number: string;
  document_date: string;
  debit_account: number;
  credit_account: number;
  quantity: number;
  cost_price: number;
  description: string;
  amount: number;
}

const AddAndUpdateJournalEntry = ({ edit, record }: { edit: boolean; record?: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t: any = useTranslations();
  const [width] = useWindowSize();
  const [tabKey, setTabKey] = useState<string>("0");
  const [journalExcel, setJournalExcel] = useState<bodyDataType[]>([]);
  const [form] = Form.useForm();
  const [modalDialog, setModalDialog] = useState({
    open: false,
    success: [],
    error: [],
  });

  const [createMultiJournalEntry, { isLoading: isLoadingAdd }] = useCreateMultiJournalEntryMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCreateByExcelFile = async (journalExcel: bodyDataType[]) => {
    try {
      const result = await createMultiJournalEntry(journalExcel);
      if (result && "error" in result) {
        notification.error({
          message: "Thêm dữ liệu thất bại",
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setIsModalOpen(false);
        setModalDialog({
          ...modalDialog,
          open: true,
          success: result?.data?.entries_created,
          error: result?.data?.errors,
        });
      }
    } catch (error) { }
  };

  const handleOk = async () => {
    if (tabKey === "1") {
      await form.submit();
    } else {
      if (journalExcel) {
        handleCreateByExcelFile(journalExcel);
      }
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: edit ? "Sửa hạch toán" : "Thêm hạch toán",
      children: <AddJournalEntry edit={edit} record={record} form={form} />,
    },
    {
      key: "2",
      label: "Tải lên",
      children: <UploadExcel journalExcel={journalExcel} setJournalExcel={setJournalExcel} />,
    },
  ];

  return (
    <>
      <Button type={width < 640 && edit ? "text" : "primary"}
        className={` ${edit && width < 640 ? "" : "bg-teal-600 hover:!bg-teal-500"}`} onClick={showModal} size={`${edit ? "small": "middle"}`}> 
        {edit ? `${t("general.edit")}` : "Nhập dữ liệu"}
      </Button>
      <Modal title="" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1300}>
        <Tabs
          onTabClick={(key: string) => setTabKey(key)}
          defaultActiveKey={"1"}
          items={edit ? items.splice(0, 1) : items}
        />
      </Modal>
      <ModalDialog
        open={modalDialog.open}
        setOpen={(value) => setModalDialog({ ...modalDialog, open: value })}
        success={modalDialog.success}
        error={modalDialog.error}
        object_str="Hạch toán"
      />
    </>
  );
};

const UploadExcel = ({
  journalExcel,
  setJournalExcel,
}: {
  journalExcel: bodyDataType[];
  setJournalExcel: Dispatch<SetStateAction<bodyDataType[]>>;
}) => {
  const [fileData, setFileData] = useState<{ name: string }>();
  const handleChangeFile = () => {
    const inputFile = document.getElementById("file");
    inputFile?.click();
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    setFileData(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parseData = XLSX.utils.sheet_to_json(sheet);
        parseData?.forEach((item: any) => {
          const newJournal = {
            date: item?.date,
            invoice_number: item?.invoice_number?.toString(),
            document_date: item?.document_date,
            debit_account: item?.debit_account,
            credit_account: item?.credit_account,
            quantity: item?.quantity,
            cost_price: item?.cost_price,
            description: item?.description,
            amount: item?.amount,
          };
          setJournalExcel((journalExcel) => [...journalExcel, newJournal]);
        });
      };
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center w-100%  mb-2">
        <span
          className="cursor-pointer underline italic text-primary mb-5"
          onClick={() => dowloadFileExcel(ENTRY_EXCEL_FILE, "Mẫu-Hạch-toán.xlsx")}
        >
          {" "}
          (Click vào đây để tải file mẫu và hướng dẫn)
        </span>
        <Input
          id="file"
          hidden
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          onClick={(e: any) => (e.target.value = "")}
        />
        <SiMicrosoftexcel onClick={handleChangeFile} fill="green" size={60} cursor={"pointer"} />
      </div>
      <div className="flex w-100% justify-center mb-2">
        {!fileData ? (
          <div>Không có file nào được tải lên</div>
        ) : (
          <div className="flex justify-center items-center">
            <div>{fileData.name}</div>
            <IoIosCloseCircleOutline className="cursor-pointer ml-1" onClick={() => setFileData(undefined)} size={20} />
          </div>
        )}
      </div>
    </>
  );
};

const AddJournalEntry = ({ form, edit, record }: { form: any; edit: boolean; record: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: accountData } = useGetAccountListQuery();

  const [createMultiJournalEntry, { isLoading: isLoadingAdd }] = useCreateMultiJournalEntryMutation();

  const [editJournalEntry, { isLoading: isLoadingEdit }] = useEditJournalEntryMutation();

  const onFinish = async (values: any) => {
    const dataBody = values.journal_entry?.map((item: any) => {
      return {
        date: dayjs(item?.date).format("YYYY-MM-DD"),
        invoice_number: item?.invoice_number,
        ref_code: item?.ref_code,
        document_date: dayjs(item?.document_date).format("YYYY-MM-DD"),
        debit_account: item?.debit_account,
        credit_account: item?.credit_account,
        quantity: item?.quantity,
        amount: item?.amount,
        description: item?.description,
      };
    });
    try {
      const result = await createMultiJournalEntry(dataBody);
      if (result && "error" in result) {
        form.resetFields();
        notification.error({
          message: "Thêm dữ liệu thất bại",
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setIsModalOpen(false);
        notification.success({
          message: "Thêm dữ liệu thành công",
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) { }
  };

  const onEdit = async (values: any) => {
    const newBody = {
      date: dayjs(values?.journal_entry[0]?.date).format("YYYY-MM-DD"),
      invoice_number: values?.journal_entry[0]?.invoice_number,
      ref_code: values?.journal_entry[0]?.ref_code,
      document_date: dayjs(values?.journal_entry[0]?.document_date).format("YYYY-MM-DD"),
      debit_account: values?.journal_entry[0]?.debit_account,
      credit_account: values?.journal_entry[0]?.credit_account,
      quantity: values?.journal_entry[0]?.quantity,
      amount: values?.journal_entry[0]?.amount,
      description: values?.journal_entry[0]?.description,
    };
    try {
      const result = await editJournalEntry({ id: record?.id, data: newBody });
      if (result && "error" in result) {
        form.resetFields();
        notification.error({
          message: "Sửa dữ liệu thất bại",
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        setIsModalOpen(false);
        notification.success({
          message: "Sửa dữ liệu thành công",
          placement: "bottomRight",
          className: "h-16",
        });
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (edit && record) {
      form.setFieldsValue({
        journal_entry: [
          {
            date: dayjs(record.date),
            invoice_number: record.invoice_number,
            ref_code: record.ref_code,
            document_date: dayjs(record.document_date),
            debit_account: record.debit_account,
            credit_account: record.credit_account,
            quantity: record.quantity,
            amount: record.amount,
            description: record.description,
          },
        ],
      });
    }
  }, [edit, record]);

  return (
    <>
      <Form
        form={form}
        onFinish={edit ? onEdit : onFinish}
        layout="vertical"
        initialValues={{
          journal_entry: [
            {
              date: null,
              invoice_number: null,
              ref_code: null,
              document_date: null,
              debit_account: null,
              credit_account: null,
              quantity: null,
              amount: null,
              description: null,
            },
          ],
        }}
      >
        <Form.List name="journal_entry">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center">
                  <Row gutter={16}>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "date"]} rules={[{ required: true }]} noStyle>
                        <DatePicker className="w-full" placeholder="Ngày ghi sổ" />
                      </Form.Item>
                    </Col>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "invoice_number"]} rules={[{ required: true }]} noStyle>
                        <Input placeholder="Số hóa đơn" />
                      </Form.Item>
                    </Col>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "ref_code"]} rules={[{ required: true }]} noStyle>
                        <Input placeholder="Số chứng từ" />
                      </Form.Item>
                    </Col>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "document_date"]} rules={[{ required: true }]} noStyle>
                        <DatePicker className="w-full" placeholder="Ngày chứng từ" />
                      </Form.Item>
                    </Col>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "debit_account"]} rules={[{ required: true }]} noStyle>
                        <Select placeholder="TK nợ" allowClear className="w-full" showSearch>
                          {accountData?.results
                            .filter((item: { account_type: string }) => item.account_type === "N")
                            .map((type: { id: number; account_number: string }) => (
                              <Select.Option key={type.id} value={type.id}>
                                {type.account_number}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={3} className="border p-3">
                      <Form.Item {...restField} name={[name, "credit_account"]} rules={[{ required: true }]} noStyle>
                        <Select placeholder="TK có" allowClear className="w-full" showSearch>
                          {accountData?.results
                            .filter((item: { account_type: string }) => item.account_type === "C")
                            .map((type: { id: number; account_number: string }) => (
                              <Select.Option key={type.id} value={type.id}>
                                {type.account_number}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={2} className="border p-3">
                      <Form.Item {...restField} name={[name, "quantity"]} rules={[{ required: true }]} noStyle>
                        <InputNumber placeholder="Số lượng" className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col className="border p-3" span={4}>
                      <Form.Item {...restField} name={[name, "amount"]} rules={[{ required: true }]} noStyle>
                        <InputNumber placeholder="Số tiền" className="w-full" />
                      </Form.Item>
                    </Col>
                    <Col span={24} className="border p-3">
                      {" "}
                      <Form.Item {...restField} name={[name, "description"]} rules={[{ required: true }]} noStyle>
                        <Input.TextArea className="w-full" placeholder="Diễn giải" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {fields.length > 1 && (
                    <Button type="link" danger ghost onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  )}
                </div>
              ))}

              {!edit && (
                <Form.Item className="mt-3">
                  <Button type="dashed" onClick={() => add()} block>
                    Nhập thêm
                  </Button>
                </Form.Item>
              )}
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
};

export default AddAndUpdateJournalEntry;
