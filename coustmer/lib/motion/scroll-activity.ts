type Listener = (scrolling: boolean) => void;

const listeners = new Set<Listener>();
let scrolling = false;

/** Notify home feed listeners without re-rendering the FlatList host. */
export function setFeedScrolling(next: boolean) {
  if (scrolling === next) return;
  scrolling = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribeFeedScrolling(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isFeedScrolling() {
  return scrolling;
}
