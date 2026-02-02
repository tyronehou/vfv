export class Physics {
    constructor() {
        this.k = 9000; // Coulomb constant multiplier for visualization
    }

    /**
     * Calculates the electric field at point (x, y) given a list of charges.
     * @param {number} x - Target x coordinate
     * @param {number} y - Target y coordinate
     * @param {Array} charges - List of charge objects {x, y, q}
     * @returns {Object} vector - {vx, vy, magnitude}
     */
    calculateField(x, y, charges) {
        let vx = 0;
        let vy = 0;

        for (const charge of charges) {
            const dx = x - charge.x;
            const dy = y - charge.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            // Avoid division by zero and singularity issues for visualization
            if (dist < 0.01) continue;

            // E = k * q / r^2
            // Vector components: Ex = E * (dx/r), Ey = E * (dy/r)
            // Assumes we're acting on positive charge of 1C
            const E = (this.k * charge.q) / distSq;

            vx += E * (dx / dist);
            vy += E * (dy / dist);
        }

        const magnitude = Math.sqrt(vx * vx + vy * vy);
        return { vx, vy, magnitude };
    }
}
