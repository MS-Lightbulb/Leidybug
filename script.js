const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;

// Size config
const size = 140;
const radius = size / 2;

let startTime = null;

/* ⚙️ TEXT ADJUSTMENTS */
const TEXT_CONFIG = {
    message: "<3 you Leidybug",
    delayAfterHeart: 1500, // Time to wait (in ms) after heart fills before text appears (2.5s)
    verticalSpacing: radius * 1.7 // Spacing below the heart's bottom tip
};

/* 🐌 SLOWER TIMELINE CONFIGURATION */
const DURATIONS = {
    drawSquare: 2200,          // Slowed down from 1600
    drawCircle: 1600,          // Slowed down from 1000
    splitCircles: 1800,        // Slowed down from 1200
    rotateAntiClockwise: 1800, // Slowed down from 1200
    fillHeart: 2000,           // Slowed down from 1200 (smoother bleed-in effect)
    textFade: 1500             // Slowed down from 1200
};

const TIMELINE = {
    squareEnd: DURATIONS.drawSquare,
    circleEnd: DURATIONS.drawSquare + DURATIONS.drawCircle,
    splitEnd: DURATIONS.drawSquare + DURATIONS.drawCircle + DURATIONS.splitCircles,
    rotateEnd: DURATIONS.drawSquare + DURATIONS.drawCircle + DURATIONS.splitCircles + DURATIONS.rotateAntiClockwise,
    heartEnd: DURATIONS.drawSquare + DURATIONS.drawCircle + DURATIONS.splitCircles + DURATIONS.rotateAntiClockwise + DURATIONS.fillHeart,
    textStart: DURATIONS.drawSquare + DURATIONS.drawCircle + DURATIONS.splitCircles + DURATIONS.rotateAntiClockwise + DURATIONS.fillHeart + TEXT_CONFIG.delayAfterHeart,
    total: DURATIONS.drawSquare + DURATIONS.drawCircle + DURATIONS.splitCircles + DURATIONS.rotateAntiClockwise + DURATIONS.fillHeart + TEXT_CONFIG.delayAfterHeart + 4000
};

// smoother easing
function ease(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function draw(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffffff';

    ctx.save();
    ctx.translate(centerX, centerY + size / 4);

    /* ROTATION PHASE */
    if (elapsed > TIMELINE.splitEnd) {
        let rotateProgress = Math.min((elapsed - TIMELINE.splitEnd) / DURATIONS.rotateAntiClockwise, 1);
        rotateProgress = ease(rotateProgress);
        ctx.rotate(-rotateProgress * Math.PI / 4);
    }

    /* SQUARE DRAW */
    let sqProgress = Math.min(elapsed / DURATIONS.drawSquare, 1);

    ctx.beginPath();

    let p1 = Math.min(Math.max(sqProgress * 4, 0), 1);
    ctx.moveTo(-radius, -radius);
    ctx.lineTo(-radius + size * p1, -radius);

    let p2 = Math.min(Math.max(sqProgress * 4 - 1, 0), 1);
    if (p2 > 0) ctx.lineTo(radius, -radius + size * p2);

    let p3 = Math.min(Math.max(sqProgress * 4 - 2, 0), 1);
    if (p3 > 0) ctx.lineTo(radius - size * p3, radius);

    let p4 = Math.min(Math.max(sqProgress * 4 - 3, 0), 1);
    if (p4 > 0) ctx.lineTo(-radius, radius - size * p4);

    ctx.stroke();

    /* CIRCLES */
    let circleProgress = 0;
    let splitProgress = 0;

    if (elapsed > TIMELINE.squareEnd) {
        circleProgress = Math.min((elapsed - TIMELINE.squareEnd) / DURATIONS.drawCircle, 1);
    }

    if (elapsed > TIMELINE.circleEnd) {
        splitProgress = Math.min((elapsed - TIMELINE.circleEnd) / DURATIONS.splitCircles, 1);
        splitProgress = ease(splitProgress);
    }

    if (circleProgress > 0) {
        ctx.beginPath();
        ctx.arc(0, -splitProgress * radius, radius, 0, Math.PI * 2 * circleProgress);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(splitProgress * radius, 0, radius, 0, Math.PI * 2 * circleProgress);
        ctx.stroke();
    }

   /* FILL HEART */
    if (elapsed > TIMELINE.rotateEnd) {
        let fillProgress = Math.min((elapsed - TIMELINE.rotateEnd) / DURATIONS.fillHeart, 1);

        // Fill background behind outline
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        
        // 1. Updated to Bright Red
        ctx.fillStyle = `rgba(255, 0, 0, ${fillProgress})`;

        ctx.fillRect(-radius, -radius, size, size);

        ctx.beginPath();
        ctx.arc(0, -radius, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(radius, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Extra blending pass to clip cleanly
        ctx.save();
        ctx.globalCompositeOperation = 'source-in';
        
        // 2. Updated to Bright Red
        ctx.fillStyle = `rgba(255, 0, 0, ${fillProgress})`;
        
        ctx.fillRect(-size * 2, -size * 2, size * 4, size * 4);
        ctx.restore();
    }

    /* 💬 DELAYED CUSTOM TEXT MESSAGE */
    if (elapsed > TIMELINE.textStart) {
        let textProgress = Math.min((elapsed - TIMELINE.textStart) / DURATIONS.textFade, 1);

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${textProgress})`;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Counter-rotate text so it stays horizontally upright
        ctx.rotate(Math.PI / 4);
        
        ctx.fillText(TEXT_CONFIG.message, 0, TEXT_CONFIG.verticalSpacing);
        ctx.restore();
    }

    ctx.restore();

    if (elapsed < TIMELINE.total) {
        requestAnimationFrame(draw);
    }
}

requestAnimationFrame(draw);