document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    // --- [수정] 한글 단위 변환 함수: 억 단위가 있으면 반드시 '0억 0000만' 출력 ---
    function formatKRW(val) {
        const num = Math.round(val);
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";

        if (absNum < 10000) return sign + absNum.toLocaleString() + "만";
        
        const eok = Math.floor(absNum / 10000);
        const man = absNum % 10000;
        
        if (man === 0) return `${sign}${eok}억`;
        // 1억 500만 원 같은 형식을 위해 만 단위에 콤마 추가
        return `${sign}${eok}억 ${man.toLocaleString()}만`;
    }

    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        finalRunBtn.classList.add("hidden");
    });

    coupangLink.addEventListener("click", () => {
        setTimeout(() => {
            document.getElementById("verifyMsg").innerText = "방문 확인 완료! ✅";
            finalRunBtn.classList.remove("hidden");
            coupangLink.style.display = "none";
        }, 1500);
    });

    finalRunBtn.addEventListener("click", () => {
        adModal.classList.add("hidden");
        runSimulation();
    });

    function runSimulation() {
        const val = (id) => parseFloat(document.getElementById(id).value) || 0;
        
        const initialAsset = val("assetTotal");
        const incomeS = val("incomeSelf"), incomeP = val("incomePartner");
        const expenseBase = val("expenseTotal");
        const rate = val("interestRate") / 100;
        const incInf = val("incomeInflation") / 100;
        const expInf = val("expenseInflation") / 100;
        const retS = val("retireSelf"), retP = val("retirePartner");
        const ageS = val("ageSelf"), ageP = val("agePartner");
        const childCount = val("childCount"), childExitAge = val("childExitAge"), childExpense = val("childExpense");
        const pensionYearlyBase = val("pensionMonthly") * 12;

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null, bankruptAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            let curInc = 0;
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            if (curAgeS >= 65) {
                let upgradeCount = Math.floor((curAgeS - 65) / 3);
                curInc += pensionYearlyBase * Math.pow(1 + 0.02, upgradeCount);
            }
            
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (curAgeS < childExitAge) {
                curExp += (childCount * childExpense) * Math.pow(1 + expInf, i);
            }
            
            asset = (asset * (1 + rate)) + curInc - curExp;

            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;
            if (bankruptAge === null && asset < 0) bankruptAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td><td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : '#333'} font-weight:bold;">${formatKRW(asset)}</td>
                    <td style="color:#3182f6;">${formatKRW(curInc)}</td>
                    <td>${formatKRW(curExp)}</td>
                </tr>
            `);
            if (asset < -2000000) break; 
        }

        resultArea.classList.remove("hidden");
        
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        if (bankruptAge !== null && (fireAge === null || bankruptAge < fireAge + 5)) {
            headline.innerHTML = `⚠️ ${bankruptAge}세에 자산이 고갈될 수 있습니다`;
            headline.style.color = "#f04452";
            summary.innerHTML = `현재 소비 수준이 자산 성장보다 빠릅니다. <strong>${bankruptAge}세</strong> 무렵 고갈 위험이 있으니 점검이 필요합니다.`;
        } else if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            headline.style.color = "#191f28";
            summary.innerHTML = `
                현재 순자산 <strong>${formatKRW(initialAsset)}</strong> 기준, 자녀 양육 및 보수적 연금 수령을 반영했을 때<br>
                <strong>${fireAge}세</strong>에 경제적 자립이 가능한 것으로 분석되었습니다.
            `;
        }

        renderCharts(labels, assetData, targetData, incData, expData);
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }

    function renderCharts(labels, assetData, targetData, incData, expData) {
        // 차트 Y축 눈금도 '억' 단위 표기 함수 적용
        const yLabelFormat = (v) => {
            if (Math.abs(v) >= 10000) return (v / 10000).toFixed(1) + '억';
            return v.toLocaleString();
        };

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
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { y: { ticks: { callback: yLabelFormat } } }
            }
        });

        const ctx2 = document.getElementById('flowChart').getContext('2d');
        if (flowChart) flowChart.destroy();
        flowChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: '연 수입(+연금)', data: incData, backgroundColor: 'rgba(49,130,246,0.7)' },
                    { label: '연 지출(양육비 포함)', data: expData, backgroundColor: 'rgba(240,68,82,0.4)' }
                ]
            },
            options: { 
                responsive: true, maintainAspectRatio: false,
                scales: { y: { ticks: { callback: yLabelFormat } } }
            }
        });
    }
});
