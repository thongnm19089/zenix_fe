import { Button, Dropdown, Tag, theme } from 'antd'
import { MenuProps } from 'antd/lib'
import { useTheme } from 'next-themes'
import React from 'react'
import { BsArchive } from 'react-icons/bs'
import { FiClock, FiEdit, FiUserPlus } from 'react-icons/fi'
import CardDetail from './CardDetail';
import { FiBox } from "react-icons/fi";

export default function Card({ card, list }: { card: any; list: any }) {
    const { theme } = useTheme();
    const bgColor = theme === "dark" ? "bg-gray-100" : "bg-slate-100";
    const items: MenuProps["items"] = [
        {
            key: "0",
            label: (
                <CardDetail card={card} list={list} />
            ),
        },
        {
            key: "1",
            label: (
                <div>
                    <FiBox className='inline-block mr-2' />
                    Thêm/ Sửa nhãn
                </div>
            ),
        },
        {
            key: "2",
            label: (
                <div>
                    <FiUserPlus className="inline-block mr-2" />
                    Thêm thành viên
                </div>
            ), // You'll need to add a function or method for this action
        },
        {
            key: "3",
            label: (
                <div>
                    <FiClock className="inline-block mr-2" />
                    Thêm ngày đến hạn
                </div>
            ),
        },
        {
            key: "4",
            label: (
                <div>
                    <BsArchive className="inline-block mr-2" />
                    Lưu trữ
                </div>
            ),
        },
    ];


    return (
        <>
            <div
                className={`${bgColor} p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer my-3 bg-inherit `}
                key={card.id}
            >
                <div className="justify-between w-full ">
                    <div className="mx-4">
                        {card.labels && card.labels.length > 0
                            ? card.labels.map((label: any) => (
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
                            {card.name}
                        </div>

                        <Dropdown
                            menu={{ items }}
                            placement="bottomLeft"
                            arrow
                            trigger={["click"]}
                            overlayClassName="custom-dropdown"
                        >
                            <Button
                                type="text"
                                icon={<FiEdit size={22} />}
                            />
                        </Dropdown>
                    </div>
                </div>
            </div>
        </>
    )
}

