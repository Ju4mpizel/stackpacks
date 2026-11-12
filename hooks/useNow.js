"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set();
let timer = null;

function subscribe(cb) {
  listeners.add(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const getServerSnapshot = () => null;

/**
 * Hora actual (ms, redondeada al segundo) que se actualiza cada segundo.
 * Devuelve `null` en el servidor y durante la hidratación, para no desincronizar el HTML.
 */
export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
