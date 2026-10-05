import { useCopyBoardMutation, useCopyCardMutation, useCopyListMutation } from "@/api/Task/apiTask";
import { Button, Col, Form, Input, Modal, Row, Select, notification } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineCopy } from "react-icons/ai";

const getStringByType = (type: string) => {
  switch (type) {
    case "list":
      return "Sao chép danh sách";
    case "card":
      return "Sao chép thẻ";
    case "board":
      return "Sao chép bảng";
    default:
      return "";
  }
};

function CopyItem({ type, itemId, name }: { type: string; itemId: number; name: string }) {
  const [isOpen, setOpen] = useState(false);
  const [form] = Form.useForm();

  const [copyList, { isLoading: loadingList }] = useCopyListMutation();
  const [copyCard, { isLoading: loadingCard }] = useCopyCardMutation();
  const [copyBoard, { isLoading: loadingBoard }] = useCopyBoardMutation();

  const showModal = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const onFinish = async (values: any) => {
    const body = {
      id: itemId,
      name: values.name,
    };

    try {
      if (type === "list") {
        const result = await copyList(body);
        if (result && "error" in result) {
          notification.error({
            message: `Sao chép danh sách thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `Sao chép danh sách thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else if (type === "card") {
        const result = await copyCard(body);
        if (result && "error" in result) {
          notification.error({
            message: `Sao chép thẻ thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `Sao chép thẻ thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await copyBoard(body);
        if (result && "error" in result) {
          notification.error({
            message: `Sao chép bảng thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `Sao chép bảng thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    form.setFieldsValue({
      name: name,
    });
  }, [type, itemId]);

  return (
    <>
      <div onClick={showModal}>
        <AiOutlineCopy className="inline-block mr-2 mb-1" />
        {getStringByType(type)}
      </div>

      <Modal title={getStringByType(type)} open={isOpen} onCancel={handleModalClose} footer={null} width={300}>
        <div className="mt-3">
          <Form form={form} onFinish={onFinish}>
            <Form.Item name="name" className="mb-2">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loadingList || loadingCard || loadingBoard}>
              Sao chép
            </Button>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default CopyItem;
