import CopyItem from "./CopyItem";
import MoveCard from "./MoveCard";
import MoveItem from "./MoveItem";
import { useEditCardMutation } from "@/api/Task/apiTask";
import AddAndUpdateDeadline from "@/components/FunctionsManagement/Task/Task-archive/AddAndUpdateDeadline";
import AddAndUpdateLabels from "@/components/FunctionsManagement/Task/Task-archive/AddAndUpdateLabels";
import AddAndUpdateUser from "@/components/FunctionsManagement/Task/Task-archive/AddAndUpdateUser";
import "@/styles/CardInfo.css";
import { IBoard, ICard, ILabel } from "@/types/taskTypes";
import { formatDate } from "@/utils/formatDate";
import { Button, Dropdown, Tooltip, type MenuProps, Avatar, Popconfirm, Tag, notification } from "antd";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsArchive } from "react-icons/bs";
import { FiEdit, FiBox, FiUserPlus, FiClock, FiTrash2, FiCalendar } from "react-icons/fi";

interface CardProps {
  card: ICard;
  listId: number;
  board: IBoard;
  removeCard: (lisId: number, cardId: number) => void;
  refreshCardAndBoard: () => void;
}

const isCheckTime = (value: any, isCompleted: any) => {
  if (isCompleted) return true; // Nếu công việc đã hoàn thành, trả về true luôn

  const providedDate = new Date(value);
  const currentDate = new Date();

  return providedDate < currentDate;
};

function Card(props: CardProps) {
  const { card, listId, board, removeCard, refreshCardAndBoard } = props;
  const { id, name, start_date, deadline, is_completed } = card;
  const [showCardDeadlineModal, setShowCardDeadlineModal] = useState(false);
  const [showCardUserModal, setShowCardUserModal] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-gray-100" : "bg-slate-100";
  const router = useRouter();
  const [currentBoard, setCurrentBoard] = useState<any>(null);

  const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
  const [isCompleted, setIsCompleted] = useState(is_completed);

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

  const openCardDeadlineAndCloseMenu = () => {
    setShowCardDeadlineModal(true);
    setContextMenuVisible(false);
  };

  const closeMenuVisible = () => {
    setContextMenuVisible(false);
  };

  
  // State to control Dropdown visibility
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const t: any = useTranslations();

  const navigateToCardDetail = () => {
    refreshCardAndBoard();
    router.push(`/business/task/task-archive/c/${card?.slug}`);
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
      disabled: false,
    },
    {
      key: "1",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <MoveItem type="card" itemId={card?.id} />
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: "2",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <AddAndUpdateLabels edit={true} board={board} card={card} refreshCardAndBoard={refreshCardAndBoard} />
          </div>
        </div>
      ),
      disabled: true, // Vô hiệu hóa chức năng này
    },
    {
      key: "3",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <FiUserPlus className="inline-block mr-2" />
            {t("noficationAddAndUpdate.addEditMembers")}
          </div>    
        </div>
      ),
      disabled: true, // Vô hiệu hóa chức năng này
    },
    {
      key: "4",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <FiClock className="inline-block mr-2" />
            {t("noficationAddAndUpdate.addEditDeadline")}
          </div>       
        </div>
      ),
      disabled: true, // Vô hiệu hóa chức năng này
    },
    {
      key: "5",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <CopyItem type="card" itemId={id} name={name} />
          </div> 
        </div>
      ),
      disabled: true, // Vô hiệu hóa chức năng này
    },
    {
      key: "6",
      label: (
        <div onClick={navigateToCardDetail} className="disabled-item">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
            <BsArchive className="inline-block mr-2" />
            {t("general.storage")}
          </div>     
        </div>
      ),
      disabled: true, // Vô hiệu hóa chức năng này
    },
  ];

  const onChangeCompletedCard = async () => {
    const body = {
      id: id,
      is_completed: !isCompleted,
    };

    try {
      const result = await editCard(body);
      refreshCardAndBoard();
      if ("error" in result) {
        console.error(result.error);
        return;
      }
      setIsCompleted(result?.data?.is_completed);
    } catch (error) {
      console.log(error);
    }
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
                <Tag key={label.id} color={label.color} className="my-1">
                  {" "}
                  {label.name}
                </Tag>
              ))
            : null}
        </div>
        <div className="flex items-center justify-between">
          {/* Ensure it's relative */}
          <div className="flex-1 font-bold text-base leading-7 ml-4  " onClick={navigateToCardDetail}>
            {name}
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
          {start_date && (
            <div className="flex items-center py-1 px-2 rounded bg-white text-gray-700 border border-gray-300">
              <FiCalendar />
              <div className="flex-1 ml-2 text-start">{formatDate(start_date)}</div>
            </div>
          )}

          {deadline && (
            <div
              className={`
            ${
              isCheckTime(deadline, isCompleted)
                ? isCompleted
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
                : ""
            }
            flex py-1 px-2 rounded
          `}
              onClick={onChangeCompletedCard}
            >
              <AiOutlineClockCircle />
              <div className="flex-1 ml-2 text-start">{formatDate(deadline)}</div>
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
                    <Avatar src={user.image} />
                  ) : (
                    <Avatar>{user.first_name.charAt(0) + user.last_name.charAt(0)}</Avatar>
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
          refreshCardAndBoard={refreshCardAndBoard}
        />

        {/* update deadline modal */}
        <AddAndUpdateDeadline
          isOpen={showCardDeadlineModal}
          closeModal={() => setShowCardDeadlineModal(false)}
          board={board}
          card={card}
          refreshCardAndBoard={refreshCardAndBoard}
        />
      </div>
    </div>
  );
}

export default Card;
