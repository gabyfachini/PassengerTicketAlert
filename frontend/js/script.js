/**
 * ================================================
 * FLIGHT PRICE ALERTS — script.js
 * ================================================
 */

// ------------------------------------------------
// Element References
// ------------------------------------------------
const elements = {
    themeToggle:    document.getElementById("themeToggle"),
    themeLabel:     document.querySelector(".theme-label"),
    themeIcon:      document.querySelector(".theme-icon"),
    tripType:       document.getElementById("tripType"),
    swapBtn:        document.getElementById("swapBtn"),
    createBtn:      document.getElementById("createAlertBtn"),
    clearBtn:       document.getElementById("clearHistoryBtn"),
    returnContainer:document.getElementById("returnContainer"),
    departure:      document.getElementById("departure"),
    returnDate:     document.getElementById("returnDate"),
    historyList:    document.getElementById("historyList"),
    inputCard:      document.getElementById("inputCard"),
    toast:          document.getElementById("toast"),
    allInputs:      document.querySelectorAll("input, select"),
};

// ------------------------------------------------
// Initialization
// ------------------------------------------------
restoreTheme();
renderHistory();
setupAutocomplete("origin", "origin-list");
setupAutocomplete("destination", "destination-list");

// FIX: sync has-value on the price container (not just the inner input)
const priceInput     = document.getElementById("price");
const priceContainer = document.querySelector(".price-input-container");

function updatePriceContainer() {
    priceContainer.classList.toggle("has-value", Boolean(priceInput.value));
}

priceInput.addEventListener("input",  updatePriceContainer);
priceInput.addEventListener("change", updatePriceContainer);
updatePriceContainer();
const todayStr = new Date().toISOString().split("T")[0];
elements.departure.min = todayStr;

// Wire up events
elements.themeToggle.addEventListener("click", toggleTheme);
elements.tripType.addEventListener("change", handleTripTypeChange);
elements.swapBtn.addEventListener("click", swapAirports);
elements.createBtn.addEventListener("click", createAlert);
elements.clearBtn.addEventListener("click", clearHistory);

// FIX: Keep return date min in sync with departure
elements.departure.addEventListener("change", (e) => {
    elements.returnDate.min = e.target.value;
    // If return date is now before departure, reset it
    if (elements.returnDate.value && elements.returnDate.value < e.target.value) {
        elements.returnDate.value = "";
        updateInputState(elements.returnDate);
    }
});

// FIX: Input styling — track filled state on all inputs
elements.allInputs.forEach((input) => {
    updateInputState(input);
    input.addEventListener("input",  () => updateInputState(input));
    input.addEventListener("change", () => updateInputState(input));
});

// ------------------------------------------------
// Theme
// ------------------------------------------------

/**
 * Persists and restores dark/light preference via localStorage
 */
function restoreTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
        document.body.classList.add("dark");
        updateThemeButton(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    if (elements.themeLabel) elements.themeLabel.textContent = isDark ? "Light Mode" : "Dark Mode";
    if (elements.themeIcon)  elements.themeIcon.textContent  = isDark ? "☀️" : "🌙";
}

// ------------------------------------------------
// Input State
// ------------------------------------------------

/**
 * Adds/removes .has-value class based on whether the input has content.
 * This drives the "filled" border highlight in CSS.
 */
function updateInputState(el) {
    el.classList.toggle("has-value", Boolean(el.value && el.value !== ""));
}

// ------------------------------------------------
// Trip Type Toggle
// ------------------------------------------------

function handleTripTypeChange() {
    const isOneWay = elements.tripType.value === "oneway";

    // FIX: use a CSS class instead of inline styles for disabled state
    elements.returnContainer.classList.toggle("disabled", isOneWay);

    if (isOneWay) {
        elements.returnDate.value = "";
        updateInputState(elements.returnDate);
    }

    updateInputState(elements.tripType);
}

// ------------------------------------------------
// Swap Airports
// ------------------------------------------------

function swapAirports() {
    const origin      = document.getElementById("origin");
    const destination = document.getElementById("destination");

    [origin.value, destination.value] = [destination.value, origin.value];

    updateInputState(origin);
    updateInputState(destination);
}

// ------------------------------------------------
// Autocomplete
// ------------------------------------------------

/**
 * Attaches autocomplete behaviour to an input/list pair.
 * Suggestions display city name + airport code in a readable dropdown.
 */
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list  = document.getElementById(listId);

    input.addEventListener("input", () => {
        const value = input.value.trim().toLowerCase();
        list.innerHTML = "";

        if (value.length < 1) {
            list.style.display = "none";
            return;
        }

        const results = airports.filter(
            (a) =>
                a.city.toLowerCase().includes(value) ||
                a.code.toLowerCase().includes(value) ||
                a.name.toLowerCase().includes(value)
        );

        if (results.length === 0) {
            list.style.display = "none";
            return;
        }

        results.slice(0, 6).forEach((a) => {
            const div = document.createElement("div");
            // FIX: separate city text and code for styled display
            div.innerHTML = `<span>${a.city} — ${a.name.split(" ").slice(0, 3).join(" ")}</span><span class="code">${a.code}</span>`;
            div.addEventListener("mousedown", (e) => {
                // FIX: use mousedown so click doesn't blur the input first
                e.preventDefault();
                input.value = `${a.city} (${a.code})`;
                list.style.display = "none";
                updateInputState(input);
                input.focus();
            });
            list.appendChild(div);
        });

        list.style.display = "flex";
    });

    // FIX: close on blur rather than document click — more reliable
    input.addEventListener("blur", () => {
        setTimeout(() => (list.style.display = "none"), 150);
    });
}

// ------------------------------------------------
// Create Alert
// ------------------------------------------------

function createAlert() {
    const data = {
        origin:     document.getElementById("origin").value.trim(),
        destination:document.getElementById("destination").value.trim(),
        tripType:   elements.tripType.value,
        departure:  elements.departure.value,
        returnDate: elements.returnDate.value,
        price:      document.getElementById("price").value,
        currency:   document.getElementById("currency").value,
        email:      document.getElementById("email").value.trim(),
        id:         Date.now(),
    };

    // Validation
    const missing = [];
    if (!data.origin)      missing.push("origin");
    if (!data.destination) missing.push("destination");
    if (!data.departure)   missing.push("departure");
    if (!data.price)       missing.push("price");
    if (!data.email)       missing.push("email");

    // FIX: highlight empty required fields individually
    ["origin", "destination", "departure", "price", "email"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.classList.add("error");
            // For price, also highlight the container
            if (id === "price") priceContainer.classList.add("error");
            el.addEventListener("input", () => {
                el.classList.remove("error");
                priceContainer.classList.remove("error");
            }, { once: true });
        }
    });

    if (missing.length > 0) {
        elements.inputCard.classList.add("shake");
        setTimeout(() => elements.inputCard.classList.remove("shake"), 450);
        showToast("Please fill in all required fields.", "error");
        return;
    }

    // FIX: require return date if round trip
    if (data.tripType === "round" && !data.returnDate) {
        elements.returnDate.classList.add("error");
        elements.returnDate.addEventListener("input", () => elements.returnDate.classList.remove("error"), { once: true });
        elements.inputCard.classList.add("shake");
        setTimeout(() => elements.inputCard.classList.remove("shake"), 450);
        showToast("Please add a return date for round trips.", "error");
        return;
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        document.getElementById("email").classList.add("error");
        elements.inputCard.classList.add("shake");
        setTimeout(() => elements.inputCard.classList.remove("shake"), 450);
        showToast("Please enter a valid email address.", "error");
        return;
    }

    // Save
    const alerts = JSON.parse(localStorage.getItem("flight_alerts") || "[]");
    alerts.push(data);
    localStorage.setItem("flight_alerts", JSON.stringify(alerts));

    showToast("Alert created! ✓", "success");
    renderHistory();
}

// ------------------------------------------------
// Render History
// ------------------------------------------------

function renderHistory() {
    elements.historyList.innerHTML = "";
    const alerts = JSON.parse(localStorage.getItem("flight_alerts") || "[]");

    if (alerts.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔔</div>
                <p>No alerts yet. Create one above!</p>
            </div>`;
        return;
    }

    // Most recent first
    [...alerts].reverse().forEach((a) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const isOneWay    = a.tripType === "oneway";
        const arrow       = isOneWay ? "→" : "⇄";
        const priceDisplay = a.price ? `${a.currency} ${Number(a.price).toLocaleString()}` : "Any price";
        const dateRange   = isOneWay || !a.returnDate
            ? formatDate(a.departure)
            : `${formatDate(a.departure)} – ${formatDate(a.returnDate)}`;

        item.innerHTML = `
            <div class="item-main">
                <span class="route">${a.origin} ${arrow} ${a.destination}</span>
                <span class="price-tag">${priceDisplay}</span>
            </div>
            <div class="item-footer">
                <small>${dateRange}</small>
                <span class="trip-badge">${isOneWay ? "One Way" : "Round Trip"}</span>
            </div>`;

        elements.historyList.appendChild(item);
    });
}

// ------------------------------------------------
// Clear History
// ------------------------------------------------

function clearHistory() {
    if (confirm("Delete all flight alerts?")) {
        localStorage.removeItem("flight_alerts");
        renderHistory();
        showToast("All alerts cleared.", "");
    }
}

// ------------------------------------------------
// Utilities
// ------------------------------------------------

/**
 * Formats an ISO date string (YYYY-MM-DD) to a readable format.
 * e.g. "2024-08-15" → "Aug 15, 2024"
 * FIX: avoids timezone offset issues by parsing manually
 */
function formatDate(str) {
    if (!str) return "";
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
    });
}

/**
 * Shows a transient toast notification.
 * @param {string} message
 * @param {"success"|"error"|""} type
 */
function showToast(message, type = "") {
    const toast = elements.toast;
    toast.textContent = message;
    toast.className = `toast${type ? " " + type : ""} show`;

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}