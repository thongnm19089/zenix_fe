import { useGetBoardListQuery } from "@/api/Task/apiTask";
import { IBoard } from "@/types/taskTypes";
import { DownOutlined, SmileOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown, Space } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import { AiOutlineDown } from "react-icons/ai";

const SelectBoard = ({ board }: { board: IBoard }) => {
  const router = useRouter();

  const { data: boardList, isLoading } = useGetBoardListQuery({});

  // Tạo một bản sao của boardList.results và sắp xếp nó
  const sortedBoardList = [...(boardList?.results || [])].sort((a, b) => a.name.localeCompare(b.name));

  const items: MenuProps["items"] = sortedBoardList?.reduce((accumulator: any, item: IBoard) => {
    if (item.id !== board?.id) {
      accumulator.push({
        key: item.id,
        label: (
          <div className="text-lg font-semibold py-1" onClick={() => router.push(item.slug)}>
            {item.name}
          </div>
        ),
      });
    }
    return accumulator;
  }, []);

  return (
    <Dropdown menu={{ items }}>
      <Button type="text" size="large" onClick={(e) => e.preventDefault()}>
        {board?.name && (
          <div className="text-xl font-bold flex gap-2 items-center">
            {board?.name} <AiOutlineDown size={20} />
          </div>
        )}
      </Button>
    </Dropdown>
  );
};

export default SelectBoard;
