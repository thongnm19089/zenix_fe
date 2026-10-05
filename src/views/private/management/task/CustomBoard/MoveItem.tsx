import { useGetBoardListSelectQuery, useMoveCardMutation, useMoveListMutation, useReorderCardMutation } from "@/api/Task/apiTask";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, notification } from "antd";
import { useState } from "react";
import { AiOutlineCopy } from "react-icons/ai";
import { TbArrowsCross, TbArrowsExchange } from "react-icons/tb";

const getStringByType = (type: string) => {
  switch (type) {
    case "list":
      return "Di Chuyển danh sách";
    case "card":
      return "Di Chuyển thẻ";
    case "reorder":
      return "Di Chuyển vị trí";
    default:
      return "";
  }
};

const { Option } = Select;

function MoveItem({ type, itemId, reorderCard }: {
  type: string; itemId: number, reorderCard?: (destiation: number) => Promise<void>
}) {
  const [isOpen, setOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: boardQuery, refetch, error, isLoading } = useGetBoardListSelectQuery({});
  const [moveList, { isLoading: loadingList }] = useMoveListMutation();
  const [moveCard, { isLoading: loadingCard }] = useMoveCardMutation();
  const [loadingTList, setLoading] = useState(false);

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
      } else if (type === "card") {
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
      } else if (type === "reorder" && reorderCard) {
        setLoading(true)
        await reorderCard(values.index - 1)
        notification.success({
          message: `Di chuyển thẻ thành công`,
          placement: "bottomRight",
          className: "h-16",
        });
        setLoading(false)
        setOpen(false)
      }
    } catch (error) {
      console.log(error);
      if (error) {
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
  };

  return (
    <>
      <div onClick={showModal}>
        {type === "reorder" ?
          <TbArrowsCross className="inline-block mr-2" /> :
          <TbArrowsExchange className="inline-block mr-2" />
        }
        {getStringByType(type)}
      </div>

      <Modal title={getStringByType(type)} open={isOpen} onCancel={handleModalClose} footer={null} width={300}
        cancelButtonProps={{
          loading: loadingList || loadingCard || loadingTList,
          disabled: !(loadingList || loadingCard || loadingTList)
        }}
      >
        <div className="mt-3">
          <Form form={form} onFinish={onFinish}>
            {type !== "reorder" &&
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
            }
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
            {type === "reorder" && (
              <Form.Item name="index" className="w-full mb-2">
                <InputNumber />
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={loadingList || loadingCard || loadingTList}>
              Di chuyển
            </Button>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default MoveItem;
