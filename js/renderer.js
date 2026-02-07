export class Renderer {
    constructor(canvas, physics) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.physics = physics;

        // Settings
        this.gridSpacing = 40; // Spacing in pixels
        this.scale = 50; // Pixels per unit (for Equation mode)
        this.arrowScale = 1.0;
        this.fieldThreshold = 0.1; // Minimum magnitude to draw
        this.fieldThreshold = 0.1; // Minimum magnitude to draw
        this.showHeatmap = false;

        // New Visualization Settings
        this.visualizationMode = 'vector'; // 'vector' or 'lines'
        this.lineDensity = 8; // Lines per charge

        // Equation Mode Settings
        this.mode = 'charges'; // 'charges' or 'equation'
        this.equationEx = 'y';
        this.equationEy = '-x';
        this.showGridLines = true;
        this.showAxes = true;
        this.equationFnEx = null;
        this.equationFnEy = null;
        this.compileEquation();

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

    setEquation(ex, ey) {
        this.equationEx = ex;
        this.equationEy = ey;
        this.compileEquation();
    }

    compileEquation() {
        try {
            // Create function that takes x, y and Math functions
            // We'll expose Math properties directly or destructure them
            this.equationFnEx = new Function('x', 'y', 'Math', `with(Math) { return ${this.equationEx}; }`);
            this.equationFnEy = new Function('x', 'y', 'Math', `with(Math) { return ${this.equationEy}; }`);
        } catch (e) {
            console.error("Invalid equation", e);
            this.equationFnEx = () => 0;
            this.equationFnEy = () => 0;
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    render(charges, hoveredCharge, selectedCharge) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.mode === 'equation') {
            this.drawEquationMode();
            return;
        }

        if (this.showHeatmap) {
            this.drawHeatmap(charges);
        }

        if (this.visualizationMode === 'lines') {
            this.drawFieldLines(charges);
        } else {
            this.drawGrid(charges);
        }
        this.drawCharges(charges, hoveredCharge, selectedCharge);
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

        let visualSpacing = this.gridSpacing;
        if (this.mode === 'equation') {
            visualSpacing = this.gridSpacing * this.scale;
        }

        const maxLength = visualSpacing * 0.8 * this.arrowScale;

        let len;
        if (this.showHeatmap) {
            // Uniform length for direction only when heatmap is showing magnitude
            // Use 60% of grid spacing as base length, scaled by user setting
            len = visualSpacing * 0.3 * this.arrowScale;
        } else {
            // Logarithmic scaling for standard view
            // Visualization trick: E varies by 1/r^2, dynamic range is huge. 
            // We compress the length visually.
            len = Math.log(magnitude + 1) * 10 * this.arrowScale;
            if (len > maxLength) len = maxLength;
        }

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

    drawCharges(charges, hoveredCharge, selectedCharge) {
        for (const c of charges) {
            const isSelected = c === selectedCharge;
            const isHovered = c === hoveredCharge;

            // Visual size based on magnitude
            let radius = 10 + Math.sqrt(Math.abs(c.q)) * 2;

            // Apply filter FIRST (affects both ring and body)
            if (isSelected || isHovered) {
                radius *= 1.15;
                this.ctx.filter = 'brightness(1.5)';
            }

            // Selection Ring (Only when selected)
            if (isSelected) {
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, radius + 4, 0, Math.PI * 2);
                this.ctx.strokeStyle = c.q > 0 ? this.colors.pos : this.colors.neg;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
            }

            // Draw Charge Body
            this.ctx.beginPath();
            this.ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);

            this.ctx.fillStyle = c.q > 0 ? this.colors.pos : this.colors.neg;
            this.ctx.fill();

            // Reset filter
            this.ctx.filter = 'none';

            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.lineWidth = 1;



            // Text symbol
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(c.q > 0 ? '+' : '-', c.x, c.y);

            // Show magnitude text below charge
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(Math.abs(c.q), c.x, c.y + radius + 12);
        }
    }

    drawFieldLines(charges) {
        console.log("Drawing field lines");
        this.ctx.strokeStyle = '#6c757d'; // Grey for field lines
        this.ctx.lineWidth = 1;

        const stepSize = 5;
        const maxSteps = 500; // Limit line length to prevent infinite loops

        for (const c of charges) {
            // Determine trace direction: Positive -> Downstream (+E), Negative -> Upstream (-E)
            let direction = c.q > 0 ? 1 : -1;

            // Number of lines depends on charge magnitude? Or fixed density?
            // User requested "regular angles". Let's use fixed count for now, or scaled by q?
            // "Each charge" implies per-charge source.
            // Let's use the UI setting this.lineDensity

            const count = this.lineDensity;

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;

                // Start slightly offset from the center to avoid singularity
                let x = c.x + Math.cos(angle) * 10;
                let y = c.y + Math.sin(angle) * 10;

                const path = [];
                path.push({ x, y });

                this.ctx.beginPath();
                this.ctx.moveTo(x, y);

                for (let s = 0; s < maxSteps; s++) {
                    const field = this.physics.calculateField(x, y, charges);

                    if (field.magnitude === 0) {
                        break; // Should not happen often
                    }
                    // Normalize field vector for uniform step size (trace path, not strength)
                    // We want the SHAPE of the line, so we follow unit vector.
                    const len = Math.sqrt(field.vx * field.vx + field.vy * field.vy);
                    const vx = (field.vx / len) * direction;
                    const vy = (field.vy / len) * direction;

                    x += vx * stepSize;
                    y += vy * stepSize;

                    path.push({ x, y });
                    this.ctx.lineTo(x, y);

                    // Stop if out of bounds
                    if (x < 0 || x > this.width || y < 0 || y > this.height) {
                        break;
                    }

                    // Stop if too close to another charge (sink)
                    // Simple check: distance to all charges
                    let hitCharge = false;
                    for (const other of charges) {
                        const dx = x - other.x;
                        const dy = y - other.y;
                        if (dx * dx + dy * dy < 100) { // radius squared < 10^2
                            hitCharge = true;
                            break;
                        }
                    }
                    if (hitCharge) break;
                }
                this.ctx.stroke();

                // Draw arrow halfway
                if (path.length > 2) {
                    const midIndex = Math.floor(path.length / 2);
                    const p1 = path[midIndex];
                    const p2 = path[midIndex + 1] || path[midIndex]; // Point ahead

                    // Angle for arrow
                    // If negative charge, we traced UPSTREAM (away from charge),
                    // so the path goes against the field.
                    // We want arrow to point ALONG the field (towards charge).
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    let angle = c.q > 0 ? Math.atan2(dy, dx) : Math.atan2(-dy, -dx);

                    const headLen = 6;
                    this.ctx.fillStyle = '#6c757d';
                    this.ctx.beginPath();
                    // Draw triangle arrow
                    this.ctx.moveTo(p1.x + headLen * Math.cos(angle), p1.y + headLen * Math.sin(angle));
                    this.ctx.lineTo(p1.x - headLen * Math.cos(angle - Math.PI / 6), p1.y - headLen * Math.sin(angle - Math.PI / 6));
                    this.ctx.lineTo(p1.x - headLen * Math.cos(angle + Math.PI / 6), p1.y - headLen * Math.sin(angle + Math.PI / 6));
                    this.ctx.fill();
                }
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

    drawEquationMode() {
        if (this.showGridLines) {
            this.drawEquationGridLines();
        }
        if (this.showAxes) {
            this.drawAxes();
        }

        // Draw Vector Field
        this.ctx.strokeStyle = this.colors.vector;
        this.ctx.fillStyle = this.colors.vector;

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const scale = this.scale;

        // In equation mode, gridSpacing is in UNITS (e.g. 1.0, 0.5)
        // Convert to pixels for drawing loop
        const stepPixels = this.gridSpacing * scale;

        // Calculate start positions to ensure a grid point lands exactly on (centerX, centerY)
        // We want x = centerX + n * stepPixels
        // So find the smallest x > 0 that satisfies this.
        const startX = (centerX % stepPixels);
        const startY = (centerY % stepPixels);

        for (let x = startX; x < this.width; x += stepPixels) {
            for (let y = startY; y < this.height; y += stepPixels) {
                // Convert to logical coordinates
                // Cartesian standard: Y up is positive. Canvas: Y down is positive.
                const lx = (x - centerX) / scale;
                const ly = -(y - centerY) / scale;

                let vx = 0, vy = 0;
                try {
                    vx = this.equationFnEx(lx, ly, Math);
                    vy = this.equationFnEy(lx, ly, Math);
                } catch (e) {
                    // Ignore math errors in loop
                }

                // Check for validity
                if (isNaN(vx) || isNaN(vy) || !isFinite(vx) || !isFinite(vy)) continue;

                const magnitude = Math.sqrt(vx * vx + vy * vy);

                // Flip vy back for canvas rendering (Logical Y+ is Up, Canvas Y+ is Down)
                // If Ey is positive, it points UP. In canvas, that means y decreases.
                // So canvas_vy should be -vy.
                const cvy = -vy;

                if (magnitude > 0.01) {
                    this.drawArrow(x, y, vx, cvy, magnitude);
                }
            }
        }
    }

    drawAxes() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const scale = this.scale;

        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // X Axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(this.width, centerY);
        this.ctx.stroke();

        // X Axis Labels
        for (let x = centerX; x < this.width; x += scale) {
            this.ctx.beginPath(); this.ctx.moveTo(x, centerY - 3); this.ctx.lineTo(x, centerY + 3); this.ctx.stroke();
            const val = (x - centerX) / scale;
            if (val !== 0) this.ctx.fillText(val, x, centerY + 5);
        }
        for (let x = centerX; x > 0; x -= scale) {
            this.ctx.beginPath(); this.ctx.moveTo(x, centerY - 3); this.ctx.lineTo(x, centerY + 3); this.ctx.stroke();
            const val = (x - centerX) / scale;
            if (val !== 0) this.ctx.fillText(val, x, centerY + 5);
        }

        // Y Axis
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.height);
        this.ctx.stroke();

        // Y Axis Labels
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        for (let y = centerY; y < this.height; y += scale) {
            this.ctx.beginPath(); this.ctx.moveTo(centerX - 3, y); this.ctx.lineTo(centerX + 3, y); this.ctx.stroke();
            const val = -(y - centerY) / scale; // Invert logic for label
            if (val !== 0) this.ctx.fillText(val, centerX - 5, y);
        }
        for (let y = centerY; y > 0; y -= scale) {
            this.ctx.beginPath(); this.ctx.moveTo(centerX - 3, y); this.ctx.lineTo(centerX + 3, y); this.ctx.stroke();
            const val = -(y - centerY) / scale;
            if (val !== 0) this.ctx.fillText(val, centerX - 5, y);
        }

        // Origin
        this.ctx.fillText("0", centerX - 5, centerY + 5);

        this.ctx.lineWidth = 1;
    }

    drawEquationGridLines() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const scale = this.scale;

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = centerX; x < this.width; x += scale) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height); this.ctx.stroke();
        }
        for (let x = centerX; x > 0; x -= scale) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height); this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = centerY; y < this.height; y += scale) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
        }
        for (let y = centerY; y > 0; y -= scale) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
        }
    }
}
