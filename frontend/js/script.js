// --- Atribuição de Eventos ---
document.getElementById("themeToggle").onclick = toggleTheme;
document.getElementById("tripType").onchange = toggleReturn;
document.getElementById("swapBtn").onclick = swapAirports;
document.getElementById("createAlertBtn").onclick = createAlert;
document.getElementById("clearHistoryBtn").onclick = clearHistory;

// --- Gerenciamento de Cores (Placeholder Dinâmico) ---
const allInputs = document.querySelectorAll('input, select');

function handleColorChange(el) {
    if (el.value && el.value !== "") {
        el.classList.add('has-value');
    } else {
        el.classList.remove('has-value');
    }
}

// Inicializa a escuta de eventos para todos os inputs e selects
allInputs.forEach(input => {
    // Verifica ao carregar (para campos pré-preenchidos pelo navegador)
    handleColorChange(input);

    // Verifica ao mudar ou digitar
    input.addEventListener('change', () => handleColorChange(input));
    input.addEventListener('input', () => handleColorChange(input));
});

// --- Funções de Interface ---
function toggleTheme() {
    document.body.classList.toggle("dark");
    const toggle = document.getElementById("themeToggle");
    const isDark = document.body.classList.contains("dark");
    toggle.innerText = isDark ? "Light Mode" : "Dark Mode";
}

function toggleReturn() {
    const trip = document.getElementById("tripType").value;
    const container = document.getElementById("returnContainer");
    
    // UI Feedback para One Way
    container.style.opacity = trip === "oneway" ? "0.3" : "1";
    container.style.pointerEvents = trip === "oneway" ? "none" : "all";
    
    handleColorChange(document.getElementById("tripType"));
}

function swapAirports() {
    const origin = document.getElementById("origin");
    const destination = document.getElementById("destination");
    
    // Troca os valores
    [origin.value, destination.value] = [destination.value, origin.value];
    
    // Atualiza as cores após a troca
    handleColorChange(origin);
    handleColorChange(destination);
}

// --- Autocomplete com Estilo de Balões ---
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

        results.slice(0, 6).forEach(a => {
            const div = document.createElement("div");
            // Texto compacto para o balão
            div.innerText = `${a.city} (${a.code})`; 
            
            div.onclick = () => {
                input.value = `${a.city}, ${a.country} (${a.code})`;
                list.style.display = "none";
                // Muda a cor do texto ao selecionar do balão
                handleColorChange(input);
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

// --- Persistência de Dados (LocalStorage) ---
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
        alert("Please fill in the required fields (Origin and Email).");
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

    // Mostra os alertas mais recentes no topo
    alerts.reverse().forEach(a => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = `<strong>${a.origin} ⇄ ${a.destination}</strong><br>
                         <small>${a.departure} | Max: $${a.price || 'N/A'}</small>`;
        list.appendChild(div);
    });
}

function clearHistory() {
    if(confirm("Are you sure you want to clear all flight alerts?")) {
        localStorage.removeItem("alerts");
        renderHistory();
    }
}

// Inicializa o histórico ao abrir a página
renderHistory();