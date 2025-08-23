// Константы для цветовых порогов
const COLOR_THRESHOLDS = {
  SCHEDULE: { green: 0, yellow: -40 },
  COST: { green: 0, yellow: -40 },
  PERFORMANCE: { green: 1, yellow: 0.96 },
  BUDGET: { green: 0, yellow: -40 }
};

// Константы для сообщений об ошибках
const ERROR_MESSAGES = {
  INVALID_INPUT: "Пожалуйста, введите корректные числовые значения.",
  NEGATIVE_VALUES: "Значения не могут быть отрицательными.",
  INVALID_PERCENT: "Процент выполнения должен быть от 0 до 100.",
  INVALID_DAYS: "Количество прошедших дней не может превышать общее количество дней."
};

// Переменная для хранения экземпляра графика
let evmChart = null;

/**
 * Основная функция расчета показателей EVM
 */
function calculateEVM() {
  try {
    // Получение и валидация входных данных
    const inputData = getAndValidateInputs();
    if (!inputData) return;

    // Расчет всех показателей EVM
    const evmMetrics = calculateEVMMetrics(inputData);
    
    // Отображение результатов
    displayResults(evmMetrics);
    
    // Применение цветовой индикации
    applyColorIndicators(evmMetrics);
    
  } catch (error) {
    console.error('Ошибка при расчете EVM:', error);
    alert('Произошла ошибка при расчете. Проверьте введенные данные.');
  }
}

/**
 * Получение и валидация входных данных
 */
function getAndValidateInputs() {
  const inputs = {
    totalDays: parseFloat(document.getElementById("totalDays").value),
    daysPassed: parseFloat(document.getElementById("daysPassed").value),
    bac: parseFloat(document.getElementById("bac").value),
    percentComplete: parseFloat(document.getElementById("percentComplete").value),
    ac: parseFloat(document.getElementById("ac").value)
  };

  // Проверка на NaN
  if (Object.values(inputs).some(isNaN)) {
    alert(ERROR_MESSAGES.INVALID_INPUT);
    return null;
  }

  // Проверка на отрицательные значения
  if (Object.values(inputs).some(value => value < 0)) {
    alert(ERROR_MESSAGES.NEGATIVE_VALUES);
    return null;
  }

  // Проверка процента выполнения
  if (inputs.percentComplete < 0 || inputs.percentComplete > 100) {
    alert(ERROR_MESSAGES.INVALID_PERCENT);
    return null;
  }

  // Проверка логики дней
  if (inputs.daysPassed > inputs.totalDays) {
    alert(ERROR_MESSAGES.INVALID_DAYS);
    return null;
  }

  // Конвертация процента в десятичную дробь
  inputs.percentComplete = inputs.percentComplete / 100;
  
  return inputs;
}

/**
 * Расчет всех показателей EVM
 */
function calculateEVMMetrics(inputs) {
  const { totalDays, daysPassed, bac, percentComplete, ac } = inputs;
  
  // Базовые расчеты
  const pv = (daysPassed / totalDays) * bac;
  const ev = percentComplete * bac;
  
  // Расчет отклонений
  const sv = ev - pv;
  const cv = ev - ac;
  
  // Расчет индексов производительности
  const spi = pv !== 0 ? ev / pv : 0;
  const cpi = ac !== 0 ? ev / ac : 0;
  
  // Расчет прогнозных показателей
  const eac = cpi !== 0 ? bac / cpi : 0;
  const etc = eac - ac;
  const vac = bac - eac;

  return {
    pv, ev, sv, cv, spi, cpi, eac, etc, vac,
    bac, // для цветовой индикации
    inputs // для дополнительной информации
  };
}

/**
 * Отображение результатов на странице
 */
function displayResults(metrics) {
  const { pv, ev, sv, cv, spi, cpi, eac, etc, vac } = metrics;
  
  // Обновление основных показателей
  updateMetricCard('pv', pv, 'чел./час');
  updateMetricCard('ev', ev, 'чел./час');
  updateMetricCard('sv', sv, 'чел./час');
  updateMetricCard('cv', cv, 'чел./час');
  
  // Обновление индексов производительности
  updatePerformanceCard('spi', spi);
  updatePerformanceCard('cpi', cpi);
  
  // Обновление прогнозных показателей
  updateForecastCard('eac', eac, 'чел./час');
  updateForecastCard('etc', etc, 'чел./час');
  updateForecastCard('vac', vac, 'чел./час');
  
  // Обновление графика
  updateEVMChart(metrics);
  
  // Активация кнопки экспорта
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.disabled = false;
  }
}

/**
 * Обновление карточки метрики
 */
function updateMetricCard(id, value, unit) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.metric-value');
    if (valueElement) {
      valueElement.textContent = value.toFixed(1);
    }
  }
}

/**
 * Обновление карточки производительности
 */
function updatePerformanceCard(id, value) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.performance-value');
    const statusElement = card.querySelector('.performance-status');
    
    if (valueElement) {
      valueElement.textContent = value.toFixed(2);
    }
    
    if (statusElement) {
      if (value >= 1.0) {
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

/**
 * Обновление карточки прогноза
 */
function updateForecastCard(id, value, unit) {
  const card = document.getElementById(id);
  if (card) {
    const valueElement = card.querySelector('.forecast-value');
    if (valueElement) {
      valueElement.textContent = value.toFixed(1);
    }
  }
}

/**
 * Применение цветовой индикации к результатам
 */
function applyColorIndicators(metrics) {
  const { sv, cv, spi, cpi, eac, vac, bac } = metrics;
  
  // Применение цветов к отклонениям
  applyColorToCard(document.getElementById("sv"), sv, COLOR_THRESHOLDS.SCHEDULE);
  applyColorToCard(document.getElementById("cv"), cv, COLOR_THRESHOLDS.COST);
  
  // Применение цветов к индексам производительности
  applyColorToPerformanceCard(document.getElementById("spi"), spi, COLOR_THRESHOLDS.PERFORMANCE);
  applyColorToPerformanceCard(document.getElementById("cpi"), cpi, COLOR_THRESHOLDS.PERFORMANCE);
  
  // Применение цветов к прогнозным показателям
  applyColorToCard(document.getElementById("vac"), vac, COLOR_THRESHOLDS.BUDGET);
  
  // Специальная обработка для EAC
  applyColorToEACCard(document.getElementById("eac"), eac, bac);
}

/**
 * Применение цвета к карточке метрики
 */
function applyColorToCard(card, value, thresholds) {
  if (!card) return;
  
  const { green, yellow } = thresholds;
  
  // Удаляем предыдущие цветовые классы
  card.classList.remove('green', 'yellow', 'red');
  
  if (value >= green) {
    card.classList.add('green');
  } else if (value >= yellow) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

/**
 * Применение цвета к карточке производительности
 */
function applyColorToPerformanceCard(card, value, thresholds) {
  if (!card) return;
  
  const { green, yellow } = thresholds;
  
  // Удаляем предыдущие цветовые классы
  card.classList.remove('green', 'yellow', 'red');
  
  if (value >= green) {
    card.classList.add('green');
  } else if (value >= yellow) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

/**
 * Специальная обработка цвета для EAC
 */
function applyColorToEACCard(card, eac, bac) {
  if (!card) return;
  
  // Удаляем предыдущие цветовые классы
  card.classList.remove('green', 'yellow', 'red');
  
  if (eac <= bac) {
    card.classList.add('green');
  } else if (eac <= bac + 40) {
    card.classList.add('yellow');
  } else {
    card.classList.add('red');
  }
}

/**
 * Создание графика EVM показателей
 */
function createEVMChart() {
  const ctx = document.getElementById('evmChart');
  if (!ctx) return;
  
  // Уничтожаем предыдущий график, если он существует
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
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Скрываем стандартную легенду, используем свою
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
              return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' чел./час';
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

/**
 * Обновление данных графика
 */
function updateEVMChart(metrics) {
  if (!evmChart) return;
  
  const { pv, ev, ac, bac } = metrics;
  
  // Обновляем данные для каждой линии
  evmChart.data.datasets[0].data = [0, pv, bac]; // PV линия
  evmChart.data.datasets[1].data = [0, ev, bac]; // EV линия  
  evmChart.data.datasets[2].data = [0, ac, bac]; // AC линия
  
  // Обновляем график
  evmChart.update('active');
}

/**
 * Сброс графика
 */
function resetEVMChart() {
  if (!evmChart) return;
  
  // Сбрасываем данные к нулевым значениям
  evmChart.data.datasets.forEach(dataset => {
    dataset.data = [0, 0, 0];
  });
  
  // Обновляем график
  evmChart.update('active');
}

/**
 * Сброс формы и результатов
 */
function resetForm() {
  console.log('Функция resetForm вызвана');
  
  try {
    // Сброс значений полей ввода
    const totalDaysInput = document.getElementById("totalDays");
    const daysPassedInput = document.getElementById("daysPassed");
    const bacInput = document.getElementById("bac");
    const percentCompleteInput = document.getElementById("percentComplete");
    const acInput = document.getElementById("ac");
    
    if (totalDaysInput) totalDaysInput.value = "31";
    if (daysPassedInput) daysPassedInput.value = "17";
    if (bacInput) bacInput.value = "1525";
    if (percentCompleteInput) percentCompleteInput.value = "52";
    if (acInput) acInput.value = "833";
    
    console.log('Значения полей сброшены');
    
    // Сброс всех карточек результатов
    resetAllCards();
    
    // Деактивация кнопки экспорта
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.disabled = true;
      console.log('Кнопка экспорта деактивирована');
    } else {
      console.log('Кнопка экспорта не найдена');
    }
    
    console.log('Форма успешно сброшена');
    
  } catch (error) {
    console.error('Ошибка при сбросе формы:', error);
    alert('Произошла ошибка при сбросе формы. Проверьте консоль браузера.');
  }
}

/**
 * Сброс всех карточек результатов
 */
function resetAllCards() {
  // Сброс основных метрик
  const metricCards = document.querySelectorAll('.metric-card');
  metricCards.forEach(card => {
    const valueElement = card.querySelector('.metric-value');
    if (valueElement) valueElement.textContent = '-';
    card.classList.remove('green', 'yellow', 'red');
  });
  
  // Сброс индексов производительности
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
  
  // Сброс прогнозных показателей
  const forecastCards = document.querySelectorAll('.forecast-card');
  forecastCards.forEach(card => {
    const valueElement = card.querySelector('.forecast-value');
    if (valueElement) valueElement.textContent = '-';
    card.classList.remove('green', 'yellow', 'red');
  });
  
  // Сброс графика
  resetEVMChart();
  
  console.log('Все карточки результатов сброшены');
}

/**
 * Экспорт результатов в JSON
 */
function exportResults() {
  const results = {};
  
  try {
    // Экспорт основных метрик
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
    
    // Экспорт индексов производительности
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
    
    // Экспорт прогнозных показателей
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
    
    // Добавляем информацию о проекте
    const projectInfo = {
      totalDays: document.getElementById('totalDays')?.value || '',
      daysPassed: document.getElementById('daysPassed')?.value || '',
      budget: document.getElementById('bac')?.value || '',
      percentComplete: document.getElementById('percentComplete')?.value || '',
      actualCost: document.getElementById('ac')?.value || ''
    };
    
    results.projectInfo = projectInfo;
    results.exportDate = new Date().toISOString();
    
    // Создание и скачивание файла
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `evm_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    console.log('Результаты успешно экспортированы');
    
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    alert('Произошла ошибка при экспорте результатов. Проверьте консоль браузера.');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM загружен, инициализация приложения...');
  
  // Создание графика
  createEVMChart();
  
  // Добавление обработчиков событий для Enter в полях ввода
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        calculateEVM();
      }
    });
  });
  
  // Добавление обработчиков для кнопок
  const calculateBtn = document.querySelector('.btn-primary');
  const resetBtn = document.querySelector('.btn-secondary');
  const exportBtn = document.querySelector('.btn-export');
  
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateEVM);
    console.log('Обработчик для кнопки "Рассчитать" добавлен');
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetForm);
    console.log('Обработчик для кнопки "Сбросить" добавлен');
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportResults);
    console.log('Обработчик для кнопки "Экспорт" добавлен');
  }
  
  console.log('Инициализация завершена');
});
