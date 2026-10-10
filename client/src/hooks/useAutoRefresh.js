import { useEffect, useRef } from "react";

export default function useAutoRefresh(refresh, { interval = 20000, enabled = true } = {}) {
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  useEffect(() => {
    if (!enabled) return undefined;
    let running = false;
    const run = async () => {
      if (running || document.hidden) return;
      running = true;
      try { await refreshRef.current(); } finally { running = false; }
    };
    const onFocus = () => void run();
    const onVisibility = () => { if (!document.hidden) void run(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => void run(), interval);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVisibility); };
  }, [enabled, interval]);
}
