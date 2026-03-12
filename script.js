document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const countNum = document.getElementById("countNum");
    const resultArea = document.getElementById("resultArea");
    
    // 차트 인스턴스 관리
    let assetChartInstance = null;
    let flowChartInstance = null;

    const fmt = (n) => Math.round(n).toLocaleString();

    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        let count = 5;
        countNum.innerText = count;

        const timer = setInterval(() => {
            count--;
            countNum.innerText = count;
            if (count === 0) {
                clearInterval(timer);
                adModal.classList.add("hidden");
                runSimulation();
            }
        }, 1000);
    });

    function runSimulation() {
        const val = (id) => parseFloat(document.getElementById(id).value) || 0;

        let asset = val("assetTotal");
        const incomeS = val("incomeSelf");
        const incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100;
        const expInf = val("expenseInflation") / 100;
        const retS = val("retireSelf");
        const retP = val("retirePartner");
        const ageS = val("ageSelf");
        const ageP = val("agePartner");
        const childC = val("childCount");
        const childY = val("childYears");
        const childE = val("childExpense");

        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";

        let labels = [], assetData = [], fireTargetData = [];
        let incomeData = [], expenseData = [];
        let fireAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 수입/지출 계산
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);

            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (i < childY) curExp += (childC * childE) * Math.pow(1 + expInf, i);

            asset = (asset * (1 + rate)) + curInc - curExp;
            let fireTarget = curExp * 25;

            if (fireAge === null && asset >= fireTarget && asset > 0) fireAge = curAgeS;

            // 데이터 수집
            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            fireTargetData.push(Math.round(fireTarget));
            incomeData.push(Math.round(curInc));
            expenseData.push(Math.round(curExp));

            const row = `<tr><td>${curAgeS}</td><td>${curAgeP}</td><td>${fmt(asset)}</td><td>${fmt(curInc)}</td><td>${fmt(curExp)}</td></tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
            if (asset < -100000) break;
        }

        resultArea.classList.remove("hidden");
        
        // --- 그래프 1: 자산 성장 추이 ---
        const ctx1 = document.getElementById('assetChart').getContext('2d');
        if (assetChartInstance) assetChartInstance.destroy();
        assetChartInstance = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '누적 순자산', data: assetData, borderColor: '#3182f6', fill: false, tension: 0.3, pointRadius: 0 },
                    { label: 'FIRE 목표선', data: fireTargetData, borderColor: '#f04452', borderDash: [5, 5], pointRadius: 0 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // --- 그래프 2: 수입 vs 지출 비교 ---
        const ctx2 = document.getElementById('flowChart').getContext('2d');
        if (flowChartInstance) flowChartInstance.destroy();
        flowChartInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: '연 소득', data: incomeData, backgroundColor: 'rgba(49, 130, 246, 0.5)' },
                    { label: '연 지출', data: expenseData, backgroundColor: 'rgba(240, 68, 82, 0.5)' }
                ]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { x: { stacked: false }, y: { beginAtZero: true } }
            }
        });

        // 결과 텍스트 업데이트 및 스크롤
        document.getElementById("summaryText").innerHTML = fireAge 
            ? `🎉 <strong>${fireAge}세</strong>에 파이어 달성 가능!` 
            : `⚠️ 현재 조건으론 달성이 어렵습니다.`;
        
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }
});
