import {
  touchEnabled,
  getSupportedEvents,
  coordX,
  coordY,
  UniversalTouchEvent,
} from "@/utils/touch";
import { Disposable } from "@/utils/lifeCycle";

export interface GestureDescription {
  pressed?: boolean;
  startX?: number;
  startY?: number;
  startT?: Date;
  isY?: boolean;
  isX?: boolean;
  isSlideX?: boolean;
  isSlideY?: boolean;
  isSlide?: boolean;
  shiftX?: number;
  shiftY?: number;
  shiftXAbs?: number;
  shiftYAbs?: number;
}

interface TouchEventHandler {
  (event: UniversalTouchEvent): void;
}

interface TouchEventListener {
  (gesture: GestureDescription): void;
}

interface TouchControllerEventListeners {
  onStart?: TouchEventListener;
  onStartX?: TouchEventListener;
  onStartY?: TouchEventListener;
  onMove?: TouchEventListener;
  onMoveX?: TouchEventListener;
  onMoveY?: TouchEventListener;
  onEnd?: TouchEventListener;
  onEndX?: TouchEventListener;
  onEndY?: TouchEventListener;
}

const events = getSupportedEvents();

export class TouchController implements Disposable {
  private gesture: Partial<GestureDescription> = {};
  private cancelClick = false;

  constructor(
    private el: Node,
    private listeners: TouchControllerEventListeners
  ) {
    this.init();
  }

  private get document(): Node {
    return document;
  }

  private get eventListenerOptions(): AddEventListenerOptions {
    return { capture: false, passive: false };
  }

  private init() {
    this.el.addEventListener("dragstart", this.onDragStart);
    this.el.addEventListener("click", this.onClick);

    this.el.addEventListener(
      events[0],
      this.onStart,
      this.eventListenerOptions
    );
    touchEnabled && this.subscribe(this.el);
  }

  private subscribe(element: Node) {
    element.addEventListener(events[1], this.onMove, this.eventListenerOptions);
    element.addEventListener(events[2], this.onEnd, this.eventListenerOptions);
    element.addEventListener(events[3], this.onEnd, this.eventListenerOptions);
  }

  private unsubscribe(element: Node) {
    /**
     * Необходимо указать последний аргумент с такими же параметрами, потому что
     *  некоторые браузеры на экзотических вендорах не удаляют обработчик, например Meizu.
     */
    element.removeEventListener(
      events[1],
      this.onMove,
      this.eventListenerOptions
    );
    element.removeEventListener(
      events[2],
      this.onEnd,
      this.eventListenerOptions
    );
    element.removeEventListener(
      events[3],
      this.onEnd,
      this.eventListenerOptions
    );
  }

  onStart: TouchEventHandler = (e: UniversalTouchEvent) => {
    this.gesture = {
      startX: coordX(e),
      startY: coordY(e),
      startT: new Date(),
      pressed: true,
    };

    const outputEvent = {
      ...this.gesture,
      originalEvent: e,
    };

    if (this.listeners.onStart) {
      this.listeners.onStart(outputEvent);
    }

    if (this.listeners.onStartX) {
      this.listeners.onStartX(outputEvent);
    }

    if (this.listeners.onStartY) {
      this.listeners.onStartY(outputEvent);
    }

    !touchEnabled && this.subscribe(this.document);
  };

  private onMove: TouchEventHandler = (e: UniversalTouchEvent) => {
    const { pressed, isX, isY, startX, startY } = this.gesture;

    if (pressed) {
      // смещения
      const shiftX = coordX(e) - startX;
      const shiftY = coordY(e) - startY;

      // абсолютные значения смещений
      const shiftXAbs = Math.abs(shiftX);
      const shiftYAbs = Math.abs(shiftY);

      // Если определяем мультитач, то прерываем жест
      if (!!e.touches && e.touches.length > 1) {
        return this.onEnd(e);
      }

      // если мы ещё не определились
      if (!isX && !isY) {
        let willBeX = shiftXAbs >= 5 && shiftXAbs > shiftYAbs;
        let willBeY = shiftYAbs >= 5 && shiftYAbs > shiftXAbs;
        let willBeSlidedX =
          (willBeX && !!this.listeners.onMoveX) || !!this.listeners.onMove;
        let willBeSlidedY =
          (willBeY && !!this.listeners.onMoveY) || !!this.listeners.onMove;

        this.gesture.isY = willBeY;
        this.gesture.isX = willBeX;
        this.gesture.isSlideX = willBeSlidedX;
        this.gesture.isSlideY = willBeSlidedY;
        this.gesture.isSlide = willBeSlidedX || willBeSlidedY;
      }

      if (this.gesture.isSlide) {
        this.gesture.shiftX = shiftX;
        this.gesture.shiftY = shiftY;
        this.gesture.shiftXAbs = shiftXAbs;
        this.gesture.shiftYAbs = shiftYAbs;

        // Вызываем нужные колбеки из props
        const outputEvent = {
          ...this.gesture,
          originalEvent: e,
        };

        if (this.listeners.onMove) {
          this.listeners.onMove(outputEvent);
        }

        if (this.gesture.isSlideX && this.listeners.onMoveX) {
          this.listeners.onMoveX(outputEvent);
        }

        if (this.gesture.isSlideY && this.listeners.onMoveY) {
          this.listeners.onMoveY(outputEvent);
        }
      }
    }
  };

  private onEnd: TouchEventHandler = (e: UniversalTouchEvent) => {
    const { pressed, isSlide, isSlideX, isSlideY } = this.gesture;

    if (pressed) {
      // Вызываем нужные колбеки из props
      const outputEvent = {
        ...this.gesture,
        originalEvent: e,
      };

      if (this.listeners.onEnd) {
        this.listeners.onEnd(outputEvent);
      }

      if (isSlideY && this.listeners.onEndY) {
        this.listeners.onEndY(outputEvent);
      }

      if (isSlideX && this.listeners.onEndX) {
        this.listeners.onEndX(outputEvent);
      }
    }

    const target = e.target as HTMLElement;

    // Если закончили жест на ссылке, выставляем флаг для отмены перехода
    this.cancelClick = target.tagName === "A" && isSlide;
    this.gesture = {};

    !touchEnabled && this.unsubscribe(this.document);
  };

  private onClick = (event: MouseEvent) => {
    if (this.cancelClick) {
      this.cancelClick = false;
      event.preventDefault();
    }
  };

  private onDragStart = (event: DragEvent) => {
    const target = event.target as HTMLElement;

    if (target.tagName === "A" || target.tagName === "IMG") {
      event.preventDefault();
    }
  };

  dispose() {
    this.unsubscribe(this.el);
  }
}
