const API = "/api";

// ======================================
// ELEMENTS
// ======================================

const urlForm = document.getElementById("urlForm");
const longUrl = document.getElementById("longUrl");
const customAlias = document.getElementById("customAlias");
const expiry = document.getElementById("expiry");

const resultBox = document.getElementById("resultBox");
const shortUrl = document.getElementById("shortUrl");

const copyBtn = document.getElementById("copyBtn");
const qrBtn = document.getElementById("qrBtn");
const shareBtn = document.getElementById("shareBtn");

const themeBtn = document.getElementById("themeBtn");

const toast = document.getElementById("toast");

const qrModal = document.getElementById("qrModal");
const closeModal = document.getElementById("closeModal");

const qrCode = document.getElementById("qrcode");
const downloadQR = document.getElementById("downloadQR");


// ======================================
// TOAST
// ======================================

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


// ======================================
// CREATE SHORT URL
// ======================================

if (urlForm) {
    urlForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const originalUrl = longUrl.value.trim();
        const alias = customAlias.value.trim();
        const expiryValue = expiry.value;

        if (!originalUrl) {
            showToast("Please enter a URL.");
            return;
        }

        const button = urlForm.querySelector("button[type='submit']");
        button.disabled = true;
        button.innerHTML = "⏳ Creating...";

        try {
            // FIXED: Backtick close matching corrected
            const response = await fetch(`${API}/shorten`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    originalUrl: originalUrl,
                    customAlias: alias,
                    expiry: expiryValue
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to create short URL.");
            }

            if (!data.shortUrl) {
                throw new Error("Short URL not received from server.");
            }

            shortUrl.textContent = data.shortUrl;
            resultBox.classList.remove("hidden");
            showToast("Short URL created successfully! 🎉");
            urlForm.reset();

        } catch (error) {
            console.error("Short URL Error:", error);
            showToast(error.message);
        } finally {
            button.disabled = false;
            button.innerHTML = "<span>⚡</span> Shorten URL";
        }
    });
}


// ======================================
// COPY SHORT URL
// ======================================

if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
        const url = shortUrl.textContent.trim();
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            showToast("Short URL copied! 📋");
            copyBtn.textContent = "✓";

            setTimeout(function () {
                copyBtn.textContent = "📋";
            }, 1500);
        } catch (error) {
            console.error("Copy Error:", error);
            showToast("Could not copy URL.");
        }
    });
}


// ======================================
// QR CODE
// ======================================

if (qrBtn) {
    qrBtn.addEventListener("click", function () {
        const url = shortUrl.textContent.trim();
        if (!url) return;

        if (typeof QRCode === "undefined") {
            showToast("QR Code library not loaded.");
            return;
        }

        qrCode.innerHTML = "";

        new QRCode(qrCode, {
            text: url,
            width: 180,
            height: 180
        });

        qrModal.classList.remove("hidden");
    });
}


// ======================================
// CLOSE QR MODAL
// ======================================

if (closeModal) {
    closeModal.addEventListener("click", function () {
        qrModal.classList.add("hidden");
    });
}

if (qrModal) {
    qrModal.addEventListener("click", function (event) {
        if (event.target === qrModal) {
            qrModal.classList.add("hidden");
        }
    });
}


// ======================================
// DOWNLOAD QR
// ======================================

if (downloadQR) {
    downloadQR.addEventListener("click", function () {
        const canvas = qrCode.querySelector("canvas");
        const image = qrCode.querySelector("img");

        if (canvas) {
            const link = document.createElement("a");
            link.download = "linkify3d-qr.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
            showToast("QR Code downloaded! 📥");
        } else if (image) {
            const link = document.createElement("a");
            link.download = "linkify3d-qr.png";
            link.href = image.src;
            link.click();
            showToast("QR Code downloaded! 📥");
        } else {
            showToast("QR Code is not ready.");
        }
    });
}


// ======================================
// SHARE
// ======================================

if (shareBtn) {
    shareBtn.addEventListener("click", async function () {
        const url = shortUrl.textContent.trim();
        if (!url) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Linkify3D Short URL",
                    text: "Check this link:",
                    url: url
                });
            } catch (error) {
                console.log("Share cancelled.");
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                showToast("Sharing not supported. URL copied! 📋");
            } catch (error) {
                showToast("Could not copy URL.");
            }
        }
    });
}


// ======================================
// DARK / LIGHT MODE
// ======================================

if (themeBtn) {
    themeBtn.addEventListener("click", function () {
        document.body.classList.toggle("light");
        const isLight = document.body.classList.contains("light");
        themeBtn.textContent = isLight ? "☀️" : "🌙";
    });
}


// ======================================
// 3D CARD EFFECT
// ======================================

const tiltCard = document.querySelector(".tilt-card");

if (tiltCard) {
    tiltCard.addEventListener("mousemove", function (event) {
        const rect = tiltCard.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    tiltCard.addEventListener("mouseleave", function () {
        tiltCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
}