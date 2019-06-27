
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { DomWatcher } from '../lib/dom/dom-watcher';
import { VectorDom } from '../lib/dom/vector-dom';
import { EASE } from '../lib/ease/ease';
import { dom } from '../lib/dom/dom';
import { mathf } from '../lib/mathf/mathf';
import { CatmullRom } from '../lib/mathf/catmull-rom';
import { Vector } from '../lib/mathf/vector';

export default class ScrollDemoSample3 {
    constructor() {
        console.log('Scroll Demo 3');

        this.domWatcher = new DomWatcher();
        this.parentElement = document.getElementById("parent");
        this.moduleHeight = this.parentElement.offsetHeight;
        this.childElement = document.getElementById("child");

        // Instance of rafProgress.
        const rafProgress = new RafProgress();

        // Update the progress value per scroll.
        this.domWatcher.add({
            element: window,
            on: 'scroll',
            callback: (event) => {
                this.progress =
                    dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
                rafProgress.easeTo(this.progress, 0.08, EASE.Linear);
            },
            eventOptions: { passive: true }
        });


        // this.flowerElement = document.getElementById('flower');
        // this.flowerVector = new VectorDom(this.flowerElement);
        // this.flowerVector.anchorX = 0.5;
        // this.flowerVector.anchorY = 0.5;

        // const timeline = [
        //     { progress: 0, x: 100, y: 600, z: 2 - 1, ry: 20, rz: 0, alpha: 0 },
        //     { progress: 0.3, x: 100, y: 400, z: 2 - 1, rz: 180, alpha: 1 },
        //     { progress: 0.6, x: 0, y: 200, z: 1 - 1, ry: 0, rz: 10 },
        //     { progress: 0.8, x: 300, y: 800, z: 1 - 1, ry: 20, rz: 0, easingFunction: EASE.easeInOutCubic },
        //     { progress: 1, x: 400, y: 500, z: 0.5 - 1, ry: 0, rz: 0 },
        // ];

        // this.flowerVector.setTimeline(timeline);

        // Create a second VectorDom on the parent element.
        // this.parentElement = document.getElementById('parent');
        // this.parentVector = new VectorDom(this.parentElement, { cssTimelineOnly: true });
        // this.parentVector.anchorX = 0;
        // this.parentVector.anchorY = 0;
        // this.parentVector.setTimeline([
        //     {
        //         progress: 0,
        //         '--background': 'rgba(255, 129, 0, 1)',
        //         '--text-color': '#000000'
        //     },
        //     {
        //         progress: 0.5,
        //         '--background': 'rgba(255, 153, 204, 1)',
        //         '--text-color': '#A56023'
        //     },
        //     {
        //         progress: 1,
        //         // You can interchange between hex and rgba
        //         // since it all converts to rgba.
        //         '--background': '#000000',
        //         '--text-color': '#FFFFFF'
        //     }
        // ]);


        this.textElement = document.getElementById('text');
        this.textVector = new VectorDom(this.textElement, { cssTimelineOnly: true });
        // Just doing this via straight css var to demo.
        // You can normally just use the y value.
        this.textVector.setTimeline([
            // {
            //     progress: 0,
            //     '--opacity': 0,
            //     '--y': '100px',
            // },
            {
                progress: 0.25,
                '--opacity': 0,
                '--y': '100px',
            },
            {
                progress: 0.3,
                '--opacity': 1,
                '--y': '0px',
            },
            {
                progress: 0.95,
                '--opacity': 1,
                '--y': '0px',
            },
            {
                progress: 1,
                '--opacity': 0,
                '--y': '-100px',
            }
        ]);
        this.textVector.anchorX = 0;
        this.textVector.anchorY = 0;


        // Update progress immediately on load.
        this.progress =
            dom.getElementScrolledPercent(this.parentElement, window.innerHeight);
        this.render(this.progress);

        rafProgress.easeTo(this.progress, 1, EASE.Linear);
        rafProgress.watch(this.onProgressUpdate.bind(this));
    }

    render(easedProgress) {
        // this.parentVector.setTimelineProgress(easedProgress);
        // this.parentVector.render();

        this.textVector.setTimelineProgress(easedProgress);
        this.textVector.render();

        // this.flowerVector.setTimelineProgress(easedProgress);
        // this.flowerVector.render();
    }


    // Runs every time eased progress is updated.
    onProgressUpdate(easedProgress, direction) {
        this.render(easedProgress);
    }

}