import AddAndUpdateTask from "../AddAndUpdateTask";
import UpdateUserDeadline from "./UpdateUserDeadline";
import UpdateUserTask from "./UpdateUserTask";
import { useDeleteChecklistMutation, useDeleteTaskMutation, useEditTaskMutation } from "@/api/Task/apiTask";
import { ICard, IChecklist, ITask, IUser } from "@/types/taskTypes";
import { formatDate } from "@/utils/formatDate";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Popover,
  Progress,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
  notification,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { AiOutlineClockCircle, AiOutlineDelete } from "react-icons/ai";
import { BiUserPlus } from "react-icons/bi";
import { BsCheck2Square } from "react-icons/bs";

function CheckList({ card }: { card: ICard }) {
  const [editTask, { isLoading: isLoadingEdit }] = useEditTaskMutation();
  const [deleteChecklist, { isLoading: isLoadingDelete }] = useDeleteChecklistMutation();
  const [deleteTask, { isLoading: isLoadingDeleteTask }] = useDeleteTaskMutation();

  const onChangeTaskCompleted = async (taskId: number, e: any) => {
    try {
      const body = {
        id: taskId,
        is_completed: e.target.checked,
      };
      if (e.target.checked) {
        await editTask(body);
      } else {
        await editTask(body);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onDeleteChecklist = async (checklistId: any) => {
    try {
      await deleteChecklist(checklistId);
    } catch (error) {
      notification.error({
        message: `Xóa danh mục công việc thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      notification.error({
        message: `Xóa công việc thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onAddUserTask = async (value: any) => {
    try {
      const body = {
        id: value.taskId,
        user_ids: value.user_ids,
      };
      await editTask(body);
    } catch (error) {
      console.log(error);
    }
  };

  const onAddDeadlineTask = async (value: any) => {
    try {
      const body = {
        id: value.taskId,
        deadline:
          (dayjs(value.date).isValid()
            ? dayjs(value.date).format("YYYY-MM-DD")
            : dayjs(new Date()).format("YYYY-MM-DD")) +
          "T" +
          (dayjs(value.time).isValid() ? dayjs(value.time).format("HH:mm:ss") : "00:00:00"),
      };
      if (dayjs(value.date).isValid() && dayjs(value.time).isValid()) {
        await editTask(body);
      }
      await editTask(body);
    } catch (error) {
      console.log(error);
    }
  };

  const cancel = () => { };

  return (
    <div>
      {card?.checklist_list.map((checklist: IChecklist, index: React.Key | null | undefined) => (
        <div key={index} className="mt-3">
          <div className="flex justify-between items-center">
            <Typography.Title level={4} className="flex items-center gap-2">
              <BsCheck2Square />
              {checklist?.name}
            </Typography.Title>
            <Popconfirm
              title="Xóa danh mục công việc?"
              description="Bạn có chắc chắn muốn xóa danh mục công việc này"
              onConfirm={() => onDeleteChecklist(checklist.id)}
              onCancel={cancel}
              okText="Xác nhận"
              cancelText="Đóng"
              placement="left"
              disabled={card.archived}
            >
              <Button disabled={card.archived}>Delete</Button>
            </Popconfirm>
          </div>
          <Progress
            percent={
              checklist?.tasks?.length > 0
                ? parseFloat(
                  (
                    (checklist?.tasks?.filter((task: { is_completed: boolean }) => task.is_completed === true)
                      .length /
                      checklist?.tasks?.length) *
                    100
                  ).toFixed(1)
                )
                : 0
            }
          />
          {checklist?.tasks &&
            checklist?.tasks.map((task: ITask, taskIndex: number) => (
              <div className="flex flex-col">
                <Checkbox
                  key={taskIndex}
                  value={task.id}
                  onChange={(e) => onChangeTaskCompleted(task.id, e)}
                  checked={task.is_completed}
                  disabled={card.archived}
                >
                  <div className="w-[550px] max-sm:w-[275px] cursor-pointer hover:bg-neutral-200  px-2.5 flex items-center justify-between group/task">
                    <div
                      className={
                        task.is_completed === true
                          ? "line-through max-w-[115px] sm:max-w-[380px] py-1.5"
                          : "max-w-[115px] sm:max-w-[380px] py-1.5"
                      }
                    >
                      {task.name}
                    </div>
                    <div className="hidden group-hover/task:block">
                      <UpdateUserTask card={card} task={task} onAddUserTask={onAddUserTask} />
                      <UpdateUserDeadline task={task} onAddDeadlineTask={onAddDeadlineTask} disabled={card.archived} />
                      <Popconfirm
                        title="Xóa công việc?"
                        description="Bạn có chắc chắn muốn xóa công việc này"
                        onConfirm={(e) => onDeleteTask(task.id)}
                        onCancel={cancel}
                        okText="Xác nhận"
                        cancelText="Đóng"
                        placement="left"
                        disabled={card.archived}
                      >
                        <Button
                          type="text"
                          icon={<AiOutlineDelete size={18} className="pt-1" />}
                          className="rounded-full"
                          disabled={card.archived}
                        />
                      </Popconfirm>
                    </div>
                    <div className=" flex gap-1  group-hover/task:hidden">
                      {task?.users && (
                        <Avatar.Group
                          size="small"
                          maxCount={3}
                          maxPopoverTrigger="click"
                          maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf", cursor: "pointer" }}
                        >
                          {task?.users?.map((user: IUser) => (
                            <Tooltip title={`${user.first_name} ${user.last_name}`} key={user.id}>
                              {user.image ? (
                                <Avatar src={user.image} />
                              ) : (
                                <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                              )}
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      )}
                      {task.deadline && (
                        <Tag color="green">
                          {dayjs(task.deadline).format("HH:mm")} {formatDate(task.deadline)}{" "}
                        </Tag>
                      )}
                    </div>
                  </div>
                </Checkbox>
              </div>
            ))}

          <AddAndUpdateTask checklist={checklist} disabled={card.archived} />
        </div>
      ))}
    </div>
  );
}

export default CheckList;
