import AddAndUpdateActivity from "./AddAndUpdateActivity";
import AddAndUpdateLabels from "./AddAndUpdateLabels";
import AddCheckList from "./Checklist/AddCheckList";
import CheckList from "./Checklist/CheckList";
import UpdateCardDeadline from "./UpdateCardDeadline";
import UpdateCardUsers from "./UpdateCardUsers";
import UploadCardFile from "./UploadCardFile";
import { useEditCardMutation } from "@/api/Task/apiTask";
import { RootState } from "@/store/store";
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
import dynamic from "next/dynamic";
// if you want to use the bubble theme
import { useState } from "react";
import { AiOutlineAlignLeft, AiOutlineClockCircle, AiOutlineCreditCard } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import { useSelector } from "react-redux";

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

const iconMap = {
  word: FileWordOutlined,
  pdf: FilePdfOutlined,
  excel: FileExcelOutlined,
  ppt: FilePptOutlined,
  text: FileTextOutlined,
  image: FileImageOutlined,
  zip: FileZipOutlined,
  code: CodeOutlined,
  audio: AudioOutlined,
  video: VideoCameraOutlined,
  other: FileOutlined,
};

const UpdateCardDetail: React.FC<UpdateCardDetailsProps> = ({ isOpen, board, card, refreshCardAndBoard }) => {
  const [description, setDescription] = useState(card?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(card?.name || "");
  const [prevName, setPrevName] = useState(card?.name || "");
  const [error, setError] = useState("");
  const searchParamsValue = useSelector((state: RootState) => state.searchParams);
  const t: any = useTranslations();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const router = useRouter();

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
      await editCard(body);
      refreshCardAndBoard();
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
      const response = await editCard(body);
      refreshCardAndBoard();
      if (!response) {
        setError("Could not update name. Please try again.");
        setNewName(prevName);
      }
    } catch (error) {
      console.log("error", error);
      setError("An error occurred. Please try again.");
      setNewName(prevName);
    }
  };

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const handleAddNewFile = () => {
    setIsUploadModalVisible(true);
  };

  const handleFileClick = (file: string | URL | undefined, fileType: any) => {
    switch (fileType) {
      case "image":
        setModalContent(<img src={file?.toString()} alt="Image preview" style={{ maxWidth: "100%" }} />);
        break;
      case "video":
        setModalContent(<video controls src={file?.toString()} style={{ maxWidth: "100%" }} />);
        break;
      case "pdf":
      case "word":
      case "excel":
      case "ppt":
        // For document types, provide a download link
        setModalContent(
          <Typography.Text>
            Preview not available.
            <a href={file?.toString()} target="_blank" rel="noopener noreferrer">
              Download file
            </a>
            .
          </Typography.Text>
        );
        break;
      default:
        window.open(file, "_blank");
        return;
    }
    setModalVisible(true);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={() => {
          router.push(`/business/task/task-archive/${board?.slug}${searchParamsValue}`);
        }}
        width={800}
        footer={null}
      >
        <div>
          <Typography.Title level={3} className="flex items-center">
            <AiOutlineCreditCard className="mr-3" />
            {newName}
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
              {/* <UpdateCardUsers card={card} board={board} refreshCardAndBoard={refreshCardAndBoard} />
              <AddAndUpdateLabels board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} />
              <AddCheckList card={card} refreshCardAndBoard={refreshCardAndBoard} />
              <UpdateCardDeadline board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} /> */}
            </div>

            <div>
              <div className="mb-1 font-semibold">{t("general.label")}</div>
              {card.label_list && card.label_list.length > 0
                ? card.label_list.map((label: ILabel, index: number) => (
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
                {card?.deadline && (
                  <>
                    <div className="font-semibold">{t("table.expirationDate")}</div>
                    <div className="flex items-center">
                      <AiOutlineClockCircle />
                      <div className="ml-2">{formatDate(card?.deadline)}</div>
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
              <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
                <ReactQuill value={description} onChange={handleDescriptionChange} theme="snow" modules={modules} />
                <div className="mt-5">
                  <Button type="primary" className="text-sm mx-4" onClick={handleSaveDescription}>
                    {t("admin.save")}
                  </Button>
                  <Button className="text-sm" onClick={() => setIsEditingDescription(false)}>
                    {t("general.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: description || `${t("general.clickDescription")}`,
                  }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
              </div>
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
                    const Icon = iconMap[fileType] || iconMap["other"];

                    return (
                      <div key={index} className="flex items-center justify-center">
                        {fileType === "image" || fileType === "video" ? (
                          <div className="cursor-pointer" onClick={() => handleFileClick(file.file, fileType)}>
                            {fileType === "image" ? (
                              <img src={file.file} alt={`Preview ${index}`} className="w-full object-cover" />
                            ) : (
                              <video
                                src={file.file}
                                className="w-full object-cover"
                                poster="/images/banner/video.png"
                              />
                            )}
                          </div>
                        ) : (
                          <a href={file.file} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <Icon style={{ color: "blue", marginRight: "8px" }} rev={undefined} />
                            File #{index + 1}: {file.file?.split("/").pop()}
                          </a>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p>{t("noficationDelete.noAttachedFiles")}</p>
                )}
              </div>
              <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
                <UploadCardFile card={card} refreshCardAndBoard={refreshCardAndBoard} />
              </div>
            </div>

            <div className="mt-5" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
              <AddAndUpdateActivity card={card} />
            </div>
          </div>
          <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
            <div className="hidden sm:block sm:w-[150px]">
              <div className="font-semibold">{t("noficationAddAndUpdate.addToCards")}</div>
              <UpdateCardUsers card={card} board={board} refreshCardAndBoard={refreshCardAndBoard} />
              <AddAndUpdateLabels board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} />
              <AddCheckList card={card} refreshCardAndBoard={refreshCardAndBoard} />
              <UpdateCardDeadline board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} />
            </div>
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
