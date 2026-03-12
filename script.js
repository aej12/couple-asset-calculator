document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const coupangLink = document.getElementById("coupangLink");
    const finalRunBtn = document.getElementById("finalRunBtn");
    const resultArea = document.getElementById("resultArea");
    
    let assetChart = null, flowChart = null;

    // [핵심 수정] 억 단위 표기 함수 (1억 이상일 때 반드시 '0억 0000만' 형식 유지)
    function formatKRW(val) {
        const num = Math.round(val);
        const absNum = Math.abs(num);
        const sign = num < 0 ? "-" : "";

        if (absNum < 10000) {
            return sign + absNum.toLocaleString() + "만";
        }
        
        const eok = Math.floor(absNum / 10000);
        const man = absNum % 10000;
        
        // 만 단위가 0일 때는 '0억'만 표시, 아닐 때는 '0억 0000만' 표시
        if (man === 0) return `${sign}${eok}억`;
        
        // 만 단위가 1000 미만일 때 앞에 0을 채우지 않고 자연스럽게 콤마 표기
        return `${sign}${eok}억 ${man.toLocaleString()}만`;
    }

    // 광고 모달 로직
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
        
        // 국민연금: 월 150 -> 연 1800 설정
        const pensionMonthly = val("pensionMonthly");
        const pensionYearlyBase = pensionMonthly * 12;

        let asset = initialAsset;
        const tableBody = document.querySelector("#resultTable tbody");
        tableBody.innerHTML = "";
        
        let labels = [], assetData = [], targetData = [], incData = [], expData = [];
        let fireAge = null, bankruptAge = null;

        for (let i = 0; i <= (100 - ageS); i++) {
            let curAgeS = ageS + i;
            let curAgeP = ageP + i;

            // 1. 수입 계산
            let curInc = 0;
            // 근로 소득
            if (curAgeS < retS) curInc += incomeS * Math.pow(1 + incInf, i);
            if (curAgeP < retP) curInc += incomeP * Math.pow(1 + incInf, i);
            
            // [연금 로직] 65세 시작, 5년 주기 2.5% 고정 상승
            if (curAgeS >= 65) {
                let upgradeCount = Math.floor((curAgeS - 65) / 5);
                curInc += pensionYearlyBase * Math.pow(1 + 0.025, upgradeCount);
            }
            
            // 2. 지출 계산
            let curExp = expenseBase * Math.pow(1 + expInf, i);
            if (curAgeS < childExitAge) {
                curExp += (childCount * childExpense) * Math.pow(1 + expInf, i);
            }
            
            // 3. 자산 업데이트
            asset = (asset * (1 + rate)) + curInc - curExp;

            // 4. 상태 판정
            let target = curExp * 25;
            if (fireAge === null && asset >= target && asset > 0) fireAge = curAgeS;
            if (bankruptAge === null && asset < 0) bankruptAge = curAgeS;

            labels.push(curAgeS + "세");
            assetData.push(Math.round(asset));
            targetData.push(Math.round(target));
            incData.push(Math.round(curInc));
            expData.push(Math.round(curExp));

            // [표 적용] formatKRW 함수를 모든 금액 컬럼에 적용
            tableBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${curAgeS}세</td>
                    <td>${curAgeP}세</td>
                    <td style="color:${asset < 0 ? '#f04452' : '#333'}; font-weight:bold;">${formatKRW(asset)}</td>
                    <td style="color:#3182f6; font-weight:600;">${formatKRW(curInc)}</td>
                    <td>${formatKRW(curExp)}</td>
                </tr>
            `);
            if (asset < -5000000) break; 
        }

        resultArea.classList.remove("hidden");
        
        const headline = document.getElementById("resultHeadline");
        const summary = document.getElementById("summaryText");

        if (bankruptAge !== null) {
            headline.innerHTML = `⚠️ ${bankruptAge}세에 자산이 고갈될 것으로 보입니다`;
            headline.style.color = "#f04452";
            summary.innerHTML = `현재 소비와 양육비 지출이 자산 성장보다 빠릅니다. <strong>${bankruptAge}세</strong> 무렵 고갈 위험이 있으니 점검이 필요합니다.`;
        } else if (fireAge) {
            headline.innerHTML = `💡 ${fireAge}세에 파이어 가능합니다`;
            headline.style.color = "#191f28";
            summary.innerHTML = `
                현재 순자산 <strong>${formatKRW(initialAsset)}</strong> 기준, 보수적인 연금 수령(5년 주기 상승)을 반영했을 때<br>
                <strong>${fireAge}세</strong>에 경제적 자립이 가능한 것으로 분석되었습니다.
            `;
        }

        renderCharts(labels, assetData, targetData, incData, expData);
        window.scrollTo({ top: resultArea.offsetTop - 20, behavior: 'smooth' });
    }

    function renderCharts(labels, assetData, targetData, incData, expData) {
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
