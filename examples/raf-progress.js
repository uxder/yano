
import { mathf } from '../lib/mathf/mathf';
import { RafProgress, RAF_PROGRESS_EVENTS } from '../lib/raf/raf-progress';
import { EASE } from '../lib/ease/ease';

export default class RafProgressSample {
    constructor() {
        console.log('RafProgressSample');

        this.ball = document.getElementById('ball');
        this.range = document.getElementById('range');


        const rafProgress = new RafProgress();
        rafProgress.addListener(RAF_PROGRESS_EVENTS.PROGRESS_CHANGE,
            (easedProgress) => {
                console.log('progress event', easedProgress);
            });


        rafProgress.setPrecision(10);
        rafProgress.setCurrentProgress(this.range.value);

        // Update rafProgress each time the value of range changes.
        this.range.addEventListener('input', () => {
            rafProgress.easeTo(+this.range.value, 0.25, EASE.easeInOutQuad);
        });

    }

}