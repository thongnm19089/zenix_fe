"use client";

import { useEditCardMutation } from "@/api/Task/apiTask";
import { IBoard, ICard, IList } from "@/types/taskTypes";
import { formatDate } from "@/utils/formatDate";
import { Avatar, Empty, notification, Segmented, Tag, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineClockCircle } from "react-icons/ai";

export type TimelineView = "hour" | "day" | "week";

type TimelineProps = {
  board?: IBoard | null;
  detailQuery?: string;
  timelineView?: TimelineView;
  onTimelineViewChange?: (value: TimelineView) => void;
  openCardDetail?: (cardSlug: string) => void;
  onFilterChange?: (type: string, value: string) => void;
  patchCard?: (listId: number, cardId: number, patch: Partial<ICard>) => void;
};

type TimelineCard = ICard & {
  listId: number;
  listName: string;
  listOrder: number;
  startDate: Date;
  endDate: Date;
};

const ROW_HEIGHT = 86;
const SIDEBAR_WIDTH = 280;
const MOBILE_ROW_HEIGHT = 126;
const MOBILE_SIDEBAR_WIDTH = 180;
const CELL_WIDTH: Record<TimelineView, number> = {
  hour: 44,
  day: 84,
  week: 120,
};
const MOBILE_CELL_WIDTH: Record<TimelineView, number> = {
  hour: 48,
  day: 34,
  week: 92,
};
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const UNIT_MS: Record<TimelineView, number> = {
  hour: MS_PER_HOUR,
  day: MS_PER_DAY,
  week: 7 * MS_PER_DAY,
};

const startOfHour = (date: Date) => {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  return next;
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
};

const startOfUnit = (date: Date, view: TimelineView) => {
  if (view === "hour") return startOfHour(date);
  if (view === "week") return startOfWeek(date);
  return startOfDay(date);
};

const addUnit = (date: Date, amount: number, view: TimelineView) => {
  const next = new Date(date);
  if (view === "hour") {
    next.setHours(next.getHours() + amount);
  } else if (view === "week") {
    next.setDate(next.getDate() + amount * 7);
  } else {
    next.setDate(next.getDate() + amount);
  }
  return next;
};

const diffInUnits = (start: Date, end: Date, view: TimelineView) => {
  return Math.round((startOfUnit(end, view).getTime() - startOfUnit(start, view).getTime()) / UNIT_MS[view]);
};

const getTimelineOffset = (rangeStart: Date, date: Date, view: TimelineView, cellWidth: number) => {
  return ((date.getTime() - rangeStart.getTime()) / UNIT_MS[view]) * cellWidth;
};

const getTimelineWidth = (start: Date, end: Date, view: TimelineView, cellWidth: number) => {
  const duration = Math.max(end.getTime() - start.getTime(), 0);
  return Math.max((duration / UNIT_MS[view]) * cellWidth - 8, 10);
};

const parseDate = (source?: string | null) => {
  if (!source) return null;

  const date = new Date(source);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getCardStartDate = (card: ICard) => {
  const source = card.start_date || card.created_at;
  return parseDate(source) || new Date();
};

const getCardEndDate = (card: ICard, startDate: Date) => {
  if (!card.deadline) return startDate;

  const endDate = parseDate(card.deadline) || startDate;
  return endDate < startDate ? startDate : endDate;
};

const getMonthLabel = (date: Date) => date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
const getDayLabel = (date: Date) => date.toLocaleDateString("vi-VN", { day: "2-digit" });
const getWeekdayLabel = (date: Date) => date.toLocaleDateString("vi-VN", { weekday: "short" });
const getHourLabel = (date: Date) => date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const getTooltipDateLabel = (date: Date) =>
  date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
const getWeekLabel = (date: Date) => {
  const end = addUnit(date, 6, "day");
  return `${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - ${end.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
};

const getGroupLabel = (date: Date, view: TimelineView) => {
  if (view === "hour") {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (view === "week") {
    return date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
  }
  return getMonthLabel(date);
};

const getUnitLabel = (date: Date, view: TimelineView, t: any) => {
  if (view === "hour") {
    return (
      <>
        <div className="font-semibold">{getHourLabel(date)}</div>
        <div>{getDayLabel(date)}</div>
      </>
    );
  }

  if (view === "week") {
    return (
      <>
        <div className="font-semibold">{t("task.week")}</div>
        <div>{getWeekLabel(date)}</div>
      </>
    );
  }

  return (
    <>
      <div className="font-semibold">{getDayLabel(date)}</div>
      <div>{getWeekdayLabel(date)}</div>
    </>
  );
};

const Timeline: React.FC<TimelineProps> = ({
  board,
  detailQuery,
  timelineView = "day",
  onTimelineViewChange,
  openCardDetail,
  onFilterChange,
  patchCard,
}) => {
  const router = useRouter();
  const t: any = useTranslations();
  const [isMobile, setIsMobile] = useState(false);
  const [editCard] = useEditCardMutation();
  const cellWidth = isMobile ? MOBILE_CELL_WIDTH[timelineView] : CELL_WIDTH[timelineView];
  const rowHeight = isMobile ? MOBILE_ROW_HEIGHT : ROW_HEIGHT;
  const sidebarWidth = isMobile ? MOBILE_SIDEBAR_WIDTH : SIDEBAR_WIDTH;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const getCardDetailPath = (slug: string) => {
    if (!board?.slug) {
      return detailQuery ? `/business/task?${detailQuery}` : "/business/task";
    }
    return detailQuery ? `/business/task/${board.slug}?${detailQuery}` : `/business/task/${board.slug}`;
  };
  const handleOpenCard = (slug: string) => {
    if (openCardDetail) {
      openCardDetail(slug);
      return;
    }
    router.push(getCardDetailPath(slug));
  };

  const handleToggleCardCompleted = async (event: React.MouseEvent, card: TimelineCard) => {
    event.stopPropagation();
    if (card.archived) return;

    const nextCompleted = !card.is_completed;
    patchCard?.(card.listId, card.id, { is_completed: nextCompleted });

    try {
      const res = await editCard({ id: card.id, is_completed: nextCompleted }).unwrap();
      if (typeof res?.is_completed === "boolean") {
        patchCard?.(card.listId, card.id, { is_completed: res.is_completed });
      }
    } catch (error) {
      patchCard?.(card.listId, card.id, { is_completed: !nextCompleted });
      notification.error({
        message: "Cập nhật trạng thái thất bại",
        placement: "bottomRight",
        className: "h-16",
      });
    }
  };

  const cards = useMemo<TimelineCard[]>(() => {
    return (board?.lists || [])
      .flatMap((list: IList, listOrder: number) =>
        (list.cards || []).map((card: ICard) => {
          const startDate = getCardStartDate(card);
          return {
            ...card,
            listId: list.id,
            listName: list.name,
            listOrder,
            startDate,
            endDate: getCardEndDate(card, startDate),
          };
        })
      )
      .sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime() || a.listOrder - b.listOrder || a.order - b.order;
      });
  }, [board]);

  const range = useMemo(() => {
    const starts = cards.map((card) => card.startDate);
    const ends = cards.map((card) => card.endDate);

    if (!starts.length) {
      const today = startOfUnit(new Date(), timelineView);
      const defaultSpan = timelineView === "hour" ? 23 : timelineView === "week" ? 4 : 6;
      return { start: today, end: addUnit(today, defaultSpan, timelineView) };
    }

    const min = new Date(Math.min(...starts.map((date) => date.getTime())));
    const max = new Date(Math.max(...ends.map((date) => date.getTime())));
    return {
      start: addUnit(startOfUnit(min, timelineView), -1, timelineView),
      end: addUnit(startOfUnit(max, timelineView), 1, timelineView),
    };
  }, [cards, timelineView]);

  const units = useMemo(() => {
    const unitCount = Math.max(diffInUnits(range.start, range.end, timelineView) + 1, 1);
    return Array.from({ length: unitCount }, (_, index) => addUnit(range.start, index, timelineView));
  }, [range, timelineView]);

  const headerSpans = useMemo(() => {
    return units.reduce<Array<{ label: string; count: number }>>((acc, unit) => {
      const label = getGroupLabel(unit, timelineView);
      const last = acc[acc.length - 1];
      if (last?.label === label) {
        last.count += 1;
      } else {
        acc.push({ label, count: 1 });
      }
      return acc;
    }, []);
  }, [units, timelineView]);

  const timelineWidth = units.length * cellWidth;
  const todayOffset = getTimelineOffset(range.start, new Date(), timelineView, cellWidth);
  const timelineViewSelector = (
    <Segmented
      size="small"
      value={timelineView}
      onChange={(value) => onTimelineViewChange?.(value as TimelineView)}
      options={[
        { label: t("task.hour"), value: "hour" },
        { label: t("task.day"), value: "day" },
        { label: t("task.week"), value: "week" },
      ]}
    />
  );

  if (!cards.length) {
    return (
      <div className="rounded-lg bg-white/95 shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
          <div className="font-semibold text-gray-700">{t("task.timeline")}</div>
          {timelineViewSelector}
        </div>
        <div className="px-4 py-10">
          <Empty description={t("task.emptyTimeline")} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-full overflow-hidden rounded-lg bg-white/95 shadow-sm">
      <div className="shrink-0 border-r border-gray-200 bg-white" style={{ width: sidebarWidth }}>
        <div className="flex h-[77px] flex-col justify-center gap-2 border-b border-gray-200 px-4 max-sm:h-[88px] max-sm:px-2">
          <div className="font-semibold text-gray-700">{t("task.timeline")}</div>
          {timelineViewSelector}
        </div>
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex items-center gap-3 border-b border-gray-100 px-4 max-sm:items-center max-sm:gap-2 max-sm:px-2 max-sm:py-2"
            style={{ height: rowHeight }}
          >
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => handleOpenCard(card.slug)}
                className="block min-w-0 text-left"
              >
                <Tooltip title={
                  <div className="space-y-1">
                    <div className="font-semibold">{card.name}</div>
                    <div>Bắt đầu: {getTooltipDateLabel(card.startDate)}</div>
                    <div>Kết thúc: {getTooltipDateLabel(card.endDate)}</div>
                  </div>
                }>
                  <div className="line-clamp-1 text-sm font-semibold text-gray-800 max-sm:line-clamp-2 max-sm:leading-5">
                    {card.name}
                  </div>
                </Tooltip>
              </button>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 max-sm:flex-col max-sm:items-start max-sm:gap-1">
                <Tag
                  className="m-0 max-w-[120px] cursor-pointer truncate max-sm:max-w-[130px]"
                  color="default"
                  onClick={() => onFilterChange?.("lists", String(card.listId))}
                >
                  {card.listName}
                </Tag>
                {card.deadline && (
                  <button
                    type="button"
                    className={`flex min-w-0 items-center gap-1 rounded px-1 text-left max-sm:max-w-[150px] ${card.is_completed ? "bg-green-600 text-white" : ""}`}
                    onClick={(event) => handleToggleCardCompleted(event, card)}
                    disabled={card.archived}
                  >
                    <AiOutlineClockCircle className="shrink-0" />
                    <span className="truncate">{formatDate(card.deadline)}</span>
                  </button>
                )}
              </div>
              {card.label_list && card.label_list.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 overflow-hidden">
                  {card.label_list.slice(0, isMobile ? 1 : 2).map((label) => (
                    <Tag
                      key={label.id}
                      color={label.color}
                      className="m-0 max-w-[150px] cursor-pointer truncate text-xs max-sm:max-w-[200px]"
                      onClick={() => onFilterChange?.("labels", String(label.id))}
                    >
                      {label.name}
                    </Tag>
                  ))}
                  {card.label_list.length > (isMobile ? 1 : 2) && (
                    <Tag className="m-0 text-xs">+{card.label_list.length - (isMobile ? 1 : 2)}</Tag>
                  )}
                </div>
              )}
            </div>
            <Avatar.Group maxCount={isMobile ? 1 : 2} size="small">
              {card.users.map((user) => (
                <Tooltip title={`${user.first_name} ${user.last_name}`} key={user.id}>
                  {user.image ? (
                    <Avatar src={user.image} className="cursor-pointer" onClick={() => onFilterChange?.("users", String(user.id))} />
                  ) : (
                    <Avatar className="cursor-pointer" onClick={() => onFilterChange?.("users", String(user.id))}>
                      {user.first_name.charAt(0) + user.last_name.charAt(0)}
                    </Avatar>
                  )}
                </Tooltip>
              ))}
            </Avatar.Group>
          </div>
        ))}
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto custom-scrollbar">
        <div style={{ width: timelineWidth }}>
          <div className="sticky top-0 z-20 border-b border-gray-200 bg-white">
            <div className="flex border-b border-gray-100">
              {headerSpans.map((span) => (
                <div
                  key={span.label}
                  className="border-r border-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-600"
                  style={{ width: span.count * cellWidth }}
                >
                  {span.label}
                </div>
              ))}
            </div>
            <div className="flex">
              {units.map((unit) => {
                const isToday = startOfUnit(unit, timelineView).getTime() === startOfUnit(new Date(), timelineView).getTime();
                return (
                  <div
                    key={unit.toISOString()}
                    className={`h-11 border-r border-gray-100 px-1 py-1 text-center text-xs ${isToday ? "bg-orange-50 text-orange-700" : "text-gray-500"}`}
                    style={{ width: cellWidth }}
                  >
                    {getUnitLabel(unit, timelineView, t)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            {todayOffset >= 0 && todayOffset <= timelineWidth && (
              <div
                className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-orange-500"
                style={{ left: todayOffset }}
              />
            )}

            {cards.map((card, index) => {
              const offset = Math.max(getTimelineOffset(range.start, card.startDate, timelineView, cellWidth), 0);
              const barWidth = getTimelineWidth(card.startDate, card.endDate, timelineView, cellWidth);
              const isOverdue = !!card.deadline && new Date(card.deadline) < new Date() && !card.is_completed;

              return (
                <div key={card.id} className="relative border-b border-gray-100" style={{ height: rowHeight }}>
                  <div className="absolute inset-0 flex">
                    {units.map((unit) => (
                      <div key={`${card.id}-${unit.toISOString()}`} className="h-full border-r border-gray-100" style={{ width: cellWidth }} />
                    ))}
                  </div>
                  <Tooltip
                    title={
                      <div className="space-y-1">
                        <div className="font-semibold">{card.name}</div>
                        <div>Bắt đầu: {getTooltipDateLabel(card.startDate)}</div>
                        <div>Kết thúc: {getTooltipDateLabel(card.endDate)}</div>
                      </div>
                    }
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenCard(card.slug)}
                      className={`absolute top-3 h-8 rounded-md px-3 text-left text-xs font-semibold text-white shadow-sm transition hover:brightness-95 max-sm:top-5 max-sm:h-7 max-sm:px-2 ${card.is_completed ? "bg-green-600" : isOverdue ? "bg-red-600" : "bg-[#f1692f]"}`}
                      style={{
                        left: offset + 4,
                        width: barWidth,
                        minWidth: 36,
                      }}
                    >
                      <span className="block truncate">
                        #{index + 1} {card.name} - {getTooltipDateLabel(card.startDate)} - {getTooltipDateLabel(card.endDate)}
                      </span>
                    </button>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
