// Modal.js - Функциональность модального окна для EVM калькулятора

class Modal {
  constructor() {
    this.modal = null;
    this.overlay = null;
    this.isOpen = false;
    this.init();
  }

  /**
   * Инициализация модального окна
   */
  init() {
    this.createModalElements();
    this.bindEvents();
  }

  /**
   * Создание элементов модального окна
   */
  createModalElements() {
    // Создаем overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
         this.overlay.style.cssText = `
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.3);
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
       z-index: 1000;
       opacity: 0;
       visibility: hidden;
       transition: all 0.3s ease;
     `;

    // Создаем модальное окно
    this.modal = document.createElement('div');
    this.modal.className = 'modal';
         this.modal.style.cssText = `
       position: fixed;
       top: 50%;
       left: 50%;
       transform: translate(-50%, -50%) scale(0.7);
       background: white;
       border-radius: 16px;
       box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
       z-index: 1001;
       max-width: 90vw;
       max-height: 90vh;
       overflow: hidden;
       opacity: 0;
       visibility: hidden;
       transition: all 0.3s ease;
     `;

    // Добавляем элементы на страницу
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.modal);
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Закрытие по клику на overlay
    this.overlay.addEventListener('click', () => this.close());

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  /**
   * Открытие модального окна
   */
  open(content, options = {}) {
    const {
      title = 'Информация',
      width = '500px',
      height = 'auto',
      showCloseButton = true,
      closeOnOverlayClick = true
    } = options;

    // Настройка размеров
    this.modal.style.width = width;
    this.modal.style.height = height;

    // Создание содержимого
    this.modal.innerHTML = this.createModalContent(title, content, showCloseButton);

    // Настройка закрытия по overlay
    if (closeOnOverlayClick) {
      this.overlay.addEventListener('click', () => this.close());
    } else {
      this.overlay.removeEventListener('click', () => this.close());
    }

    // Привязка события закрытия кнопки
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Показываем модальное окно
    this.show();
  }

  /**
   * Создание содержимого модального окна
   */
  createModalContent(title, content, showCloseButton) {
    return `
      <div class="modal-header" style="
        padding: 20px 24px 16px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h3 class="modal-title" style="
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        ">${title}</h3>
        ${showCloseButton ? `
          <button class="modal-close" style="
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #64748b;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
          " onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#64748b'">
            ×
          </button>
        ` : ''}
      </div>
      <div class="modal-body" style="
        padding: 20px 24px;
        max-height: calc(90vh - 120px);
        overflow-y: auto;
      ">
        ${content}
      </div>
    `;
  }

  /**
   * Показ модального окна
   */
  show() {
    this.isOpen = true;
    this.overlay.style.opacity = '1';
    this.overlay.style.visibility = 'visible';
    this.modal.style.opacity = '1';
    this.modal.style.visibility = 'visible';
    this.modal.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden';
  }

  /**
   * Закрытие модального окна
   */
  close() {
    this.isOpen = false;
    this.overlay.style.opacity = '0';
    this.overlay.style.visibility = 'hidden';
    this.modal.style.opacity = '0';
    this.modal.style.visibility = 'hidden';
    this.modal.style.transform = 'translate(-50%, -50%) scale(0.7)';
    
    // Восстанавливаем прокрутку страницы
    document.body.style.overflow = '';
  }

  /**
   * Проверка, открыто ли модальное окно
   */
  isModalOpen() {
    return this.isOpen;
  }

  /**
   * Уничтожение модального окна
   */
  destroy() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}

// Создаем глобальный экземпляр модального окна
const modal = new Modal();

// Функции для удобного использования модального окна

/**
 * Показать информационное модальное окно
 */
function showInfoModal(title, content, options = {}) {
  modal.open(content, { title, ...options });
}

/**
 * Показать модальное окно с подтверждением
 */
function showConfirmModal(title, content, onConfirm, onCancel) {
  const confirmContent = `
    <div style="text-align: center;">
      <div style="margin-bottom: 20px;">
        ${content}
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="confirm-yes" class="btn btn-primary" style="
          background: #dc2626;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
        " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
          Да, подтвердить
        </button>
        <button id="confirm-no" class="btn btn-secondary" style="
          background: #64748b;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s ease;
        " onmouseover="this.style.background='#475569'" onmouseout="this.style.background='#64748b'">
          Отмена
        </button>
      </div>
    </div>
  `;

  modal.open(confirmContent, { 
    title, 
    showCloseButton: false,
    closeOnOverlayClick: false 
  });

  // Привязываем события кнопок
  setTimeout(() => {
    const yesBtn = document.getElementById('confirm-yes');
    const noBtn = document.getElementById('confirm-no');
    
    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        modal.close();
        if (onConfirm) onConfirm();
      });
    }
    
    if (noBtn) {
      noBtn.addEventListener('click', () => {
        modal.close();
        if (onCancel) onCancel();
      });
    }
  }, 100);
}

/**
 * Показать модальное окно с ошибкой
 */
function showErrorModal(title, error) {
  const errorContent = `
    <div style="text-align: center; color: #dc2626;">
      <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
      <div style="margin-bottom: 20px; font-size: 1.1rem;">
        ${error}
      </div>
      <button class="btn btn-primary" onclick="modal.close()" style="
        background: #dc2626;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s ease;
      " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
        Понятно
      </button>
    </div>
  `;
  
  modal.open(errorContent, { title, showCloseButton: false });
}

/**
 * Показать модальное окно с успехом
 */
function showSuccessModal(title, message) {
  const successContent = `
    <div style="text-align: center; color: #16a34a;">
      <div style="font-size: 3rem; margin-bottom: 16px;">✅</div>
      <div style="margin-bottom: 20px; font-size: 1.1rem;">
        ${message}
      </div>
      <button class="btn btn-primary" onclick="modal.close()" style="
        background: #16a34a;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s ease;
      " onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
        Отлично!
      </button>
    </div>
  `;
  
  modal.open(successContent, { title, showCloseButton: false });
}

/**
 * Показать модальное окно с детальной информацией о расчетах
 */
function showCalculationsModal() {
  const content = `
    <div style="max-width: 600px;">
      <h4 style="color: #2563eb; margin-bottom: 16px;">📊 Детализация расчетов EVM</h4>
      
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h5 style="margin: 0 0 12px 0; color: #1e293b;">Основные формулы:</h5>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          <li><strong>PV</strong> = (Дней прошло / Всего дней) × BAC</li>
          <li><strong>EV</strong> = % выполнено × BAC</li>
          <li><strong>SV</strong> = EV - PV (отклонение по срокам)</li>
          <li><strong>CV</strong> = EV - AC (отклонение по стоимости)</li>
          <li><strong>SPI</strong> = EV / PV (индекс выполнения графика)</li>
          <li><strong>CPI</strong> = EV / AC (индекс выполнения стоимости)</li>
        </ul>
      </div>
      
      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h5 style="margin: 0 0 12px 0; color: #1e293b;">Прогнозные показатели:</h5>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          <li><strong>EAC</strong> = AC + (BAC - EV) / CPI</li>
          <li><strong>ETC</strong> = EAC - AC</li>
          <li><strong>VAC</strong> = BAC - EAC</li>
        </ul>
      </div>
      
      <div style="background: #fffbeb; padding: 16px; border-radius: 8px;">
        <h5 style="margin: 0 0 12px 0; color: #1e293b;">Интерпретация результатов:</h5>
        <ul style="margin: 0; padding-left: 20px; color: #475569;">
          <li><strong>SPI > 1</strong>: Проект опережает график</li>
          <li><strong>SPI < 1</strong>: Проект отстает от графика</li>
          <li><strong>CPI > 1</strong>: Проект укладывается в бюджет</li>
          <li><strong>CPI < 1</strong>: Проект превышает бюджет</li>
          <li><strong>VAC > 0</strong>: Проект уложится в бюджет</li>
          <li><strong>VAC < 0</strong>: Проект превысит бюджет</li>
        </ul>
      </div>
    </div>
  `;
  
  modal.open(content, { 
    title: '📚 Справочник по EVM', 
    width: '700px',
    height: 'auto'
  });
}

/**
 * Показать приветственное модальное окно
 */
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
       
       <button onclick="modal.close()" style="
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
  
  modal.open(content, { 
    title: 'Добро пожаловать!', 
    width: '600px',
    height: 'auto',
    showCloseButton: false,
    closeOnOverlayClick: false
  });
}

// Экспортируем функции для использования в других файлах
window.Modal = Modal;
window.modal = modal;
window.showInfoModal = showInfoModal;
window.showConfirmModal = showConfirmModal;
window.showErrorModal = showErrorModal;
window.showSuccessModal = showSuccessModal;
window.showCalculationsModal = showCalculationsModal;
window.showWelcomeModal = showWelcomeModal;
