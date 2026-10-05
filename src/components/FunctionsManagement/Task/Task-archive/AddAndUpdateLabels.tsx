import {
  useAssignLabelMutation,
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useEditLabelMutation,
} from "@/api/Task/apiTask";
import { IBoard, ICard, ILabel } from "@/types/taskTypes";
import colorToString from "@/utils/colorToString";
import { Button, Checkbox, ColorPicker, Form, Input, message, notification, Popconfirm, Tag } from "antd";
import { ColorPickerProps } from "antd/lib";
import React, { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineTag } from "react-icons/ai";
import { CiBookmarkRemove } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import { useTranslations } from "next-intl";
import { FiBox } from "react-icons/fi";

interface LabelProps {
  id: number;
  color: string;
  name: string;
}

function AddAndUpdateLabels({
  edit,
  board,
  card,
  refreshCardAndBoard,
}: {
  edit?: Boolean;
  board: IBoard;
  card: ICard;
  refreshCardAndBoard: () => void;
}) {
  const [form] = Form.useForm();
  const [openCreateLabel, setOpenCreateLabel] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [label, setLabel] = useState<LabelProps | null>(null);
  const t: any = useTranslations();

  const [colorValue, setColorValue] = useState<ColorPickerProps["value"]>("#1677ff");
  const [createLabel, { isLoading: isLoadingAdd }] = useCreateLabelMutation();
  const [editLabel, { isLoading: isLoadingEdit }] = useEditLabelMutation();
  const [deleteLabel, { isLoading: isLoadingDelete }] = useDeleteLabelMutation();
  const [assignLabel, { isLoading: isLoadingLabelAssign }] = useAssignLabelMutation();

  const onFinish = async (values: any) => {
    try {
      const body = {
        color: colorToString(values?.color?.metaColor || "#1677ff"),
        name: values.name,
        board: board.id,
      };
      const result = await createLabel(body);
      refreshCardAndBoard();
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationDelete.anErrorOccurred')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpenCreateLabel(false);
      }
    } catch (error) {
      console.log(error);
      setOpenCreateLabel(true);
    }
  };

  useEffect(() => {
    if (label && isEdit) {
      form.setFieldsValue({ name: label?.name, color: label?.color });
    }
  }, [label]);

  const onEdit = async (values: any) => {
    try {
      const body = {
        id: label?.id,
        color: colorToString(values?.color?.metaColor || "#1677ff"),
        name: values.name,
        board: board.id,
      };
      const result = await editLabel(body);
      refreshCardAndBoard();
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationDelete.anErrorOccurred')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
        setOpenCreateLabel(false);
      }
    } catch (error) {
      console.log(error);
      setOpenCreateLabel(true);
    }
  };

  useEffect(() => {
    const labels = card?.label_list || [];
    if (labels.length > 0) {
      form.setFieldsValue({ label: labels.map((label) => label.id) });
    }
  }, [card]);

  const onAddLabel = async (values: any) => {
    try {
      const body = {
        label: values.label,
        card: card.id,
      };
      const result = await assignLabel(body);
      refreshCardAndBoard();
      if (result && "error" in result) {
        notification.error({
          message: `${t('noficationDelete.anErrorOccurred')}`,
          placement: "bottomRight",
          className: "h-16",
        });
      } else {
        form.resetFields();
      }
    } catch (error) {
      console.log(error);
      setOpenCreateLabel(true);
    }
  };

  const onDelete = async () => {
    try {
      if (label) {
        const result = await deleteLabel(label.id);
        if (result && "error" in result) {
          notification.error({
            message: `${t('noficationDelete.anErrorOccurred')}`,
            placement: "bottomRight",
            className: "h-16",
          });
        } else {
          form.resetFields();
          setOpenCreateLabel(false);
          setIsEdit(false);
          setIsDelete(false);
          setLabel(null);
        }
      }
    } catch (error) {
      console.log(error);
      setOpenCreateLabel(true);
    }
  };
  return (
    <Popconfirm
      placement="bottomLeft"
      title={
        openCreateLabel ? (
          <div className="flex justify-between ">
            <Button
              className="flex items-center text-center"
              size="small"
              type="text"
              icon={<IoIosArrowBack />}
              onClick={() => {
                isDelete
                  ? (setIsDelete(false), setIsEdit(true))
                  : (setIsEdit(false), setOpenCreateLabel(false), form.resetFields());
              }}
            />
            <div className="flex-1 text-center">{isEdit ? (isDelete ? "Xóa nhãn" : "Sửa nhãn") : " Tạo nhãn mới"} </div>
            {isEdit && !isDelete && (
              <Button
                type="text"
                className="text-red-500"
                icon={<CiBookmarkRemove size={16} />}
                onClick={() => setIsDelete(true)}
              />
            )}
          </div>
        ) : (
          <div className="text-center">{t('general.label')}</div>
        )
      }
      description={
        <div className="w-[200px]">
          {isDelete ? (
            <div className="text-red-500 italic text-center">{t('noficationDelete.wantToLabel')}</div>
          ) : openCreateLabel ? (
            <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={isEdit ? onEdit : onFinish} form={form}>
              <Form.Item name="name" label="Title" className="my-1">
                <Input size="small" />
              </Form.Item>
              <Form.Item name="color" label="Color" className="my-1">
                <ColorPicker
                  size="small"
                  className="w-full"
                  showText
                  value={colorValue}
                  onChange={(color) => {
                    setColorValue(color);
                  }}
                />
              </Form.Item>
            </Form>
          ) : (
            <>
              <Button type="dashed" block size="small" className="mb-3" onClick={() => setOpenCreateLabel(true)}>
                {t('noficationAddAndUpdate.addNewLabel')}
              </Button>{" "}
              <Form onFinish={onAddLabel} form={form}>
                <Form.Item name="label" noStyle>
                  {board && board.labels && board.labels.length > 0 ? (
                    <Checkbox.Group>
                      {board.labels.map((label, index) => (
                        <div className="flex items-center mb-2" key={index}>
                          <Checkbox value={label.id}>
                            <Tag color={label.color} className="w-[120px] p-1">
                              {label.name}
                            </Tag>
                          </Checkbox>
                          <Button
                            type="text"
                            icon={<AiOutlineEdit size={16} />}
                            onClick={() => {
                              setOpenCreateLabel(true);
                              setIsEdit(true);
                              setLabel(label);
                            }}
                          />
                        </div>
                      ))}
                    </Checkbox.Group>
                  ) : null}
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      }
      showCancel={false}
      icon={null}
      okText={isDelete ? `${t('noficationAddAndUpdate.deleteLabel')}` : `${t('general.confirm')}`}
      okButtonProps={{ block: true, danger: isDelete ? true : false, loading: isLoadingDelete }}
      onConfirm={isDelete ? () => onDelete() : () => form.submit()}

    >
      <div className={`flex items-center gap-2 w-full cursor-pointer`}>
        {edit ? <>
          <FiBox className="inline-block" />
          {t('noficationAddAndUpdate.addEditLabels')}
        </> :
          <>
            <AiOutlineTag size={16} /> <span>{t('general.label')}</span>{" "}
          </>
        }

      </div>
    </Popconfirm>
  );
}

export default AddAndUpdateLabels;
