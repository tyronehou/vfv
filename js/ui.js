export class UI {
    constructor(app, renderer) {
        this.app = app;
        this.renderer = renderer;

        // Element refs - Shared/Charges
        this.btnPos = document.getElementById('btn-pos');
        this.btnNeg = document.getElementById('btn-neg');

        // Charges Controls
        this.sliderDensityCharges = document.getElementById('grid-density-charges');
        this.valDensityCharges = document.getElementById('val-density-charges');
        this.sliderScaleCharges = document.getElementById('arrow-scale-charges');
        this.valScaleCharges = document.getElementById('val-scale-charges');

        // Equation Controls
        this.sliderDensityEquation = document.getElementById('grid-density-equation');
        this.valDensityEquation = document.getElementById('val-density-equation');
        this.sliderScaleEquation = document.getElementById('arrow-scale-equation');
        this.valScaleEquation = document.getElementById('val-scale-equation');

        // Shared/Misc
        this.sliderThreshold = document.getElementById('field-threshold');
        this.valThreshold = document.getElementById('val-threshold');

        this.checkHeatmap = document.getElementById('show-heatmap');
        this.controlsHeatmap = document.getElementById('controls-heatmap');
        this.btnClear = document.getElementById('btn-clear');

        this.sliderStrength = document.getElementById('charge-strength');
        this.valStrength = document.getElementById('val-strength');
        this.groupStrength = document.getElementById('strength-control-group');

        // View Mode Tabs
        this.tabVector = document.getElementById('tab-vector');
        this.tabLines = document.getElementById('tab-lines');
        this.controlsVectorCharges = document.getElementById('controls-vector-charges');
        this.controlsLines = document.getElementById('controls-lines');
        this.divThreshold = document.getElementById('control-group-threshold');

        // Line Config
        this.sliderLines = document.getElementById('line-density');
        this.valLines = document.getElementById('val-lines');

        // Main Tabs
        this.tabCharges = document.getElementById('main-tab-charges');
        this.tabEquation = document.getElementById('main-tab-equation');
        this.contentCharges = document.getElementById('tab-content-charges');
        this.contentEquation = document.getElementById('tab-content-equation');

        // Equation Inputs
        this.inputEx = document.getElementById('eq-ex');
        this.inputEy = document.getElementById('eq-ey');
        this.checkGrid = document.getElementById('show-grid-lines');
        this.checkAxes = document.getElementById('show-axes');
        this.btnUpdateEquation = document.getElementById('btn-update-equation');

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

        // Grid Density (Charges)
        bindInput(this.sliderDensityCharges, this.valDensityCharges, (val) => {
            this.renderer.gridSpacing = parseInt(val);
            this.app.requestRender();
        });

        // Grid Density (Equation)
        bindInput(this.sliderDensityEquation, this.valDensityEquation, (val) => {
            this.renderer.gridSpacing = val; // Float for units
            this.app.requestRender();
        });

        // Field Threshold (Charges only effectively)
        bindInput(this.sliderThreshold, this.valThreshold, (val) => {
            this.renderer.fieldThreshold = val;
            this.app.requestRender();
        });

        // Arrow Scale (Charges)
        bindInput(this.sliderScaleCharges, this.valScaleCharges, (val) => {
            this.renderer.arrowScale = val;
            this.app.requestRender();
        });

        // Arrow Scale (Equation)
        bindInput(this.sliderScaleEquation, this.valScaleEquation, (val) => {
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

        // View Mode Switching
        this.tabVector.addEventListener('click', () => {
            this.setMode('vector');
            this.renderer.visualizationMode = 'vector';
            this.app.requestRender();
        });

        this.tabLines.addEventListener('click', () => {
            this.setMode('lines');
            this.renderer.visualizationMode = 'lines';
            this.app.requestRender();
        });

        // Line Density
        bindInput(this.sliderLines, this.valLines, (val) => {
            this.renderer.lineDensity = parseInt(val);
            this.app.requestRender();
        });

        // Main Tab Switching
        this.tabCharges.addEventListener('click', () => {
            this.setMainTab('charges');
        });

        this.tabEquation.addEventListener('click', () => {
            this.setMainTab('equation');
        });

        // Grid & Axes Toggles
        this.checkGrid.addEventListener('change', (e) => {
            this.renderer.showGridLines = e.target.checked;
            this.app.requestRender();
        });

        this.checkAxes.addEventListener('change', (e) => {
            this.renderer.showAxes = e.target.checked;
            this.app.requestRender();
        });

        // Equation Update
        if (this.btnUpdateEquation) {
            this.btnUpdateEquation.addEventListener('click', () => {
                const ex = this.inputEx.value;
                const ey = this.inputEy.value;
                this.renderer.setEquation(ex, ey);
                this.app.requestRender();
            });

            // Enter key support
            const handleEnter = (e) => {
                if (e.key === 'Enter') {
                    this.btnUpdateEquation.click();
                }
            };
            this.inputEx.addEventListener('keydown', handleEnter);
            this.inputEy.addEventListener('keydown', handleEnter);

            // Dynamic Resizing
            this.inputEx.addEventListener('input', (e) => this.resizeInput(e.target));
            this.inputEy.addEventListener('input', (e) => this.resizeInput(e.target));

            // Initial resize
            this.resizeInput(this.inputEx);
            this.resizeInput(this.inputEy);
        }

        // Initial state
        this.updateSelectionMode(null);
        this.setMainTab('charges');
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

            // Show strength controls
            if (this.groupStrength) this.groupStrength.style.display = 'block';

        } else {
            // Add Mode
            title.textContent = 'Add Charge';

            // Reset to default app state
            this.updateActiveBtn(); // Reset toggles to app state
            this.sliderStrength.value = this.app.currentChargeValue; // Reset slider
            this.valStrength.value = this.app.currentChargeValue;
            this.resizeInput(this.valStrength);

            // Hide strength controls
            if (this.groupStrength) this.groupStrength.style.display = 'none';
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

    setMode(mode) {
        if (mode === 'vector') {
            this.tabVector.classList.add('active');
            this.tabLines.classList.remove('active');
            if (this.controlsVectorCharges) this.controlsVectorCharges.style.display = 'block';
            this.controlsLines.style.display = 'none';
            if (this.controlsHeatmap) this.controlsHeatmap.style.display = 'flex';
        } else {
            this.tabVector.classList.remove('active');
            this.tabLines.classList.add('active');
            if (this.controlsVectorCharges) this.controlsVectorCharges.style.display = 'none';
            this.controlsLines.style.display = 'block';
            if (this.controlsHeatmap) this.controlsHeatmap.style.display = 'none';
        }
    }

    setMainTab(tab) {
        if (tab === 'charges') {
            this.tabCharges.classList.add('active');
            this.tabEquation.classList.remove('active');
            this.contentCharges.style.display = 'block';
            this.contentEquation.style.display = 'none';
            this.renderer.mode = 'charges';

            // Restore sub-tab state
            this.setMode(this.renderer.visualizationMode);

            // Sync state from Charges controls
            if (this.sliderDensityCharges) this.renderer.gridSpacing = parseInt(this.sliderDensityCharges.value);
            if (this.sliderScaleCharges) this.renderer.arrowScale = parseFloat(this.sliderScaleCharges.value);

            // Show threshold
            if (this.divThreshold) this.divThreshold.style.display = 'block';

        } else {
            this.tabCharges.classList.remove('active');
            this.tabEquation.classList.add('active');
            this.contentCharges.style.display = 'none';
            this.contentEquation.style.display = 'block';
            this.renderer.mode = 'equation';

            // Show appropriate controls for equation mode
            // Reuse vector controls for now
            // this.controlsVector.style.display = 'block'; // Removed
            this.controlsLines.style.display = 'none';
            if (this.controlsHeatmap) this.controlsHeatmap.style.display = 'flex';

            // Hide threshold
            if (this.divThreshold) this.divThreshold.style.display = 'none';

            // Sync state from Equation controls
            if (this.sliderDensityEquation) this.renderer.gridSpacing = parseFloat(this.sliderDensityEquation.value);
            if (this.sliderScaleEquation) this.renderer.arrowScale = parseFloat(this.sliderScaleEquation.value);
        }
        this.app.requestRender();
    }
}
