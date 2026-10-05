import {
  useCreateActivityMutation,
  useDeleteActivityEmojiMutation,
  useDeleteActivityMutation,
  useEditActivityMutation,
} from "@/api/Task/apiTask";
import Emoji from "@/components/Emoji/Emoji";
import { ICard } from "@/types/taskTypes";
import { Avatar, Button, Input, Popconfirm, Typography, notification } from "antd";
import EmojiPicker from "emoji-picker-react";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { AiOutlineOrderedList } from "react-icons/ai";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import jwt_decode from "jwt-decode";
import { useTranslations } from "next-intl";

const modules = {
  toolbar: [
    [{ header: "1" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    ["image", "code-block"],
  ],
};

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function AddAndUpdateActivity({ card }: { card: ICard }) {
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isOpenActivity, setIsOpenActivity] = useState(false);
  const [openEditActivity, setOpenEditActivity] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createActivity, { isLoading: isLoadingAdd }] = useCreateActivityMutation();
  const [editActivity, { isLoading: isLoadingEdit }] = useEditActivityMutation();
  const [deleteActivity, { isLoading: isLoadingDelete }] = useDeleteActivityMutation();
  const [deleteActivityEmoji, { isLoading: isLoadingDeleteE }] = useDeleteActivityEmojiMutation();
  const t: any = useTranslations();

  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1];
      setAccessToken(token);

      // Decode the token to get userId
      if (token) {
        try {
          const decodedToken: { user_id: string } = jwt_decode(token);
          setUserId(decodedToken.user_id);
        } catch (e) {
          console.error("Decoding accessToken failed", e);
        }
      }
    }
  }, []);

  const handleSaveActivity = async () => {
    const body = {
      card: card.id,
      content: editId ? editContent : content || null,
      type: "C",
      id: editId,
    };
    try {
      if (editId) {
        await editActivity(body);
      } else {
        await createActivity(body);
      }
    } catch (error) {
      notification.error({
        message: "Lỗi ko tạo/cập nhật được hoạt dộng",
        placement: "bottomRight",
        className: "h-16",
      });
    }
    setIsOpenActivity(false);
    setOpenEditActivity(false);
  };

  const onDelete = async (activityId: any) => {
    try {
      await deleteActivity(activityId);
      notification.success({
        message: `Xóa bình luận thành công`,
        placement: "bottomRight",
        className: "h-16",
      });
    } catch (error) {
      notification.error({
        message: `Xóa bình luận thất bại`,
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const onDeleteEmoji = async (activityEmojiId: any) => {
    try {
      await deleteActivityEmoji(activityEmojiId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <Typography.Title level={4} className="flex items-center">
            <AiOutlineOrderedList className="mr-3" />
            Hoạt động
          </Typography.Title>
        </div>

        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-stone-500 hover:bg-stone-300 text-white font-semibold text-sm py-1 px-3 rounded"
          >
            {showDetails ? `${t('finance.hideDetails')}` : `${t('finance.showDetails')}`}
          </button>
        </div>
      </div>
      <div className={`flex gap-2 mb-4 ${isOpenActivity ? "items-start" : "items-center"} `}>
        <Avatar style={{ verticalAlign: "middle" }} size="large">
          T
        </Avatar>

        {isOpenActivity ? (
          <div className="w-full">
            <ReactQuill
              onChange={(value: string) => setContent(value)}
              theme="snow"
              modules={modules}
            />
            <div className=" flex justify-end mt-2">
              <Button type="primary" className="text-sm mr-2" onClick={handleSaveActivity}>
                {t('admin.save')}
              </Button>
              <Button className="text-sm " onClick={() => setIsOpenActivity(false)}>
              {t('general.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Input className="w-full" onClick={() => setIsOpenActivity(true)} placeholder="Viết bình luận..." />
        )}
      </div>

      {
        card.activity_list && card.activity_list.length > 0
          ? card.activity_list.map((activity, index) => {
            if (showDetails && activity.type === "A") {
              return (
                <div key={activity.id} className="activity-item">
                  <p>
                    <strong>{activity.creator_str || "Someone"}</strong>:{` ${activity.content}`}
                    <br></br>
                    <span className="font-thin text-xs">{new Date(activity.created_at).toLocaleString()}</span>
                  </p>
                </div>
              );
            } else if ((showDetails && activity.type === "C") || (!showDetails && activity.type === "C")) {
              return (
                <div key={activity.id} className="activity-item mb-2">
                  <div className="flex gap-1">
                    <strong>{activity.creator_str}</strong>:
                    {openEditActivity && activity.id === editId ? (
                      <div className="w-full">
                        <ReactQuill
                          value={editContent}
                          onChange={(value: string) => setEditContent(value)}
                          theme="snow"
                          modules={modules}
                        />
                        <div className="flex justify-end mt-2">
                          <Button type="primary" className="text-sm mr-2" onClick={handleSaveActivity}>
                          {t('admin.save')}
                          </Button>
                          <Button className="text-sm" onClick={() => setOpenEditActivity(false)}>
                          {t('general.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activity.content,
                        }}
                        className="specific-div"
                      />
                    )}
                  </div>
                  {!openEditActivity && (
                    <div className="flex items-center">
                      {activity.emojis.length > 0 ? (
                        activity.emojis.map((item) => (
                          <span
                            className="text-base cursor-pointer"
                            onClick={() => (Number(userId) === item.user) ? onDeleteEmoji(item.id) : null}
                            title={item?.user_str}
                          >
                            {item.emoji_code}
                          </span>
                        ))
                      ) : null}

                      {!activity.emojis.some((item) => item.user === Number(userId)) && (
                        <Emoji id={activity.id} />
                      )}

                      {Number(userId) === activity.creator && (
                        <>
                          <div
                            className="text-primary hover:text-primary/80 font-medium mx-3 my-1 cursor-pointer"
                            onClick={() => {
                              setOpenEditActivity(true);
                              setEditId(activity.id);
                              setEditContent(activity.content);
                            }}
                          >
                           {t('general.edit')}
                          </div>
                          <Popconfirm
                            title={t('noficationDelete.deleteComments')}
                            description={t('noficationDelete.wantComment')}
                            onConfirm={() => onDelete(activity.id)}
                            okText= {t("general.confirm")}
                            cancelText={t("table.actionValues.canceltext")}
                            placement="left"
                            okButtonProps={{loading: isLoadingDelete ||  isLoadingDeleteE }}
                          >
                            <div className="text-primary hover:text-primary/80 font-medium mr-3 my-1 cursor-pointer">
                            {t("general.delete")}
                            </div>
                          </Popconfirm>
                        </>
                      )}
                      <span className="font-thin text-xs">{new Date(activity.created_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              );
            }
          })
          : null
      }
    </div>
  );
}

export default AddAndUpdateActivity;
