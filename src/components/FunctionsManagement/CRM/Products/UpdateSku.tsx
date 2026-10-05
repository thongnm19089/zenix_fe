import { useEditSkuMutation, useGetClassifyListsQuery } from "@/api/Procurement/apiProducts";
import { Button, Form, Input, Modal, Select, notification } from "antd";
import React, { useMemo, useState } from "react";

const { Option } = Select;

const UpdateSku = ({
  code,
  sku,
  classifyListId,
}: {
  code: string | null;
  sku: {
    id: number | null | string;
    name?: string;
    classify1_list_id?: number | null;
    classify2_list_id?: number | null;
    classify1?: number | null;
    classify2?: number | null;
    price: number | null;
  };
  classifyListId: number[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: classifyList } = useGetClassifyListsQuery();
  const [editSku, { isLoading: isLoadingEdit }] = useEditSkuMutation();
  const [form] = Form.useForm();
  const classifyListData = useMemo(() => {
    return classifyList?.results.filter((item: { id: number }) => classifyListId.includes(item.id));
  }, [classifyList, classifyListId]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      id: sku.id,
      sku_code: values.sku_code,
      name: values.sku_code,
      classify1: values.classify1,
      classify2: values.classify2,
      price: values.price,
    };
    console.log(body);
    try {
      await editSku(body);
      setIsModalOpen(false);
      notification.success({
        message: `Sửa sản phẩm thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Sửa sản phẩm thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  return (
    <>
      <Button type="link" onClick={showModal} className="p-0">
        {/* {(code || "") + (sku.name || "")} */}
        {(code || "")}
      </Button>
      <Modal title="Chỉnh sửa lựa chọn sản phẩm" open={isModalOpen} footer={null} onCancel={handleCancel}>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={onFinish} className="mt-10" form={form}>
          <Form.Item
            label="Mã sản phẩm"
            name="sku_code"
            rules={[{ required: true, message: "" }]}
            initialValue={sku.name}
            className="mb-3"
          >
            <Input />
          </Form.Item>
          {classifyListData?.map(
            (item: { title: string; id: number; classify_list: { id: number; title: string }[] }) => (
              <Form.Item
                className="mb-3"
                label={item.title}
                name={`classify${item.id === sku.classify1_list_id ? "1" : "2"}`}
                rules={[{ required: true, message: "Please input your password!" }]}
                initialValue={
                  item.id === sku.classify1_list_id
                    ? sku.classify1
                    : item.id === sku.classify2_list_id
                      ? sku.classify2
                      : null
                }
              >
                <Select placeholder="Danh sách lựa chọn" allowClear>
                  {item.classify_list.map((classify) => (
                    <Option key={classify.id} value={classify.id}>
                      {classify.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )
          )}

          <Form.Item
            className="mb-3"
            label="Giá chênh"
            name="price"
            rules={[{ required: true, message: "Please input your password!" }]}
            initialValue={sku.price}
          >
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button type="primary" htmlType="submit" loading={isLoadingEdit}>
              Xác nhận
            </Button>

            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateSku;
