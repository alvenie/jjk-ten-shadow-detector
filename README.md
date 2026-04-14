# JJK Ten Shadow Detector

A real-time, browser-based hand gesture recognition tool that "summons" the **Ten Shadows Technique** (十種影法術) from *Jujutsu Kaisen*. This project uses **MediaPipe** to track hand landmarks and identify the specific "Seals" used to call forth Shikigami.

---

## Overview

This application bridges the gap between the Zenin Clan's inherited technique and computer vision. By analyzing 21 3D hand landmarks in real-time, the detector recognizes the unique finger orientations and hand overlaps required for Megumi Fushiguro’s techniques.

### Currently Supported Shikigami
* **Divine Dogs (玉犬):** Interlocked fingers with thumbs raised.
* **Toad (蝦蟇):** Specific interlocking of pinky fingers.

### In development
* **Nue (鵺):** Crossed wrists with palms splayed like wings.
* **Max Elephant (満象):** Vertical stacking of palms to mimic a trunk.
* **Mahoraga (魔虚羅):** The Eight-Handled Sword Divergent Sila Divine General.

---

## Tech Stack

* **Logic:** Vanilla JavaScript
* **AI Engine:** [Google MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
* **Rendering:** HTML5 Canvas & CSS3
* **Environment:** Visual Studio Code + Live Server

---

## Getting Started

Because MediaPipe requires a secure context (HTTPS or Localhost) to access your webcam, you **must** run this via a local server.

### Prerequisites
1.  **Visual Studio Code** installed.
2.  **Live Server** extension (by Ritwick Dey) installed from the VS Code Marketplace.

### Installation & Launch
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/alvenie/jjk-ten-shadow-detector.git
    cd jjk-ten-shadow-detector
    ```
2.  **Open in VS Code:**
    ```bash
    code .
    ```
3.  **Go Live:**
    * Right-click `index.html` in the file explorer.
    * Select **"Open with Live Server"**.
    * Grant the browser permission to use your **Webcam**.

---
