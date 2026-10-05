import { useGetBoardListSelectQuery, useMoveCardMutation, useMoveListMutation } from "@/api/Task/apiTask";
import { Button, Col, Form, Input, Modal, Row, Select, notification } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineCopy } from "react-icons/ai";
import { TbArrowsExchange } from "react-icons/tb";

const getStringByType = (type: string) => {
  switch (type) {
    case "list":
      return "Di Chuyển danh sách";
    case "card":
      return "Di Chuyển thẻ";
    default:
      return "";
  }
};

const { Option } = Select;

function MoveItem({ type, itemId }: { type: string; itemId: number }) {
  const [isOpen, setOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: boardQuery, refetch, error, isLoading } = useGetBoardListSelectQuery({});
  const [moveList, { isLoading: loadingList }] = useMoveListMutation();
  const [moveCard, { isLoading: loadingCard }] = useMoveCardMutation();

  const showModal = () => {
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleBoardChange = (value: number) => {
    setSelectedBoard(value);
    form.resetFields(["list"]);
  };

  const onFinish = async (values: any) => {
    const body = {
      id: itemId,
      board: values.board,
      list: values.list,
    };

    try {
      if (type === "list") {
        const result = await moveList(body);
        if (result && "error" in result) {
          notification.error({
            message: `Di chuyển danh sách thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `Di chuyển danh sách thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      } else {
        const result = await moveCard(body);
        if (result && "error" in result) {
          notification.error({
            message: `Di chuyển thẻ thất bại`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpen(false);
          notification.success({
            message: `Di chuyển thẻ thành công`,
            placement: "bottomRight",
            className: "h-16",
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div onClick={showModal}>
        <TbArrowsExchange className="inline-block mr-2" />
        {getStringByType(type)}
      </div>

      <Modal title={getStringByType(type)} open={isOpen} onCancel={handleModalClose} footer={null} width={300}>
        <div className="mt-3">
          <Form form={form} onFinish={onFinish}>
            <Form.Item name="board" className="w-full mb-2">
              <Select
                showSearch
                placeholder="Chọn bảng"
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                }
                onChange={handleBoardChange}
              >
                {boardQuery?.results.map((item: { id: number; name: string }) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {type === "card" && selectedBoard && (
              <Form.Item name="list" className="w-full mb-2">
                <Select
                  showSearch
                  placeholder="Chọn danh sách"
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children ? option.children.toString().toLowerCase().includes(input.toLowerCase()) : false
                  }
                >
                  {boardQuery?.results
                    .find((board: { id: number }) => board.id === selectedBoard)
                    ?.lists.map((item: { id: number; name: string }) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={loadingList || loadingCard}>
              Di chuyển
            </Button>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default MoveItem;
