import { useCallback, useEffect, useRef, useState } from "react";

export type PushPermission = "unsupported" | "default" | "granted" | "denied";

export interface PushPayload {
  title: string;
  body: string;
  tag?: string;
}

function readPermission(): PushPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as PushPermission;
}

/**
 * Thin wrapper around the browser Notification API.
 *
 * The authenticated app already reacts to new rows in the Convex
 * `notifications` table, so once permission is granted a freshly published
 * story shows up as a real system notification — the same pipeline a native
 * build would use, minus the push service.
 */
export function useWebPush() {
  const [permission, setPermission] = useState<PushPermission>(readPermission);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (): Promise<PushPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      setError("Bu tarayıcı sistem bildirimlerini desteklemiyor.");
      return "unsupported";
    }

    try {
      const result = (await Notification.requestPermission()) as PushPermission;
      setPermission(result);
      if (result === "granted") {
        setError(null);
      } else if (result === "denied") {
        setError(
          "Tarayıcı izni verilmedi. Adres çubuğundaki kilit simgesinden bildirimleri açabilirsiniz.",
        );
      }
      return result;
    } catch {
      setError(
        "İzin isteği engellendi. Önizleme çerçevesi içinde bildirimler kapalı olabilir.",
      );
      return readPermission();
    }
  }, []);

  const show = useCallback((payload: PushPayload): boolean => {
    if (readPermission() !== "granted") return false;
    try {
      new Notification(payload.title, {
        body: payload.body,
        tag: payload.tag,
        icon: "/brand-mark.svg",
        badge: "/brand-mark.svg",
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return { permission, error, request, show };
}

/**
 * Fires a system notification for rows that arrived after the first render,
 * so opening the app never replays the whole inbox.
 */
export function useNotifyOnNew<T extends { _id: string }>(
  items: T[] | undefined,
  show: (payload: PushPayload) => boolean,
  enabled: boolean,
  toPayload: (item: T) => PushPayload,
) {
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!items) return;

    if (seen.current === null) {
      seen.current = new Set(items.map((item) => item._id));
      return;
    }

    for (const item of items) {
      if (seen.current.has(item._id)) continue;
      seen.current.add(item._id);
      if (enabled) show(toPayload(item));
    }
  }, [items, enabled, show, toPayload]);
}
