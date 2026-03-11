document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("btnCalculate");

    btn.addEventListener("click", function() {
        console.log("버튼 클릭됨!"); // 작동 확인용 로그

        // 1. 값 가져오기 (오타 방지용 기본값 0 설정)
        const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;

        const ageSelf = getVal("ageSelf");
        const agePartner = getVal("agePartner");
        let currentAsset = getVal("assetTotal");
        const interestRate = getVal("interestRate") / 100;
        const incomeSelf = getVal("incomeSelf");
        const incomePartner = getVal("incomePartner");
        const incomeGrowth = getVal("incomeGrowth") / 100;
        const expenseTotal = getVal("expenseTotal");
        const expenseInflation = getVal("expenseInflation") / 100;
        const retireSelf = getVal("retireSelf");
        const retirePartner = getVal("retirePartner");
        const childCount = getVal("childCount");
        const childYearsRemaining = getVal("childYearsRemaining");
        const childAnnualExpense = getVal("childAnnualExpense");

        const maxAge = 100;
        const yearsToCalculate = maxAge - ageSelf;

        let labels = [];
        let assetData = [];
        let incomeData = [];
        let expenseData = [];
        let childExpData = [];

        const tableBody = document.getElementById("yearlyTable");
        tableBody.innerHTML = "";

        let fireAge = null;
        let bankruptAge = null;

        // 2. 루프 계산
        for (let i = 0; i <= yearsToCalculate; i++) {
            let curAgeS = ageSelf + i;
            let curAgeP = agePartner + i;

            // 수입/지출 계산
            let curInc = 0;
            if (curAgeS < retireSelf) curInc += incomeSelf * Math.pow(1 + incomeGrowth, i);
            if (curAgeP < retirePartner) curInc += incomePartner * Math.pow(1 + incomeGrowth, i);

            let curExp = expenseTotal * Math.pow(1 + expenseInflation, i);
            let curChildExp = (i < childYearsRemaining) ? (childCount * childAnnualExpense * Math.pow(1 + expenseInflation, i)) : 0;
            let totalExp = curExp + curChildExp;

            // 금융 소득 및 경제적 자유 체크
            let financialIncome = currentAsset > 0 ? currentAsset * interestRate : 0;
            if (fireAge === null && financialIncome > totalExp && currentAsset > 0) fireAge = curAgeS;

            // 자산 업데이트
            currentAsset = currentAsset + financialIncome + curInc - totalExp;
            if (currentAsset < 0 && bankruptAge === null) bankruptAge = curAgeS;

            // 데이터 저장
            labels.push(`${curAgeS}(${curAgeP})`);
            assetData.push(currentAsset);
            incomeData.push(curInc);
            expenseData.push(totalExp);
            childExpData.push(curChildExp);

            // 테이블 추가
            let row = `<tr>
                <td>${curAgeS}(${curAgeP})</td>
                <td>${Math.round(currentAsset).toLocaleString()}</td>
                <td>${Math.round(curInc).toLocaleString()}</td>
                <td>${Math.round(curExp).toLocaleString()}</td>
                <td>${Math.round(curChildExp).toLocaleString()}</td>
            </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
        }

        // 3. UI 업데이트
        document.getElementById("summarySection").style.display = "block";
        document.getElementById("resultSection").style.display = "block";

        const summaryText = document.getElementById("summaryText");
        let msg = bankruptAge ? `<h2 style="color:#f04452">${bankruptAge}세에 자산이 고갈됩니다.</h2>` : 
                  (fireAge ? `<h2 style="color:#3182f6">${fireAge}세에 경제적 자유 가능!</h2>` : "<h2>안정적인 흐름입니다.</h2>");
        summaryText.innerHTML = msg + `<p>현재 수입 대비 지출과 투자 수익률 ${getVal("interestRate")}% 기준입니다.</p>`;

        // 4. 그래프 그리기 (Chart.js)
        const ctx = document.getElementById('assetChart').getContext('2d');
        if (window.myChart) window.myChart.destroy();

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '누적 순자산', data: assetData, borderColor: '#3182f6', borderWidth: 5, fill: false, tension: 0.1 },
                    { label: '
