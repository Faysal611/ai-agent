// Canvas and Context Initialization
const canvas = document.getElementById('shapesCanvas');
const ctx = canvas.getContext('2d');

// UI Controls Elements
const countInput = document.getElementById('shapeCount');
const countVal = document.getElementById('countVal');
const speedInput = document.getElementById('baseSpeed');
const speedVal = document.getElementById('speedVal');
const sizeInput = document.getElementById('shapeSize');
const sizeVal = document.getElementById('sizeVal');
const boundarySelect = document.getElementById('boundaryMode');
const themeSelect = document.getElementById('colorTheme');
const btnPause = document.getElementById('btnPause');
const btnReset = document.getElementById('btnReset');
const fpsDisplay = document.getElementById('fps');

// Shape type checkboxes
const shapeCheckboxes = {
    circle: document.getElementById('chkCircle'),
    square: document.getElementById('chkSquare'),
    triangle: document.getElementById('chkTriangle'),
    pentagon: document.getElementById('chkPentagon'),
    star: document.getElementById('chkStar'),
    heart: document.getElementById('chkHeart')
};

// Global App State
let shapes = [];
let isPaused = false;
let lastTime = 0;
let fps = 0;
let frameCount = 0;
let fpsInterval = 0;

// Color Themes definition
const themes = {
    neon: [
        'rgba(255, 0, 127, 0.85)',   // Hot Pink
        'rgba(123, 44, 191, 0.85)',  // Purple
        'rgba(63, 55, 201, 0.85)',   // Indigo
        'rgba(72, 149, 239, 0.85)',  // Blue
        'rgba(76, 201, 240, 0.85)',  // Cyan
        'rgba(0, 245, 212, 0.85)',   // Teal
        'rgba(255, 112, 166, 0.85)'  // Light neon pink
    ],
    pastel: [
        'rgba(255, 183, 178, 0.85)', // Coral Pastel
        'rgba(255, 218, 193, 0.85)', // Peach
        'rgba(226, 240, 203, 0.85)', // Light Green
        'rgba(181, 234, 215, 0.85)', // Mint
        'rgba(199, 206, 234, 0.85)', // Periwinkle
        'rgba(222, 192, 241, 0.85)', // Lilac
        'rgba(243, 196, 251, 0.85)'  // Pink Pearl
    ],
    sunset: [
        'rgba(255, 77, 109, 0.85)',  // Rose
        'rgba(255, 117, 143, 0.85)', // Coral Pink
        'rgba(255, 159, 28, 0.85)',  // Bright Orange
        'rgba(255, 191, 105, 0.85)', // Yellow Orange
        'rgba(247, 127, 0, 0.85)',   // Deep Orange
        'rgba(252, 191, 73, 0.85)',  // Honey Gold
        'rgba(214, 40, 40, 0.85)'    // Crimson
    ],
    ocean: [
        'rgba(3, 4, 94, 0.85)',      // Royal Blue
        'rgba(0, 119, 182, 0.85)',   // Sapphire Blue
        'rgba(0, 150, 199, 0.85)',   // Deep Cyan
        'rgba(0, 180, 216, 0.85)',   // Ocean Teal
        'rgba(144, 224, 239, 0.85)', // Sky Blue
        'rgba(0, 245, 212, 0.85)',   // Neon Turquoise
        'rgba(112, 224, 0, 0.85)'    // Seaweed Green
    ]
};

// Shape Class
class Shape {
    constructor() {
        this.reset();
    }

    reset() {
        const speedMultiplier = parseFloat(speedInput.value);
        this.size = (Math.random() * 25 + 15); // Base size between 15 and 40
        
        // Spawn randomly within the screen, keeping a border buffer
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = Math.random() * (canvas.height - this.size * 2) + this.size;
        
        // Generate velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * speedMultiplier + 0.5;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        
        // Angular rotation
        this.rotation = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 0.05; // rotational speed
        
        // Assign shape type and color
        this.type = this.getRandomSelectedType();
        this.color = this.getRandomColor();
    }

    getRandomSelectedType() {
        const activeTypes = Object.keys(shapeCheckboxes).filter(key => shapeCheckboxes[key].checked);
        if (activeTypes.length === 0) return 'circle'; // Fallback if none are selected
        return activeTypes[Math.floor(Math.random() * activeTypes.length)];
    }

    getRandomColor() {
        const theme = themes[themeSelect.value];
        return theme[Math.floor(Math.random() * theme.length)];
    }

    // Adapt shape to new properties (color, velocity, etc.) on-the-fly
    updateColor() {
        this.color = this.getRandomColor();
    }

    updateSpeed(oldMax, newMax) {
        // Recalculate speeds proportionally so direction is preserved
        if (oldMax === 0) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * newMax;
            this.vy = Math.sin(angle) * newMax;
            return;
        }
        const factor = newMax / oldMax;
        this.vx *= factor;
        this.vy *= factor;
    }

    update(boundaryMode, sizeScale) {
        // Adjust position based on velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Rotate shape
        this.rotation += this.vr;

        const effectiveSize = this.size * sizeScale;

        // Boundary handling
        if (boundaryMode === 'bounce') {
            if (this.x - effectiveSize < 0) {
                this.x = effectiveSize;
                this.vx = -this.vx;
            } else if (this.x + effectiveSize > canvas.width) {
                this.x = canvas.width - effectiveSize;
                this.vx = -this.vx;
            }

            if (this.y - effectiveSize < 0) {
                this.y = effectiveSize;
                this.vy = -this.vy;
            } else if (this.y + effectiveSize > canvas.height) {
                this.y = canvas.height - effectiveSize;
                this.vy = -this.vy;
            }
        } else { // 'wrap' mode
            const wrapBuffer = effectiveSize * 1.5;
            if (this.x + wrapBuffer < 0) {
                this.x = canvas.width + wrapBuffer;
            } else if (this.x - wrapBuffer > canvas.width) {
                this.x = -wrapBuffer;
            }

            if (this.y + wrapBuffer < 0) {
                this.y = canvas.height + wrapBuffer;
            } else if (this.y - wrapBuffer > canvas.height) {
                this.y = -wrapBuffer;
            }
        }
    }

    draw(sizeScale) {
        const effectiveSize = this.size * sizeScale;
        ctx.fillStyle = this.color;
        
        // Slightly brighter outline for glow/depth effect
        ctx.strokeStyle = this.color.replace('0.85', '1.0');
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'circle':
                this.drawCircle(effectiveSize);
                break;
            case 'square':
                this.drawSquare(effectiveSize);
                break;
            case 'triangle':
                this.drawTriangle(effectiveSize);
                break;
            case 'pentagon':
                this.drawPentagon(effectiveSize);
                break;
            case 'star':
                this.drawStar(effectiveSize);
                break;
            case 'heart':
                this.drawHeart(effectiveSize);
                break;
        }
    }

    drawCircle(size) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    drawSquare(size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.rect(-size, -size, size * 2, size * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawTriangle(size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            let a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            ctx.lineTo(size * Math.cos(a), size * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawPentagon(size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            ctx.lineTo(size * Math.cos(a), size * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawStar(size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        const points = 5;
        const inset = 0.45; // inner ratio
        for (let i = 0; i < points * 2; i++) {
            const r = (i % 2 === 0) ? size : size * inset;
            const a = (i * Math.PI) / points - Math.PI / 2;
            ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawHeart(size) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        // Shift a bit up so the visual gravity center is close to actual center
        const topY = -size * 0.35;
        ctx.moveTo(0, topY);
        // Left lobe and point
        ctx.bezierCurveTo(-size * 0.7, topY - size * 0.7, -size * 1.2, topY + size * 0.1, 0, topY + size * 1.1);
        // Right lobe
        ctx.bezierCurveTo(size * 1.2, topY + size * 0.1, size * 0.7, topY - size * 0.7, 0, topY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Canvas Resizing Setup
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
}

// Adjust shape array length based on requested count
function adjustShapeCount() {
    const targetCount = parseInt(countInput.value);
    countVal.textContent = targetCount;

    if (shapes.length < targetCount) {
        const needed = targetCount - shapes.length;
        for (let i = 0; i < needed; i++) {
            shapes.push(new Shape());
        }
    } else if (shapes.length > targetCount) {
        shapes.length = targetCount;
    }
}

// Change dynamic active types for shapes whose current types are now disabled
function enforceActiveShapeTypes() {
    const activeTypes = Object.keys(shapeCheckboxes).filter(key => shapeCheckboxes[key].checked);
    if (activeTypes.length === 0) {
        // Enforce at least one checkbox is checked
        shapeCheckboxes.circle.checked = true;
        activeTypes.push('circle');
    }
    
    shapes.forEach(shape => {
        if (!shapeCheckboxes[shape.type].checked) {
            shape.type = activeTypes[Math.floor(Math.random() * activeTypes.length)];
        }
    });
}

// Handle Theme changes
function updateTheme() {
    shapes.forEach(shape => shape.updateColor());
}

// Handle speed slider modification
let currentSpeedSetting = parseFloat(speedInput.value);
function updateSpeed() {
    const newSpeed = parseFloat(speedInput.value);
    speedVal.textContent = newSpeed;
    shapes.forEach(shape => shape.updateSpeed(currentSpeedSetting, newSpeed));
    currentSpeedSetting = newSpeed;
}

// Reset / Randomize all shapes completely
function resetShapes() {
    shapes.forEach(shape => shape.reset());
}

// Initialization
function init() {
    resizeCanvas();
    adjustShapeCount();

    // Event Listeners for UI interaction
    window.addEventListener('resize', resizeCanvas);
    countInput.addEventListener('input', adjustShapeCount);
    speedInput.addEventListener('input', updateSpeed);
    
    sizeInput.addEventListener('input', () => {
        sizeVal.textContent = parseFloat(sizeInput.value).toFixed(1);
    });

    themeSelect.addEventListener('change', updateTheme);

    // Watch checkboxes for dynamic filters
    Object.values(shapeCheckboxes).forEach(checkbox => {
        checkbox.addEventListener('change', enforceActiveShapeTypes);
    });

    btnReset.addEventListener('click', resetShapes);

    btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            btnPause.textContent = "Resume";
            btnPause.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            btnPause.style.color = "var(--text-color)";
            btnPause.style.border = "1px solid var(--panel-border)";
        } else {
            btnPause.textContent = "Pause";
            btnPause.style.backgroundColor = "var(--accent-color)";
            btnPause.style.color = "white";
            btnPause.style.border = "none";
            // Restart frame updates smoothly
            lastTime = performance.now();
            requestAnimationFrame(animate);
        }
    });

    // Start Animation loop
    lastTime = performance.now();
    requestAnimationFrame(animate);
}

// Core animation loop
function animate(currentTime) {
    if (isPaused) return;

    requestAnimationFrame(animate);

    // Calculate FPS
    frameCount++;
    const delta = currentTime - lastTime;
    if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        fpsDisplay.textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }

    // Modern trail effect background clear
    // We draw slightly transparent dark fill to get motion trailing glow
    ctx.fillStyle = 'rgba(15, 16, 22, 0.18)'; // Adjust trails length (lower = longer trails)
    ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    // Update and draw each shape
    const boundaryMode = boundarySelect.value;
    const sizeScale = parseFloat(sizeInput.value);

    for (let i = 0; i < shapes.length; i++) {
        shapes[i].update(boundaryMode, sizeScale);
        shapes[i].draw(sizeScale);
    }
}

// Fire off the app!
window.addEventListener('DOMContentLoaded', init);
