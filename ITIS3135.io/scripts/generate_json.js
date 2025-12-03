// generate_json.js - build JSON from the introduction form and render it as highlighted code
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('introForm');
  const genBtn = document.getElementById('genJsonBtn');
  const coursesDiv = document.getElementById('courses');
  const preview = document.getElementById('preview');
  const defaultPreviewSrc = preview ? preview.src : '';

  function collectFormData() {
    const fd = new FormData(form);
    const obj = {};
    // simple fields
    [
      'first','middle','nick','last','ack','ackdate','mascAdj','mascAnimal','divider','piccap','personal'
    ].forEach(k => { obj[k] = fd.get(k) || ''; });

    // picture preview (data URL or default path)
    obj.picturePreview = (preview && preview.src) ? preview.src : defaultPreviewSrc;

    // bullets
    obj.bullets = [];
    for (let i = 1; i <= 7; i++) {
      const v = fd.get('bullet' + i);
      obj.bullets.push(v || '');
    }

    // courses from dynamic course items
    obj.courses = [];
    const courseItems = coursesDiv.querySelectorAll('.course-item');
    courseItems.forEach(item => {
      const inputs = item.querySelectorAll('input');
      const course = {
        dept: (inputs[0] && inputs[0].value) || '',
        number: (inputs[1] && inputs[1].value) || '',
        name: (inputs[2] && inputs[2].value) || '',
        reason: (inputs[3] && inputs[3].value) || ''
      };
      obj.courses.push(course);
    });

    // quote and small fields
    ['quote','quoteAuth','funny','share'].forEach(k => { obj[k] = fd.get(k) || ''; });

    // links
    obj.links = [];
    for (let i = 1; i <= 5; i++) {
      const l = fd.get('link' + i);
      if (l) obj.links.push(l);
    }

    return obj;
  }

  function showJson(jsonText) {
    // hide the form
    form.style.display = 'none';

    // change any H2 text "Introduction Form" -> "Introduction HTML" if present
    const h2 = document.querySelector('h2');
    if (h2 && h2.textContent.includes('Introduction Form')) h2.textContent = 'Introduction HTML';

    const main = document.querySelector('main');

    const container = document.createElement('div');
    container.className = 'result json-result';

    const h2out = document.createElement('h2');
    h2out.textContent = 'Introduction HTML';
    container.appendChild(h2out);

    const section = document.createElement('section');
    section.style.maxWidth = '900px';

    const infoP = document.createElement('p');
    infoP.textContent = 'Below is your introduction data as JSON. You can select and copy everything to get a JSON file.';
    section.appendChild(infoP);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'json';
    code.textContent = jsonText;
    pre.appendChild(code);
    section.appendChild(pre);

    // Add a "Back to Edit" link
    const back = document.createElement('p');
    back.style.marginTop = '1em';
    back.innerHTML = '<a href="#" id="backToEditJson">Back to Edit Form</a>';
    section.appendChild(back);

    container.appendChild(section);
    main.appendChild(container);

    // highlight using highlight.js if available
    if (window.hljs && typeof hljs.highlightElement === 'function') {
      try { hljs.highlightElement(code); } catch (e) { /* ignore */ }
    } else if (window.hljs && typeof hljs.highlightAll === 'function') {
      try { hljs.highlightAll(); } catch (e) { }
    }

    document.getElementById('backToEditJson').addEventListener('click', function (ev) {
      ev.preventDefault();
      container.remove();
      // restore form and preview if needed
      form.style.display = '';
    });
  }

  if (genBtn) {
    genBtn.addEventListener('click', function () {
      // basic validation: ensure required fields are present
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const obj = collectFormData();
      const jsonText = JSON.stringify(obj, null, 2);
      showJson(jsonText);
    });
  }

});
