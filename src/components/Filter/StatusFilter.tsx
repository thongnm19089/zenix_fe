import { Badge } from "antd";
import React, { useState } from "react";

function StatusFilter({ data, setFilter }: { data: any; setFilter: any }) {
  const [active, setActive] = useState<any[]>([]);
  const [isNoContactActive, setIsNoContactActive] = useState(false);

  const handleClick = (id: any) => {
    let newActive: any[];
    if (active.includes(id)) {
      newActive = active.filter((item) => item !== id);
    } else {
      newActive = [...active, id];
    }
    if (newActive.includes(-1)) {
      newActive = newActive.filter((item) => item !== -1);
      setIsNoContactActive(false);
    }
    setActive(newActive);
    setFilter((prev: any) => ({ ...prev, stage: newActive }));
  };

  const filterNoContact = () => {
    if (isNoContactActive) {
      setActive([]);
      setFilter((prev: any) => ({ ...prev, stage: [] }));
      setIsNoContactActive(false);
    } else {
      setActive([-1]);
      setFilter((prev: any) => ({ ...prev, stage: [-1] }));
      setIsNoContactActive(true);
    }
  };


  return (
    <div className=" flex gap-2 mb-1">
      <div
        className="text-center px-2 py-1 text-white h-[32px] bg-gray-500 font-medium text-sm rounded-md cursor-pointer border-transparent border-2 mb-1 mt-2 "
        onClick={() => {
          setActive([]);
          setFilter((prev: any) => ({ ...prev, stage: [] }));
        }}
      >
        Tất cả
      </div>

      <div className="h-[32px] mt-2">
        <Badge
          count={data && data.length > 0 ? data[data.length - 1]?.lead_count : 0}
          size="small"
          overflowCount={9}
        >
          <div
            className={`text-center px-2 py-1 border-transparent border-2 translate-x-px text-white font-medium text-sm rounded-md cursor-pointer w-full ${isNoContactActive && "border-red-500 opacity-30"}`}
            style={{ backgroundColor: 'gray' }}
            onClick={() => filterNoContact()}
          >
            Chưa liên hệ
          </div>
        </Badge>
      </div>

      <div className="flex-1 w-[calc(100vw-750px)] overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2 mb-1 mt-2  w-full">
          {data &&
            data
              .filter((item: any) => item.is_active)
              .map((item: any) => (
                <Badge count={item.lead_count} size="small" overflowCount={9} key={item.id}>
                  <div
                    className={`text-center px-2 py-1 border-transparent border-2 translate-x-px text-white font-medium text-sm rounded-md cursor-pointer w-full ${active.includes(item.id) && "border-red-500 opacity-30 "
                      }`}
                    style={{ backgroundColor: item.color }}
                    onClick={() => handleClick(item.id)}
                  >
                    {item.stage}
                  </div>
                </Badge>
              ))}
        </div>
      </div>
    </div>
  );
}

export default StatusFilter;
