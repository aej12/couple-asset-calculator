document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const verifyMsg = document.getElementById("verifyMsg");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    // 1. 시뮬레이션 버튼 클릭 (모달 띄우기)
    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        finalRunBtn.classList.add("hidden");
        verifyMsg.innerText = "방문 확인 대기 중...";
    });

    // 2. 쿠팡 링크 클릭 감지
    coupangLink.addEventListener("click", () => {
        setTimeout(() => {
            verifyMsg.innerText = "방문 확인 완료! ✅";
            finalRunBtn.classList.remove("hidden");
            coupangLink.style.display = "none";
        }, 1500); // 1.5초 후 확인 버튼 등장
    });

    // 3. 최종 결과 실행
    finalRunBtn.addEventListener("click", () => {
        adModal.classList.add("hidden");
        runSimulation();
    });

    function runSimulation() {
        const val = (id) => parseFloat(document.getElementById(id).value) || 0;
        let asset = val("assetTotal");
        const incomeS = val("incomeSelf"), incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal"), rate = val("interestRate")/100, expInf = val("expenseInflation")/100;
        const retS = val("retireSelf"), retP = val("retirePartner");
        const ageS = val("ageSelf"), ageP = val("agePartner");

        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i, curAgeP = ageP + i;
            let curInc = (curAgeS < retS ? incomeS : 0) + (curAgeP < retP ? incomeP : 0);
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            asset = (asset * (1 + rate)) + curInc - curExp;

            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            tableBody.insertAdjacentHTML('beforeend', `<tr><td>${curAgeS}세</td><td>${curAgeP}세</td><td>${Math.round(asset).toLocaleString()}</td><td>${Math.round(curInc).toLocaleString()}</td><td>${Math.round(curExp).toLocaleString()}</td></tr>`);
            if (asset < -50000) break;
        }

        resultArea.classList.remove("hidden");
        renderCharts(labels, assetData, targetData, incData, expData);
        document.getElementById("summaryText").innerHTML = fireAge ? `🎉 <strong>${fireAge}세</strong>에 파이어 가능!` : `⚠️ 자산 관리가 필요합니다.`;
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }

    function renderCharts(labels, assetData, targetData, incData, expData) {
        const ctx1 = document.getElementById('assetChart').getContext('2d');
        if (assetChart) assetChart.destroy();
        assetChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: '순자산', data: assetData, borderColor: '#3182f6', fill: true, backgroundColor: 'rgba(49,130,246,0.1)', pointRadius: 0 },
                    { label: 'FIRE 목표선', data: targetData, borderColor: '#f04452', borderDash: [5,5], pointRadius: 0 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const ctx2 = document.getElementById('flowChart').getContext('2d');
        if (flowChart) flowChart.destroy();
        flowChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: '연 소득', data: incData, backgroundColor: 'rgba(49,130,246,0.5)' },
                    { label: '연 지출', data: expData, backgroundColor: 'rgba(240,68,82,0.4)' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
});
