"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface RefreshContextValue {
  refreshKey: number;
  triggerRefresh: () => void;
  autoInterval: number | null; // null=off, 30000, 60000, 300000
  setAutoInterval: (ms: number | null) => void;
  isRefreshing: boolean;
}

const RefreshContext = createContext<RefreshContextValue>({
  refreshKey: 0,
  triggerRefresh: () => {},
  autoInterval: null,
  setAutoInterval: () => {},
  isRefreshing: false,
});

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoInterval, setAutoIntervalState] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("auto-refresh-interval");
    if (saved) setAutoIntervalState(Number(saved) || null);
  }, []);

  const setAutoInterval = useCallback((ms: number | null) => {
    setAutoIntervalState(ms);
    if (ms) localStorage.setItem("auto-refresh-interval", String(ms));
    else localStorage.removeItem("auto-refresh-interval");
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoInterval) return;
    const id = setInterval(triggerRefresh, autoInterval);
    return () => clearInterval(id);
  }, [autoInterval, triggerRefresh]);

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh, autoInterval, setAutoInterval, isRefreshing }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
