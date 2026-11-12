"use client";

import dynamic from "next/dynamic";
import { SceneSkeleton } from "./SceneSkeleton";

// La escena (Motion + lógica de sorteo) se carga aparte y solo en el cliente.
const PackScene = dynamic(() => import("./PackScene"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

export function PackSceneLoader(props) {
  return <PackScene {...props} />;
}
