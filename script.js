/* =========================================================
   PHONG LYIZ — CINEMATIC PROFILE ENGINE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       DOM
    ===================================================== */

    const bootScreen = document.getElementById("boot-screen");
    const bootText = document.getElementById("boot-text");
    const bootProgress = document.getElementById("boot-progress-fill");
    const bootPercent = document.getElementById("boot-percent");

    const musicUnlock = document.getElementById("music-unlock");
    const enterBtn = document.getElementById("enterBtn");
    const skipMusicBtn = document.getElementById("skipMusicBtn");

    const audio = document.getElementById("bgMusic");

    const playBtn = document.getElementById("playBtn");
    const soundToggle = document.getElementById("soundToggle");
    const volumeSlider = document.getElementById("volumeSlider");

    const progress = document.getElementById("progress");
    const progressTrack = document.getElementById("progressTrack");

    const musicDisk = document.getElementById("musicDisk");
    const visualizer = document.getElementById("visualizer");

    const clock = document.getElementById("clock");
    const footerClock = document.getElementById("footerClock");
    const date = document.getElementById("date");

    const glow = document.querySelector(".mouse-glow");
    const profileCard = document.getElementById("profileCard");

    const particlesCanvas = document.getElementById("particles");
    const ambientCanvas = document.getElementById("ambient-canvas");
    const sakuraContainer = document.getElementById("sakura-container");

    const cursorTrail = document.getElementById("cursor-trail");
    const backTop = document.getElementById("backTop");


    /* =====================================================
       CONFIG
    ===================================================== */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const savedVolume = Number(
        localStorage.getItem("phongMusicVolume")
    );

    let musicVolume = Number.isFinite(savedVolume)
        ? savedVolume
        : 0.45;

    let musicEnabled =
        localStorage.getItem("phongMusicEnabled") !== "false";


    /* =====================================================
       AUDIO STATE
    ===================================================== */

    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let audioStarted = false;

    if (audio) {
        audio.volume = musicVolume;
    }

    if (volumeSlider) {
        volumeSlider.value = String(musicVolume);
    }


    /* =====================================================
       BOOT ENGINE
    ===================================================== */

    const bootMessages = [
        "INITIALIZING PROFILE ENGINE...",
        "LOADING VISUAL CORE...",
        "CONNECTING TO PHONG LYIZ...",
        "LOADING ANIME MODULE...",
        "STARTING NEON SYSTEM...",
        "SYSTEM ONLINE."
    ];

    let bootValue = 0;
    let bootFinished = false;

    const bootTimer = setInterval(() => {

        bootValue += Math.random() * 9 + 6;

        if (bootValue >= 100) {
            bootValue = 100;
            bootFinished = true;
        }

        if (bootProgress) {
            bootProgress.style.width = `${bootValue}%`;
        }

        if (bootPercent) {
            bootPercent.textContent = `${Math.floor(bootValue)}%`;
        }

        const messageIndex = Math.min(
            bootMessages.length - 1,
            Math.floor(
                bootValue /
                (100 / bootMessages.length)
            )
        );

        if (bootText) {
            bootText.textContent = bootMessages[messageIndex];
        }

        if (bootFinished) {

            clearInterval(bootTimer);

            setTimeout(() => {
                if (bootScreen) {
                    bootScreen.classList.add("boot-finished");
                }
            }, 500);
        }

    }, 100);


    /* =====================================================
       AUDIO VISUALIZER SETUP
    ===================================================== */

    function setupAudioVisualizer() {

        if (audioContext || !audio) {
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        try {

            audioContext = new AudioContextClass();

            sourceNode = audioContext.createMediaElementSource(audio);

            analyser = audioContext.createAnalyser();

            analyser.fftSize = 64;

            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

        } catch (error) {

            console.warn(
                "Audio visualizer unavailable:",
                error
            );

        }
    }


    /* =====================================================
       AUDIO VISUALIZER RENDER
    ===================================================== */

    const visualizerBars = [];
    let visualizerFrame = null;

    function createVisualizerBars() {

        if (!visualizer || visualizerBars.length) {
            return;
        }

        const barCount = 18;

        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement("span");
            bar.style.height = "3px";
            visualizer.appendChild(bar);
            visualizerBars.push(bar);
        }
    }

    function resetVisualizer() {
        visualizerBars.forEach((bar) => {
            bar.style.height = "3px";
        });
    }

    function renderVisualizer() {

        visualizerFrame = null;

        if (
            !analyser ||
            !audioStarted ||
            !audio ||
            audio.paused ||
            document.hidden
        ) {
            return;
        }

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        visualizerBars.forEach((bar, index) => {
            const dataIndex = Math.floor(
                index * data.length / visualizerBars.length
            );

            const height = Math.max(
                3,
                (data[dataIndex] || 0) / 255 * 24
            );

            bar.style.height = `${height}px`;
        });

        visualizerFrame = requestAnimationFrame(renderVisualizer);
    }

    function startVisualizer() {

        createVisualizerBars();

        if (visualizerFrame === null) {
            visualizerFrame = requestAnimationFrame(renderVisualizer);
        }
    }

    createVisualizerBars();


    /* =====================================================
       MUSIC CONTROLS
    ===================================================== */

    async function startMusic() {

        if (!audio) {
            return false;
        }

        try {

            setupAudioVisualizer();

            if (
                audioContext &&
                audioContext.state === "suspended"
            ) {
                await audioContext.resume();
            }

            await audio.play();

            audioStarted = true;
            musicEnabled = true;

            localStorage.setItem("phongMusicEnabled", "true");

            if (playBtn) {
                playBtn.textContent = "❚❚";
            }

            if (musicDisk) {
                musicDisk.classList.add("disk-spin");
            }

            if (musicUnlock) {
                musicUnlock.classList.add("hidden");
            }

            startVisualizer();

            return true;

        } catch (error) {

            console.warn(
                "Browser blocked audio play:",
                error
            );

            audioStarted = false;

            if (playBtn) {
                playBtn.textContent = "▶";
            }

            return false;
        }
    }


    function stopMusic() {

        if (!audio) {
            return;
        }

        audio.pause();

        audioStarted = false;
        musicEnabled = false;

        localStorage.setItem("phongMusicEnabled", "false");

        if (playBtn) {
            playBtn.textContent = "▶";
        }

        if (musicDisk) {
            musicDisk.classList.remove("disk-spin");
        }

        resetVisualizer();
    }


    async function toggleMusic() {

        if (!audio) {
            return;
        }

        if (audio.paused) {
            await startMusic();
        } else {
            stopMusic();
        }
    }


    /* =====================================================
       EVENT LISTENERS (EXPLICIT USER ACTION ONLY)
    ===================================================== */

    if (enterBtn) {
        enterBtn.addEventListener("click", async (event) => {
            event.stopPropagation();
            await startMusic();
        });
    }

    if (skipMusicBtn) {
        skipMusicBtn.addEventListener("click", () => {
            musicEnabled = false;
            localStorage.setItem("phongMusicEnabled", "false");

            if (musicUnlock) {
                musicUnlock.classList.add("hidden");
            }
        });
    }

    if (!musicEnabled && musicUnlock) {
        musicUnlock.classList.add("hidden");
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && audioStarted && audio && !audio.paused) {
            startVisualizer();
        }
    });

    if (playBtn) {
        playBtn.addEventListener("click", async (event) => {
            event.stopPropagation();
            await toggleMusic();
        });
    }

    if (soundToggle) {
        soundToggle.addEventListener("click", async () => {
            await toggleMusic();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("input", () => {

            const value = Number(volumeSlider.value);

            musicVolume = Math.max(0, Math.min(1, value));

            if (audio) {
                audio.volume = musicVolume;
            }

            localStorage.setItem("phongMusicVolume", String(musicVolume));

            if (soundToggle) {
                soundToggle.textContent = musicVolume === 0 ? "MUTED" : "SOUND";
            }
        });
    }


    /* =====================================================
       AUDIO PROGRESS
    ===================================================== */

    if (audio) {

        audio.addEventListener("timeupdate", () => {

            if (!audio.duration || !progress) {
                return;
            }

            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
        });

        audio.addEventListener("error", () => {
            console.warn("Không tải được assets/music.mp3");
            showToast("⚠️ Không tìm thấy assets/music.mp3");
        });
    }


    if (progressTrack && audio) {

        progressTrack.addEventListener("click", (event) => {

            if (!audio.duration) {
                return;
            }

            const rect = progressTrack.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));

            audio.currentTime = ratio * audio.duration;
        });
    }


    /* =====================================================
       CLOCK
    ===================================================== */

    function updateClock() {

        const now = new Date();

        const time = now.toLocaleTimeString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false
        });

        const currentDate = now.toLocaleDateString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

        if (clock) {
            clock.textContent = time;
        }

        if (footerClock) {
            footerClock.textContent = time;
        }

        if (date) {
            date.textContent = currentDate;
        }
    }

    updateClock();
    setInterval(updateClock, 1000);


    /* =====================================================
       MOUSE GLOW
    ===================================================== */

    if (glow && !reducedMotion && window.innerWidth > 700) {

        let mouseX = 0;
        let mouseY = 0;
        let glowX = 0;
        let glowY = 0;

        window.addEventListener("mousemove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        }, { passive: true });

        function animateGlow() {
            glowX += (mouseX - glowX) * 0.09;
            glowY += (mouseY - glowY) * 0.09;

            glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;

            requestAnimationFrame(animateGlow);
        }

        animateGlow();
    }


    /* =====================================================
       CURSOR TRAIL
    ===================================================== */

    if (cursorTrail && !reducedMotion && window.innerWidth > 700) {

        const dots = [];

        for (let i = 0; i < 10; i++) {
            const dot = document.createElement("span");
            dot.className = "cursor-dot";
            cursorTrail.appendChild(dot);

            dots.push({
                element: dot,
                x: 0,
                y: 0
            });
        }

        let mouseX = 0;
        let mouseY = 0;

        window.addEventListener("mousemove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        }, { passive: true });

        function animateTrail() {
            let x = mouseX;
            let y = mouseY;

            dots.forEach((dot, index) => {
                const easing = 0.28 - index * 0.015;

                dot.x += (x - dot.x) * easing;
                dot.y += (y - dot.y) * easing;

                dot.element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
                dot.element.style.opacity = String(1 - index / dots.length);
                dot.element.style.scale = String(1 - index / (dots.length * 1.2));

                x = dot.x;
                y = dot.y;
            });

            requestAnimationFrame(animateTrail);
        }

        animateTrail();
    }


    /* =====================================================
       PARTICLE ENGINE
    ===================================================== */

    if (particlesCanvas && !reducedMotion) {

        const ctx = particlesCanvas.getContext("2d");
        let particles = [];
        let width = 0;
        let height = 0;

        function resizeParticles() {

            width = window.innerWidth;
            height = window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            particlesCanvas.width = width * dpr;
            particlesCanvas.height = height * dpr;

            particlesCanvas.style.width = `${width}px`;
            particlesCanvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            particles = [];
            const count = width < 700 ? 45 : 85;

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.3 + 0.05,
                    drift: (Math.random() - 0.5) * 0.15,
                    opacity: Math.random() * 0.7 + 0.2,
                    hue: Math.random() > 0.5 ? 190 : 320
                });
            }
        }

        function animateParticles() {

            ctx.clearRect(0, 0, width, height);

            for (const particle of particles) {

                particle.y -= particle.speed;
                particle.x += particle.drift;

                if (particle.y < -20) particle.y = height + 20;
                if (particle.x < -20) particle.x = width + 20;
                if (particle.x > width + 20) particle.x = -20;

                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.size * 5
                );

                gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${particle.opacity})`);
                gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 70%, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animateParticles);
        }

        resizeParticles();
        window.addEventListener("resize", resizeParticles);
        animateParticles();
    }


    /* =====================================================
       AMBIENT LIGHT ENGINE
    ===================================================== */

    if (ambientCanvas && !reducedMotion) {

        const ctx = ambientCanvas.getContext("2d");
        let width = window.innerWidth;
        let height = window.innerHeight;
        let time = 0;

        function resizeAmbient() {

            width = window.innerWidth;
            height = window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            ambientCanvas.width = width * dpr;
            ambientCanvas.height = height * dpr;

            ambientCanvas.style.width = `${width}px`;
            ambientCanvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function animateAmbient() {

            time += 0.003;
            ctx.clearRect(0, 0, width, height);

            const blobs = [
                {
                    x: width * (0.25 + Math.sin(time) * 0.08),
                    y: height * (0.30 + Math.cos(time) * 0.08),
                    radius: 280,
                    color: "rgba(34,211,238,0.06)"
                },
                {
                    x: width * (0.78 + Math.cos(time * 0.8) * 0.08),
                    y: height * (0.65 + Math.sin(time * 0.7) * 0.08),
                    radius: 350,
                    color: "rgba(244,114,182,0.05)"
                }
            ];

            for (const blob of blobs) {

                const gradient = ctx.createRadialGradient(
                    blob.x,
                    blob.y,
                    0,
                    blob.x,
                    blob.y,
                    blob.radius
                );

                gradient.addColorStop(0, blob.color);
                gradient.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animateAmbient);
        }

        resizeAmbient();
        window.addEventListener("resize", resizeAmbient);
        animateAmbient();
    }


    /* =====================================================
       SAKURA ENGINE
    ===================================================== */

    if (sakuraContainer && !reducedMotion) {

        const sakuraPalettes = [
            {
                light: "#ffe8f0",
                mid: "#ffacc8",
                deep: "#ee5e95",
                vein: "rgba(196, 36, 96, 0.56)"
            },
            {
                light: "#fff0f5",
                mid: "#ffc1d6",
                deep: "#f779aa",
                vein: "rgba(191, 49, 111, 0.50)"
            },
            {
                light: "#ffe3ec",
                mid: "#ff9fc2",
                deep: "#e84e89",
                vein: "rgba(174, 24, 82, 0.55)"
            }
        ];

        function randomBetween(min, max) {
            return Math.random() * (max - min) + min;
        }

        function createSakura() {

            if (sakuraContainer.children.length >= 48) {
                return;
            }

            const petal = document.createElement("div");
            petal.className = "sakura-petal";

            const size = randomBetween(8, 18);
            const duration = randomBetween(8, 14);
            const delay = Math.random() * -duration;
            const palette = sakuraPalettes[
                Math.floor(Math.random() * sakuraPalettes.length)
            ];

            petal.style.width = `${size}px`;
            petal.style.height = `${size * randomBetween(0.62, 0.74)}px`;
            petal.style.left = `${Math.random() * 100}vw`;
            petal.style.animationDuration = `${duration}s`;
            petal.style.animationDelay = `${delay}s`;
            petal.style.opacity = String(randomBetween(0.58, 0.93));
            petal.style.filter = `blur(${randomBetween(0, 0.38)}px)`;

            petal.style.setProperty("--petal-light", palette.light);
            petal.style.setProperty("--petal-mid", palette.mid);
            petal.style.setProperty("--petal-deep", palette.deep);
            petal.style.setProperty("--petal-vein", palette.vein);

            for (let step = 1; step <= 4; step++) {
                petal.style.setProperty(
                    `--sway-${step}`,
                    `${Math.round(randomBetween(-68, 68))}px`
                );
            }

            petal.style.setProperty(
                "--spin-0",
                `${Math.round(randomBetween(-25, 25))}deg`
            );

            for (let step = 1; step <= 4; step++) {
                petal.style.setProperty(
                    `--spin-${step}`,
                    `${Math.round(randomBetween(step * 70, step * 130))}deg`
                );
            }

            for (let step = 0; step <= 4; step++) {
                petal.style.setProperty(
                    `--scale-${step}`,
                    String(randomBetween(0.84, 1.08))
                );
            }

            sakuraContainer.appendChild(petal);

            setTimeout(() => {
                petal.remove();
            }, (duration + 2) * 1000);
        }

        for (let i = 0; i < 15; i++) {
            createSakura();
        }

        setInterval(createSakura, 285);
    }


    /* =====================================================
       3D TILT
    ===================================================== */

    if (profileCard && !reducedMotion && window.innerWidth > 700) {

        let cardRect = null;

        profileCard.addEventListener("mouseenter", () => {
            cardRect = profileCard.getBoundingClientRect();
            profileCard.style.transition = "none";
        });

        profileCard.addEventListener("mousemove", (event) => {

            if (!cardRect) {
                cardRect = profileCard.getBoundingClientRect();
            }

            const x = event.clientX - cardRect.left;
            const y = event.clientY - cardRect.top;

            const centerX = cardRect.width / 2;
            const centerY = cardRect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -2.7;
            const rotateY = ((x - centerX) / centerX) * 2.7;

            profileCard.style.transform =
                `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0) scale3d(1.006,1.006,1.006)`;
        });

        profileCard.addEventListener("mouseleave", () => {
            profileCard.style.transition = "transform 0.7s cubic-bezier(.2,.8,.2,1)";
            profileCard.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0) scale3d(1,1,1)";
            cardRect = null;
        });
    }


    /* =====================================================
       COPY UID
    ===================================================== */

    const interestTags = document.querySelectorAll(".interest-tag");

    interestTags.forEach((tag) => {

        if (tag.textContent.includes("UID:")) {

            tag.title = "Click để sao chép UID";

            tag.addEventListener("click", async () => {

                const match = tag.textContent.match(/\d{6,}/);

                if (!match) {
                    return;
                }

                const uid = match[0];

                try {
                    await navigator.clipboard.writeText(uid);
                    showToast(`📋 Đã sao chép UID: ${uid}`);
                } catch {
                    showToast("⚠️ Không thể sao chép UID");
                }
            });
        }
    });


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;

    function showToast(message) {

        let toast = document.getElementById("toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            document.body.appendChild(toast);
        }

        clearTimeout(toastTimer);

        toast.textContent = message;
        toast.classList.add("toast-show");

        toastTimer = setTimeout(() => {
            toast.classList.remove("toast-show");
        }, 2400);
    }


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    if (backTop) {
        function updateBackTopVisibility() {
            if (window.scrollY > 500) {
                backTop.classList.add("visible");
            } else {
                backTop.classList.remove("visible");
            }
        }

        window.addEventListener(
            "scroll",
            updateBackTopVisibility,
            { passive: true }
        );

        updateBackTopVisibility();

        backTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });
        });
    }

});
