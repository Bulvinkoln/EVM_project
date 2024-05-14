function calculateEVM() {
  const totalDays = parseFloat(document.getElementById("totalDays").value);
  const daysPassed = parseFloat(document.getElementById("daysPassed").value);
  const bac = parseFloat(document.getElementById("bac").value);
  const percentComplete =
    parseFloat(document.getElementById("percentComplete").value) / 100;
  const ac = parseFloat(document.getElementById("ac").value);

  if (
    isNaN(totalDays) ||
    isNaN(daysPassed) ||
    isNaN(bac) ||
    isNaN(percentComplete) ||
    isNaN(ac)
  ) {
    alert("Пожалуйста, введите все значения.");
    return;
  }

  // Расчет показателей
  const pv = (daysPassed / totalDays) * bac;
  const ev = percentComplete * bac;
  const sv = ev - pv;
  const cv = ev - ac;
  const spi = ev / pv;
  const cpi = ev / ac;
  const eac = bac / cpi;
  const etc = eac - ac;
  const vac = bac - eac;

  // Отображение показателей
  document.getElementById(
    "pv"
  ).textContent = `Плановый объем на текущую дату (PV): ${pv.toFixed(
    1
  )} чел./час`;
  document.getElementById(
    "ev"
  ).textContent = `Освоенный объем (EV): ${ev.toFixed(1)} чел./час`;
  document.getElementById(
    "sv"
  ).textContent = `Отклонение по срокам (SV): ${sv.toFixed(1)} чел./час`;
  document.getElementById(
    "cv"
  ).textContent = `Отклонение по стоимости (CV): ${cv.toFixed(1)} чел./час`;
  document.getElementById(
    "spi"
  ).textContent = `Индекс выполнения графика (SPI): ${spi.toFixed(2)}`;
  document.getElementById(
    "cpi"
  ).textContent = `Индекс выполнения стоимости (CPI): ${cpi.toFixed(2)}`;
  document.getElementById(
    "eac"
  ).textContent = `Прогнозируемая оценка по завершению (EAC): ${eac.toFixed(
    1
  )} чел./час`;
  document.getElementById(
    "etc"
  ).textContent = `Оценка до завершения (ETC): ${etc.toFixed(1)} чел./час`;
  document.getElementById(
    "vac"
  ).textContent = `Отклонение бюджета по завершению (VAC): ${vac.toFixed(
    1
  )} чел./час`;

  // Применение цветовой градации
  applyColor(document.getElementById("sv"), sv, 0, -40);
  applyColor(document.getElementById("cv"), cv, 0, -40);
  applyColor(document.getElementById("spi"), spi, 1, 0.96);
  applyColor(document.getElementById("cpi"), cpi, 1, 0.96);
  applyColorEAC(document.getElementById("eac"), eac, bac);
  applyColor(document.getElementById("vac"), vac, 0, -40);
}

function applyColor(element, value, greenThreshold, yellowThresholdStart) {
  element.className =
    value >= greenThreshold
      ? "green"
      : value >= yellowThresholdStart
      ? "yellow"
      : "red";
}

function applyColorEAC(element, eac, bac) {
  if (eac <= bac) {
    element.className = "green";
  } else if (eac <= bac + 40) {
    element.className = "yellow";
  } else {
    element.className = "red";
  }
}
