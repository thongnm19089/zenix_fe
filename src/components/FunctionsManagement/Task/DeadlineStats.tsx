"use client";
import { IBoard, ICard } from "@/types/taskTypes";
import { Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { AiOutlineCheckCircle, AiOutlineUnorderedList } from "react-icons/ai";
import { BsCalendarDate, BsClock } from "react-icons/bs";

interface DeadlineStatsProps {
    board: IBoard;
    onFilterChange: (type: string, value: string) => void;
    activeFilter?: string | null;
    className?: string;
}

export const isDeadlineInToday = (card: ICard) => {
  if (!card.deadline) return false;

  const endDate = new Date(card.deadline);

  if (Number.isNaN(endDate.getTime())) return false;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  return todayStart <= endDate && endDate <= todayEnd;
};

const DeadlineStats = ({
    board,
    onFilterChange,
    activeFilter,
    className = "w-full",
}: DeadlineStatsProps) => {
    const t = useTranslations();

    // =====================
    // COUNT LOGIC
    // =====================
    const countCardsByStatus = () => {
        let total = 0;
        let noDeadline = 0;
        let overdue = 0;
        let withinDeadline = 0;
        let completed = 0;
        let today = 0;

        board?.lists?.forEach((list) => {
            list.cards?.forEach((card: ICard) => {
                total++;

                if (isDeadlineInToday(card)) {
                    today++;
                }

                if (card.is_completed) {
                    completed++;
                    return;
                }

                if (!card.deadline) {
                    noDeadline++;
                    return;
                }

                new Date(card.deadline) < new Date()
                    ? overdue++
                    : withinDeadline++;
            });
        });

        return { total, noDeadline, overdue, withinDeadline, completed, today };
    };

    const { total, noDeadline, overdue, withinDeadline, completed, today } =
        countCardsByStatus();

    // =====================
    // STATS CONFIG
    // =====================
    const stats = [
        {
            key: "ALL",
            icon: <AiOutlineUnorderedList />,
            label: "Tất cả",
            count: total,
            color: "blue",
        },
        {
            key: "NONE",
            icon: <BsCalendarDate />,
            label: "Không hạn",
            count: noDeadline,
            color: "gray",
        },
        {
            key: "overdue",
            icon: <BsClock />,
            label: "Quá hạn",
            count: overdue,
            color: "red",
        },
        {
            key: "today",
            icon: <BsCalendarDate />,
            label: "Hôm nay",
            count: today,
            color: "orange",
        },
        {
            key: "withinDeadline",
            icon: <BsClock />,
            label: "Còn hạn",
            count: withinDeadline,
            color: "yellow",
        },
        {
            key: "completedDeadline",
            icon: <AiOutlineCheckCircle />,
            label: "Hoàn thành",
            count: completed,
            color: "green",
        },
    ];

    // =====================
    // STYLE MAP
    // =====================
    const colorMap: Record<string, string> = {
        blue: "text-blue-600 bg-blue-100",
        gray: "text-gray-600 bg-gray-100",
        red: "text-red-600 bg-red-100",
        orange: "text-orange-600 bg-orange-100",
        yellow: "text-yellow-700 bg-yellow-100",
        green: "text-green-600 bg-green-100",
    };

    const activeMap: Record<string, string> = {
        blue: "ring-blue-300",
        gray: "ring-gray-300",
        red: "ring-red-300",
        orange: "ring-orange-300",
        yellow: "ring-yellow-300",
        green: "ring-green-300",
    };

    // =====================
    // RENDER
    // =====================
    return (
        <div className={`flex gap-2 items-center flex-wrap pb-1 ${className}`}>
            {stats.map((stat) => {
                const isActive =
                    activeFilter === stat.key ||
                    (!activeFilter && stat.key === "ALL");

                return (
                    <Tooltip key={stat.key} title={stat.label}>
                        <button
                            type="button"
                            onClick={() => onFilterChange("deadline", stat.key)}
                            className={`
                flex items-center gap-2
                rounded-full px-4 py-2
                whitespace-nowrap
                transition
                hover:opacity-80
                ${colorMap[stat.color]}
                ${isActive ? `ring-2 ${activeMap[stat.color]}` : ""}
              `}
                        >
                            {stat.icon}

                            <span className="text-sm font-medium">
                                {stat.label}
                            </span>

                            {/* COUNT */}
                            <span
                                className={`
                  ml-1 min-w-[28px] px-2 py-0.5
                  text-xs font-bold text-center
                  rounded-full
                  ${stat.count === 0
                                        ? "bg-black/10 text-gray-500"
                                        : "bg-white text-gray-800"
                                    }
                `}
                            >
                                {stat.count}
                            </span>
                        </button>
                    </Tooltip>
                );
            })}
        </div>
    );
};

export default DeadlineStats;
