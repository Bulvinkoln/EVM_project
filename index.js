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
  
  const resultElements = {
    pv: `Плановый объем на текущую дату (PV): ${pv.toFixed(1)} чел./час`,
    ev: `Освоенный объем (EV): ${ev.toFixed(1)} чел./час`,
    sv: `Отклонение по срокам (SV): ${sv.toFixed(1)} чел./час`,
    cv: `Отклонение по стоимости (CV): ${cv.toFixed(1)} чел./час`,
    spi: `Индекс выполнения графика (SPI): ${spi.toFixed(2)}`,
    cpi: `Индекс выполнения стоимости (CPI): ${cpi.toFixed(2)}`,
    eac: `Прогнозируемая оценка по завершению (EAC): ${eac.toFixed(1)} чел./час`,
    etc: `Оценка до завершения (ETC): ${etc.toFixed(1)} чел./час`,
    vac: `Отклонение бюджета по завершению (VAC): ${vac.toFixed(1)} чел./час`
  };

  // Обновление всех элементов результатов
  Object.entries(resultElements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  });

  // Активация кнопки экспорта
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.disabled = false;
  }
}

/**
 * Применение цветовой индикации к результатам
 */
function applyColorIndicators(metrics) {
  const { sv, cv, spi, cpi, eac, vac, bac } = metrics;
  
  // Применение цветов к отклонениям и индексам
  applyColor(document.getElementById("sv"), sv, COLOR_THRESHOLDS.SCHEDULE);
  applyColor(document.getElementById("cv"), cv, COLOR_THRESHOLDS.COST);
  applyColor(document.getElementById("spi"), spi, COLOR_THRESHOLDS.PERFORMANCE);
  applyColor(document.getElementById("cpi"), cpi, COLOR_THRESHOLDS.PERFORMANCE);
  applyColor(document.getElementById("vac"), vac, COLOR_THRESHOLDS.BUDGET);
  
  // Специальная обработка для EAC
  applyColorEAC(document.getElementById("eac"), eac, bac);
}

/**
 * Применение цвета к элементу на основе значения и порогов
 */
function applyColor(element, value, thresholds) {
  if (!element) return;
  
  const { green, yellow } = thresholds;
  
  if (value >= green) {
    element.className = "result green";
  } else if (value >= yellow) {
    element.className = "result yellow";
  } else {
    element.className = "result red";
  }
}

/**
 * Специальная обработка цвета для EAC
 */
function applyColorEAC(element, eac, bac) {
  if (!element) return;
  
  if (eac <= bac) {
    element.className = "result green";
  } else if (eac <= bac + 40) {
    element.className = "result yellow";
  } else {
    element.className = "result red";
  }
}

/**
 * Сброс формы и результатов
 */
function resetForm() {
  // Сброс значений полей ввода
  document.getElementById("totalDays").value = "31";
  document.getElementById("daysPassed").value = "17";
  document.getElementById("bac").value = "1525";
  document.getElementById("percentComplete").value = "52";
  document.getElementById("ac").value = "833";
  
  // Очистка результатов
  const resultElements = document.querySelectorAll('.results div');
  resultElements.forEach(element => {
    element.textContent = '';
    element.className = '';
  });

  // Деактивация кнопки экспорта
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.disabled = true;
  }
}

/**
 * Экспорт результатов в JSON
 */
function exportResults() {
  const results = {};
  const resultElements = document.querySelectorAll('.results div');
  
  resultElements.forEach(element => {
    if (element.textContent) {
      const key = element.id || 'result';
      results[key] = element.textContent;
    }
  });
  
  const dataStr = JSON.stringify(results, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'evm_results.json';
  link.click();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Добавление обработчиков событий для Enter в полях ввода
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        calculateEVM();
      }
    });
  });
});
