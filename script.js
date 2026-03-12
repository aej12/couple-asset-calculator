document.addEventListener("DOMContentLoaded", () => {
  const mainBtn = document.getElementById("mainBtn");
  let assetChart = null;
  let hasAdOpened = false; // 광고가 한 번 열렸는지 체크

  // 1. 방문자 통계 업데이트 (즉시 실행)
  const updateVisitors = () => {
    let today = Number(localStorage.getItem('v_today') || "120");
    let total = Number(localStorage.getItem('v_total') || "2540");
    
    // 세션당 한 번만 카운트
    if (!sessionStorage.getItem('v_counted')) {
      today += 1;
      total += 1;
      localStorage.setItem('v_today', today);
      localStorage.setItem('v_total', total);
      sessionStorage.setItem('v_counted', 'true');
    }
    
    document.getElementById('todayCount').innerText = today.toLocaleString();
    document.getElementById('totalCount').innerText = total.toLocaleString();
  };
  updateVisitors();

  // 2. 억 단위 한글 변환 함수
  const formatKrw = (num) => {
    let absN = Math.abs(Math.round(num));
    if (absN >= 10000) {
      let uk = Math.floor(absN / 10000);
      let man = absN % 10000;
      return `${uk}억 ${man > 0 ? man.toLocaleString() : ''}`;
    }
    return absN.toLocaleString();
  };

  // 3. 버튼 클릭 이벤트
  mainBtn.addEventListener("click", () => {
    if (!hasAdOpened) {
      // 처음 클릭 시: 광고 열기 + 5초 대기
      window.open("https://link.coupang.com/a/d2Gw7t", "_blank");
      hasAdOpened = true; 
      
      let count = 5;
      mainBtn.disabled = true;
      const timer = setInterval(() => {
        mainBtn.innerText = `데이터 분석 중... ${count}초`;
        count--;
        if (count < 0) {
          clearInterval(timer);
          mainBtn.disabled = false;
          mainBtn.innerText = "결과 확인하기";
          mainBtn.style.background = "#00c64b"; // 색상 변경으로 완료 알림
          runSimulation(); // 5초 후 자동 실행
        }
      }, 1000);
    } else {
      // 광고를 이미 본 상태에서 클릭 시: 바로 실행
      runSimulation();
    }
  });

  function runSimulation() {
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;
    const data = {
      asset: val("assetTotal"), incS: val("incomeSelf"), incP: val("incomePartner"),
      exp: val("expenseTotal"), rate: val("interestRate")/100,
      inf: val("expenseInflation")/100, ageS: val("ageSelf"), ageP: val("agePartner"),
      retS: val("retireSelf"), retP: val("retirePartner")
    };

    const tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = "";
    let labels = [], assetN = [], assetF = [];
    let isFIRE = false, fireAge = null, aN = data.asset, aF = data.asset;

    for (let i = 0; i <= (90 - data.ageS); i++) {
      let curAge = data.ageS + i;
      let inc = (curAge < data.retS ? data.incS : 0) + (data.ageP + i < data.retP ? data.incP : 0);
      let exp = data.exp * Math.pow(1 + data.inf, i);

      aN = aN * (1 + data.rate) + inc - exp;
      aF = aF * (1 + data.rate) + (isFIRE ? 0 : inc) - exp;

      if (!isFIRE && aN >= exp * 25 && aN > 0) { isFIRE = true; fireAge = curAge; }

      labels.push(`${curAge}세`);
      assetN.push(aN); assetF.push(aF);

      tableBody.insertAdjacentHTML("beforeend", `<tr><td>${curAge}세</td><td>${formatKrw(aN)}</td><td>${formatKrw(aF)}</td><td>${formatKrw(inc)}</td><td>${formatKrw(exp)}</td></tr>`);
    }

    document.getElementById("resultArea").classList.remove("hidden");
    document.getElementById("resultHeadline").innerText = fireAge ? `${fireAge}세 파이어 성공!` : "분석 완료";
    document.getElementById("summaryText").innerHTML = fireAge ? `<strong>${fireAge}세</strong>에 경제적 자유 달성 가능!` : "현재 조건으로는 자산 고갈 위험이 있습니다.";
    
    renderChart(labels, assetN, assetF);
    window.scrollTo({ top: document.getElementById("resultArea").offsetTop - 20, behavior: "smooth" });
  }

  function renderChart(labels, assetN, assetF) {
    if (assetChart) assetChart.destroy();
    assetChart = new Chart(document.getElementById("assetChart"), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: '일반 자산', data: assetN, borderColor: '#ccc', borderWidth: 1, fill: false },
          { label: 'FIRE 자산', data: assetF, borderColor: '#3182f6', borderWidth: 3, fill: true, backgroundColor: 'rgba(49,130,246,0.1)' }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: { y: { ticks: { callback: (v) => formatKrw(v) } } }
      }
    });
  }
});
