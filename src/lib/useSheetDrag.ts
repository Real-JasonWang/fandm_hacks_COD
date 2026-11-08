import { useRef } from 'react';

export function useSheetDrag(onClose?: () => void) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const currentDeltaY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only drag when user pulls down from the top or when scrolled to the top
    if (sheetRef.current && sheetRef.current.scrollTop > 5) return;
    dragStartY.current = e.clientY;
    currentDeltaY.current = 0;
    isDragging.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || dragStartY.current === null || !sheetRef.current) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 0) {
      currentDeltaY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      sheetRef.current.style.transition = 'none';
    } else {
      currentDeltaY.current = 0;
      sheetRef.current.style.transform = `translateY(${delta * 0.15}px)`;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    dragStartY.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    if (currentDeltaY.current > 85) {
      // Threshold passed -> animate out and close
      sheetRef.current.style.transition = 'transform 0.22s cubic-bezier(0.2, 0.9, 0.25, 1)';
      sheetRef.current.style.transform = 'translateY(105%)';
      setTimeout(() => {
        if (onClose) onClose();
      }, 180);
    } else {
      // Rebound
      sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.25, 1.2)';
      sheetRef.current.style.transform = '';
    }
  };

  return {
    sheetRef,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      style: { touchAction: 'none' as const, cursor: 'grab' },
    },
  };
}
