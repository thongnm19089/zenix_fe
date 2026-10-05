import Card from "./Card";
import CardInput from "./CardInput";
import CopyItem from "./CopyItem";
import MoveCard from "./MoveCard";
import MoveItem from "./MoveItem";
import { useEditTrelloListMutation } from "@/api/Task/apiTask";
import { IBoard, ICard, IList } from "@/types/taskTypes";
import { Button, Dropdown, notification, type MenuProps, Popconfirm } from "antd";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { BsArchive } from "react-icons/bs";
import { FiCheckSquare, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";

interface TrelloListProps {
  board: IBoard;
  list: IList;
  removeList: (listId: number) => void;
  addCard: (listId: number, value: any) => void;
  removeCard: (listId: number, cardId: number) => void;
  refreshCardAndBoard: () => void;
}

function TrelloList(props: TrelloListProps) {
  const { board, list, removeList, addCard, removeCard, refreshCardAndBoard } = props;
  const { id, name, order, cards } = list;
  const { theme } = useTheme();
  const bgColor = theme === "dark" ? "bg-black-500" : "bg-blue-500 ";
  const borderColor = theme === "dark" ? "border-white" : "border-transparent";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [prevTitle, setPrevTitle] = useState(name);
  const [newTitle, setNewTitle] = useState(name);
  const [editTrelloList, { isLoading: isLoadingLeave }] = useEditTrelloListMutation();
  const t: any = useTranslations();

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="disabled-item cursor-not-allowed opacity-50">
          <BsArchive className="inline-block mr-2" />
          asdfhsajdfl
          {t("general.storage")}
        </div>
      ),
      disabled: true,
    },
    {
      key: "2",
      label: (
        <div className="disabled-item" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
          <MoveItem type="list" itemId={id} />
        </div>
      ),
      disabled: true,
    },
    {
      key: "3",
      label: (
        <div className="disabled-item" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
          <CopyItem type="list" itemId={id} name={name} />
        </div>
      ),
      disabled: true,
    },
  ];

  const handleTitleSubmit = async () => {
    setIsEditing(false);
    if (newTitle === name) return;
    setPrevTitle(name);
    const body = {
      id: list.id,
      name: newTitle || null,
    };
    try {
      const response = await editTrelloList(body);
      if (!response) {
        setNewTitle(prevTitle);
        setError("Could not update title. Please try again.");
      }
    } catch (error) {
      setNewTitle(prevTitle);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div
        className={`relative bg-card-task border p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer min-w-[272px] w-[272px]`}
        key={list.id}
      >
        <div className="justify-between w-full bg-inherit">
          <div className="flex items-center">
            <div className="flex-1 font-bold text-base leading-7 ml-4">
              {newTitle}
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={["click"]}>
              <Button type="text" icon={<FiMoreHorizontal size={22} />} />
            </Dropdown>
          </div>
          <div>
            {cards?.map((item: ICard) => (
              <div key={item.id}>
                <Card
                  key={item.id}
                  card={item}
                  board={board}
                  listId={list.id}
                  removeCard={removeCard}
                  refreshCardAndBoard={refreshCardAndBoard}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default TrelloList;
