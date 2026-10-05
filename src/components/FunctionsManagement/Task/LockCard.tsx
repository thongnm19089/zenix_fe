import { useEditCardMutation } from "@/api/Task/apiTask";
import { Popconfirm, notification } from "antd";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { IBoard, ICard } from "@/types/taskTypes";
import { AiOutlineLock } from "react-icons/ai";

interface LockCardProps {
    board: IBoard;
    card: ICard;
    refreshCardAndBoard: () => void;
}

const LockCard: React.FC<LockCardProps> = ({ board, card, refreshCardAndBoard }) => {
    const t: any = useTranslations();
    const [isPopConfirmOpen, setPopConfirmOpen] = useState(false);
    const [editCard, { isLoading: isLoadingEdit }] = useEditCardMutation();
    const [user, setUser] = useState<any>(null);
    
    useEffect(() => {
        const userDataString = localStorage.getItem("user");
        const parsedUserData = userDataString ? JSON.parse(userDataString) : null;
        setUser(parsedUserData);
    }, []);

    const handleLockCard = async () => {
        if (isLoadingEdit) return;

        try {
            const body = {
                id: card.id,
                archived: !card.archived,
            };
            await editCard(body).unwrap();
            notification.success({
                message: !card.archived ? t("task.locked") : t("task.unlocked"),
                placement: "bottomRight",
                className: "h-16",
            });
            refreshCardAndBoard();
            setPopConfirmOpen(false);
        } catch (error) {
            notification.error({
                message: t("task.error_locking_card"),
                placement: "bottomRight",
                className: "h-16",
            });
        }
    };
    const popContent = (
        <div className="text-center mb-2">
            {card.archived ? t("task.confirmUnlock") : t("task.confirmLock")}
        </div>
    );

    // Phần tử JSX phải được trả về từ đây
    return (
        <Popconfirm
            title={popContent}
            open={isPopConfirmOpen}
            onOpenChange={setPopConfirmOpen}
            onConfirm={handleLockCard}
            onCancel={() => setPopConfirmOpen(false)}
            okText={t("general.confirm")}
            cancelText={t("general.cancel")}
            placement="bottom"
            okButtonProps={{ loading: isLoadingEdit }}
        >
            <div
                className="flex items-center gap-2 py-1 px-2 border w-full mt-2 cursor-pointer hover:bg-neutral-200"
                onClick={() => setPopConfirmOpen(true)}
            >
                <AiOutlineLock size={16} /> <span>{card.archived ? t("task.unlockCard") : t("task.lockCard")}</span>
            </div>
        </Popconfirm>
    );
};


export default LockCard;
