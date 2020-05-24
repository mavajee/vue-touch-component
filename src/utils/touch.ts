import { isBrowser } from "@/utils/dom";

export interface UniversalTouchEvent extends MouseEvent, TouchEvent {}

/**
 * Доступны ли тач события
 */
export const touchEnabled: boolean = isBrowser && "ontouchstart" in window;

/*
 * Получает кординату по оси абсцисс из touch- или mouse-события
 */
export function coordX(event: UniversalTouchEvent): number {
  return (
    event.clientX || (event.changedTouches && event.changedTouches[0].clientX)
  );
}

/*
 * Получает кординату по оси ординат из touch- или mouse-события
 */
export function coordY(event: UniversalTouchEvent): number {
  return (
    event.clientY || (event.changedTouches && event.changedTouches[0].clientY)
  );
}

/**
 * Платформо зависымые кортежи событий
 */
export function getSupportedEvents(): string[] {
  if (touchEnabled) {
    return ["touchstart", "touchmove", "touchend", "touchcancel"];
  }

  return ["mousedown", "mousemove", "mouseup", "mouseleave"];
}
