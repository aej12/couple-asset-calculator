document.addEventListener("DOMContentLoaded", function () {

  const button = document.querySelector(".calculate-btn");
  const summarySection = document.getElementById("summarySection");
  const resultSection = document.getElementById("resultSection");
  const summaryText = document.getElementById("summaryText");
  const yearlyTable = document.getElementById("yearlyTable");
  const chartCanvas = document.getElementById("assetChart");

  let chart;

  function formatNum(num) {
    return Math.round(num).toLocaleString();
  }

  button.addEventListener("click", function () {

    const ageSelf = parseInt(document.getElementById("ageSelf").value);
    const agePartner = parseInt(document.getElementById("agePartner").value);

    let currentAsset = parseFloat(document.getElementById("assetTotal").value);

    const incomeSelf = parseFloat(document.getElementById("incomeSelf").value);
    const incomePartner = parseFloat(document.getElementById("incomePartner").value);

    const incomeGrowth = parseFloat(document.getElementById("incomeGrowth").value) / 100;

    const expenseTotal = parseFloat(document.getElementById("expenseTotal").value);

    const interestRate = parseFloat(document.getElementById("interestRate").value) / 100;

    const expenseInflation = parseFloat(document.getElementById("expenseInflation").value) / 100;

    const retireSelf = parseInt(document.getElementById("retireSelf").value);
    const retirePartner = parseInt(document.getElementById("retirePartner").value);

    const childCount = parseInt(document.getElementById("childCount").value);
    const childYearsRemaining = parseInt(document.getElementById("childYearsRemaining").value);
    const childAnnualExpense = parseFloat(document.getElementById("childAnnualExpense").value);

    const maxAge = 100;
    const years = maxAge - ageSelf;

    let labels = [];
    let assetData = [];
    let incomeData = [];
    let expenseData = [];
    let childExpenseData = [];

    yearlyTable.innerHTML = "";

    let bankruptAge = null;
    let fireAge = null;

    for (let i = 0; i < years; i++) {

      let currentAgeSelf = ageSelf + i;
      let currentAgePartner = agePartner + i;

      let currentIncomeSelf =
        currentAgeSelf < retireSelf
          ? incomeSelf * Math.pow(1 + incomeGrowth, i)
          : 0;

      let currentIncomePartner =
        currentAgePartner < retirePartner
          ? incomePartner * Math.pow(1 + incomeGrowth, i)
          : 0;

      let annualIncome = currentIncomeSelf + currentIncomePartner;

      let adjustedExpense =
        expenseTotal * Math.pow(1 + expenseInflation, i);

      let childExpense = 0;

      if (childCount > 0 && i < childYearsRemaining) {
        childExpense =
          childCount *
          childAnnualExpense *
          Math.pow(1 + expenseInflation, i);
      }

      let totalExpense = adjustedExpense + childExpense;

      let passiveIncome =
        currentAsset > 0 ? currentAsset * interestRate : 0;

      if (fireAge === null && passiveIncome >= totalExpense) {
        fireAge = currentAgeSelf;
      }

      currentAsset =
        currentAsset * (1 + interestRate) +
        annualIncome -
        totalExpense;

      if (currentAsset < 0 && bankruptAge === null) {
        bankruptAge = currentAgeSelf;
      }

      let tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${currentAgeSelf}(${currentAgePartner})</td>
        <td>${formatNum(currentAsset)}</td>
        <td>${formatNum(annualIncome)}</td>
        <td>${formatNum(adjustedExpense)}</td>
        <td>${formatNum(childExpense)}</td>
      `;

      yearlyTable.appendChild(tr);

      labels.push(`${currentAgeSelf}(${currentAgePartner})`);

      assetData.push(currentAsset);
      incomeData.push(annualIncome);
      expenseData.push(totalExpense);
      childExpenseData.push(childExpense);
    }

    summarySection.style.display = "block";
    resultSection.style.display = "block";

    const ctx = chartCanvas.getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",

      data: {
        labels: labels,

        datasets: [
          {
            label: "순자산",
            data: assetData,
            borderColor: "#3182f6",
            borderWidth: 4,
            tension: 0.3
          },

          {
            label: "수입",
            data: incomeData,
            borderColor: "#20c997",
            borderWidth: 3,
            tension: 0.3
          },

          {
            label: "지출",
            data: expenseData,
            borderColor: "#f04452",
            borderWidth: 3,
            tension: 0.3
          },

          {
            label: "자녀지출",
            data: childExpenseData,
            borderColor: "#ff9800",
            borderWidth: 3,
            tension: 0.3
          }
        ]
      },

      options: {

        responsive: true,

        scales: {

          y: {

            ticks: {
              callback: function(value) {

                const 억 = value / 10000;

                if (억 >= 1) return 억 + "억";

                return value;
              }
            }
          }
        },

        plugins: {

          legend: {
            labels: {
              font: {
                size: 14
              }
            }
          }
        }
      }
    });

    if (bankruptAge) {

      summaryText.innerHTML =
        `<b>${bankruptAge}세 파산</b> 예상됩니다`;

    } else if (fireAge) {

      summaryText.innerHTML =
        `<b>${fireAge}세 경제적 자유</b> 달성 예상`;

    } else {

      summaryText.innerHTML =
        `100세까지 경제적 자유는 도달하지 못합니다`;

    }

  });

});
