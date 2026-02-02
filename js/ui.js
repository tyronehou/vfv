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

        this.sliderStrength = document.getElementById('charge-strength');
        this.valStrength = document.getElementById('val-strength');

        this.init();
    }

    init() {
        // Charge type toggles
        this.btnPos.addEventListener('click', () => {
            this.app.currentChargeType = 1;
            this.updateActiveBtn();

            if (this.app.selectedCharge) {
                this.app.selectedCharge.q = Math.abs(this.app.selectedCharge.q); // Make positive
                this.app.render();
            }
        });

        this.btnNeg.addEventListener('click', () => {
            this.app.currentChargeType = -1;
            this.updateActiveBtn();

            if (this.app.selectedCharge) {
                this.app.selectedCharge.q = -Math.abs(this.app.selectedCharge.q); // Make negative
                this.app.render();
            }
        });

        // Sliders
        // Sliders & Inputs
        // Sliders & Inputs
        const bindInput = (slider, numberInput, callback) => {
            // Initial resize
            this.resizeInput(numberInput);

            // Slider -> Number & Callback
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                numberInput.value = val;
                this.resizeInput(numberInput);
                callback(val);
            });

            // Number -> Slider & Callback
            numberInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                slider.value = val;
                this.resizeInput(numberInput);
                callback(val);
            });
        };

        // Charge Strength
        bindInput(this.sliderStrength, this.valStrength, (val) => {
            this.app.currentChargeValue = parseInt(val);
            if (this.app.selectedCharge) {
                const sign = this.app.selectedCharge.q > 0 ? 1 : -1;
                this.app.selectedCharge.q = sign * val;
                this.app.render();
            }
        });

        // Grid Density
        bindInput(this.sliderDensity, this.valDensity, (val) => {
            this.renderer.gridSpacing = parseInt(val);
            this.app.requestRender();
        });

        // Field Threshold
        bindInput(this.sliderThreshold, this.valThreshold, (val) => {
            this.renderer.fieldThreshold = val;
            this.app.requestRender();
        });

        // Arrow Scale
        bindInput(this.sliderScale, this.valScale, (val) => {
            this.renderer.arrowScale = val;
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

    updateSelectionMode(charge) {
        const title = document.querySelector('.control-group label'); // "Add Charge Type" label

        if (charge) {
            // Edit Mode
            title.textContent = 'Edit Selected Charge';

            // Set toggles to match charge
            if (charge.q > 0) {
                this.btnPos.classList.add('active');
                this.btnNeg.classList.remove('active');
            } else {
                this.btnPos.classList.remove('active');
                this.btnNeg.classList.add('active');
            }

            // Set strength slider to match charge
            const magnitude = Math.abs(charge.q);
            this.sliderStrength.value = magnitude;
            this.valStrength.value = magnitude;
            this.resizeInput(this.valStrength);

        } else {
            // Add Mode
            title.textContent = 'Add Charge';

            // Reset to default app state
            this.updateActiveBtn(); // Reset toggles to app state
            this.sliderStrength.value = this.app.currentChargeValue; // Reset slider
            this.valStrength.value = this.app.currentChargeValue;
            this.resizeInput(this.valStrength);
        }
    }

    resizeInput(input) {
        const len = input.value.toString().length;
        input.style.width = `${Math.max(1, len) * 1.1 + 1.5}ch`;
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
