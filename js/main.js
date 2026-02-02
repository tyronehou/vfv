import { Physics } from './physics.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.canvas = document.getElementById('fieldCanvas');
        this.charges = [];
        this.currentChargeType = 1; // 1 for pos, -1 for neg
        this.currentChargeValue = 1;
        this.hoveredCharge = null;
        this.selectedCharge = null;

        this.physics = new Physics();
        this.renderer = new Renderer(this.canvas, this.physics);
        this.ui = new UI(this, this.renderer);
        this.input = new InputHandler(this.canvas, this);

        this.init();
    }

    init() {
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.render();
        });

        // Initial render
        this.render();
    }

    addCharge(x, y) {
        const newCharge = { x, y, q: this.currentChargeType * this.currentChargeValue };
        this.charges.push(newCharge);
        this.render();
    }

    clearCharges() {
        this.charges = [];
        this.render();
    }

    removeCharge(charge) {
        const index = this.charges.indexOf(charge);
        if (index > -1) {
            this.charges.splice(index, 1);
            if (this.selectedCharge === charge) {
                this.deselectCharge();
            }
            if (this.hoveredCharge === charge) {
                this.hoveredCharge = null;
            }
            this.render();
        }
    }

    getChargeAt(x, y) {
        // Find charge within reasonable hit radius (e.g. 20px)
        const hitRadius = 20;
        return this.charges.find(c => {
            const dx = c.x - x;
            const dy = c.y - y;
            return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
        });
    }

    reset() {
        this.clearCharges();
    }

    requestRender() {
        requestAnimationFrame(() => this.render());
    }

    render() {
        this.renderer.render(this.charges, this.hoveredCharge, this.selectedCharge);
    }

    selectCharge(charge) {
        this.selectedCharge = charge;
        this.ui.updateSelectionMode(charge);
        this.render();
    }

    deselectCharge() {
        this.selectedCharge = null;
        this.ui.updateSelectionMode(null);
        this.render();
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
