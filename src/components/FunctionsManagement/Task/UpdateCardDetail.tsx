import AddAndUpdateActivity from "./AddAndUpdateActivity";
import AddAndUpdateLabels from "./AddAndUpdateLabels";
import AddCheckList from "./Checklist/AddCheckList";
import CheckList from "./Checklist/CheckList";
import UpdateCardDateField from "./UpdateCardDateField";
import UpdateCardUsers from "./UpdateCardUsers";
import UploadCardFile from "./UploadCardFile";
import { useDeleteCardFileMutation, useEditCardMutation } from "@/api/Task/apiTask";
import { IBoard, ICard, ILabel } from "@/types/taskTypes";
import { formatDate } from "@/utils/formatDate";
import {
  FileWordOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileOutlined,
  FileZipOutlined,
  CodeOutlined,
  AudioOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Modal, Button, Typography, notification, Avatar, Tooltip, Tag } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next-intl/client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// if you want to use the bubble theme
import { useEffect, useState } from "react";
import { AiOutlineAlignLeft, AiOutlineClockCircle, AiOutlineCreditCard } from "react-icons/ai";
import { FaEye, FaTrash } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import LockCard from "./LockCard";
import jwt_decode from "jwt-decode";

// Dynamic import to avoid server-side rendering issues
const modules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["link", "image", "video"],
  ],
};

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface UpdateCardDetailsProps {
  isOpen: boolean;
  board: IBoard;
  card: ICard;
  refreshCardAndBoard: () => void;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void;
  onClose?: () => void;
}

const determineFileType = (fileName: any) => {
  const extension = fileName?.split(".").pop().toLowerCase();

  if (["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"].includes(extension)) {
    return "image";
  }

  if (["mp4", "avi", "mov", "wmv", "flv", "mkv"].includes(extension)) {
    return "video";
  }

  if (["pdf"].includes(extension)) {
    return "pdf";
  }

  if (["doc", "docx"].includes(extension)) {
    return "word";
  }

  if (["xls", "xlsx"].includes(extension)) {
    return "excel";
  }

  if (["ppt", "pptx"].includes(extension)) {
    return "ppt";
  }

  // Add more file types as needed
  return "other";
};


const UpdateCardDetail: React.FC<UpdateCardDetailsProps> = ({ isOpen, board, card, refreshCardAndBoard, patchCard, onClose }) => {
  const [description, setDescription] = useState(card?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(card?.name || "");
  const [prevName, setPrevName] = useState(card?.name || "");
  const [error, setError] = useState("");
  const searchParams = useSearchParams()!;
  const t: any = useTranslations();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteCardFile] = useDeleteCardFileMutation();

  const [editCard] = useEditCardMutation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
    setUser(parsedUserData);
  }, []);

  const [accessToken, setAccessToken] = useState<string | null | undefined>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCompleted, setCompleted] = useState<boolean>(card.is_completed);

  useEffect(() => {
    setCompleted(card.is_completed);
  }, [card.id, card.is_completed]);

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

  const isBoardCreator = userId == board?.creator?.toString();
  const renderCardDateFields = () => (
    <>
      <UpdateCardDateField
        card={card}
        field="start_date"
        buttonLabelKey="task.start_date"
        titleKey="task.start_date"
        errorMessageKey="error_adding_start_date"
        refreshCardAndBoard={refreshCardAndBoard}
      />
      <UpdateCardDateField
        card={card}
        field="deadline"
        buttonLabelKey="task.deadline"
        titleKey="table.deadline"
        errorMessageKey="error_adding_deadline"
        refreshCardAndBoard={refreshCardAndBoard}
      />
    </>
  );

  const getBoardReturnPath = () => {
    const query =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).toString()
        : searchParams.toString();
    return query ? `/business/task/${board?.slug}?${query}` : `/business/task/${board?.slug}`;
  };

  const closeModal = async () => {
    if (isCompleted !== card.is_completed) {
      try {
        await editCard({
          id: card.id,
          is_completed: isCompleted,
        }).unwrap();
        await refreshCardAndBoard();
      } catch (error) {
        notification.error({
          message: `${t("noficationAddAndUpdate.changeFailed")}`,
          placement: "bottomRight",
          className: "h-16",
        });
        return;
      }
    }

    if (onClose) {
      onClose();
      return;
    }
    router.push(getBoardReturnPath());
  };

  const handleEditDescription = () => setIsEditingDescription(true);
  const handleDescriptionChange = (value: string) => setDescription(value);
  const handleSaveDescription = async () => {
    // Add your API call logic here
    // Example: await saveDescriptionToServer(card.id, description);
    const body = {
      id: card.id,
      description: description || null,
    };
    try {
      await editCard(body).unwrap();
      await refreshCardAndBoard();
    } catch (error) {
      notification.error({
        message: "Lỗi ko tạo/cập nhật được mô tả",
        placement: "bottomRight",
        className: "h-16",
      });
    }
    setIsEditingDescription(false);
  };

  const handleNameSubmit = async () => {
    setIsEditingName(false);
    if (newName === card?.name) return;
    setPrevName(card?.name);
    // Submit the new title to your API...
    const body = {
      id: card.id,
      name: newName || null,
    };
    try {
      await editCard(body).unwrap();
      await refreshCardAndBoard();
    } catch (error) {
      console.log("error", error);
      setError("An error occurred. Please try again.");
      setNewName(prevName);
    }
  };

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const handleOnClickCompletedCard = () => {
    if (card.archived) return;
    setCompleted((current) => !current);
  };

  const isDeadlineOverdue = Boolean(card?.deadline && !isCompleted && new Date(card.deadline).getTime() < Date.now());
  const deadlineStatusClass = isCompleted
    ? "border-green-500 bg-green-50 text-green-700"
    : isDeadlineOverdue
      ? "border-red-500 bg-red-50 text-red-700"
      : "";

  const handlePreview = (file: any) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const handleDeleteFile = async (fileId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this file?',
      onOk: async () => {
        try {
          await deleteCardFile(fileId).unwrap();
          refreshCardAndBoard(); // Làm mới dữ liệu sau khi xóa
          notification.success({
            message: 'File deleted successfully',
            placement: 'bottomRight',
          });
        } catch (error) {
          notification.error({
            message: 'Unable to delete file',
            placement: 'bottomRight',
          });
        }
      },
    });
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={closeModal}
        width={800}
        footer={null}
      >
        <div>
          <Typography.Title level={3} className="flex items-center">
            <AiOutlineCreditCard className="mr-3" />
            {isEditingName ? (
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNameSubmit();
                  if (e.key === "Escape") {
                    setIsEditingName(false);
                    setNewName(prevName);
                  }
                }}
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                disabled={card.archived}
              />
            ) : (
              <span
                onClick={() => {
                  setPrevName(newName);
                  setIsEditingName(true);
                }}
              >
                {newName}
              </span>
            )}
          </Typography.Title>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>

        <span>
          `{t("general.inTheList")}` <span className="font-bold underline">{card?.list_str}</span>
        </span>
        <div className="flex ml-4 mt-4 gap-4">
          <div className="flex-1">
            <div className=" font-semibold sm:hidden mb-2">{t("noficationAddAndUpdate.addToCards")}</div>
            <div className="sm:hidden grid grid-cols-2 gap-1 sm:w-[150px] mb-3">
              <UpdateCardUsers card={card} board={board} refreshCardAndBoard={refreshCardAndBoard} />
              <AddAndUpdateLabels board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} listId={card.trello_list} patchCard={patchCard} />
              <AddCheckList card={card} refreshCardAndBoard={refreshCardAndBoard} />
              {renderCardDateFields()}
            </div>

            <div>
              <div className="mb-1 font-semibold">{t("general.label")}</div>
              {card.label_list && card.label_list.length > 0
                ? card.label_list.map((label: ILabel) => (
                  <span key={label.id} className="my-2">
                    <Tag color={label.color}> {label.name}</Tag>
                  </span>
                ))
                : null}
            </div>

            <div className="flex items-start gap-6 my-2">
              <div>
                <div className="font-semibold">{t("nav.teamMembers")}</div>
                <div>
                  <Avatar.Group
                    maxCount={2}
                    maxPopoverTrigger="click"
                    size="small"
                    maxStyle={{
                      color: "#f56a00",
                      backgroundColor: "#fde3cf",
                      cursor: "pointer",
                    }}
                  >
                    {card.users.map((user) => (
                      <Tooltip title={`${user.first_name} ${user.last_name}`} key={user.id}>
                        {user.image ? (
                          <Avatar src={user.image} />
                        ) : (
                          <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
                        )}
                      </Tooltip>
                    ))}
                  </Avatar.Group>
                </div>
              </div>
              <div>
                {card?.start_date && (
                  <>
                    <div className="font-semibold">{t("table.startDate")}</div>
                    <div className="flex items-center">
                      <AiOutlineClockCircle />
                      <div className="ml-2">{formatDate(card.start_date)}</div>
                    </div>
                  </>
                )}
              </div>
              <div>
                {card?.deadline && (
                  <>
                    <div className="font-semibold">{t("table.expirationDate")}</div>
                    <div className={`flex items-center rounded px-2 py-1 ${deadlineStatusClass ? `border ${deadlineStatusClass}` : ""}`}>
                      <AiOutlineClockCircle className="shrink-0" />
                      <div className="ml-2">{formatDate(card?.deadline)}</div>
                      <Button
                        size="small"
                        type={isCompleted ? "primary" : "default"}
                        className={`ml-2 ${isCompleted ? "bg-green-600 hover:!bg-green-500" : ""}`}
                        onClick={handleOnClickCompletedCard}
                        disabled={card.archived}
                      >
                        {isCompleted ? "Completed" : "Complete"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-5">
              <Typography.Title level={4} className="flex items-center">
                <AiOutlineAlignLeft className="mr-3" />
                {t("general.jobDescription")}
              </Typography.Title>
            </div>

            {isEditingDescription ? (
              <>
                <ReactQuill value={description} onChange={handleDescriptionChange} theme="snow" modules={modules} readOnly={card.archived} />
                <div className="mt-5">
                  <Button type="primary" className="text-sm mx-4" onClick={handleSaveDescription} disabled={card.archived}>
                    {t("admin.save")}
                  </Button>
                  <Button className="text-sm" onClick={() => setIsEditingDescription(false)} disabled={card.archived}>
                    {t("general.cancel")}
                  </Button>
                </div>
              </>
            ) : (
              <div
                onDoubleClick={handleEditDescription}
                dangerouslySetInnerHTML={{
                  __html: description || `${t("general.clickDescription")}`,
                }}
              />
            )}

            <CheckList card={card} />

            <div className="mt-5">
              <div>
                <Typography.Title level={4} className="flex items-center">
                  <ImAttachment className="mr-3" />
                  {t("general.attachedFiles")}
                </Typography.Title>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {card.file_list && card.file_list.length > 0 ? (
                  card.file_list.map((file, index) => {
                    const fileType = determineFileType(file.file);

                    return (
                      <div key={index} className="relative">
                        <div className={`cursor-pointer ${card.archived ? 'pointer-events-none opacity-50' : ''}`}
                          onClick={() => !card.archived && handlePreview(file.file)}
                        >
                          {fileType === 'image' ? (
                            <img src={file.file} alt={`Preview ${index}`} className="w-full object-cover" />
                          ) : fileType === 'video' ? (
                            <video
                              src={file.file}
                              className="w-full object-cover"
                              poster="/images/banner/video.png"
                              controls={!card.archived}
                            />
                          ) : (
                            <a href={file.file} target="_blank" rel="noopener noreferrer"
                              className={card.archived ? "pointer-events-none opacity-50" : ""}
                            >
                              File #{index + 1}: {file.file?.split("/").pop()}
                            </a>
                          )}
                        </div>

                        <div className="absolute top-0 right-0 flex space-x-2">
                          <Button
                            icon={<FaTrash />}
                            // type="danger"
                            shape="circle"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={card.archived}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No files attached</p>
                )}
              </div>
              <div>
                <UploadCardFile card={card} refreshCardAndBoard={refreshCardAndBoard} />
              </div>
            </div>

            <div className="mt-5">
              <AddAndUpdateActivity card={card} />
            </div>
          </div>

          <div className="hidden sm:block sm:w-[150px]">
            <div className="font-semibold">{t("noficationAddAndUpdate.addToCards")}</div>
            <UpdateCardUsers card={card} board={board} refreshCardAndBoard={refreshCardAndBoard} />
            <AddAndUpdateLabels board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} listId={card.trello_list} patchCard={patchCard} />
            <AddCheckList card={card} refreshCardAndBoard={refreshCardAndBoard} />
            {renderCardDateFields()}
            {isBoardCreator && (
              <LockCard card={card} board={board} refreshCardAndBoard={refreshCardAndBoard} />
            )}
          </div>
        </div>
      </Modal>

      <Modal open={modalVisible} footer={null} onCancel={() => setModalVisible(false)} width="80%">
        {modalContent}
      </Modal>
    </>
  );
};

export default UpdateCardDetail;
