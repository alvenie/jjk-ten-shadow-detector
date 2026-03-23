const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const summonText = document.getElementById('summon-text');

canvasElement.width = 640;
canvasElement.height = 480;

// Helper function to calculate 3D distance between two landmarks
function calculateDistance(point1, point2) {
    return Math.sqrt(
        Math.pow(point1.x - point2.x, 2) +
        Math.pow(point1.y - point2.y, 2) +
        Math.pow(point1.z - point2.z, 2)
    );
}

// Helper function to check if a specific finger is extended
// checking if the fingertip is further from the wrist than the middle joint (PIP)
function isFingerExtended(handLandmarks, tipIndex, pipIndex) {
    const wrist = handLandmarks[0]
    const tip = handLandmarks[tipIndex]
    const pip = handLandmarks[pipIndex]

    return calculateDistance(wrist, tip) > calculateDistance(wrist, pip)
}

// DIVINE DOG LOGIC
// Helper function to define the specific hand shapes for Divine (Clenched Fist)
function isTopHandShape(hand) {

    // All fingers should be clenched
    const indexUp = isFingerExtended(hand, 8, 6)
    const middleUp = isFingerExtended(hand, 12, 10)
    const ringUp = isFingerExtended(hand, 16, 14)
    const pinkyUp = isFingerExtended(hand, 20, 18)

    return !indexUp && !middleUp && !ringUp && !pinkyUp
}

// Helper function for the bottom hand (The Dog's Snout)
function isBottomHandShape(hand) {

    // Index, Middle, Ring, and Pinky all extended
    const indexUp = isFingerExtended(hand, 8, 6)
    const middleUp = isFingerExtended(hand, 12, 10)
    const ringUp = isFingerExtended(hand, 16, 14)
    const pinkyUp = isFingerExtended(hand, 20, 18)

    if (!(indexUp && middleUp && ringUp && pinkyUp)) {
        return false; // If they aren't all extended, it's not the right shape
    }

    // Gap Math
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];
    const pinkyTip = hand[20];

    // Get the distance between the fingers
    const indexMiddleDist = calculateDistance(indexTip, middleTip) // Top snout
    const middleRingDist = calculateDistance(middleTip, ringTip) // The mouth
    const ringPinkyDist = calculateDistance(ringTip, pinkyTip) // Bottom jaw

    // Constants for min or max thresholds (0.05 = roughly 5% of the screen distance)
    const TOUCHING_THRESHOLD = 0.10;
    const GAP_THRESHOLD = 0.15;

    // Check if the fingers are in the correct positions
    const isTopSnoutTouching = indexMiddleDist < TOUCHING_THRESHOLD;

    const isBottomJawTouching = ringPinkyDist < TOUCHING_THRESHOLD;

    const isGap = middleRingDist > GAP_THRESHOLD;

    return isTopSnoutTouching && isBottomJawTouching && isGap;
}

// Toad (GAMA) Logic
function isToadShape(hand1, hand2) {
    // 1. Are the thumbs touching?
    const thumbsTouching = calculateDistance(hand1[4], hand2[4]) < 0.08;
    
    // 2. Are the index fingers touching?
    const indexesTouching = calculateDistance(hand1[8], hand2[8]) < 0.08;

    // 3. Are the middle fingers touching?
    const middlesTouching = calculateDistance(hand1[12], hand2[12]) < 0.08;

    // 3. Are the wrists pushed apart?
    const wristsApart = calculateDistance(hand1[0], hand2[0]) > 0.12;

    // 4. Is there an open gap between the thumbs and index fingers?
    const hand1Gap = calculateDistance(hand1[4], hand1[8]) > 0.08;
    const hand2Gap = calculateDistance(hand2[4], hand2[8]) > 0.08;

    return thumbsTouching && indexesTouching && middlesTouching && wristsApart && hand1Gap && hand2Gap;
}

// Runs every time MediaPipe processes a frame
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the camera frame
    // Note: We mirror the canvas horizontally so it acts like a mirror
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let detectedSign = null;
    try {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Draw the skeletal landmarks on your hands
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#555555', lineWidth: 2});
                drawLandmarks(canvasCtx, landmarks, {color: '#FFFFFF', lineWidth: 1, radius: 2});
            }

            // DIVINE DOGS DETECTION LOGIC
            // MediaPipe returns 21 landmarks per hand. Landmark 0 is the wrist, 8 is the index fingertip.
            // Coordinates (x,y,z) are normalized between 0.0 and 1.0.
            if (results.multiHandLandmarks.length === 2) {
                const hand1 = results.multiHandLandmarks[0];
                const hand2 = results.multiHandLandmarks[1];

                // 1. Check if hands are clasped together (distance between wrists is very small)
                const wristDistance = calculateDistance(hand1[0], hand2[0]);
                const handsClasped = wristDistance < 0.4; // 40% of the screen distance
                
                // 2. Does one hand match the top shape, and the other match the bottom
                const combo1 = isTopHandShape(hand1) && isBottomHandShape(hand2);
                const combo2 = isTopHandShape(hand2) && isBottomHandShape(hand1);
                
                // Check for divine dogs
                if (handsClasped && (combo1 || combo2)){
                    detectedSign = "DIVINE_DOGS";
                }
                // Check for Toad
                else if (isToadShape(hand1, hand2)) {
                    detectedSign = "TOAD";
                }
            }
        }
    } catch (error) {
        console.error("Error processing hand landmarks:", error);
    }

    canvasCtx.restore();

    // Update UI
    if (detectedSign === "DIVINE_DOGS") {
        summonText.innerText = "Summoning: Divine Dogs!";
        summonText.style.color = "#FF9800"; // Orange
    } else if (detectedSign === "TOAD") {
        summonText.innerText = "Summoning: Toad!";
        summonText.style.color = "#4CAF50"; // Green
    } else {
        summonText.innerText = "Awaiting Sign...";
        summonText.style.color = "#FFF";
    }
}

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2, // We need exactly 2 hands for almost all Ten Shadows signs
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);

// Start the webcam feed
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 480
});

camera.start();