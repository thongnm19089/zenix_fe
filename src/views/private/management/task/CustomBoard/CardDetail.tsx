"use client";

import React, { useEffect, useState, useRef } from "react";
import Board from "./Board";
import { useGetBoardDetailQuery, useGetCardDetailQuery } from "@/api/Task/apiTask";
import UpdateCardDetail from "@/components/FunctionsManagement/Task/UpdateCardDetail";
import { ICard, IBoard } from "@/types/taskTypes";

interface CardDetailProps {
  cardSlug: string | string[] | undefined;
}

const CardDetail: React.FC<CardDetailProps> = ({ cardSlug }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const cardQuery = useGetCardDetailQuery(cardSlug);
  const [currentCard, setCurrentCard] = useState<ICard | null>(null);

  useEffect(() => {
    setCurrentCard(cardQuery.data);
  }, [cardQuery.data]);

  const boardQuery = useGetBoardDetailQuery(currentCard?.board_slug, { skip : currentCard ? false : true });
  const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null);

  useEffect(() => {
    setCurrentBoard(boardQuery.data);
  }, [boardQuery.data]);

  const refreshCardAndBoard = async () => {
    if (!cardSlug) return;
    const cardResult = await cardQuery.refetch();
    if ("data" in cardResult && cardResult.data) {
      setCurrentCard(cardResult.data);
    }

    const boardResult = await boardQuery.refetch();
    if ("data" in boardResult && boardResult.data) {
      setCurrentBoard(boardResult.data);
    }
  };

  const modalRef = useRef<HTMLDivElement | null>(null);

  const patchCard = (listId: number, cardId: number, patch: Partial<ICard>) => {
    // 1) Patch card đang mở trong modal
    setCurrentCard((prev) => {
      if (!prev || prev.id !== cardId) return prev;
      return { ...prev, ...patch };
    });

    // 2) Patch card trong board (để board phía sau modal cũng đổi)
    setCurrentBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lists: (prev.lists || []).map((list: any) => {
          if (list.id !== listId) return list;
          return {
            ...list,
            cards: (list.cards || []).map((c: any) =>
              c.id === cardId ? { ...c, ...patch } : c
            ),
          };
        }),
      };
    });
  };

  return (
    <>
      <Board slug={boardQuery?.data?.slug} />
      {currentBoard && currentCard && (
        <div ref={modalRef} style={{ display: isModalOpen ? 'block' : 'none' }}>
          <UpdateCardDetail
            isOpen={isModalOpen}
            board={currentBoard}
            card={currentCard}
            refreshCardAndBoard={refreshCardAndBoard}
            patchCard={patchCard}
          />
        </div>
      )}
      <button onClick={() => setIsModalOpen(!isModalOpen)}>
        Toggle Modal
      </button>
    </>
  );
};

export default CardDetail;
