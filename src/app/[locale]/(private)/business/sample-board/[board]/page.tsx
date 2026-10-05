import SampleBoard from "@/views/private/management/task/CustomBoard/SampleBoard";
import React from "react";

type PageProps = {
  params: {
    board: string;
  };
};

export default function page({ params }: PageProps) {
  return <SampleBoard slug={params.board} />;
}
