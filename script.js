const API_KEY = "0ac1f472c69044e99502d7ca8e16881e";
const stocks = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META", "NFLX"];

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark";
    updateThemeButton();
    localStorage.setItem("themePreference", document.body.dataset.theme);
});

function updateThemeButton() {
    const btn = document.getElementById("theme-toggle");
    btn.textContent = document.body.dataset.theme === "dark" ? "Light Mode" : "Dark Mode";
}

async function fetchStockData(symbol) {
    try {
        const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=${API_KEY}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.status === "error") throw new Error(data.message);

        return {
            symbol: symbol,
            price: parseFloat(data.values[0].close).toFixed(2),
            change: ((data.values[0].close - data.values[1].close) / data.values[1].close * 100).toFixed(2),
            history: data.values.slice(0, 30).reverse()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
    }
}

function renderChart(stockData) {
    const ctx = document.getElementById("market-chart").getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: stockData.map(s => s.symbol),
            datasets: [{
                label: 'Current Price ($)',
                data: stockData.map(s => s.price),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

async function loadStocks() {
    const container = document.getElementById("stock-container");
    container.innerHTML = '<div class="loading">Loading market data...</div>';

    try {
        const stockData = (await Promise.all(stocks.map(fetchStockData))).filter(Boolean);
        
        container.innerHTML = '';
        stockData.forEach(data => {
            const card = document.createElement("div");
            card.className = "stock-card";
            card.innerHTML = `
                <h3>${data.symbol}</h3>
                <div class="price">$${data.price}</div>
                <div class="change ${data.change >= 0 ? 'up' : 'down'}">
                    ${data.change >= 0 ? '+' : ''}${data.change}%
                </div>
            `;
            container.appendChild(card);
        });

        renderChart(stockData);
    } catch (error) {
        container.innerHTML = '<div class="error">Failed to load data. Please try again later.</div>';
        console.error("Loading error:", error);
    }
}

window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("themePreference") || "light";
    document.body.dataset.theme = savedTheme;
    updateThemeButton();
    loadStocks();
});
