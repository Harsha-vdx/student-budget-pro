// Protect dashboard
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = localStorage.getItem("budget") || 0;
document.getElementById("budget").value = budget;

document.getElementById("budget").addEventListener("change", function() {
    budget = this.value;
    localStorage.setItem("budget", budget);
    updateUI();
});

function addTransaction() {
    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    if (!amount || !category) return alert("Enter valid details");

    transactions.push({ id: Date.now(), type, amount, category });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";

    updateUI();
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateUI();
}

let chart;

function updateUI() {
    let income = 0;
    let expense = 0;
    let categoryTotals = {};

    const historyDiv = document.getElementById("history");
    historyDiv.innerHTML = "";

    transactions.forEach(t => {
        if (t.type === "income") income += t.amount;
        else {
            expense += t.amount;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }

        const div = document.createElement("div");
        div.className = "transaction";
        div.innerHTML = `
            <span class="${t.type}">
                ${t.category} - ₹${t.amount}
            </span>
            <button onclick="deleteTransaction(${t.id})">X</button>
        `;
        historyDiv.appendChild(div);
    });

    const balance = income - expense;

    document.getElementById("incomeCard").innerText = "₹" + income;
    document.getElementById("expenseCard").innerText = "₹" + expense;
    document.getElementById("balanceCard").innerText = "₹" + balance;

    if (budget) {
        const percent = ((expense / budget) * 100).toFixed(1);
        if (expense > budget) {
            document.getElementById("budgetStatus").innerHTML =
                `<span class="warning">⚠ Budget exceeded (${percent}% used)</span>`;
        } else {
            document.getElementById("budgetStatus").innerHTML =
                `Budget used: ${percent}%`;
        }
    }

    renderChart(categoryTotals);
}

function renderChart(categoryTotals) {
    const ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                label: "Expense by Category",
                data: Object.values(categoryTotals),
                backgroundColor: "#243b55"
            }]
        }
    });
}

updateUI();
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}