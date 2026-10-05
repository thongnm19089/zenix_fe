"use client";

import React, { useEffect, useState, useRef } from "react";
import Board from "./Board";
import { useGetBoardDetailQuery, useGetCardDetailQuery } from "@/api/Task/apiTask";
import UpdateCardDetail from "@/components/FunctionsManagement/Task/Task-archive/UpdateCardDetail";
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

  const refreshCardAndBoard = () => {
    if (!cardSlug) return;
    cardQuery.refetch();
    setCurrentCard(cardQuery.data);
    boardQuery.refetch();
    setCurrentBoard(boardQuery.data);
  };

  const modalRef = useRef<HTMLDivElement | null>(null);

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
