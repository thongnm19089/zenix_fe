import {
  useAssignLabelMutation,
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useEditLabelMutation,
} from "@/api/Task/apiTask";
import { IBoard, ICard, ILabel } from "@/types/taskTypes";
import colorToString from "@/utils/colorToString";
import {
  Button,
  Checkbox,
  ColorPicker,
  Form,
  Input,
  notification,
  Popconfirm,
  Tag,
} from "antd";
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

interface AddAndUpdateLabelsProps {
  edit?: boolean;
  board: IBoard;
  card: ICard;
  refreshCardAndBoard: () => void;

  listId: number;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void;
}

const AddAndUpdateLabels: React.FC<AddAndUpdateLabelsProps> = ({
  edit,
  board,
  card,
  listId,
  refreshCardAndBoard,
  patchCard,
}) => {
  const [form] = Form.useForm();
  const t: any = useTranslations();

  const [openCreateLabel, setOpenCreateLabel] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [label, setLabel] = useState<LabelProps | null>(null);

  const [colorValue, setColorValue] =
    useState<ColorPickerProps["value"]>("#1677ff");

  const [createLabel] = useCreateLabelMutation();
  const [editLabel] = useEditLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();
  const [assignLabel] = useAssignLabelMutation();

  /* ============================
   *  INIT FORM LABEL CHECKBOX
   * ============================ */
  useEffect(() => {
    const labels = card?.label_list || [];
    form.setFieldsValue({
      label: labels.map((l) => l.id),
    });
  }, [card, form]);

  /* ============================
   *  CREATE LABEL (BOARD)
   * ============================ */
  const onCreateLabel = async (values: any) => {
    try {
      await createLabel({
        name: values.name,
        color: colorToString(values?.color?.metaColor || "#1677ff"),
        board: board.id,
      }).unwrap();
    
      form.resetFields();
      setOpenCreateLabel(false);
      refreshCardAndBoard();
    } catch {
      notification.error({
        message: t("noficationDelete.anErrorOccurred"),
        placement: "bottomRight",
      });
    }
  };

  /* ============================
   *  EDIT LABEL (BOARD)
   * ============================ */
  const onEditLabel = async (values: any) => {
    if (!label) return;

    try {
      await editLabel({
        id: label.id,
        name: values.name,
        color: colorToString(values?.color?.metaColor || "#1677ff"),
        board: board.id,
      }).unwrap();

      setOpenCreateLabel(false);
      setIsEdit(false);
      setLabel(null);
      form.resetFields();
      refreshCardAndBoard();
    } catch {
      notification.error({
        message: t("noficationDelete.anErrorOccurred"),
        placement: "bottomRight",
      });
    }
  };

  /* ============================
   *  DELETE LABEL (BOARD)
   * ============================ */
  const onDeleteLabel = async () => {
    if (!label) return;

    try {
      await deleteLabel(label.id).unwrap();

      setOpenCreateLabel(false);
      setIsDelete(false);
      setIsEdit(false);
      setLabel(null);
      form.resetFields();
      refreshCardAndBoard();

    } catch {
      notification.error({
        message: t("noficationDelete.anErrorOccurred"),
        placement: "bottomRight",
      });
    }
  };

  /* ============================
   *  ASSIGN LABEL (CARD) – OPTIMISTIC
   * ============================ */
  const onAssignLabel = (values: any) => {
    const selectedIds: number[] = values.label || [];
    const oldLabels = card.label_list || [];

    const newLabels: ILabel[] = (board.labels || []).filter((l) =>
      selectedIds.includes(l.id)
    );

    // ✅ 1) UI FAKE NGAY
    patchCard(listId, card.id, { label_list: newLabels });

    // ✅ 2) API SAU
    assignLabel({ label: selectedIds, card: card.id })
      .unwrap()
      .catch(() => {
        // ❌ rollback
        patchCard(listId, card.id, { label_list: oldLabels });

        notification.error({
          message: t("noficationDelete.anErrorOccurred"),
          placement: "bottomRight",
        });
      });
  };

  /* ============================
   *  RENDER
   * ============================ */
  return (
    <Popconfirm
      placement="bottomLeft"
      title={
        openCreateLabel ? (
          <div className="flex justify-between">
            <Button
              size="small"
              type="text"
              icon={<IoIosArrowBack />}
              onClick={() => {
                setOpenCreateLabel(false);
                setIsEdit(false);
                setIsDelete(false);
                setLabel(null);
                form.resetFields();
              }}
            />
            <div className="flex-1 text-center">
              {isDelete
                ? "Xóa nhãn"
                : isEdit
                ? "Sửa nhãn"
                : "Tạo nhãn mới"}
            </div>
            {isEdit && !isDelete && (
              <Button
                type="text"
                danger
                icon={<CiBookmarkRemove />}
                onClick={() => setIsDelete(true)}
              />
            )}
          </div>
        ) : (
          <div className="text-center">{t("general.label")}</div>
        )
      }
      description={
        <div className="w-[220px]">
          {isDelete ? (
            <div className="text-red-500 text-center italic">
              {t("noficationDelete.wantToLabel")}
            </div>
          ) : openCreateLabel ? (
            <Form
              form={form}
              onFinish={isEdit ? onEditLabel : onCreateLabel}
            >
              <Form.Item name="name" label="Title">
                <Input size="small" />
              </Form.Item>
              <Form.Item name="color" label="Color">
                <ColorPicker
                  size="small"
                  className="w-full"
                  showText
                  value={colorValue}
                  onChange={(c) => setColorValue(c)}
                />
              </Form.Item>
            </Form>
          ) : (
            <>
              <Button
                type="dashed"
                size="small"
                block
                className="mb-2"
                onClick={() => setOpenCreateLabel(true)}
              >
                {t("noficationAddAndUpdate.addNewLabel")}
              </Button>

              <Form form={form} onFinish={onAssignLabel}>
                <Form.Item name="label" noStyle>
                  <Checkbox.Group>
                    {(board.labels || []).map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center gap-1 mb-2"
                      >
                        <Checkbox value={l.id}>
                          <Tag color={l.color} className="w-[120px]">
                            {l.name}
                          </Tag>
                        </Checkbox>
                        <Button
                          type="text"
                          icon={<AiOutlineEdit />}
                          onClick={() => {
                            setOpenCreateLabel(true);
                            setIsEdit(true);
                            setLabel(l);
                            form.setFieldsValue({
                              name: l.name,
                              color: l.color,
                            });
                          }}
                        />
                      </div>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      }
      showCancel={false}
      icon={null}
      okText={isDelete ? t("general.delete") : t("general.confirm")}
      okButtonProps={{ danger: isDelete, block: true }}
      onConfirm={isDelete ? onDeleteLabel : () => form.submit()}
      disabled={card.archived}
    >
      <div
        className={`flex items-center gap-2 ${
          card.archived ? "opacity-50" : "cursor-pointer"
        } ${!edit && "py-1 px-2 border mt-2"}`}
      >
        {edit ? (
          <>
            <FiBox /> {t("noficationAddAndUpdate.addEditLabels")}
          </>
        ) : (
          <>
            <AiOutlineTag /> {t("general.label")}
          </>
        )}
      </div>
    </Popconfirm>
  );
};

export default AddAndUpdateLabels;

