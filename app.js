/**
 * app.js - Lógica interativa do Pedido de Desculpas (PWA)
 * - Botão 'Não' fujão (mobile touch + desktop hover)
 * - Contador de tentativas (> 5 vezes o botão desaparece)
 * - Celebração com show de fogos de artifício e corações
 * - Efeitos sonoros suaves sintetizados via Web Audio API
 */

(function () {
  'use strict';

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('PWA ServiceWorker registrado com sucesso:', reg.scope))
        .catch((err) => console.warn('Falha ao registrar ServiceWorker:', err));
    });
  }

  // Elementos da Interface
  const questionCard = document.getElementById('question-card');
  const celebrationCard = document.getElementById('celebration-card');
  const btnSim = document.getElementById('btn-sim');
  const btnNao = document.getElementById('btn-nao');
  const btnRestart = document.getElementById('btn-restart');
  const feedbackContainer = document.getElementById('attempt-feedback');

  // Inicializar Fogos de Artifício
  let fireworks = null;
  if (window.FireworksDisplay) {
    fireworks = new window.FireworksDisplay('fireworks-canvas');
  }

  // Áudio Sintetizado via Web Audio API (100% autônomo e offline)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Som suave de pulo do botão
  function playPopSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Ignora silenciosamente se o navegador bloquear áudio pré-interação
    }
  }

  // Melodia romântica de celebração
  function playCelebrationChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // Dó, Mi, Sol, Dó alto, Mi alto
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }, idx * 140);
      });
    } catch (e) {
      // Audio playback fallback
    }
  }

  // Mensagens para cada tentativa de tocar no "Não"
  const feedbackMessages = [
    "Opa, errou o botão? 🙈",
    "Ei, não vale tentar recusar! 🥺",
    "Olha como ele foge de você! 😂💕",
    "Você tem certeza disso mesmo? 💔",
    "Última chance de tentar clicar no Não... 👀"
  ];

  let naoAttempts = 0;
  let isNaoActive = true;

  // Atualizar a mensagem na tela
  function showFeedback(text) {
    feedbackContainer.innerHTML = `<span class="feedback-pill">${text}</span>`;
  }

  // Mover o botão Não para uma posição aleatória na tela
  function moveNaoButton() {
    if (!isNaoActive) return;

    naoAttempts++;
    playPopSound();

    if (!btnNao.classList.contains('fleeing')) {
      btnNao.classList.add('fleeing');
    }

    // Se ultrapassar 5 tentativas (> 5), o botão Não desaparece!
    if (naoAttempts > 5) {
      isNaoActive = false;
      btnNao.classList.add('poof-away');

      showFeedback("O 'Não' fugiu de vez! Agora só restou uma opção... 🥰❤️");

      // Destacar o botão Sim
      btnSim.classList.add('sim-expanded');
      btnSim.innerHTML = 'Sim, desculpo você! 💖';

      setTimeout(() => {
        btnNao.style.display = 'none';
      }, 500);
      return;
    }

    // Exibir frase correspondente à tentativa atual
    const msgIndex = Math.min(naoAttempts - 1, feedbackMessages.length - 1);
    showFeedback(feedbackMessages[msgIndex]);

    // Calcular nova posição dentro dos limites da tela (viewport)
    const btnRect = btnNao.getBoundingClientRect();
    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 48;

    const marginX = 24;
    const marginTop = 60;
    const marginBottom = 90;

    const maxX = Math.max(20, window.innerWidth - btnWidth - marginX);
    const maxY = Math.max(marginTop, window.innerHeight - btnHeight - marginBottom);

    let newX = Math.floor(Math.random() * (maxX - marginX)) + marginX;
    let newY = Math.floor(Math.random() * (maxY - marginTop)) + marginTop;

    // Garantir que fique a uma distância mínima de onde estava para o salto ser nítido
    const currX = btnRect.left || 0;
    const currY = btnRect.top || 0;
    if (Math.hypot(newX - currX, newY - currY) < 120) {
      newX = (newX + 150) % maxX;
      newY = (newY + 120) % maxY;
    }

    btnNao.style.left = `${newX}px`;
    btnNao.style.top = `${newY}px`;
  }

  // Eventos para o botão Não fugir (desktop e mobile)
  btnNao.addEventListener('pointerenter', (e) => {
    e.preventDefault();
    moveNaoButton();
  });

  btnNao.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNaoButton();
  }, { passive: false });

  btnNao.addEventListener('click', (e) => {
    e.preventDefault();
    moveNaoButton();
  });

  // Evento ao Clicar em "Sim"
  function handleSimClick() {
    playCelebrationChime();

    // Iniciar show de fogos de artifício e corações
    if (fireworks) {
      fireworks.start();
    }

    // Ocultar card de pergunta e exibir tela de celebração
    questionCard.style.animation = 'poof-disappear 0.4s forwards';
    setTimeout(() => {
      questionCard.classList.add('hidden');
      celebrationCard.classList.remove('hidden');
    }, 380);
  }

  btnSim.addEventListener('click', handleSimClick);

  // Botão para comemorar de novo
  btnRestart.addEventListener('click', () => {
    playCelebrationChime();
    if (fireworks) {
      // Disparar uma salva especial de fogos em forma de coração
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          fireworks.createFirework(
            window.innerWidth * (0.2 + i * 0.15),
            window.innerHeight * (0.2 + (i % 2) * 0.15),
            true
          );
        }, i * 220);
      }
    }
  });

})();
