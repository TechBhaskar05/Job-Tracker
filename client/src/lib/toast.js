/**
 * Dispatches a custom event to show a toast notification.
 * @param {string} message - The message to display in the toast.
 * @param {'success' | 'error' | 'warning' | 'info'} [type='success'] - The type of toast.
 * @param {number} [duration=4000] - The duration in milliseconds to show the toast.
 */
export function showToast(message, type = 'success', duration = 4000) {
  const event = new CustomEvent('jt:toast', {
    detail: {
      id: Date.now(),
      message,
      type,
      duration,
    },
  });
  document.dispatchEvent(event);
}
