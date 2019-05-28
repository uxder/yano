import { time } from '../time/time';
import { EventEmitter } from 'events';


interface RafEvent extends Event {
    readonly frame: string;
    readonly lastUpdateTime: string;
    readonly elapsed: number;
    readonly stop: Function;
}

interface RafEvents {
    "raf": RafEvent
}

export enum RAF_EVENTS {
    RAF = 'raf'
}



/**
 * A class that creates a RAF loop and calls a specific callback.  Setting the
 * frame rate will throttle the animation.
 *
 * Example usage;
 * ```ts
 * var raf = new Raf((frame, lastUpdateTime, stop)=> {
 *   console.log('this runs on request animation frame');
 * });
 * raf.start();
 *
 * // Later to stop raf.
 * raf.stop();
 *
 * // Set the FPS
 * raf.setFps(30);
 * raf.start();
 *
 *
 * // Add or remove listeners
 * var onRaf = ()=> {
 *   console.log('hello')
 * }
 * raf.watch(onRaf);
 * raf.unwatch(onRaf);
 * ```
 *
 * @class
 */
export class Raf extends EventEmitter {

    private raf_: any;
    private frame: number | null;
    private lastUpdateTime: number;
    private fps: number;
    private isPlaying: boolean;

    /**
     * @param {Function} rafLoop  Optional function to be called on each
     *     request animation frame.
     * @constructor
     */
    constructor(rafLoop: Function | null) {
        super();

        /**
         * The internal reference to request animation frame.
         * @type {private}
         */
        this.raf_ = null;

        /**
         * The current animation frame.
         * @type {number}
         * @public
         */
        this.frame = null;

        /**
         * The last updated time.
         * @type {number}
         * @public
         */
        this.lastUpdateTime = 0;

        /**
         * The frame rate. Defaults to 0 in which case RAF is not throttled.
         * @type {number}
         */
        this.fps = 0;

        /**
         * Whether raf is looping.
         * @type {boolean}
         */
        this.isPlaying = false;

        if (rafLoop) {
            this.watch(rafLoop);
        }
    }

    /**
     * Adds a raf listener
     * @param
     */
    watch(callback: any) {
        this.on(RAF_EVENTS.RAF, callback);
    }

    /**
     * Removes a progress listener.
     * @param {Function}
     */
    unwatch(callback: any) {
        this.off(RAF_EVENTS.RAF, callback);
    }


    /**
     * Sets the fps .
     */
    setFps(fps: number) {
        this.fps = fps;
    }

    /**
     * Starts the RAF animation loop.
     * @param {boolean} Whether to force a start.
     */
    start(force: boolean = false) {
        if (!force && this.isPlaying) {
            return;
        }
        this.animationLoop_();
        this.isPlaying = true;
    }

    /**
     * Stops the RAF animation loop.
     */
    stop() {
        this.isPlaying = false;
        window.cancelAnimationFrame(this.raf_);
    }

    dispose() {
        this.stop();
    }


    /**
     * The internal animation loop.
     */
    private animationLoop_() {
        this.raf_ = window.requestAnimationFrame((frame: number) => {
            this.frame = frame;
            this.animationLoop_();
        });

        if (this.lastUpdateTime) {
            const current = time.now();
            const elapsed = current - this.lastUpdateTime;
            const fps = this.fps == 0 ? 0 : 1000 / this.fps;
            if (elapsed > fps) {

                this.emit(RAF_EVENTS.RAF, this.frame, this.lastUpdateTime, elapsed, () => {
                    this.stop();
                });

                this.lastUpdateTime = time.now();
            }
        }

        if (!this.lastUpdateTime) {
            this.lastUpdateTime = time.now();
        }

    }
}
