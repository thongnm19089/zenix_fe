import { ITask } from "@/types/taskTypes";
import { Button, DatePicker, Form, Popconfirm, TimePicker } from "antd";
import dayjs from "dayjs";
import React from "react";
import { AiOutlineClockCircle } from "react-icons/ai";

function UpdateUserDeadline({ task, onAddDeadlineTask }: { task: ITask; onAddDeadlineTask: (value: any) => void }) {
  const [form] = Form.useForm();

  return (
    <Popconfirm
      placement="bottom"
      title={<div className="text-center">Thời hạn</div>}
      description={
        <div className=" w-[300px]">
          <Form form={form} onFinish={onAddDeadlineTask}>
            <Form.Item name="taskId" initialValue={task.id} hidden></Form.Item>
            <Form.Item name="date" noStyle initialValue={task.deadline && dayjs(task.deadline)}>
              <DatePicker className="mr-3" />
            </Form.Item>
            <Form.Item name="time" noStyle initialValue={task.deadline && dayjs(task.deadline)}>
              <TimePicker format="HH:mm" />
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
      <Button type="text" icon={<AiOutlineClockCircle size={19} className="pt-1" />} className="rounded-full" />
    </Popconfirm>
  );
}

export default UpdateUserDeadline;
