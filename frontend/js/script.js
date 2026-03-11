// Atribuição de eventos simplificada
document.getElementById("themeToggle").onclick = toggleTheme;
document.getElementById("tripType").onchange = toggleReturn;
document.getElementById("swapBtn").onclick = swapAirports;
document.getElementById("createAlertBtn").onclick = createAlert;
document.getElementById("clearHistoryBtn").onclick = clearHistory;

function toggleTheme() {
    document.body.classList.toggle("dark");
    const toggle = document.getElementById("themeToggle");
    const isDark = document.body.classList.contains("dark");
    toggle.innerText = isDark ? "Light Mode" : "Dark Mode";
}

function toggleReturn() {
    const trip = document.getElementById("tripType").value;
    const container = document.getElementById("returnContainer");
    container.style.opacity = trip === "oneway" ? "0.3" : "1";
    container.style.pointerEvents = trip === "oneway" ? "none" : "all";
}

function swapAirports() {
    const origin = document.getElementById("origin");
    const destination = document.getElementById("destination");
    [origin.value, destination.value] = [destination.value, origin.value];
}

function autocomplete(inputId, listId) {
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
            a.country.toLowerCase().includes(value) ||
            a.code.toLowerCase().includes(value)
        );

        results.slice(0, 8).forEach(a => {
            const div = document.createElement("div");
            div.innerText = `${a.city}, ${a.country} (${a.code})`;
            div.onclick = () => {
                input.value = `${a.city}, ${a.country} (${a.code})`;
                list.style.display = "none";
            };
            list.appendChild(div);
        });
        list.style.display = "block";
    });

    // Fecha a lista ao clicar fora
    document.addEventListener("click", (e) => {
        if (e.target !== input) list.style.display = "none";
    });
}

autocomplete("origin", "origin-list");
autocomplete("destination", "destination-list");

function createAlert() {
    const alertData = {
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        tripType: document.getElementById("tripType").value,
        departure: document.getElementById("departure").value,
        returnDate: document.getElementById("returnDate").value,
        price: document.getElementById("price").value,
        email: document.getElementById("email").value
    };

    if (!alertData.origin || !alertData.email) {
        alert("Please fill in the required fields.");
        return;
    }

    let alerts = JSON.parse(localStorage.getItem("alerts") || "[]");
    alerts.push(alertData);
    localStorage.setItem("alerts", JSON.stringify(alerts));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "";
    let alerts = JSON.parse(localStorage.getItem("alerts") || "[]");

    alerts.reverse().forEach(a => { // Mais recentes primeiro
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `<strong>${a.origin} ⇄ ${a.destination}</strong><br>
                         <small>${a.departure} | Max: $${a.price}</small>`;
        list.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Clear all alerts?")) {
        localStorage.removeItem("alerts");
        renderHistory();
    }
}

renderHistory();