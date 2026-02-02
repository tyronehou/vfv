export class UI {
    constructor(app, renderer) {
        this.app = app;
        this.renderer = renderer;

        // Element refs
        this.btnPos = document.getElementById('btn-pos');
        this.btnNeg = document.getElementById('btn-neg');
        this.sliderDensity = document.getElementById('grid-density');
        this.sliderThreshold = document.getElementById('field-threshold');
        this.sliderScale = document.getElementById('arrow-scale');

        this.valDensity = document.getElementById('val-density');
        this.valThreshold = document.getElementById('val-threshold');
        this.valScale = document.getElementById('val-scale');

        this.checkHeatmap = document.getElementById('show-heatmap');
        this.btnClear = document.getElementById('btn-clear');

        this.init();
    }

    init() {
        // Charge type toggles
        this.btnPos.addEventListener('click', () => {
            this.app.currentChargeType = 1;
            this.updateActiveBtn();
        });

        this.btnNeg.addEventListener('click', () => {
            this.app.currentChargeType = -1;
            this.updateActiveBtn();
        });

        // Sliders
        this.sliderDensity.addEventListener('input', (e) => {
            this.renderer.gridSpacing = parseInt(e.target.value);
            this.valDensity.textContent = this.renderer.gridSpacing;
            this.app.requestRender();
        });

        this.sliderThreshold.addEventListener('input', (e) => {
            this.renderer.fieldThreshold = parseFloat(e.target.value);
            this.valThreshold.textContent = this.renderer.fieldThreshold.toFixed(2);
            this.app.requestRender();
        });

        this.sliderScale.addEventListener('input', (e) => {
            this.renderer.arrowScale = parseFloat(e.target.value);
            this.valScale.textContent = this.renderer.arrowScale.toFixed(1);
            this.app.requestRender();
        });

        // Toggles
        this.checkHeatmap.addEventListener('change', (e) => {
            this.renderer.showHeatmap = e.target.checked;
            this.app.requestRender();
        });

        // Clear
        this.btnClear.addEventListener('click', () => {
            this.app.clearCharges();
        });
    }

    updateActiveBtn() {
        if (this.app.currentChargeType > 0) {
            this.btnPos.classList.add('active');
            this.btnNeg.classList.remove('active');
        } else {
            this.btnPos.classList.remove('active');
            this.btnNeg.classList.add('active');
        }
    }
}
