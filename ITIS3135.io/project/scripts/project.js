// project/scripts/project.js
// Handles: theme toggle, lessons accordion, practice quiz evaluation
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }



  // LESSONS - accordion behaviour
  function setupLessonsAccordion() {
    // target sections with id starting with 'lesson'
    const lessonSections = Array.from(document.querySelectorAll('main section[id^="lesson"]'));
    if (!lessonSections.length) return;
    lessonSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (!h2) return;
      // wrap content (everything except h2) into a div
      const children = Array.from(section.children).filter(c => c !== h2);
      const body = document.createElement('div');
      body.className = 'lesson-body';
      children.forEach(c => body.appendChild(c));
      section.appendChild(body);
      // start collapsed
      body.style.display = 'none';
      h2.style.cursor = 'pointer';
      h2.setAttribute('aria-expanded', 'false');
      h2.tabIndex = 0;
      h2.addEventListener('click', () => {
        const showing = body.style.display !== 'none';
        body.style.display = showing ? 'none' : 'block';
        h2.setAttribute('aria-expanded', (!showing).toString());
      });
      h2.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          h2.click();
        }
      });
    });
  }

  // PRACTICE - simple quiz evaluation
  function setupQuiz() {
    const quizForm = document.getElementById('quiz-form');
    if (!quizForm) return;
    quizForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const qEls = Array.from(quizForm.querySelectorAll('.question'));
      let correct = 0;
      qEls.forEach((qEl, idx) => {
        const chosen = qEl.querySelector('input[type="radio"]:checked');
        const result = qEl.querySelector('.result');
        const correctVal = qEl.getAttribute('data-correct');
        if (!result) return;
        if (chosen && chosen.value === correctVal) {
          result.textContent = 'Correct ✅';
          result.style.color = 'green';
          correct += 1;
        } else {
          result.textContent = 'Incorrect ❌';
          result.style.color = 'crimson';
        }
      });
      const scoreEl = document.getElementById('quiz-score');
      if (scoreEl) scoreEl.textContent = `Score: ${correct} / ${qEls.length}`;
    });
  }

  ready(function () {
    setupThemeToggle();
    setupLessonsAccordion();
    setupQuiz();
  });
})();
