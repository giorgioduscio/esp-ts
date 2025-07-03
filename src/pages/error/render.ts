export default function Render(datas: { [key: string]: any }) {
  // 1. Salva l'elemento attivo e la posizione del cursore (per ripristinarli dopo il rendering)
  const activeEl = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
  let selectionStart: number | null = null;
  let selectionEnd: number | null = null;
  let path: number[] | null = null;

  if (activeEl) {
    path = [];
    let current: Element | null = activeEl;

    // Costruisce un path per ritrovare l'elemento attivo dopo il rerender
    while (current && current !== document.body) {
      const parent: HTMLElement | null = current.parentElement;
      if (!parent) break;
      const index = Array.from(parent.children).indexOf(current);
      path.unshift(index); // inserisce all'inizio (per ricostruire dal body)
      current = parent;
    }

    // Salva selezione del cursore se è input o textarea
    if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
      selectionStart = activeEl.selectionStart;
      selectionEnd = activeEl.selectionEnd;
    }
  }

  // 2. Gestisce i template con attributo "for" per cicli dinamici (es: for="list")
  document.querySelectorAll('[for]').forEach(templateEl => {
    const forAttr = templateEl.getAttribute('for');
    if (!forAttr) return;

    const list = datas[forAttr];
    if (!Array.isArray(list)) return; // ignora se non è un array

    const parent = templateEl.parentElement;
    if (!parent) return;

    // Salva il template originale una sola volta (in dataset)
    if (!parent.dataset.template) {
      const clone = templateEl.cloneNode(true); // clona l'elemento
      const div = document.createElement('div');
      div.appendChild(clone);
      parent.dataset.template = div.innerHTML; // salva HTML del template
    }

    const templateHTML = parent.dataset.template;

    // Rimuove tutti gli elementi precedenti generati con for="..."
    parent.querySelectorAll(`[for="${forAttr}"]`).forEach(el => el.remove());

    // Inserisce nuovi elementi per ogni item dell'array
    for (let i = 0; i < list.length; i++) {
      const html = templateHTML.replaceAll('$i', i.toString()); // sostituisce $i con indice
      const wrapper = document.createElement('tbody');
      wrapper.innerHTML = html;
      const newEl = wrapper.firstElementChild;
      if (!newEl) return;
      parent.appendChild(newEl); // aggiunge al DOM
    }
  });

  // 3. Aggiorna i campi con attributo "get" (binding diretto dei valori)
  const flatData: { [key: string]: any } = {};

  // Funzione ricorsiva per appiattire oggetti (es: { user: { name: 'X' } } → { user_name: 'X' })
  const flatten = (data: { [key: string]: any }, prefix = '') => {
    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      if (typeof value === 'object' && value !== null) {
        flatten(value, newKey); // continua a scendere nei livelli
      } else {
        flatData[newKey] = value; // assegna valore finale
      }
    }
  };
  flatten(datas); // appiattisce `datas`

  Object.entries(flatData).forEach(([flatKey, value]) => {
    const key = flatKey
      .replace(/_(\d+)_/g, '[$1].')   // da _0_ → [0].
      .replace(/_(\d+)/g, '[$1]')     // da _0 → [0]
      .replace(/_/g, '.');            // da _ → .

    const selector = `[get="${key}"]`;

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

  // 4. Ripristina focus e selezione del cursore sull'elemento attivo
  if (path) {
    setTimeout(() => {
      let current: Element | null = document.body;
      for (const idx of path!) {
        if (!current || !current.children[idx]) {
          current = null;
          break;
        }
        current = current.children[idx]; // ricostruisce il path fino al nodo
      }

      const newActiveEl = current as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
      if (newActiveEl) {
        newActiveEl.focus(); // rimette il focus
        if ((newActiveEl instanceof HTMLInputElement || newActiveEl instanceof HTMLTextAreaElement) &&
            selectionStart !== null && selectionEnd !== null) {
          newActiveEl.setSelectionRange(selectionStart, selectionEnd); // rimette il cursore
        }
      }
    }, 0); // delay per aspettare il rendering
  }

  // 5. Gestione condizionale degli elementi con attributo "if"
  const keys = Object.keys(datas); // prende le chiavi passate nella chiamata Render({ ... })

  document.querySelectorAll('[if]').forEach(ele => {
    const expr = ele.getAttribute('if');
    if (!expr) return;

    // Verifica che l'espressione contenga almeno una delle chiavi passate
    const matchesKey = keys.some(key => {
      const regex = new RegExp(`(^|[^.\\w])${key}([^\\w]|$)`);
      return regex.test(expr);
    });
    if (!matchesKey) return; // salta la valutazione se non è rilevante

    try {
      // Valuta l'espressione in un contesto dinamico
      const fn = new Function(...keys, `return ${expr}`);
      const result = fn(...keys.map(k => datas[k]));

      // Mostra o nasconde l'elemento in base al risultato
      (ele as HTMLElement).style.display = result ? '' : 'none';
    } catch (err) {
      console.warn(`Errore valutando if="${expr}"`, err); // non rompe, solo warning
    }
  });
}
