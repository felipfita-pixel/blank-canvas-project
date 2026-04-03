import { useCallback, useEffect, useRef } from "react";

const notificationSound = typeof window !== "undefined" ? new Audio("/notification.wav") : null;

export const useBrokerNotifications = () => {
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      permissionRef.current = result;
    }
  }, []);

  const playSound = useCallback(() => {
    if (notificationSound) {
      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {});
    }
  }, []);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (document.hasFocus()) return; // Only notify when tab is not focused

    const notification = new Notification(title, {
      body,
      icon: "/placeholder.svg",
      tag: "broker-chat",
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 8000);
  }, []);

  const notifyNewMessage = useCallback((senderName: string, message: string) => {
    playSound();
    sendBrowserNotification(
      `💬 Nova mensagem de ${senderName}`,
      message.length > 80 ? message.slice(0, 80) + "…" : message
    );
  }, [playSound, sendBrowserNotification]);

  const notifyAssigned = useCallback((senderName: string) => {
    playSound();
    sendBrowserNotification(
      "🔔 Nova conversa atribuída",
      `Você foi designado para atender ${senderName}`
    );
  }, [playSound, sendBrowserNotification]);

  return { requestPermission, notifyNewMessage, notifyAssigned, playSound };
};
