import Board from "@/views/private/management/task/task-archive/CustomBoard/Board";
// import Board from "@/views/private/management/task/CustomBoard/Board";
import React from "react";

type PageProps = {
  params: {
    board: string;
  };
};

export default function page({ params }: PageProps) {
  return <Board slug={params.board} />;
}
