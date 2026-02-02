export class InputHandler {
    constructor(canvas, app) {
        this.canvas = canvas;
        this.app = app;

        this.isDragging = false;

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
    }

    getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleMouseDown(e) {
        if (e.button !== 0) return; // Only allow left click

        const pos = this.getPos(e);

        // Check if clicking on existing charge
        const existingCharge = this.app.getChargeAt(pos.x, pos.y);

        if (existingCharge) {
            this.isDragging = true;
            this.draggedCharge = existingCharge;
            this.app.selectCharge(existingCharge);
        } else {
            // If clicking empty space...
            // 1. If we have a selection, deselect it?
            // 2. OR always add a new charge?
            // "Standard" behavior: Click off -> Deselect using the same click? OR Add?
            // Let's go with: Click empty -> Add new charge (and select it). 
            // To just deselect, maybe a dedicated button or key? 
            // user: "Clicking empty space deselects the charge" in proposal 1.
            // BUT "Add new charge" interaction is "Click on canvas". 
            // Conflict!
            // Resolution: If selected, click off -> deselect ONLY. If NOT selected -> Add.

            if (this.app.selectedCharge) {
                this.app.deselectCharge();
            } else {
                this.app.addCharge(pos.x, pos.y);
            }
        }
    }

    handleMouseMove(e) {
        const pos = this.getPos(e);

        // Dragging Logic
        if (this.isDragging && this.draggedCharge) {
            this.draggedCharge.x = pos.x;
            this.draggedCharge.y = pos.y;
            this.app.requestRender();
            return;
        }

        // Hover Logic
        const hit = this.app.getChargeAt(pos.x, pos.y);
        if (hit !== this.app.hoveredCharge) {
            this.app.hoveredCharge = hit;
            this.canvas.style.cursor = hit ? 'pointer' : 'default';
            this.app.requestRender();
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.draggedCharge = null;
    }

    handleDoubleClick(e) {
        const pos = this.getPos(e);
        const charge = this.app.getChargeAt(pos.x, pos.y);

        if (charge) {
            this.app.removeCharge(charge);
        }
    }
}
