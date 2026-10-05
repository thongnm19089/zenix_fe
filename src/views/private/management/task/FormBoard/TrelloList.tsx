import Card from "./Card";
import { Button, Dropdown } from "antd";
import { MenuProps } from "antd/lib";
import React from "react";
import { BsArchive } from "react-icons/bs";
import { FiMoreHorizontal } from "react-icons/fi";
import { TbArrowsExchange2 } from "react-icons/tb";

export default function TrelloList({ list }: { list: any }) {
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div>
          <BsArchive className="inline-block mr-2" />
          Lưu trữ
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div>
          <TbArrowsExchange2 className="inline-block mr-2" />
          Chuyển danh sách
        </div>
      ),
    },
  ];
  return (
    <div
      className={` relative bg-card-task border p-2.5 flex flex-col gap-2.5 rounded-lg shadow-md cursor-pointer min-w-[272px] w-[272px] `}
      key={list.id}
    >
      <div className="justify-between w-full bg-inherit ">
        <div className="flex items-center">
          <div className="flex-1 font-bold text-base leading-7 ml-4">
            <span>{list.name}</span>
          </div>
          <Dropdown menu={{ items }} placement="bottomLeft" arrow trigger={["click"]}>
            <Button type="text" icon={<FiMoreHorizontal size={22} />} />
          </Dropdown>
        </div>
        <div>
          {list?.cards.map((item: any) => (
            <Card key={item.id} card={item} list={list} />
          ))}
        </div>
      </div>
    </div>
  );
}
