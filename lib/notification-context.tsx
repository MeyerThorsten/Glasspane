"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Notification } from "@/types/notification";
import notificationsData from "@/data/mock/notifications.json";

interface NotificationContextValue {
  notifications: Notification[];
  readIds: Set<string>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  isOpen: boolean;
  togglePanel: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  readIds: new Set(),
  markAsRead: () => {},
  markAllAsRead: () => {},
  unreadCount: 0,
  isOpen: false,
  togglePanel: () => {},
});

function getInitialReadIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  const stored = localStorage.getItem("notification-read-state");
  if (!stored) {
    return new Set();
  }

  try {
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications] = useState<Notification[]>(notificationsData as Notification[]);
  const [readIds, setReadIds] = useState<Set<string>>(getInitialReadIds);
  const [isOpen, setIsOpen] = useState(false);

  const persistReadIds = useCallback((ids: Set<string>) => {
    localStorage.setItem("notification-read-state", JSON.stringify([...ids]));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, [persistReadIds]);

  const markAllAsRead = useCallback(() => {
    const all = new Set(notifications.map(n => n.id));
    setReadIds(all);
    persistReadIds(all);
  }, [notifications, persistReadIds]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const togglePanel = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <NotificationContext.Provider value={{ notifications, readIds, markAsRead, markAllAsRead, unreadCount, isOpen, togglePanel }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
