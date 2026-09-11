/* =====================================================
   🌸 PHONG LYIZ — ULTIMATE ANIME PROFILE SCRIPT SYSTEM
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = "auto";

    const playBtn = document.getElementById("playBtn");
    const progress = document.getElementById("progress");
    const progressTrack = document.getElementById("progressTrack");
    const clock = document.getElementById("clock");
    const glow = document.querySelector(".mouse-glow");
    const canvas = document.getElementById("particles");
    const sakuraContainer = document.getElementById("sakura-container");
    const musicDisk = document.getElementById("musicDisk");
    
    /* 1. AUDIO MANAGEMENT */
    const audio = new Audio("assets/music.mp3");
    audio.loop = true;

    function startAudio() {
        audio.play()
            .then(() => { 
                if (playBtn) playBtn.textContent = "❚❚"; 
                if (musicDisk) musicDisk.classList.add("disk-spin");
            })
            .catch(() => { 
                if (playBtn) playBtn.textContent = "▶"; 
                if (musicDisk) musicDisk.classList.remove("disk-spin");
            });
    }

    startAudio();

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (audio.paused) {
                startAudio();
            } else {
                audio.pause();
                playBtn.textContent = "▶";
                if (musicDisk) musicDisk.classList.remove("disk-spin");
            }
        });
    }

    audio.addEventListener("timeupdate", () => {
        if (audio.duration && progress) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
        }
    });

    if (progressTrack) {
        progressTrack.addEventListener("click", (e) => {
            const rect = progressTrack.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (audio.duration) {
                audio.currentTime = (clickX / rect.width) * audio.duration;
            }
        });
    }

    /* 2. REALTIME CLOCK */
    function updateClock() {
        if (!clock) return;
        const now = new Date();
        clock.textContent = now.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
    }
    updateClock();
    setInterval(updateClock, 1000);

    /* 3. MOUSE GLOW EFFECT */
    if (glow) {
        window.addEventListener("mousemove", (e) => {
            requestAnimationFrame(() => {
                glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            });
        });
    }

    /* 4. PARTICLES ENGINE */
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < 70; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 0.5,
                    speed: Math.random() * 0.3 + 0.05,
                    opacity: Math.random() * 0.7 + 0.2
                });
            }
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y -= p.speed;
                if (p.y < -10) p.y = canvas.height + 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    /* 5. SAKURA PETALS FALLING (Tăng số lượng cánh hoa) */
    if (sakuraContainer) {
        function createSakuraPetal() {
            if (sakuraContainer.children.length >= 45) return;
            const petal = document.createElement("div");
            petal.className = "sakura-petal";
            const size = Math.random() * 10 + 8;
            const duration = Math.random() * 4 + 4;
            petal.style.width = `${size}px`;
            petal.style.height = `${size * 0.7}px`;
            petal.style.left = `${Math.random() * 100}vw`;
            petal.style.animationDuration = `${duration}s`;
            sakuraContainer.appendChild(petal);
            setTimeout(() => petal.remove(), duration * 1000);
        }
        setInterval(createSakuraPetal, 200);
    }

    /* 6. 3D TILT EFFECT */
    const profileCard = document.querySelector(".profile-theme-frame");
    if (profileCard) {
        profileCard.addEventListener("mousemove", (e) => {
            const rect = profileCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            profileCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
        });

        profileCard.addEventListener("mouseleave", () => {
            profileCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            profileCard.style.transition = "transform 0.5s ease";
        });

        profileCard.addEventListener("mouseenter", () => {
            profileCard.style.transition = "none";
        });
    }

    /* 7. CLICK TO COPY GAME UIDs */
    const interestTags = document.querySelectorAll(".interest-tag");
    interestTags.forEach(tag => {
        if (tag.textContent.includes("UID:")) {
            tag.style.cursor = "pointer";
            tag.title = "Click để sao chép UID";
            
            tag.addEventListener("click", () => {
                const match = tag.textContent.match(/\d+/);
                if (match) {
                    const uid = match[0];
                    navigator.clipboard.writeText(uid).then(() => {
                        showToast(`📋 Đã sao chép UID: ${uid}`);
                    });
                }
            });
        }
    });

    function showToast(text) {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.className = "toast-show";
        setTimeout(() => {
            toast.className = "";
        }, 2500);
    }
});