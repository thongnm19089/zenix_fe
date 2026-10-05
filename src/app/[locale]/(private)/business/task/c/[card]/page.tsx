import CardDetail from "@/views/private/management/task/CustomBoard/CardDetail";
import React from "react";

type PageProps = {
  params: {
    card: string;
  };
};

export default function Page({ params }: PageProps) {
  return <CardDetail cardSlug={params.card} />;
}
