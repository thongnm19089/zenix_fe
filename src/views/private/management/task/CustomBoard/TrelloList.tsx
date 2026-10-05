import Card from "./Card";
import CardInput from "./CardInput";
import CopyItem from "./CopyItem";
import MoveItem from "./MoveItem";
import { useEditTrelloListMutation } from "@/api/Task/apiTask";
import { IBoard, ICard, IList } from "@/types/taskTypes";
import { Button, Dropdown, type MenuProps } from "antd";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { BsArchive } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import TaskStatusBar from "@/components/FunctionsManagement/Task/TaskStatusBar";
import dayjs from "dayjs";

interface TrelloListProps {
  board: IBoard;
  list: IList;
  index: number;
  removeList: (listId: number) => void;
  addCard: (listId: number, value: any, startDate?: string, deadline?: string) => void;
  reorderCard?: (destiation: number) => Promise<void>;
  removeCard: (listId: number, cardId: number) => void;
  refreshCardAndBoard: () => void;
  patchCard: (listId: number, cardId: number, patch: Partial<ICard>) => void; // ✅ NEW
  openCardDetail?: (cardSlug: string) => void;
  onFilterChange?: (type: string, value: string) => void;
}
function TrelloList(props: TrelloListProps) {
  // const { board, list, removeList, addCard, removeCard, refreshCardAndBoard } = props;
  const { board, list, removeList, addCard, removeCard, refreshCardAndBoard, patchCard, openCardDetail, onFilterChange } = props;
  const { id, name, cards } = list;
  const { theme } = useTheme();
  // New state for managing title editing
  const [loading, setLoading] = useState(false); // New state to handle loading
  const [error, setError] = useState<string | null>(null); // New state to handle errors
  const [isEditing, setIsEditing] = useState(false);
  const [prevTitle, setPrevTitle] = useState(name);
  const [newTitle, setNewTitle] = useState(name);
  const [editTrelloList] = useEditTrelloListMutation();
  const t: any = useTranslations();

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div onClick={() => removeList(id)}>
          <BsArchive className="inline-block mr-2" />
          {t("general.storage")}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div>
          <MoveItem type="list" itemId={id} />
        </div>
      ),
    },{
      key: "3",
      label: (
        <div>
          <MoveItem type="reorder" itemId={id} reorderCard={props.reorderCard} />
        </div>
      ),
    },
    {
      key: "4",
      label: (
        <div>
          <CopyItem type="list" itemId={id} name={name} />
        </div>
      ),
    },
  ];

  // Function to handle title submission
  const handleTitleSubmit = async () => {
    setIsEditing(false);
    // Check if the title was actually changed, if not, no API call is needed
    if (newTitle === name) return;
    // Store the current title in case we need to revert back
    setPrevTitle(name);
    // Submit the new title to your API...
    const body = {
      id: list.id,
      name: newTitle || null,
    };
    try {
      const response = await editTrelloList(body); // Assuming API call function
      if (!response) {
        // Handle unsuccessful update by reverting title and showing an error message
        setNewTitle(prevTitle);
        setError("Could not update title. Please try again.");
      }
    } catch (error) {
      // Handle error during API call by reverting title and showing an error message
      setNewTitle(prevTitle);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div
        className={` relative bg-card-task border p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer min-w-[272px] w-[272px] `}
        key={list.id}
      >
        <div className="w-full justify-between bg-inherit">
          <div className="flex min-w-0 items-start">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center justify-between gap-1">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value)
                      }}
                      onBlur={handleTitleSubmit}
                      onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                      autoFocus
                      className="w-full p-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                    />
                  ) : (
                    <div className="flex min-w-0 max-w-full items-center gap-1">
                      <h3
                        className="block min-w-0 max-w-full flex-1 truncate whitespace-nowrap rounded px-2 py-1 text-left text-sm font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsEditing(true)}
                        title={`#${props.index + 1}: ${newTitle}`}
                      >
                          #{props.index + 1}: {newTitle}
                      </h3>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center">
                  <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
                    <Button
                      type="text"
                      icon={<FiMoreHorizontal />}
                      className="text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    />
                  </Dropdown>
                </div>
              </div>
              <TaskStatusBar list={list} />
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>
          </div>
          <Droppable droppableId={`list-${list.id}`} type="CARD">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {cards?.map((item: ICard, index: number) => (
                  <Draggable key={item.id} draggableId={`card-${item.id}`} index={index}>
                    {(provided) => {
                      return (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <Card
                            key={item.id}
                            card={item}
                            board={board}
                            listId={list.id}
                            removeCard={removeCard}
                            refreshCardAndBoard={refreshCardAndBoard}
                            index={index}
                            patchCard={patchCard}
                            openCardDetail={openCardDetail}
                            onFilterChange={onFilterChange}
                          />
                        </div>
                      )
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              <CardInput
                  text={t("noficationAddAndUpdate.addCard")}
                  placeholder="Enter Card Title"
                  displayClass="rounded-lg shadow-md w-[235px] text-center mt-4"
                  editClass="rounded-lg p-2.5 mt-4"
                  startDate={dayjs().hour(9).minute(0)}
                  deadline={dayjs().hour(17).minute(0)}
                  showDeadlineButton
                  onSubmit={(value, startDate, deadline) => addCard(list?.id, value, startDate, deadline)} // ← truyền deadline
                />
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </>
  );
}

export default TrelloList;
