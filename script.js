// =======================
// 🟢 초기 입력값
// =======================
const startAge = 25;
const endAge = 100;
const monthlyIncome = 200; // 만원 단위
const monthlyExpense = 150; // 만원 단위
const annualIncomeGrowth = 0.03;
const annualExpenseGrowth = 0.02;
const monthlyInterest = 0; // 월 금융소득률 (0%)

// =======================
// 🟢 월별 계산 함수
// =======================
function calculateMonthlyIncome(age, month) {
    return monthlyIncome * Math.pow(1 + annualIncomeGrowth, age - startAge);
}

function calculateMonthlyExpense(age, month) {
    return monthlyExpense * Math.pow(1 + annualExpenseGrowth, age - startAge);
}

function calculateNetAssets() {
    const netAssets = [];
    let asset = 0;
    for (let age = startAge; age <= endAge; age++) {
        for (let month = 1; month <= 12; month++) {
            const income = calculateMonthlyIncome(age, month);
            const expense = calculateMonthlyExpense(age, month);
            asset = asset + income - expense + asset * monthlyInterest;
            netAssets.push({ age, month, asset, income, expense });
        }
    }
    return netAssets;
}

const netAssets = calculateNetAssets();

// =======================
// 🟢 3줄 요약
// =======================
document.getElementById('summary').innerHTML = `
1. ${startAge}세부터 월 ${monthlyIncome}만원 수입, ${monthlyExpense}만원 지출로 계산.<br>
2. 연소득 증가 ${annualIncomeGrowth*100}%, 연지출 증가 ${annualExpenseGrowth*100}% 가정.<br>
3. 월 금융소득 ${monthlyInterest*100}% 적용, 월 단위 누적 순자산 계산.
`;

// =======================
// 🟢 그래프
// =======================
const labels = netAssets.map(d => `${d.age}세 ${d.month}월`);
const data = {
    labels: labels,
    datasets: [{
        label: '누적 순자산',
        data: netAssets.map(d => d.asset),
        borderColor: netAssets.map(d => d.asset >= 0 ? 'blue' : 'red'),
        backgroundColor: netAssets.map(d => d.asset >= 0 ? 'rgba(0,0,255,0.1)' : 'rgba(255,0,0,0.1)'),
        fill: true,
        tension: 0.2
    }]
};

new Chart(document.getElementById('assetChart'), {
    type: 'line',
    data: data,
    options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
    }
});

// =======================
// 🟢 연도별/월별 표
// =======================
const tableBody = document.getElementById('assetTable');
netAssets.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${d.age}</td>
        <td>${d.month}</td>
        <td>${Math.round(d.asset).toLocaleString()}</td>
        <td>${Math.round(d.expense).toLocaleString()}</td>
        <td>${Math.round(d.income).toLocaleString()}</td>
    `;
    tableBody.appendChild(tr);
});
