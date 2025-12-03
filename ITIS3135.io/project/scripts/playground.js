 // project/scripts/playground.js
// Python playground with Skulpt integration, plus copy/try buttons for Python code blocks
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Helper to safely get text from code blocks
  function extractCodeFromNode(node) {
    if (!node) return '';
    if (node.tagName.toLowerCase() === 'pre') return node.textContent || '';
    const code = node.querySelector('code');
    return code ? code.textContent : (node.textContent || '');
  }

  // Copy to clipboard helper
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (err) {
        document.body.removeChild(ta);
        return false;
      }
    }
  }

  // Initialize Skulpt runtime
  function runSkulpt(code, outputEl, inputFunc) {
    outputEl.textContent = '';
    function builtinRead(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined)
        throw "File not found: '" + x + "'";
      return Sk.builtinFiles['files'][x];
    }
    Sk.configure({ output: function (text) { outputEl.textContent += text; }, read: builtinRead, inputfun: inputFunc || function (promptText) { return window.prompt(promptText); } });
    const myPromise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody('<stdin>', false, code, true);
    });
    myPromise.then(function (mod) {
      // success
    }, function (err) {
      outputEl.textContent += '\nError: ' + err.toString();
    });
    return myPromise;
  }

  function createPlaygroundUI(container) {
    // Create the minimal playground UI: editor, run, clear, output
    const editor = document.createElement('textarea');
    editor.id = 'py-editor';
    editor.style.width = '100%';
    editor.style.minHeight = '160px';
    editor.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace';
    editor.style.fontSize = '0.95rem';
    editor.style.padding = '0.6rem';

    const toolbar = document.createElement('div');
    toolbar.style.margin = '0.6rem 0';

    const runBtn = document.createElement('button');
    runBtn.className = 'btn primary';
    runBtn.textContent = 'Run';
    runBtn.type = 'button';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn secondary';
    clearBtn.textContent = 'Clear';
    clearBtn.type = 'button';
    clearBtn.style.marginLeft = '0.4rem';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn secondary';
    copyBtn.textContent = 'Copy code';
    copyBtn.type = 'button';
    copyBtn.style.marginLeft = '0.4rem';

    const out = document.createElement('pre');
    out.id = 'py-output';
    out.style.marginTop = '0.6rem';
    out.style.padding = '0.6rem';
    out.style.background = '#f7f7f9';
    out.style.whiteSpace = 'pre-wrap';
    out.style.maxHeight = '320px';
    out.style.overflow = 'auto';

    toolbar.appendChild(runBtn);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(copyBtn);
    container.appendChild(editor);
    container.appendChild(toolbar);
    container.appendChild(out);

    // event handlers
    runBtn.addEventListener('click', function () {
      const code = editor.value;
      const outputEl = out;
      try {
        runSkulpt(code, outputEl);
      } catch (e) {
        outputEl.textContent = 'Error: ' + e.toString();
      }
    });

    clearBtn.addEventListener('click', function () {
      editor.value = '';
      out.textContent = '';
    });

    copyBtn.addEventListener('click', async function () {
      const ok = await copyToClipboard(editor.value);
      const old = copyBtn.textContent;
      copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
      setTimeout(() => (copyBtn.textContent = old), 1200);
    });

    return { editor, out };
  }

  // Add 'Try' and 'Copy' buttons next to Python code blocks
  function augmentCodeBlocks(playground) {
    const codeBlocks = Array.from(document.querySelectorAll('pre code'));
    codeBlocks.forEach(codeEl => {
      // only code blocks that look like Python
      const lang = (codeEl.className || '').toLowerCase();
      if (lang.includes('python') || lang.includes('lang-python') || lang.includes('language-python')) {
        const pre = codeEl.parentElement;
        if (!pre) return;
        // Do not add twice
        if (pre._playgroundEnhanced) return;
        pre._playgroundEnhanced = true;

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.4rem';
        actions.style.justifyContent = 'flex-end';
        actions.style.marginBottom = '0.3rem';

        const tryBtn = document.createElement('button');
        tryBtn.className = 'btn primary';
        tryBtn.textContent = 'Try in Playground';
        tryBtn.type = 'button';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn secondary';
        copyBtn.textContent = 'Copy';
        copyBtn.type = 'button';

        tryBtn.addEventListener('click', () => {
          const c = extractCodeFromNode(pre);
          playground.editor.value = c;
          window.scrollTo({ top: playground.editor.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
          playground.editor.focus();
        });
        copyBtn.addEventListener('click', async () => {
          const c = extractCodeFromNode(pre);
          const ok = await copyToClipboard(c);
          copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
          setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
        });

        pre.parentElement.insertBefore(actions, pre);
        actions.appendChild(tryBtn);
        actions.appendChild(copyBtn);
      }
    });
  }

  ready(function () {
    // find playground container on practice page
    const container = document.getElementById('py-playground');
    let playground = null;
    if (container) {
      playground = createPlaygroundUI(container);
      // the Run button relies on Skulpt; but Skulpt may not have loaded yet
      // The playground runs on click; if Skulpt isn't loaded it will error; in that case, a console error will appear
    }

    // add buttons to code blocks and wire them to the playground editor if present
    if (playground) augmentCodeBlocks(playground);
    else {
      // still add copy buttons to code blocks (even without playground)
      const codeBlocks = Array.from(document.querySelectorAll('pre code'));
      codeBlocks.forEach(codeEl => {
        const lang = (codeEl.className || '').toLowerCase();
        if (lang.includes('python') || lang.includes('lang-python') || lang.includes('language-python')) {
          const pre = codeEl.parentElement;
          if (!pre || pre._playgroundEnhanced) return;
          pre._playgroundEnhanced = true;
          const actions = document.createElement('div');
          const copyBtn = document.createElement('button');
          copyBtn.className = 'btn secondary';
          copyBtn.textContent = 'Copy';
          copyBtn.type = 'button';
          copyBtn.addEventListener('click', async () => {
            const c = extractCodeFromNode(pre);
            const ok = await copyToClipboard(c);
            copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
            setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
          });
          actions.style.display = 'flex';
          actions.style.gap = '0.4rem';
          actions.style.justifyContent = 'flex-end';
          actions.style.marginBottom = '0.3rem';
          actions.appendChild(copyBtn);
          pre.parentElement.insertBefore(actions, pre);
        }
      });
    }
  });
})();
