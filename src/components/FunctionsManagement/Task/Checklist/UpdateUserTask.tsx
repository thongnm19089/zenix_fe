import { ICard, ITask } from "@/types/taskTypes";
import { Avatar, Button, Checkbox, Form, Popconfirm } from "antd";
import React from "react";
import { BiUserPlus } from "react-icons/bi";

function UpdateUserTask({
  card,
  task,
  onAddUserTask,
}: {
  card: ICard;
  task: ITask;
  onAddUserTask: (value: any) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Popconfirm
      placement="bottom"
      title={<div className="text-center">Thành viên</div>}
      disabled={card.archived}
      description={
        <div className=" w-[300px]">
          <Form form={form} onFinish={onAddUserTask}>
            <Form.Item name="taskId" initialValue={task.id} hidden></Form.Item>
            <Form.Item name="user_ids" initialValue={task?.users?.map((user) => user.id) || []} noStyle>
              {card?.users && card?.users?.length > 0 ? (
                <Checkbox.Group>
                  {card?.users?.map((user, index) => (
                    <div className="flex flex-1 flex-col justify-center hover:bg-slate-200 p-1" key={index}>
                      <Checkbox value={user.id} className="px-1 flex items-center">
                        <div className="w-full flex flex-1 gap-2 items-center ">
                          <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                          <div className="font-semibold ">
                            {user.first_name} {user.last_name}
                          </div>
                          <div>@{user.username}</div>
                        </div>
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              ) : (
                <div className="text-center">Chưa có thành viên nào trong thẻ này</div>
              )}
            </Form.Item>
          </Form>
        </div>
      }
      showCancel={false}
      icon={null}
      okText="Lưu thay đổi"
      okButtonProps={{ block: true }}
      onConfirm={() => form.submit()}
    >
      <Button type="text" icon={<BiUserPlus size={19} className="pt-1" />} className="rounded-full" disabled={card.archived} />
    </Popconfirm>
  );
}

export default UpdateUserTask;
