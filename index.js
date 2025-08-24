const COLOR_THRESHOLDS = {
  SCHEDULE: { green: 0, yellow: -40 },
  COST: { green: 0, yellow: -40 },
  PERFORMANCE: { green: 1, yellow: 0.96 },
  BUDGET: { green: 0, yellow: -40 }
};

const ERROR_MESSAGES = {
  INVALID_INPUT: "Пожалуйста, введите корректные числовые значения.",
  NEGATIVE_VALUES: "Значения не могут быть отрицательными.",
  INVALID_PERCENT: "Процент выполнения должен быть от 0 до 100.",
  INVALID_DAYS: "Количество прошедших дней не может превышать общее количество дней."
};

let evmChart = null;

let chartUpdateTimeout = null;

function calculateEVM() {
  try {
    const inputData = getAndValidateInputs();
    if (!inputData) return;

    const evmMetrics = calculateEVMMetrics(inputData);
    
    displayResults(evmMetrics);
    
    applyColorIndicators(evmMetrics);
    
  } catch (error) {
    console.error('Ошибка при расчете EVM:', error);
            console.log('Ошибка расчета: Произошла ошибка при расчете. Проверьте введенные данные.');
  }
}

function getAndValidateInputs() {
  const inputs = {
    totalDays: parseFloat(document.getElementById("totalDays").value),
    daysPassed: parseFloat(document.getElementById("daysPassed").value),
    bac: parseFloat(document.getElementById("bac").value),
    percentComplete: parseFloat(document.getElementById("percentComplete").value),
    ac: parseFloat(document.getElementById("ac").value)
  };

  if (Object.values(inputs).some(isNaN)) {
            console.log('Ошибка ввода: ' + ERROR_MESSAGES.INVALID_INPUT);
    return null;
  }

  if (Object.values(inputs).some(value => value < 0)) {
            console.log('Ошибка ввода: ' + ERROR_MESSAGES.NEGATIVE_VALUES);
    return null;
  }

  if (inputs.percentComplete < 0 || inputs.percentComplete > 100) {
            console.log('Ошибка ввода: ' + ERROR_MESSAGES.INVALID_PERCENT);
    return null;
  }

  if (inputs.daysPassed > inputs.totalDays) {
            console.log('Ошибка ввода: ' + ERROR_MESSAGES.INVALID_DAYS);
    return null;
  }

  inputs.percentComplete = inputs.percentComplete / 100;
  
  return inputs;
}

function calculateEVMMetrics(inputs) {
  const { totalDays, daysPassed, bac, percentComplete, ac } = inputs;
  
  if (totalDays === 0 || bac === 0) {
    return {
      pv: 0, ev: 0, sv: 0, cv: 0, spi: 0, cpi: 0, eac: 0, etc: 0, vac: 0,
      bac: 0,
      inputs
    };
  }
  
  const pv = totalDays > 0 ? (daysPassed / totalDays) * bac : 0;
  const ev = percentComplete * bac;
  
  const sv = ev - pv;
  const cv = ev - ac;
  
  const spi = pv !== 0 ? ev / pv : 0;
  const cpi = ac !== 0 ? ev / ac : 0;
  
  let eac;
  if (cpi !== 0) {
    eac = ac + (bac - ev) / cpi;
  } else {
    eac = ac + (bac - ev);
  }
  
  const etc = eac - ac;
  const vac = bac - eac;

  return {
    pv, ev, sv, cv, spi, cpi, eac, etc, vac,
    bac,
    inputs
  };
}

function displayResults(metrics) {
  const { pv, ev, sv, cv, spi, cpi, eac, etc, vac } = metrics;
  
  updateMetricCard('pv', pv, 'чел./час');
  updateMetricCard('ev', ev, 'чел./час');
  updateMetricCard('sv', sv, 'чел./час');
  updateMetricCard('cv', cv, 'чел./час');
  
  updatePerformanceCard('spi', spi);
  updatePerformanceCard('cpi', cpi);
  
  updateForecastCard('eac', eac, 'чел./час');
  updateForecastCard('etc', etc, 'чел./час');
  updateForecastCard('vac', vac, 'чел./час');
  
  updateEVMChart(metrics);
  
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.disabled = false;
  }
}

function updateMetricCard(id, value, unit) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.metric-value');
    if (valueElement) {
      valueElement.textContent = value.toFixed(1);
    }
  }
}

function updatePerformanceCard(id, value) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.performance-value');
    const statusElement = card.querySelector('.performance-status');
    
    if (valueElement) {
      valueElement.textContent = value.toFixed(2);
    }
    
    if (statusElement) {
      const hasRealData = value !== 0;
      
      if (!hasRealData) {
        statusElement.textContent = 'Нет данных';
        statusElement.className = 'performance-status';
      } else if (value >= 1.0) {
        statusElement.textContent = 'Отлично';
        statusElement.className = 'performance-status green';
      } else if (value >= 0.96) {
        statusElement.textContent = 'Хорошо';
        statusElement.className = 'performance-status yellow';
      } else {
        statusElement.textContent = 'Требует внимания';
        statusElement.className = 'performance-status red';
      }
    }
  }
}

function updateForecastCard(id, value, unit) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.forecast-value');
    if (valueElement) {
      valueElement.textContent = value.toFixed(1);
    }
  }
}

function applyColorIndicators(metrics) {
  const { sv, cv, spi, cpi, eac, vac, bac } = metrics;
  
  const hasRealData = bac > 0 && (sv !== 0 || cv !== 0 || spi !== 0 || cpi !== 0);
  
  if (!hasRealData) {
    const allCards = document.querySelectorAll('.metric-card, .performance-card, .forecast-card');
    allCards.forEach(card => {
      card.classList.remove('green', 'yellow', 'red');
    });
    return;
  }
  
  applyColorToCard(document.getElementById("sv"), sv, COLOR_THRESHOLDS.SCHEDULE);
  applyColorToCard(document.getElementById("cv"), cv, COLOR_THRESHOLDS.COST);
  
  applyColorToPerformanceCard(document.getElementById("spi"), spi, COLOR_THRESHOLDS.PERFORMANCE);
  applyColorToPerformanceCard(document.getElementById("cpi"), cpi, COLOR_THRESHOLDS.PERFORMANCE);
  
  applyColorToCard(document.getElementById("vac"), vac, COLOR_THRESHOLDS.BUDGET);
  
  applyColorToEACCard(document.getElementById("eac"), eac, bac);
  
  applyColorToVACCard(document.getElementById("vac"), vac);
}

function applyColorToCard(card, value, thresholds) {
  if (!card) return;
  
  const { green, yellow } = thresholds;
  
  card.classList.remove('green', 'yellow', 'red');
  
  if (value >= green) {
    card.classList.add('green');
  } else if (value >= yellow) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

function applyColorToPerformanceCard(card, value, thresholds) {
  if (!card) return;
  
  const { green, yellow } = thresholds;
  
  card.classList.remove('green', 'yellow', 'red');
  
  if (value >= green) {
    card.classList.add('green');
  } else if (value >= yellow) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

function applyColorToEACCard(card, eac, bac) {
  if (!card) return;
  
  card.classList.remove('green', 'yellow', 'red');
  
  if (eac <= bac) {
    card.classList.add('green');
  } else if (eac <= bac + 40) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

function applyColorToVACCard(card, vac) {
  if (!card) return;
  
  card.classList.remove('green', 'yellow', 'red');
  
  if (vac >= 0) {
    card.classList.add('green');
  } else if (vac >= -40) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

function createEVMChart() {
  const ctx = document.getElementById('evmChart');
  if (!ctx) return;
  
  if (evmChart) {
    evmChart.destroy();
  }
  
  evmChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Начало', 'Текущий момент', 'Завершение'],
      datasets: [
        {
          label: 'PV (Плановый объем)',
          data: [0, 0, 0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'EV (Освоенный объем)',
          data: [0, 0, 0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'AC (Фактический объем)',
          data: [0, 0, 0],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'EAC (Прогноз завершения)',
          data: [0, 0, 0],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.05)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          borderDash: [5, 5],
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'ETC (Остаток до завершения)',
          data: [0, 0, 0],
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.05)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          borderDash: [3, 3],
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500'
            },
            filter: function(legendItem, chartData) {
              return legendItem.datasetIndex >= 3;
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y.toFixed(1);
              const label = context.dataset.label;
              
              if (label.includes('EAC')) {
                return `${label}: ${value} чел./час (прогноз)`;
              } else if (label.includes('ETC')) {
                return `${label}: ${value} чел./час (остаток)`;
              } else {
                return `${label}: ${value} чел./час`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 0, 0, 0.2)'
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            borderColor: 'rgba(0, 0, 0, 0.2)'
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12,
              weight: '500'
            },
            callback: function(value) {
              return value.toFixed(0) + ' ч/ч';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        point: {
          hoverBorderWidth: 3
        }
      }
    }
  });
}

function updateEVMChart(metrics) {
  if (!evmChart) return;
  
  const { pv, ev, ac, bac, eac, etc } = metrics;
  
  evmChart.data.datasets[0].data = [0, pv, bac];
  evmChart.data.datasets[1].data = [0, ev, bac];
  
  const currentAC = parseFloat(document.getElementById("ac").value);
  if (!isNaN(currentAC)) {
    evmChart.data.datasets[2].data = [0, currentAC, bac];
  }
  
  if (eac !== undefined && !isNaN(eac)) {
    evmChart.data.datasets[3].data = [0, currentAC, eac];
  }
  
  if (etc !== undefined && !isNaN(etc)) {
    evmChart.data.datasets[4].data = [0, 0, etc];
  }
  
  evmChart.update('active');
}

function updateChartInRealTime() {
  if (chartUpdateTimeout) {
    clearTimeout(chartUpdateTimeout);
  }
  
  chartUpdateTimeout = setTimeout(() => {
    try {
      const totalDays = parseFloat(document.getElementById("totalDays").value);
      const daysPassed = parseFloat(document.getElementById("daysPassed").value);
      const bac = parseFloat(document.getElementById("bac").value);
      const percentComplete = parseFloat(document.getElementById("percentComplete").value) / 100;
      const ac = parseFloat(document.getElementById("ac").value);
      
      if (isNaN(totalDays) || isNaN(daysPassed) || isNaN(bac) || isNaN(percentComplete) || isNaN(ac)) {
        return;
      }
      
      if (daysPassed > totalDays) {
        return;
      }
      
      const pv = (daysPassed / totalDays) * bac;
      const ev = percentComplete * bac;
      
      const cpi = ac !== 0 ? ev / ac : 1;
      const eac = cpi !== 0 ? ac + (bac - ev) / cpi : ac + (bac - ev);
      const etc = eac - ac;
      
      if (evmChart) {
        evmChart.data.datasets[0].data = [0, pv, bac];
        evmChart.data.datasets[1].data = [0, ev, bac];
        
        evmChart.data.datasets[3].data = [0, ac, eac];
        evmChart.data.datasets[4].data = [0, 0, etc];
        
        evmChart.update('active');
      }
      
    } catch (error) {
      console.error('Ошибка при обновлении графика в реальном времени:', error);
    }
  }, 300);
}

function updateACLine() {
  if (!evmChart) return;
  
  try {
    const ac = parseFloat(document.getElementById("ac").value);
    const bac = parseFloat(document.getElementById("bac").value);
    const percentComplete = parseFloat(document.getElementById("percentComplete").value) / 100;
    
    if (!isNaN(ac) && !isNaN(bac) && !isNaN(percentComplete)) {
      evmChart.data.datasets[2].data = [0, ac, bac];
      
      const ev = percentComplete * bac;
      const cpi = ac !== 0 ? ev / ac : 1;
      const eac = cpi !== 0 ? ac + (bac - ev) / cpi : ac + (bac - ev);
      const etc = eac - ac;
      
      evmChart.data.datasets[3].data = [0, ac, eac];
      evmChart.data.datasets[4].data = [0, 0, etc];
      
      evmChart.update('active');
    }
  } catch (error) {
    console.error('Ошибка при обновлении AC линии:', error);
  }
}

function resetEVMChart() {
  if (!evmChart) return;
  
  evmChart.data.datasets.forEach(dataset => {
    dataset.data = [];
  });
  
  evmChart.update('active');
}

function resetForm() {
  performReset();
}

function performReset() {
  try {
    if (chartUpdateTimeout) {
      clearTimeout(chartUpdateTimeout);
      chartUpdateTimeout = null;
    }
    

    
    const totalDaysInput = document.getElementById("totalDays");
    const daysPassedInput = document.getElementById("daysPassed");
    const bacInput = document.getElementById("bac");
    const percentCompleteInput = document.getElementById("percentComplete");
    const acInput = document.getElementById("ac");
    
    if (totalDaysInput) totalDaysInput.value = "0";
    if (daysPassedInput) daysPassedInput.value = "0";
    if (bacInput) bacInput.value = "0";
    if (percentCompleteInput) percentCompleteInput.value = "0";
    if (acInput) acInput.value = "0";
    
    resetAllCards();
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.disabled = true;
    }
    
  } catch (error) {
    console.error('Ошибка при сбросе формы:', error);
    console.log('Ошибка сброса: Произошла ошибка при сбросе формы. Проверьте консоль браузера.');
  }
}

function resetAllCards() {
  const metricCards = document.querySelectorAll('.metric-card');
  metricCards.forEach(card => {
    const valueElement = card.querySelector('.metric-value');
    if (valueElement) valueElement.textContent = '-';
    card.classList.remove('green', 'yellow', 'red');
  });
  
  const performanceCards = document.querySelectorAll('.performance-card');
  performanceCards.forEach(card => {
    const valueElement = card.querySelector('.performance-value');
    const statusElement = card.querySelector('.performance-status');
    if (valueElement) valueElement.textContent = '-';
    if (statusElement) {
      statusElement.textContent = '-';
      statusElement.className = 'performance-status';
    }
    card.classList.remove('green', 'yellow', 'red');
  });
  
  const forecastCards = document.querySelectorAll('.forecast-card');
  forecastCards.forEach(card => {
    const valueElement = card.querySelector('.forecast-value');
    if (valueElement) valueElement.textContent = '-';
    card.classList.remove('green', 'yellow', 'red');
  });
  
  resetEVMChart();
}

function exportResults() {
  const results = {};
  
  try {
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
      const id = card.id;
      const valueElement = card.querySelector('.metric-value');
      const labelElement = card.querySelector('.metric-label');
      
      if (valueElement && valueElement.textContent !== '-') {
        const label = labelElement ? labelElement.textContent : id;
        results[id] = {
          label: label,
          value: valueElement.textContent,
          unit: 'чел./час'
        };
      }
    });
    
    const performanceCards = document.querySelectorAll('.performance-card');
    performanceCards.forEach(card => {
      const id = card.id;
      const valueElement = card.querySelector('.performance-value');
      const statusElement = card.querySelector('.performance-status');
      const labelElement = card.querySelector('.performance-header span');
      
      if (valueElement && valueElement.textContent !== '-') {
        const label = labelElement ? labelElement.textContent : id;
        results[id] = {
          label: label,
          value: valueElement.textContent,
          status: statusElement ? statusElement.textContent : '-'
        };
      }
    });
    
    const forecastCards = document.querySelectorAll('.forecast-card');
    forecastCards.forEach(card => {
      const id = card.id;
      const valueElement = card.querySelector('.forecast-value');
      const labelElement = card.querySelector('.forecast-header span');
      
      if (valueElement && valueElement.textContent !== '-') {
        const label = labelElement ? labelElement.textContent : id;
        results[id] = {
          label: label,
          value: valueElement.textContent,
          unit: 'чел./час'
        };
      }
    });
    
    const projectInfo = {
      totalDays: document.getElementById('totalDays')?.value || '',
      daysPassed: document.getElementById('daysPassed')?.value || '',
      budget: document.getElementById('bac')?.value || '',
      percentComplete: document.getElementById('percentComplete')?.value || '',
      actualCost: document.getElementById('ac')?.value || ''
    };
    
    results.projectInfo = projectInfo;
    results.exportDate = new Date().toISOString();
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `evm_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    console.log('Ошибка экспорта: Произошла ошибка при экспорте результатов. Проверьте консоль браузера.');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createEVMChart();
  
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        calculateEVM();
      }
    });
  });
  
  const calculateBtn = document.querySelector('.btn-primary');
  const resetBtn = document.querySelector('.btn-secondary');
  const exportBtn = document.querySelector('.btn-export');
  
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateEVM);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportResults);
  }
  
  setTimeout(() => {
    showWelcomeModal();
  }, 500);
});
