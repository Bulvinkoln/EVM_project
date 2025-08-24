function showWelcomeModal() {
  const content = `
    <div style="text-align: center; padding: 20px;">
      <h2 style="color: #1e40af; margin-bottom: 15px;">Добро пожаловать в EVM Calculator!</h2>
      
      <p style="color: #6b7280; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
        Профессиональный калькулятор для расчета показателей управления проектами по методу EVM (Earned Value Management).
      </p>
      
      <div style="background: #fef3c7; padding: 16px; border-radius: 12px; margin: 15px 0; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; font-size: 1rem; line-height: 1.6; margin: 0; font-weight: 500;">
          ⚠️ <strong>Важно:</strong> EVM метод разработан для каскадных (водопадных) моделей управления проектами и не применим к гибким методологиям (Agile, Scrum, Kanban).
        </p>
      </div>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h4 style="color: #374151; font-size: 1.2rem; margin-bottom: 15px;">📊 Основные возможности</h4>
        <ul style="color: #6b7280; font-size: 1rem; line-height: 1.6; padding-left: 20px; text-align: left;">
          <li>Расчет EVM метрик (PV, EV, AC, SV, CV, SPI, CPI)</li>
          <li>Прогнозные показатели (EAC, ETC, VAC)</li>
          <li>Интерактивный график в реальном времени</li>
        </ul>
      </div>
      
             <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin: 20px 0;">
         <h4 style="color: #1e40af; font-size: 1.2rem; margin-bottom: 15px;">👨‍💼 Автор</h4>
         <p style="color: #1e40af; font-size: 1rem; line-height: 1.6; font-weight: 500;">
           <strong>Владимир Якимков</strong><br>
           Руководитель проектов
         </p>
       </div>
       
       <button onclick="closeWelcomeModal()" style="
         background: linear-gradient(135deg, #3b82f6, #1e40af);
         color: white;
         border: none;
         padding: 16px 32px;
         border-radius: 12px;
         font-size: 1.1rem;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
         box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
       " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(59, 130, 246, 0.3)'">
         🚀 Начать работу!
       </button>
     </div>
  `;
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
  `;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      text-align: center;
      position: relative;
  `;

  modal.innerHTML = content;

  modalOverlay.appendChild(modal);
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
          closeWelcomeModal();
      }
  });
}

function closeWelcomeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}
