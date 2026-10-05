
import { Modal, Button, Typography, Tag } from "antd";
import { useTranslations } from "next-intl";

// if you want to use the bubble theme
import { useState } from "react";
import {
    AiOutlineAlignLeft,
    AiOutlineCreditCard,
} from "react-icons/ai";
import "react-quill/dist/quill.bubble.css";
import "react-quill/dist/quill.snow.css";
import { FiBox } from "react-icons/fi";
import { GoCopy } from "react-icons/go";
import { CiShare2 } from "react-icons/ci";

const CardDetail = ({ card, list }: { card: any; list: any }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const t: any = useTranslations();
    const [open, setOpen] = useState(false);

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <>
            <div onClick={() => setOpen(true)}>
                <FiBox className="inline-block mr-2" />
                Mở thẻ
            </div>
            <Modal
                open={open}
                onCancel={handleCancel}
                width={800}
                footer={null}
            >
                <div>
                    <Typography.Title level={3} className="flex items-center">
                        <AiOutlineCreditCard className="mr-3" />
                        {isEditingName ? (
                            <input
                                value={card.name}
                            />
                        ) : (
                            <span
                                onClick={() => {
                                    setIsEditingName(true);
                                }}
                            >
                                {card.name}
                            </span>
                        )}
                    </Typography.Title>
                </div>

                <span>
                    Trong danh sách<span className="font-bold underline">   {list.name}</span>
                </span>
                <div className="flex ml-4 mt-4 gap-4">
                    <div className="flex-1">
                        <div>
                            <div className="mb-1 font-semibold">{t('general.label')}</div>
                            {card.labels && card.labels.length > 0
                                ? card.labels.map((label: any) => (
                                    <Tag key={label.id} color={label.color} className="my-1">
                                        {" "}
                                        {label.name}
                                    </Tag>
                                ))
                                : null}
                        </div>
                        <div className="mt-5">
                            <Typography.Title level={4} className="flex items-center">
                                <AiOutlineAlignLeft className="mr-3" />
                                {t('general.jobDescription')}
                            </Typography.Title>
                            <p>{card.description}</p>
                        </div>
                    </div>
                    <div className="hidden sm:block sm:w-[150px]">
                        <div className="font-semibold">Thao tác</div>

                        <div className={`flex items-center gap-2 w-full cursor-pointer mt-2 py-1 px-2 border hover:bg-neutral-200`}>
                            <GoCopy className="inline-block" />
                            Sao chép
                        </div>
                        <div className={`flex items-center gap-2 w-full cursor-pointer mt-2 py-1 px-2 border hover:bg-neutral-200`}>
                            <CiShare2 className="inline-block" />
                            Chia sẻ
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CardDetail;
