import { useCreateChecklistMutation } from "@/api/Task/apiTask";
import { ICard } from "@/types/taskTypes";
import { Form, Input, Popconfirm } from "antd";
import { AiOutlineCheckSquare } from "react-icons/ai";

function AddCheckList({
  card,
  refreshCardAndBoard,
}: {
  card: ICard;
  refreshCardAndBoard: () => void;
}) {
  const [form] = Form.useForm();
  const [createChecklist] = useCreateChecklistMutation();

  const onFinish = async (values: any) => {
    const body = {
      name: values.name,
      card: card.id,
    };

    try {
      const result = await createChecklist(body);

      if ("data" in result && result.data) {
        form.resetFields();
      } else if ("error" in result) {
        console.error("Failed to create checklist:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error when creating checklist:", error);
    }
  };

  return (
    <Popconfirm
      placement="bottomLeft"
      title={<div className="text-center">Add Checklist</div>}
      description={
        <div className="w-[200px] mt-3">
          <Form onFinish={onFinish} form={form}>
            <Form.Item name="name" noStyle>
              <Input size="small" />
            </Form.Item>
          </Form>
        </div>
      }
      showCancel={false}
      icon={null}
      okText="Add"
      okButtonProps={{ block: true }}
      onConfirm={() => form.submit()}
      disabled={card.archived} // Disable Popconfirm when card is archived
    >
      <div
        className={`flex items-center gap-2 py-1 px-2 border w-full mt-2 ${
          card.archived ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-neutral-200"
        }`} // Change appearance and disable interaction when card is archived
        onClick={(e) => card.archived && e.preventDefault()} // Prevent click event when card is archived
      >
        <AiOutlineCheckSquare size={16} /> <span>Checklist</span>
      </div>
    </Popconfirm>
  );
}

export default AddCheckList;
