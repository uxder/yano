import {DomWatcher} from '../dom/dom-watcher';
import {EventCallback, EventManager, EventDispatcher} from './events';
import * as dom from '../dom/dom';

export enum SwipeEvent {
  UP = 'swipeUp',
  DOWN = 'swipeDown',
  LEFT = 'swipeLeft',
  RIGHT = 'swipeRight',
}

/**
 * A basic class that allows you to watch directional swipe events on a given
 * element.
 *
 *
 * Usage:
 * ```ts
 * const swiper = new Swipe(myElement);
 *
 * swiper.on(Swipe.Events.UP, ()=> {
 *   // swipe up.
 * })
 * swiper.on(Swipe.Events.LEFT, ()=> {
 *   // swipe left
 * })
 *
 * // Later
 * swiper.dispose();
 * ```
 *
 *
 *
 * Events are also fired on the element itself.
 *
 * ```ts
 * const swiper = new Swipe(myElement);
 * myElement.addEventListener(Swipe.Events.UP, ()=> {
 *   // swipe up.
 * })
 * ```
 */
export class Swipe implements EventDispatcher {
  private rootElement: HTMLElement;
  private eventManager: EventManager;
  private watcher: DomWatcher;
  private x: number;
  private y: number;
  private allowSwipe = false;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.eventManager = new EventManager();
    this.watcher = new DomWatcher();

    const isTouchSupported = 'ontouchstart' in document.documentElement;

    // Add listeners
    if (isTouchSupported) {
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'touchstart',
        eventOptions: {passive: true},
        callback: this.onPointerDown.bind(this),
      });
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'touchend',
        eventOptions: {passive: true},
        callback: this.onPointerUp.bind(this),
      });
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'touchmove',
        eventOptions: {passive: true},
        callback: this.onPointerMove.bind(this),
      });
    } else {
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'mousedown',
        eventOptions: {passive: true},
        callback: this.onPointerDown.bind(this),
      });
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'mouseup',
        eventOptions: {passive: true},
        callback: this.onPointerUp.bind(this),
      });
      this.watcher.add({
        element: this.rootElement as HTMLElement,
        on: 'mousemove',
        eventOptions: {passive: true},
        callback: this.onPointerMove.bind(this),
      });
    }
  }

  static Events = SwipeEvent;

  private onPointerDown(e: TouchEvent | MouseEvent) {
    if (e instanceof TouchEvent) {
      this.x = e.touches[0].clientX;
      this.y = e.touches[0].clientY;
    }
    if (e instanceof MouseEvent) {
      this.x = e.x;
      this.y = e.y;
    }
    this.allowSwipe = true;
  }

  private onPointerUp() {
    this.allowSwipe = false;
  }

  private onPointerMove(e: TouchEvent) {
    if (!this.x || !this.y || !this.allowSwipe) {
      return;
    }

    const currentX = (e.touches && e.touches[0].clientX) || e['x'];
    const currentY = (e.touches && e.touches[0].clientY) || e['y'];

    const diffX = currentX - this.x;
    const diffY = currentY - this.y;

    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        this.eventManager.dispatch(Swipe.Events.LEFT);
        dom.event(this.rootElement, Swipe.Events.LEFT, {});
      } else {
        this.eventManager.dispatch(Swipe.Events.RIGHT);
        dom.event(this.rootElement, Swipe.Events.RIGHT, {});
      }
    } else {
      if (diffY > 0) {
        this.eventManager.dispatch(Swipe.Events.UP);
        dom.event(this.rootElement, Swipe.Events.UP, {});
      } else {
        this.eventManager.dispatch(Swipe.Events.DOWN);
        dom.event(this.rootElement, Swipe.Events.DOWN, {});
      }
    }

    this.allowSwipe = false;
  }

  on(eventName: string, callback: Function) {
    this.eventManager.on(eventName, callback as EventCallback);
  }

  off(eventName: string, callback: Function) {
    this.eventManager.off(eventName, callback as EventCallback);
  }

  dispose() {
    this.eventManager.dispose();
    this.watcher.dispose();
  }
}
