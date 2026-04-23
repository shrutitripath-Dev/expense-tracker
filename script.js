const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const list = document.getElementById("list");
const filter = document.getElementById("filter");
const category = document.getElementById("category");
const categoryFilter = document.getElementById("categoryFilter");


let transactions = [];
// front : let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

categoryFilter.addEventListener("change", filterTransactions);
filter.addEventListener("change", filterTransactions);  

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: Number(amount.value),
    category: category.value,
    type: type.value
  };

  try {
    await fetch("http://127.0.0.1:8000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transaction)
    });

    await loadTransactions(); // 🔥 MUST WAIT

    text.value = "";
    amount.value = "";

  } catch (err) {
    console.error("ADD ERROR:", err);
  }
});

function addTransactionToDOM(transaction) {
  const li = document.createElement("li");

  li.classList.add(transaction.type === "expense" ? "minus" : "plus");

  li.innerHTML = `
  ${transaction.text} (${transaction.category}) - ₹${transaction.amount}
  <button onclick ="editTransaction(${transaction.id})">Edit</button>
  <button onclick="deleteTransaction(${transaction.id})">X</button>
`;

  list.appendChild(li);
}
async function deleteTransaction(id) {
  await fetch(`http://127.0.0.1:8000/delete/${id}`, {
    method: "DELETE"
  });

  await loadTransactions();
}
let editId=null;

function editTransaction(id){
  const transaction = transactions.find(t => t.id === id);

  if(!transaction) return;

  //Fill from with old data
  text.value = transaction.text;
  amount.value = transaction.amount;
  type.value = transaction.type;
  category.value = transaction.category;

//Set edit mode
  editId = id;


}


function filterTransactions() {
  list.innerHTML = "";

  let filtered = transactions;

  //Filter by type
  if (filter.value !== "all") {
    filtered = filtered.filter(t => t.type === filter.value);
  }

  //Filter by category
  if (categoryFilter.value !=="all"){
    filtered = filtered.filter(t => t.category === categoryFilter.value);
  }

  filtered.forEach(addTransactionToDOM);
}

function updateBalance() {
  const amounts = transactions.map(t =>
    t.type === "expense" ? -Number(t.amount) : Number(t.amount)
  );

  const total = amounts.reduce((acc, val) => acc + val, 0);

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  document.getElementById("balance").innerText = total;
  document.getElementById("income").innerText = income;
  document.getElementById("expense").innerText = expense;
}


transactions.forEach(addTransactionToDOM);
updateBalance();

let chart;

function updateChart() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const data = {
    labels: ["Income", "Expense"],
    datasets: [{
      data: [income, expense],
      backgroundColor: ["green", "red"]
    }]
  };

  const config = {
    type: "doughnut",
    data: data,
    options: {  // ✅ CORRECT PLACE
      responsive: true,
      maintainAspectRatio: false
    }
  };

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.getElementById("chart"), config);
}
updateChart();


// Backendn 
async function loadTransactions() {
  try {
    const res = await fetch("http://127.0.0.1:8000/transactions");
    const data = await res.json();

    transactions = data;

    console.log("LOADED:", transactions); // debug

    list.innerHTML = "";

    transactions.forEach(addTransactionToDOM);

    updateBalance();
    updateChart();

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}
loadTransactions();
