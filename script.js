document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const countNum = document.getElementById("countNum");
    const resultArea = document.getElementById("resultArea");
    
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

        let currentAsset = val("assetTotal");
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
        let depleteAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 1. 수입 계산 (은퇴 나이 전까지만 발생)
            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);

            // 2. 지출 계산 (물가상승 및 자녀 독립 반영)
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (i < childY) curExp += (childC * childE) * Math.pow(1 + expInf, i);

            // 3. 자산 증식 로직
            currentAsset = (currentAsset * (1 + rate)) + curInc - curExp;

            // 4. FIRE 조건 (순자산 >= 연지출 * 25)
            let fireTarget = curExp * 25;
            if (fireAge === null && currentAsset >= fireTarget && currentAsset > 0) fireAge = curAgeS;
            if (depleteAge === null && currentAsset < 0) depleteAge = curAgeS;

            // 데이터 수집
            labels.push(curAgeS + "세");
            assetData.push(Math.round(currentAsset));
            fireTargetData.push(Math.round(fireTarget));
            incomeData.push(Math.round(curInc));
            expenseData.push(Math.round(curExp));

            const row = `<tr>
                <td>${curAgeS}세</td><td>${curAgeP}세</td>
                <td style="color:${currentAsset < 0 ? '#f04452' : 'inherit'}">${fmt(currentAsset)}</td>
                <td>${fmt(curInc)}</td><td>${fmt(curExp)}</td>
            </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
            
            if (currentAsset < -100000) break;
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
                    { label: '누적 순자산', data: assetData, borderColor: '#3182f6', backgroundColor: 'rgba(49, 130, 246, 0.1)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'FIRE 목표선 (지출X25)', data: fireTargetData, borderColor: '#f04452', borderDash: [5, 5], fill: false, pointRadius: 0 }
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
                    { label: '연간 소득', data: incomeData, backgroundColor: 'rgba(49, 130, 246, 0.6)', borderRadius: 4 },
                    { label: '연간 지출', data: expenseData, backgroundColor: 'rgba(240, 68, 82, 0.5)', borderRadius: 4 }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: false }, y: { beginAtZero: true } }
            }
        });

        // 결과 업데이트
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");
        const icon = document.getElementById("statusIcon");

        if (depleteAge) {
            icon.innerText = "📉";
            headline.innerText = "자산 관리 주의";
            summary.innerHTML = `<span style="color:#f04452; font-weight:700;">${depleteAge}세</span>에 자산 고갈이 예상됩니다. 지출을 줄이거나 투자 수익률을 높여보세요.`;
        } else if (fireAge) {
            icon.innerText = "🚀";
            headline.innerText = "FIRE 달성 성공!";
            summary.innerHTML = `축하합니다! <span style="color:#00c64b; font-weight:700;">${fireAge}세</span>에 경제적 자유를 얻을 수 있습니다.`;
        } else {
            icon.innerText = "🧐";
            summary.innerText = "자산은 유지되나 25배 공식 달성에는 도달하지 못했습니다.";
        }
        
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }
});
