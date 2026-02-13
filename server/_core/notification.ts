export type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  console.log("[Notification] notifyOwner called (dummy implementation):", payload);
  return true;
}
