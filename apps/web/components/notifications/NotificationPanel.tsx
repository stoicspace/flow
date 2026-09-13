"use client";
import { useState } from "react";
import { X, Bell } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
 
interface Notification {
  id: string;
  type: "error" | "warning" | "success" | "info";
  title: string;
  description: string;
  time: string;
  unread: boolean;
}
 
interface Props {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}
 
export default function NotificationsPanel({ notifications, onClose, onMarkAllRead }: Props) {
  const unreadCount = notifications.filter(n => n.unread).length;
 
  return (
    <div className="w-[380px] bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[11px] bg-brand-brand-orangetext-text-primary rounded-full px-1.5 py-0.5 font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className="text-xs text-brand-orange hover:underline">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
 
      {/* List */}
      <div className="max-h-[460px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-sm">No notifications</div>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n.id} {...n} />
          ))
        )}
      </div>
 
      {/* Footer */}
      <div className="px-4 py-3 border-t border-border text-center">
        <button className="text-xs text-text-muted hover:text-text-primary transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}