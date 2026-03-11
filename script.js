// ... (기존 루프 계산 부분은 유지)

    // 4. 그래프 그리기 (요청하신 스타일로 전면 수정)
    summarySection.style.display = "block";
    resultSection.style.display = "block";

    const ctx = chartCanvas.getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels, // 루프에서 생성한 "본인나이(배우자나이)세" 라벨 사용
        datasets: [
          {
            label: '누적 순자산',
            data: assetData,
            borderColor: '#3182f6', // 토스 블루
            borderWidth: 6,         // 선 두께 아주 두껍게
            pointRadius: 0,         // 점 제거 (깔끔하게)
            fill: false,
            tension: 0.2
          },
          {
            label: '총 수입',
            data: incomeData,
            borderColor: '#20c997', // 민트
            borderWidth: 4,         // 두껍게
            borderDash: [5, 5],     // 수입은 점선으로 구분
            pointRadius: 0,
            fill: false
          },
          {
            label: '총 지출 (기본+자녀)',
            data: expenseData,
            borderColor: '#f04452', // 레드
            borderWidth: 4,         // 두껍게
            pointRadius: 0,
            fill: false
          },
          {
            label: '자녀 지출',
            data: childExpenseData,
            borderColor: '#ff9800', // 오렌지
            borderWidth: 3,         // 약간 얇게
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            // 왼쪽 단일 축 설정
            beginAtZero: true,
            position: 'left',
            title: { display: true, text: '금액 (억 단위)', font: { weight: 'bold' } },
            ticks: {
              // 1억, 5억, 10억 단위 표시 로직
              callback: function(value) {
                if (value === 0) return '0';
                const eok = value / 10000; // 만원 단위를 억으로 변환
                if (eok >= 1) return eok.toFixed(0) + '억';
                return value.toLocaleString();
              }
            },
            grid: {
              color: '#f2f4f6'
            }
          },
          x: {
            title: { display: true, text: '내 나이 (배우자 나이)', font: { weight: 'bold' } },
            grid: {
              display: false // X축 세로선 제거로 더 깔끔하게
            },
            ticks: {
              maxTicksLimit: 10, // 라벨이 겹치지 않게 조절
              color: '#8b95a1'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: { size: 13, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += (context.parsed.y / 10000).toFixed(1) + '억 원';
                }
                return label;
              }
            }
          }
        }
      }
    });

// ... (이하 스크롤 로직 유지)
