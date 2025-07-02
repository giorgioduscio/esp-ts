export default function Render(datas: { [key: string]: any }) {
  // Funzione per ottenere il percorso DOM di un elemento (array di indici figli)
  function getDomPath(el: Element): number[] {
    const path: number[] = [];
    let current: Element | null = el;
    while (current && current !== document.body) {
      const parent: Element | null = current.parentElement;
      if (!parent) break;
      const index = Array.from(parent.children).indexOf(current);
      path.unshift(index);
      current = parent;
    }
    return path;
  }

  // Funzione per recuperare elemento dal percorso DOM
  function getElementByDomPath(path: number[]): Element | null {
    let current: Element | null = document.body;
    for (const idx of path) {
      if (!current || !current.children[idx]) return null;
      current = current.children[idx];
    }
    return current;
  }

  // 1. Salva elemento attivo e posizione cursore
  const activeEl = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;
  let path: number[] | null = null;

  if (activeEl) {
    path = getDomPath(activeEl);
    if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
      selectionStart = activeEl.selectionStart;
      selectionEnd = activeEl.selectionEnd;
    }
  }

  // === 2. Ciclo sugli elementi che hanno "for" ===
  document.querySelectorAll('[for]').forEach(templateEl => {
    const forAttr = templateEl.getAttribute('for');
    if (!forAttr) return;

    const list = datas[forAttr];
    if (!Array.isArray(list)) return;

    const parent = templateEl.parentElement;
    if (!parent) return;

    if (!parent.dataset.template) {
      const clone = templateEl.cloneNode(true);
      const div = document.createElement('div');
      div.appendChild(clone);
      parent.dataset.template = div.innerHTML;
    }

    const templateHTML = parent.dataset.template;

    parent.querySelectorAll(`[for="${forAttr}"]`).forEach(el => el.remove());

    for (let i = 0; i < list.length; i++) {
      const html = templateHTML.replaceAll('$i', i.toString());
      const wrapper = document.createElement('tbody');
      wrapper.innerHTML = html;
      const newEl = wrapper.firstElementChild;
      if (!newEl) return;
      parent.appendChild(newEl);
    }
  });

  // === 3. Aggiorna i campi che hanno l'attributo "get" ===
  const flatData: { [key: string]: any } = {};
  const flatten = (data: { [key: string]: any }, prefix = '') => {
    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (typeof value === 'object' && value !== null) {
        flatten(value, newKey);
      } else {
        flatData[newKey] = value;
      }
    }
  };
  flatten(datas);

  const convertKey = (key: string) => {
    return key
      .replace(/_(\d+)_/g, '[$1].')
      .replace(/_(\d+)/g, '[$1]')
      .replace(/_/g, '.');
  };

  Object.entries(flatData).forEach(([flatKey, value]) => {
    const selector = `[get="${convertKey(flatKey)}"]`;
    document.querySelectorAll(selector).forEach(el => {
      if (el.tagName === 'INPUT') {
        const input = el as HTMLInputElement;
        if (input.type === 'checkbox') input.checked = !!value;
        else input.value = value;
      } else if (el.tagName === 'TEXTAREA') {
        (el as HTMLTextAreaElement).value = value;
      } else if (el.tagName === 'SELECT') {
        (el as HTMLSelectElement).value = value;
      } else if (el.tagName === 'ABBR') {
        el.setAttribute('title', value);
      } else {
        (el as HTMLElement).innerText = value;
      }
    });
  });

  // 4. Ripristina focus e selezione dopo il rendering (async)
  if (path) {
    setTimeout(() => {
      const newActiveEl = getElementByDomPath(path) as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
      if (newActiveEl) {
        newActiveEl.focus();
        if ((newActiveEl instanceof HTMLInputElement || newActiveEl instanceof HTMLTextAreaElement) && selectionStart !== null && selectionEnd !== null) {
          newActiveEl.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }, 0);
  }
}
