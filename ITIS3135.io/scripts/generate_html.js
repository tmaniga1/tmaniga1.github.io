// generate_html.js - build HTML from the introduction form and render it as highlighted code
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('introForm');
  const genBtn = document.getElementById('genHtmlBtn');
  const coursesDiv = document.getElementById('courses');
  const preview = document.getElementById('preview');
  const defaultPreviewSrc = preview ? preview.src : '';

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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

  function buildHtml(obj) {
    // Build an HTML document string that mirrors introduction.html structure.
    const title = escapeHtml((obj.first + ' ' + obj.last).trim() || 'Introduction');
    const pic = escapeHtml(obj.picturePreview || '');
    const piccap = escapeHtml(obj.piccap || '');
    const personal = escapeHtml(obj.personal || '');

    let bulletsHtml = '';
    if (obj.bullets && obj.bullets.length) {
      bulletsHtml = '<h3>Highlights</h3>\n<ul>\n' + obj.bullets.map(b => '  <li>' + escapeHtml(b) + '</li>').join('\n') + '\n</ul>\n';
    }

    let coursesHtml = '';
    if (obj.courses && obj.courses.length) {
      coursesHtml = '<h3>Courses</h3>\n<ul>\n' + obj.courses.map(c => '  <li><strong>' + escapeHtml(c.dept) + ' ' + escapeHtml(c.number) + '</strong>: ' + escapeHtml(c.name) + (c.reason ? ' — ' + escapeHtml(c.reason) : '') + '</li>').join('\n') + '\n</ul>\n';
    }

    let quoteHtml = '';
    if (obj.quote) {
      quoteHtml = '<blockquote>\n  <p>' + escapeHtml(obj.quote) + '</p>\n';
      if (obj.quoteAuth) quoteHtml += '  <p>— ' + escapeHtml(obj.quoteAuth) + '</p>\n';
      quoteHtml += '</blockquote>\n';
    }

    let linksHtml = '';
    if (obj.links && obj.links.length) {
      linksHtml = '<h3>Links</h3>\n<ul>\n' + obj.links.map(l => '  <li><a href="' + escapeHtml(l) + '">' + escapeHtml(l) + '</a></li>').join('\n') + '\n</ul>\n';
    }

    const html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>${title}</title>\n  <link rel="stylesheet" href="styles/default.css">\n</head>\n<body>\n  <header>\n    <h1>${title}</h1>\n    <div data-include="components/header.html"></div>\n  </header>\n  <main>\n    <h2>Introduction HTML</h2>\n    <section>\n      ${pic ? '<img src="' + pic + '" alt="' + title + '" class="section-img">' : ''}\n      ${piccap ? '<div class="img-caption">' + piccap + '</div>' : ''}\n      <p>${personal}</p>\n      ${bulletsHtml}\n      ${coursesHtml}\n      ${quoteHtml}\n      ${linksHtml}\n    </section>\n  </main>\n  <footer>\n    <div data-include="components/footer.html"></div>\n  </footer>\n  <script src="scripts/HTML.Include.min.js"></script>\n</body>\n</html>`;

    return html;
  }

  function showHtmlText(htmlText) {
    // hide the form
    form.style.display = 'none';

    // change any H2 text "Introduction Form" -> "Introduction HTML" if present
    const h2 = document.querySelector('h2');
    if (h2 && h2.textContent.includes('Introduction Form')) h2.textContent = 'Introduction HTML';

    const main = document.querySelector('main');

    const container = document.createElement('div');
    container.className = 'result html-result';

    const h2out = document.createElement('h2');
    h2out.textContent = 'Introduction HTML';
    container.appendChild(h2out);

    const section = document.createElement('section');
    section.style.maxWidth = '900px';

    const infoP = document.createElement('p');
    infoP.textContent = 'Below is your introduction formatted as HTML. Select and copy everything to get the HTML.';
    section.appendChild(infoP);

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = 'html';
    code.textContent = htmlText;
    pre.appendChild(code);
    section.appendChild(pre);

    const back = document.createElement('p');
    back.style.marginTop = '1em';
    back.innerHTML = '<a href="#" id="backToEditHtml">Back to Edit Form</a>';
    section.appendChild(back);

    container.appendChild(section);
    main.appendChild(container);

    // highlight using highlight.js if available
    if (window.hljs && typeof hljs.highlightElement === 'function') {
      try { hljs.highlightElement(code); } catch (e) { /* ignore */ }
    } else if (window.hljs && typeof hljs.highlightAll === 'function') {
      try { hljs.highlightAll(); } catch (e) { }
    }

    document.getElementById('backToEditHtml').addEventListener('click', function (ev) {
      ev.preventDefault();
      container.remove();
      form.style.display = '';
    });
  }

  if (genBtn) {
    genBtn.addEventListener('click', function () {
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const obj = collectFormData();
      const htmlText = buildHtml(obj);
      showHtmlText(htmlText);
    });
  }

});
