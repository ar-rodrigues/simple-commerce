"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (reg.installing)
            reg.installing.addEventListener("statechange", () => {});
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
