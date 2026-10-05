import CopyItem from "./CopyItem";
import MoveCard from "./MoveCard";
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
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsArchive } from "react-icons/bs";
import { FiEdit, FiBox, FiUserPlus, FiClock, FiTrash2 } from "react-icons/fi";

interface CardProps {
    card: ICard;
    listId: number;
    board: IBoard;
}

const isCheckTime = (value: any, isCompleted: any) => {
    if (isCompleted) return true; // Nếu công việc đã hoàn thành, trả về true luôn

    const providedDate = new Date(value);
    const currentDate = new Date();

    return providedDate < currentDate;
};

function CardSample(props: CardProps) {
    const { card, listId, board } = props;
    const { id, name, deadline, is_completed } = card;
    const { theme } = useTheme();
    const bgColor = theme === "dark" ? "bg-gray-100" : "bg-slate-100";

    const [isCompleted, setIsCompleted] = useState(is_completed);
    const t: any = useTranslations();

    return (
        <div
            className={`${bgColor} p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer my-3 bg-inherit `}
            key={card.id}
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
                    <div className="flex-1 font-bold text-base leading-7 ml-4  ">
                        {name}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CardSample;
