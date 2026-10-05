import CopyItem from "./CopyItem";
import MoveItem from "./MoveItem";
import { useEditCardMutation } from "@/api/Task/apiTask";
import AddAndUpdateDate from "@/components/FunctionsManagement/Task/AddAndUpdateDeadline";
import AddAndUpdateLabels from "@/components/FunctionsManagement/Task/AddAndUpdateLabels";
import AddAndUpdateUser from "@/components/FunctionsManagement/Task/AddAndUpdateUser";
import "@/styles/CardInfo.css";
import { IBoard, ICard, ILabel } from "@/types/taskTypes";
import { formatDate } from "@/utils/formatDate";
import { Button, Dropdown, Tooltip, type MenuProps, Avatar, Popconfirm, Tag, notification } from "antd";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsArchive } from "react-icons/bs";
import { FiEdit, FiBox, FiUserPlus, FiClock, FiTrash2, FiUpload, FiCalendar } from "react-icons/fi";

interface CardProps {
  card: ICard;
  listId: number;
  board: IBoard;
  removeCard: (lisId: number, cardId: number) => void;
  refreshCardAndBoard: () => void;
  index: number;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void; // ✅ NEW
  openCardDetail?: (cardSlug: string) => void;
  onFilterChange?: (type: string, value: string) => void;
}

const isCheckTime = (value: any, isCompleted: any) => {
  if (isCompleted) return true; // Nếu công việc đã hoàn thành, trả về true luôn

  const providedDate = new Date(value);
  const currentDate = new Date();

  return providedDate < currentDate;
};

function Card(props: CardProps) {
  const { card, listId, board, removeCard, refreshCardAndBoard, index = 0, patchCard, openCardDetail, onFilterChange } = props;

  // Debug: Log the card object to check available properties
  const { id, name, start_date, deadline, is_completed } = card;
  const [showCardDateModal, setShowCardDateModal] = useState(false);
  const [showCardUserModal, setShowCardUserModal] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-gray-100" : "bg-slate-100";
  const router = useRouter();
  const searchParams = useSearchParams()!;

  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const [isCompleted, setIsCompleted] = useState(is_completed);

  useEffect(() => {
    setIsCompleted(card.is_completed);
  }, [card.is_completed]);

  const handleRightClick = (event: { preventDefault: () => void }) => {
    event.preventDefault(); // Prevent the default right-click menu from showing
    setContextMenuVisible(true); // Set the Dropdown menu to visible
  };

  const openLabelEditorAndCloseMenu = () => {
    setShowLabelEditor(!showLabelEditor);
    setContextMenuVisible(false);
  };

  const openCardUserAndCloseMenu = () => {
    setShowCardUserModal(!showCardUserModal);
    setContextMenuVisible(false);
  };

  const openCardDateAndCloseMenu = () => {
    setShowCardDateModal(true);
    setContextMenuVisible(false);
  };

  const closeMenuVisible = () => {
    setContextMenuVisible(false);
  };

  // State to control Dropdown visibility
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const t: any = useTranslations();

  const navigateToCardDetail = () => {
    if (openCardDetail) {
      openCardDetail(card.slug);
      return;
    }
    const query = searchParams.toString();
    router.push(query ? `/business/task/${board.slug}?${query}` : `/business/task/${board.slug}`);
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <div onClick={navigateToCardDetail}>
          <FiBox className="inline-block mr-2" />
          {t("general.openCard")}
        </div>
      ),
    },
    {
      key: "1",
      label: (
        <div onClick={closeMenuVisible}>
          <MoveItem type="card" itemId={card?.id} />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div onClick={openLabelEditorAndCloseMenu}>
          <AddAndUpdateLabels
            edit={true}
            board={board}
            card={card}
            listId={listId}
            patchCard={patchCard}
            refreshCardAndBoard={refreshCardAndBoard}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div onClick={openCardUserAndCloseMenu}>
          <FiUserPlus className="inline-block mr-2" />
          {t("noficationAddAndUpdate.addEditMembers")}
        </div>
      ), // You'll need to add a function or method for this action
    },
    {
      key: "4",
      label: (
        <div onClick={openCardDateAndCloseMenu}>
          <FiClock className="inline-block mr-2" />
          {t("noficationAddAndUpdate.addEditDate")}
        </div>
      ),
    },
    {
      key: "5",
      label: <CopyItem type="card" itemId={id} name={name} />,
    },
    {
      key: "6",
      label: (
        <div onClick={() => removeCard(listId, id)}>
          <BsArchive className="inline-block mr-2" />
          {t("general.storage")}
        </div>
      ),
    },
  ];

  const onChangeCompletedCard = async () => {
    if (isLoadingEdit) return;

    const nextCompleted = !isCompleted;

    // ✅ 1) UI fake trước – đổi trạng thái ngay
    setIsCompleted(nextCompleted);

    // ✅ 2) UI fake ngay (board state) để DeadlineStats đổi
    patchCard(listId, id, { is_completed: nextCompleted });

    // ✅ 3) API gọi sau
    editCard({ id, is_completed: nextCompleted })
      .unwrap()
      .then((res) => {
        // nếu backend trả trạng thái khác thì sync lại
        if (typeof res?.is_completed === "boolean") {
          setIsCompleted(res.is_completed);
          patchCard(listId, id, { is_completed: res.is_completed });
        }
      })
      .catch((error) => {
        console.error(error);

        // ✅ 4) rollback nếu lỗi
        setIsCompleted(!nextCompleted);
        patchCard(listId, id, { is_completed: !nextCompleted });

        notification.error({
          message: "Cập nhật trạng thái thất bại",
          placement: "bottomRight",
          className: "h-16",
        });
      });
  };

  return (
    <div
      className={`${bgColor} p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer my-3 bg-inherit `}
      key={card.id}
      onContextMenu={handleRightClick}
    >
      <div className="justify-between w-full ">
        <div className="mx-4">
          {card.label_list && card.label_list.length > 0
            ? card.label_list.map((label: ILabel) => (
              <Tag
                key={label.id}
                color={label.color}
                className="my-1 cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onFilterChange?.("labels", String(label.id));
                }}
              >
                {" "}
                {label.name}
              </Tag>
            ))
            : null}
        </div>
        <div className="flex items-center justify-between">
          {/* Ensure it's relative */}
          <div
            className="flex items-center gap-2 flex-1 ml-4 cursor-pointer"
            onClick={navigateToCardDetail}
          >
            {/* Badge số thứ tự */}
            <span className="px-2 py-1 bg-gray-200 rounded-md text-sm font-semibold text-gray-700 min-w-[32px] text-center">
              #{typeof index === "number" ? index + 1 : ""}
            </span>

            {/* Tên card */}
            <div className="flex flex-col">
              <span className="font-bold text-base leading-7">
                {name}
              </span>
            </div>
          </div>

          <Dropdown
            menu={{ items }}
            placement="bottomLeft"
            arrow
            trigger={["click"]}
            open={contextMenuVisible}
            onOpenChange={setContextMenuVisible}
            overlayClassName="custom-dropdown"
          >
            <Button
              type="text"
              icon={<FiEdit size={22} />}
              onClick={() => setContextMenuVisible(!contextMenuVisible)}
            />
          </Dropdown>
        </div>

        {/* Avatar.Group goes here */}
        <div className="flex items-center gap-2 ml-4 mt-4 flex-wrap">
          {deadline && (
            <div
              className={`
        ${isCheckTime(deadline, isCompleted)
                  ? isCompleted
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300"
                }
                flex items-center
                py-1 px-3
                rounded-full
                border gap-2
                ${isLoadingEdit ? "opacity-70 pointer-events-none" : ""}
                `}
              onClick={onChangeCompletedCard}
            >
              <AiOutlineClockCircle />
              <div className="flex flex-col gap-1">
                {
                  start_date && (
                    <div className="text-start">
                      {formatDate(start_date)}
                    </div>
                  )
                }
                <div className="text-start">
                  {formatDate(deadline)}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-[56px] text-end ml-auto">
            <Avatar.Group
              maxCount={2}
              maxPopoverTrigger="click"
              size="small"
              maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf", cursor: "pointer" }}
            >
              {card.users.map((user) => (
                <Tooltip title={`${user.first_name} ${user.last_name}`} key={user.id}>
                  {user.image ? (
                    <Avatar
                      src={user.image}
                      onClick={(event) => {
                        event?.stopPropagation();
                        onFilterChange?.("users", String(user.id));
                      }}
                    />
                  ) : (
                    <Avatar
                      onClick={(event) => {
                        event?.stopPropagation();
                        onFilterChange?.("users", String(user.id));
                      }}
                    >
                      {user.first_name.charAt(0) + user.last_name.charAt(0)}
                    </Avatar>
                  )}
                </Tooltip>
              ))}
            </Avatar.Group>
          </div>
        </div>

        {/* update card users */}
        <AddAndUpdateUser
          isOpen={showCardUserModal}
          closeModal={() => setShowCardUserModal(false)}
          board={board}
          card={card}
          listId={listId}
          patchCard={patchCard}
        />

        {/* update deadline modal */}
        <AddAndUpdateDate
          isOpen={showCardDateModal}
          closeModal={() => setShowCardDateModal(false)}
          board={board}
          card={card}
          listId={listId}
          patchCard={patchCard}
        />

      </div>
    </div>
  );
}

export default Card;
