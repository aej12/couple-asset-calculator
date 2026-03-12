document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-calculate");
    const adModal = document.getElementById("adModal");
    const countNum = document.getElementById("countNum");
    const resultArea = document.getElementById("resultArea");
    let fireChartInstance = null; // 차트 중복 생성 방지용

    // 1. 버튼 클릭 시 광고 모달 띄우기 (계산은 아직 안 함)
    btn.addEventListener("click", () => {
        adModal.classList.remove("hidden");
        
        let count = 5;
        countNum.innerText = count;

        const timer = setInterval(() => {
            count--;
            countNum.innerText = count;

            if (count <= 0) {
                clearInterval(timer);
                adModal.classList.add("hidden");
                runSimulation(); // 5초 뒤 계산 시작!
            }
        }, 1000);
    });

    // 2. 실제 계산 및 차트 렌더링 함수
    function runSimulation() {
        // 값 가져오기
        let asset = Number(document.getElementById("assetTotal").value);
        const income = Number(document.getElementById("incomeSelf").value) + Number(document.getElementById("incomePartner").value);
        const expense = Number(document.getElementById("expenseTotal").value);
        const interestRate = Number(document.getElementById("interestRate").value) / 100;
        const currentAge = Math.max(Number(document.getElementById("ageSelf").value), Number(document.getElementById("agePartner").value));
        
        // FIRE 목표 금액 (연 지출의 25배)
        const fireTarget = expense * 25;

        let labels = [];
        let dataAssets = [];
        let dataTargets = [];
        
        let year = 0;
        let isFired = false;
        let fireAge = 0;

        // 시뮬레이션 루프 (최대 40년)
        for(let i = 0; i <= 40; i++) {
            let age = currentAge + i;
            labels.push(`${age}세`);
            dataAssets.push(Math.round(asset));
            dataTargets.push(Math.round(fireTarget));

            if (asset >= fireTarget && !isFired) {
                isFired = true;
                fireAge = age;
            }

            // 매년 자산 증가 로직: (기존자산 * 투자수익률) + (연수입 - 연지출)
            let savings = income - expense; 
            asset = asset * (1 + interestRate) + savings;
        }

        // 결과창 보여주기
        resultArea.classList.remove("hidden");

        const resultText = document.getElementById("resultText");
        if(isFired) {
            resultText.innerHTML = `축하합니다! 현재 조건 유지 시 <span style="color:#3182f6; font-size:1.2em;">${fireAge}세</span>에 FIRE 달성이 가능합니다!<br>목표 순자산: ${fireTarget.toLocaleString()}만 원`;
        } else {
            resultText.innerHTML = `현재 조건으로는 40년 내에 FIRE 달성이 어렵습니다.<br>지출을 줄이거나 투자 수익률을 높여보세요!`;
        }

        // 기존 차트가 있으면 지우고 다시 그리기
        if (fireChartInstance) {
            fireChartInstance.destroy();
        }

        const ctx = document.getElementById('fireChart').getContext('2d');
        fireChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '예상 순자산 (만원)',
                        data: dataAssets,
                        borderColor: '#3182f6',
                        backgroundColor: 'rgba(49, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'FIRE 목표 자산 (만원)',
                        data: dataTargets,
                        borderColor: '#ff5252',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // 계산 완료 후 결과창으로 부드럽게 스크롤
        resultArea.scrollIntoView({ behavior: 'smooth' });
    }
});
