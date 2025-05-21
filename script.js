const API_KEY = "0ac1f472c69044e99502d7ca8e16881e";
const stocks = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META", "NFLX"];

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    updateThemeButton();
});

function updateThemeButton() {
    const btn = document.getElementById("theme-toggle");
    btn.textContent = document.body.dataset.theme === "dark" ? "Light Mode" : "Dark Mode";
}

async function fetchStockData(symbol) {
    try {
        const response = await fetch(
            `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=${API_KEY}`
        );
        const data = await response.json();
        
        return {
            symbol: symbol,
            price: data.values[0].close,
            change: ((data.values[0].close - data.values[1].close) / data.values[1].close * 100).toFixed(2),
            history: data.values.slice(0, 30).reverse()
        };
    } catch (error) {
        console.error(`Fehler bei ${symbol}:`, error);
        return null;
    }
}

function renderChart(stockData) {
    const ctx = document.getElementById("market-chart").getContext("2d");
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: stockData.map(s => s.symbol),
            datasets: [{
                label: 'Aktuelle Preise',
                data: stockData.map(s => s.price),
                backgroundColor: stocks.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

async function loadStocks() {
    const container = document.getElementById("stock-container");
    container.innerHTML = "<p>Lade Daten...</p>";
    
    const stockData = [];
    for (const symbol of stocks) {
        const data = await fetchStockData(symbol);
        if (!data) continue;
        
        stockData.push(data);
        
        const card = document.createElement("div");
        card.className = "stock-card";
        card.innerHTML = `
            <h3>${data.symbol}</h3>
            <div class="stock-price">$${data.price}</div>
            <div class="${data.change >= 0 ? 'up' : 'down'}">
                ${data.change >= 0 ? '+' : ''}${data.change}%
            </div>
        `;
        container.appendChild(card);
    }
    
    renderChart(stockData);
}

// Start
window.addEventListener("load", () => {
    loadStocks();
    updateThemeButton();
});
