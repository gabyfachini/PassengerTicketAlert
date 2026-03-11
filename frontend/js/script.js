/**
 * UI Element Selectors
 */
const elements = {
    themeToggle: document.getElementById("themeToggle"),
    tripType: document.getElementById("tripType"),
    swapBtn: document.getElementById("swapBtn"),
    createBtn: document.getElementById("createAlertBtn"),
    clearBtn: document.getElementById("clearHistoryBtn"),
    returnContainer: document.getElementById("returnContainer"),
    departure: document.getElementById("departure"),
    returnDate: document.getElementById("returnDate"),
    historyList: document.getElementById("historyList"),
    allInputs: document.querySelectorAll('input, select')
};

// --- Initialization ---

// Event Listeners
elements.themeToggle.onclick = toggleTheme;
elements.tripType.onchange = handleTripTypeChange;
elements.swapBtn.onclick = swapAirports;
elements.createBtn.onclick = createAlert;
elements.clearBtn.onclick = clearHistory;

// Date Validation: Prevent return date from being before departure
elements.departure.addEventListener('change', (e) => {
    elements.returnDate.min = e.target.value;
});

// Input styling logic
elements.allInputs.forEach(input => {
    updateInputState(input);
    input.addEventListener('input', () => updateInputState(input));
    input.addEventListener('change', () => updateInputState(input));
});

// --- Logic Functions ---

/**
 * Updates CSS class if input has a value
 */
function updateInputState(el) {
    if (el.value && el.value !== "") {
        el.classList.add('has-value');
    } else {
        el.classList.remove('has-value');
    }
}

/**
 * Toggles Between Light and Dark Mode
 */
function toggleTheme() {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    elements.themeToggle.innerText = isDark ? "Light Mode" : "Dark Mode";
}

/**
 * Handles UI changes when switching between Round Trip and One Way
 */
function handleTripTypeChange() {
    const isOneWay = elements.tripType.value === "oneway";
    elements.returnContainer.style.opacity = isOneWay ? "0.3" : "1";
    elements.returnContainer.style.pointerEvents = isOneWay ? "none" : "all";
    
    if (isOneWay) {
        elements.returnDate.value = "";
        updateInputState(elements.returnDate);
    }
    updateInputState(elements.tripType);
}

/**
 * Swaps Origin and Destination values
 */
function swapAirports() {
    const origin = document.getElementById("origin");
    const destination = document.getElementById("destination");
    
    [origin.value, destination.value] = [destination.value, origin.value];
    
    updateInputState(origin);
    updateInputState(destination);
}

/**
 * Autocomplete Logic
 */
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    input.addEventListener("input", () => {
        const value = input.value.toLowerCase();
        list.innerHTML = "";

        if (value.length < 1) {
            list.style.display = "none";
            return;
        }

        const results = airports.filter(a =>
            a.city.toLowerCase().includes(value) ||
            a.code.toLowerCase().includes(value)
        );

        results.slice(0, 5).forEach(a => {
            const div = document.createElement("div");
            div.innerText = `${a.city} (${a.code})`; 
            div.onclick = () => {
                input.value = `${a.city} (${a.code})`;
                list.style.display = "none";
                updateInputState(input);
            };
            list.appendChild(div);
        });
        list.style.display = "flex";
    });

    document.addEventListener("click", (e) => {
        if (e.target !== input) list.style.display = "none";
    });
}

setupAutocomplete("origin", "origin-list");
setupAutocomplete("destination", "destination-list");

/**
 * Data Persistence
 */
function createAlert() {
    const data = {
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        tripType: elements.tripType.value,
        departure: elements.departure.value,
        returnDate: elements.returnDate.value,
        price: document.getElementById("price").value,
        currency: document.getElementById("currency").value,
        email: document.getElementById("email").value,
        id: Date.now()
    };

    // Simple validation
    if (!data.origin || !data.destination || !data.email || !data.departure) {
        document.getElementById("inputCard").classList.add("shake");
        setTimeout(() => document.getElementById("inputCard").classList.remove("shake"), 500);
        alert("Please fill in Origin, Destination, Departure and Email.");
        return;
    }

    let alerts = JSON.parse(localStorage.getItem("flight_alerts") || "[]");
    alerts.push(data);
    localStorage.setItem("flight_alerts", JSON.stringify(alerts));
    
    renderHistory();
}

/**
 * Renders the list of alerts from LocalStorage
 */
function renderHistory() {
    elements.historyList.innerHTML = "";
    let alerts = JSON.parse(localStorage.getItem("flight_alerts") || "[]");

    if (alerts.length === 0) {
        elements.historyList.innerHTML = "<p class='empty-msg'>No alerts created yet.</p>";
        return;
    }

    alerts.reverse().forEach(a => {
        const item = document.createElement("div");
        item.className = "history-item";
        
        const isOneWay = a.tripType === "oneway";
        const arrow = isOneWay ? " → " : " ⇄ ";
        const priceDisplay = a.price ? `${a.currency} ${a.price}` : 'No limit';
        
        // Dynamic date string
        let dateRange = a.departure;
        if (!isOneWay && a.returnDate) {
            dateRange += ` to ${a.returnDate}`;
        }

        item.innerHTML = `
            <div class="item-main">
                <span class="route">${a.origin}${arrow}${a.destination}</span>
                <span class="price-tag">${priceDisplay}</span>
            </div>
            <div class="item-footer">
                <small>${dateRange}</small>
                <small class="trip-badge">${a.tripType}</small>
            </div>
        `;
        elements.historyList.appendChild(item);
    });
}

function clearHistory() {
    if(confirm("Delete all alerts?")) {
        localStorage.removeItem("flight_alerts");
        renderHistory();
    }
}

// Initial Render
renderHistory();