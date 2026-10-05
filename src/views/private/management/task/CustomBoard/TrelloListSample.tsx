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
import { title } from "process";
import React, { useState } from "react";
import { Droppable, Draggable, DragDropContext, DropResult } from "react-beautiful-dnd";
import { BsArchive } from "react-icons/bs";
import { FiCheckSquare, FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import CardSample from "./CardSample";

interface TrelloListProps {
    board: IBoard;
    list: IList;
}
function TrelloListSample(props: TrelloListProps) {
    const { board, list } = props;
    const { id, name, order, cards } = list;
    const { theme } = useTheme();
    const bgColor = theme === "dark" ? "bg-black-500" : "bg-blue-500 ";
    const borderColor = theme === "dark" ? "border-white" : "border-transparent";
    // New state for managing title editing
    const [loading, setLoading] = useState(false); // New state to handle loading
    const [error, setError] = useState<string | null>(null); // New state to handle errors
    const [isEditing, setIsEditing] = useState(false);
    const [prevTitle, setPrevTitle] = useState(name);
    const [newTitle, setNewTitle] = useState(name);
    const [editTrelloList, { isLoading: isLoadingLeave }] = useEditTrelloListMutation();
    const t: any = useTranslations();


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
                <div className="justify-between w-full bg-inherit ">
                    <div className="flex items-center">
                        <div className="flex-1 font-bold text-base leading-7 ml-4">
                            <span>{newTitle}</span>
                        </div>
                        {error && <div className="text-red-500 mt-2">{error}</div>}
                    </div>
                    <DragDropContext onDragEnd={() => { }}>
                        <Droppable droppableId={`list-${list.id}`} type="CARD">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {cards?.map((item: ICard, index: number) => (
                                        <Draggable key={item.id} draggableId={`card-${item.id}`} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef}>
                                                    <CardSample
                                                        key={item.id}
                                                        card={item}
                                                        board={board}
                                                        listId={list.id}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
        </>
    );
}

export default TrelloListSample;
