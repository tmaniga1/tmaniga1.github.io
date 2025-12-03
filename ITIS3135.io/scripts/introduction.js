// introduction.js - handles intro form behavior and submission
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('introForm');
  const clearBtn = document.getElementById('clearBtn');
  const addCourseBtn = document.getElementById('addCourse');
  const coursesDiv = document.getElementById('courses');
  const pictureInput = document.getElementById('picture');
  const preview = document.getElementById('preview');
  const defaultPreviewSrc = preview ? preview.src : '';

  // helper to create a course item
  function createCourseItem(dept = '', number = '', name = '', reason = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'course-item';

    const deptInput = document.createElement('input');
    deptInput.placeholder = 'Department';
    deptInput.value = dept;

    const numInput = document.createElement('input');
    numInput.placeholder = 'Number';
    numInput.value = number;

    const nameInput = document.createElement('input');
    nameInput.placeholder = 'Course name';
    nameInput.value = name;

    const reasonInput = document.createElement('input');
    reasonInput.placeholder = 'Reason';
    reasonInput.value = reason;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => wrapper.remove());

    wrapper.appendChild(deptInput);
    wrapper.appendChild(numInput);
    wrapper.appendChild(nameInput);
    wrapper.appendChild(reasonInput);
    wrapper.appendChild(del);

    return wrapper;
  }

  // add initial course example
  coursesDiv.appendChild(createCourseItem('ITIS', '3135', 'Web Dev', 'Required'));

  addCourseBtn.addEventListener('click', () => {
    coursesDiv.appendChild(createCourseItem());
  });

  // Clear button: clear form fields
  clearBtn.addEventListener('click', function () {
    form.reset();
    // reset preview image
    if (preview) preview.src = defaultPreviewSrc;
    // remove extra course items except first
    const items = coursesDiv.querySelectorAll('.course-item');
    items.forEach((it, idx) => { if (idx > 0) it.remove(); });
  });

  // Image preview handling
  if (pictureInput) {
    pictureInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) {
        preview.src = defaultPreviewSrc;
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        preview.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Submit handling
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // basic HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Gather data
    const data = new FormData(form);
    const first = data.get('first') || '';
    const last = data.get('last') || '';
    const personal = data.get('personal') || '';
    const piccap = data.get('piccap') || '';
    const imageSrc = preview.src || defaultPreviewSrc;

    // Build output that matches introduction.html structure
    const result = document.createElement('div');
    result.className = 'result';

    // Use H2 text as "Introduction Form" per evaluation requirements
    const h2 = document.createElement('h2');
    h2.textContent = 'Introduction Form';
    result.appendChild(h2);

    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = first + ' ' + last;
    img.className = 'section-img';
    result.appendChild(img);

    if (piccap) {
      const cap = document.createElement('div');
      cap.className = 'img-caption';
      cap.textContent = piccap;
      result.appendChild(cap);
    }

    const p = document.createElement('p');
    p.textContent = personal;
    result.appendChild(p);

    // Bullets (7 main bullets)
    const bulletsWrap = document.createElement('div');
    bulletsWrap.className = 'bullets';
    const bulletsTitle = document.createElement('h3');
    bulletsTitle.textContent = 'Highlights';
    bulletsWrap.appendChild(bulletsTitle);
    const bulletsList = document.createElement('ul');
    for (let i = 1; i <= 7; i++) {
      const val = data.get('bullet' + i);
      if (val && val.trim()) {
        const li = document.createElement('li');
        li.textContent = val;
        bulletsList.appendChild(li);
      }
    }
    if (bulletsList.children.length) bulletsWrap.appendChild(bulletsList);
    result.appendChild(bulletsWrap);

    // Courses
    const courseItems = coursesDiv.querySelectorAll('.course-item');
    if (courseItems.length) {
      const coursesWrap = document.createElement('div');
      coursesWrap.className = 'courses-list';
      const coursesTitle = document.createElement('h3');
      coursesTitle.textContent = 'Courses';
      coursesWrap.appendChild(coursesTitle);
      const courseUl = document.createElement('ul');
      courseItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        const dept = (inputs[0] && inputs[0].value) || '';
        const number = (inputs[1] && inputs[1].value) || '';
        const name = (inputs[2] && inputs[2].value) || '';
        const reason = (inputs[3] && inputs[3].value) || '';
        if (dept || number || name || reason) {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${dept} ${number}</strong>: ${name}${reason ? ' — ' + reason : ''}`;
          courseUl.appendChild(li);
        }
      });
      if (courseUl.children.length) coursesWrap.appendChild(courseUl);
      result.appendChild(coursesWrap);
    }

    // Quote
    const quoteVal = data.get('quote');
    const quoteAuth = data.get('quoteAuth');
    if (quoteVal && quoteVal.trim()) {
      const block = document.createElement('blockquote');
      const qP = document.createElement('p');
      qP.textContent = quoteVal;
      block.appendChild(qP);
      if (quoteAuth && quoteAuth.trim()) {
        // Use a plain paragraph for the author so it doesn't pick up global <footer> styles
        const authorEl = document.createElement('p');
        authorEl.textContent = '— ' + quoteAuth;
        block.appendChild(authorEl);
      }
      result.appendChild(block);
    }

    // Optional small fields: funny, share
    const funny = data.get('funny');
    const share = data.get('share');
    if (funny && funny.trim()) {
      const f = document.createElement('p');
      f.textContent = 'Funny: ' + funny;
      result.appendChild(f);
    }
    if (share && share.trim()) {
      const s = document.createElement('p');
      s.textContent = 'Share: ' + share;
      result.appendChild(s);
    }

    // Links
    const linksWrap = document.createElement('div');
    linksWrap.className = 'links';
    const linksTitle = document.createElement('h3');
    linksTitle.textContent = 'Links';
    linksWrap.appendChild(linksTitle);
    let linksAdded = 0;
    for (let i = 1; i <= 5; i++) {
      const l = data.get('link' + i);
      if (l && l.trim()) {
        const a = document.createElement('a');
        a.href = l;
        a.textContent = l;
        a.target = '_blank';
        a.rel = 'noopener';
        const div = document.createElement('div');
        div.appendChild(a);
        linksWrap.appendChild(div);
        linksAdded++;
      }
    }
    if (linksAdded) result.appendChild(linksWrap);

    // Hide form and show result
    form.style.display = 'none';
    const main = document.querySelector('main');
    main.appendChild(result);

    // Add reset link so user can try again
    const resetLink = document.createElement('p');
    resetLink.style.marginTop = '1em';
    resetLink.innerHTML = '<a href="#" id="backToForm">Reset and Edit Form</a>';
    main.appendChild(resetLink);

    document.getElementById('backToForm').addEventListener('click', function (ev) {
      ev.preventDefault();
      result.remove();
      resetLink.remove();
      form.style.display = '';
    });
  });

});
