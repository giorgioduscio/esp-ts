export const ST = {
  // Contesto globale dei dati della pagina
  app: {} as { [key: string]: any },

  // Funzione di caricamento del template
  async page(html: string, data: { [key: string]: any }) {
    (window as any).app = data;
    this.app = data;

    let htmlResult = html;
    if (html.includes('</')) {
      // già HTML completo
    } else if (html.includes('/')) {
      const res = await fetch(html);
      htmlResult = await res.text();
    }

    document.getElementById('app')!.innerHTML = htmlResult;
    this.Render(data);
  },

  GetFocus(data?: { path: number[] | null; selectionStart: number | null; selectionEnd: number | null }) {
    if (!data) {
      const activeEl = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
      let selectionStart: number | null = null;
      let selectionEnd: number | null = null;
      let path: number[] | null = null;

      if (activeEl) {
        path = [];
        let current: Element | null = activeEl;

        while (current && current !== document.body) {
          const parent: HTMLElement | null = current.parentElement;
          if (!parent) break;
          const index = Array.from(parent.children).indexOf(current);
          path.unshift(index);
          current = parent;
        }

        if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
          selectionStart = activeEl.selectionStart;
          selectionEnd = activeEl.selectionEnd;
        }
      }

      return { path, selectionStart, selectionEnd };
    } else {
      const { path, selectionStart, selectionEnd } = data;
      if (!path) return;

      setTimeout(() => {
        let current: Element | null = document.body;
        for (const idx of path) {
          if (!current || !current.children[idx]) {
            current = null;
            break;
          }
          current = current.children[idx];
        }

        const newActiveEl = current as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
        if (newActiveEl) {
          newActiveEl.focus();
          if ((newActiveEl instanceof HTMLInputElement || newActiveEl instanceof HTMLTextAreaElement) &&
              selectionStart !== null && selectionEnd !== null) {
            newActiveEl.setSelectionRange(selectionStart, selectionEnd);
          }
        }
      }, 0);
    }
  },

  Bind(datas: { [key: string]: any }) {
    const keys = Object.keys(datas);

    Object.entries(datas).forEach(([key, value]) => {
      document.querySelectorAll('[get]').forEach(el => {
        const expr = el.getAttribute('get');
        if (!expr || !expr.includes(key)) return;
        if (expr.includes('$i') && (!datas.result || datas.result.length === 0)) return;

        try {
          const fn = new Function(...keys, `return ${expr};`);
          const result = fn(...keys.map(k => datas[k]));

          switch (el.tagName) {
            case 'INPUT':
              const input = el as HTMLInputElement;
              if (input.type === 'checkbox') input.checked = !!result;
              else input.value = result;
              break;
            case 'TEXTAREA':
              (el as HTMLTextAreaElement).value = result;
              break;
            case 'SELECT':
              (el as HTMLSelectElement).value = result;
              break;
            case 'ABBR':
              el.setAttribute('title', result);
              break;
            case 'A':
              (el as HTMLAnchorElement).setAttribute('href', result);
              break;
            default:
              (el as HTMLElement).innerText = result;
          }
        } catch (err) {
          console.warn(`[Bind] Errore valutando: ${expr}`, err);
        }
      });
    });
  },

  BindIf(datas: { [key: string]: any }) {
    const keys = Object.keys(datas);

    document.querySelectorAll('[if]').forEach(ele => {
      const expr = ele.getAttribute('if');
      if (!expr) return;

      const matchesKey = keys.some(key => {
        const regex = new RegExp(`(^|[^.\\w])${key}([^\\w]|$)`);
        return regex.test(expr);
      });
      if (!matchesKey) return;

      try {
        const fn = new Function(...keys, `return ${expr}`);
        const result = fn(...keys.map(k => datas[k]));
        (ele as HTMLElement).style.display = result ? '' : 'none';
      } catch (err) {
        console.warn(`Errore valutando if="${expr}"`, err);
      }
    });
  },

  Render(datas: { [key: string]: any }) {
    // Merge tra i dati già esistenti (this.app) e quelli nuovi
    this.app = { ...this.app, ...datas };
    const allData = this.app;

    const focusData = this.GetFocus();

    document.querySelectorAll('[for]').forEach(templateEl => {
      const forAttr = templateEl.getAttribute('for');
      if (!forAttr) return;

      const list = allData[forAttr];
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

      if (list.length) parent.querySelectorAll(`[for="${forAttr}"]`).forEach(el => el.remove());

      for (let i = 0; i < list.length; i++) {
        const html = templateHTML.replaceAll('$i', i.toString());
        const wrapper = document.createElement('tbody');
        wrapper.innerHTML = html;
        const newEl = wrapper.firstElementChild;
        if (!newEl) return;
        parent.appendChild(newEl);
      }
    });

    this.Bind(allData);
    this.GetFocus(focusData);
    this.BindIf(allData);
  },
};
