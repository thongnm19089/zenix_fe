"use client";

import { ICard, IList } from "@/types/taskTypes";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

type TranslationKey = string;
import React from "react";

export interface TaskStatusBarProps {
    list: IList;
}

const TaskStatusBar: React.FC<TaskStatusBarProps> = ({ list }) => {
    const t = useTranslations() as (key: string) => string;

    // Count tasks by status for this specific list
    const countTasksByStatus = () => {
        let total = 0;
        let noDeadline = 0;
        let overdue = 0;
        let withinDeadline = 0;
        let completed = 0;

        list.cards?.forEach((card: ICard) => {
            total++;

            if (card.is_completed) {
                completed++;
                return;
            }

            if (!card.deadline) {
                noDeadline++;
                return;
            }

            new Date(card.deadline) < new Date() ? overdue++ : withinDeadline++;
        });

        return { total, noDeadline, overdue, withinDeadline, completed };
    };

    const { total, noDeadline, overdue, withinDeadline, completed } = countTasksByStatus();

    useEffect(() => {
    return () => {
      // Cleanup function to prevent memory leaks
    };
  }, []);

  if (total === 0) return null;

    return (
        <div className="
        flex w-full max-w-full flex-wrap gap-x-2 gap-y-1 overflow-hidden text-xs text-gray-500
        mt-1 mb-2 px-2 py-1
        bg-white
        rounded-md
        border border-gray-200
        shadow-sm
    ">
            {completed > 0 && (
                <span className="flex min-w-0 items-center">
                    <span className="w-2 h-2 shrink-0 rounded-full bg-green-500 mr-1"></span>
                    <span className="truncate">{completed} {t("general.finished")}</span>
                </span>
            )}
            {overdue > 0 && (
                <span className="flex min-w-0 items-center">
                    <span className="w-2 h-2 shrink-0 rounded-full bg-red-500 mr-1"></span>
                    <span className="truncate">{overdue} {t("general.overdue")}</span>
                </span>
            )}
            {withinDeadline > 0 && (
                <span className="flex min-w-0 items-center">
                    <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500 mr-1"></span>
                    <span className="truncate">{withinDeadline} {t("general.valid")}</span>
                </span>
            )}
            {noDeadline > 0 && (
                <span className="flex min-w-0 items-center">
                    <span className="w-2 h-2 shrink-0 rounded-full bg-gray-400 mr-1"></span>
                    <span className="truncate">{noDeadline} {t("general.indefinitely")}</span>
                </span>
            )}
        </div>
    );
};

export default TaskStatusBar;
