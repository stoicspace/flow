"use client";

import { createContext, useContext, useState } from "react";

const TitleContext = createContext({
  title: "",
  setTitle: (_: string) => {},
});

export function TitleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [title, setTitle] = useState("");

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
}

export const usePageTitle = () => useContext(TitleContext);