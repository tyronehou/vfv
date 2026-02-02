export class Renderer {
    constructor(canvas, physics) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.physics = physics;

        // Settings
        this.gridSpacing = 40; // Spacing in pixels
        this.arrowScale = 1.0;
        this.fieldThreshold = 0.1; // Minimum magnitude to draw
        this.showHeatmap = false;

        this.width = 0;
        this.height = 0;

        // Colors
        this.colors = {
            bg: '#f8f9fa',
            vector: '#343a40',
            pos: '#dc3545',
            neg: '#007bff'
        };

        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render(charges, hoveredCharge) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.showHeatmap) {
            this.drawHeatmap(charges);
        }

        this.drawGrid(charges);
        this.drawCharges(charges, hoveredCharge);
    }

    drawGrid(charges) {
        this.ctx.strokeStyle = this.colors.vector;
        this.ctx.fillStyle = this.colors.vector;

        // Loop through grid points
        for (let x = this.gridSpacing / 2; x < this.width; x += this.gridSpacing) {
            for (let y = this.gridSpacing / 2; y < this.height; y += this.gridSpacing) {
                const field = this.physics.calculateField(x, y, charges);

                // Only draw if there's a significant field to see
                if (field.magnitude > this.fieldThreshold) {
                    this.drawArrow(x, y, field.vx, field.vy, field.magnitude);
                }
            }
        }
    }

    drawArrow(x, y, vx, vy, magnitude) {
        // Normalize direction for uniform arrow size if we want just direction
        // OR scale by magnitude (clamped) to show strength.
        // For standard field viz, we often clamp length.

        const maxLength = this.gridSpacing * 0.8 * this.arrowScale;

        // Logarithmic scaling for better visibility across dynamic ranges
        // Visualization trick: E varies by 1/r^2, dynamic range is huge. 
        // We compress the length visually.
        let len = Math.log(magnitude + 1) * 10 * this.arrowScale;
        if (len > maxLength) len = maxLength;

        // Angle
        const angle = Math.atan2(vy, vx);

        // End points
        const endX = x + Math.cos(angle) * len;
        const endY = y + Math.sin(angle) * len;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Arrowhead
        const headLen = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.fill();
    }

    drawCharges(charges, hoveredCharge) {
        for (const c of charges) {
            // Visual size based on magnitude
            const radius = 10 + Math.sqrt(Math.abs(c.q)) * 2;

            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = c.q > 0 ? this.colors.pos : this.colors.neg;
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;

            // Hover Effect: Outer ring matching charge color
            if (c === hoveredCharge) {
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, radius + 4, 0, Math.PI * 2);
                this.ctx.strokeStyle = c.q > 0 ? this.colors.pos : this.colors.neg;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
            }

            // Text symbol
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y);

            // Optional: Show magnitude text if > 1
            if (Math.abs(c.q) > 1) {
                this.ctx.fillText(Math.abs(c.q), c.x, c.y + radius + 12);
            }
        }
    }

    drawHeatmap(charges) {
        // Pixel-based rendering is too slow for 60fps in JS without WebGL.
        // We will do a coarse mesh fill optimization or use offscreen canvas.
        // For now, implement a simplified version: fill grid cells with color.

        const cellSize = 10; // Finer than vector grid

        for (let x = 0; x < this.width; x += cellSize) {
            for (let y = 0; y < this.height; y += cellSize) {
                const field = this.physics.calculateField(x + cellSize / 2, y + cellSize / 2, charges);
                const intensity = Math.min(field.magnitude / 50, 1); // Normalize roughly

                // Color map: Blue (low) -> Red (high)
                // Just use alpha for simplicity over background
                // Or simplified heat map logic.

                if (intensity > 0.05) {
                    this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.4})`;
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                } else {
                    // Very weak field, maybe blue?
                    this.ctx.fillStyle = `rgba(0, 0, 255, ${0.05})`;
                    this.ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }
}
