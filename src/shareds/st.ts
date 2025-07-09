export class StateTemplate {
  private app: { [key: string]: any } = {};
  async page(data: { [key: string]: any }, html: string, containerId ='app') {
    (window as any).app = data;
    this.app = data;

    let htmlResult = html;
    if (html.includes('</')) {
      // già completo
    } else if (html.includes('/')) {
      const res = await fetch(html);
      htmlResult = await res.text();
    }

    document.getElementById(containerId)!.innerHTML = htmlResult;
    this.Render(data);
  }
  Render(datas: { [key: string]: any }) {
    this.app = { ...this.app, ...datas };
    const allData = this.app;
    const focusData = this.GetFocus();

    this.ExecuteFor(allData);
    this.Bind(allData);
    this.GetFocus(focusData);
    this.ExecuteIf(allData);
  }

  private ExecuteFor(allData: { [key: string]: any }) {
    document.querySelectorAll('[for]').forEach(templateEl => {
      const forAttr = templateEl.getAttribute('for');
      if (!forAttr) return;

      const list = allData[forAttr];
      if (!Array.isArray(list)) return;

      const parent = templateEl.parentElement;
      if (!parent) return;

      // salviamo template HTML la prima volta
      if (!parent.dataset.template) {
        const clone = templateEl.cloneNode(true) as HTMLElement;
        const div = document.createElement('div');
        div.appendChild(clone);
        parent.dataset.template = div.innerHTML;
      }

      const templateHTML = parent.dataset.template!;

      // rimuovo elementi generati precedentemente
      if (list.length) {
        parent.querySelectorAll(`[for="${forAttr}"]`).forEach(el => el.remove());
      }

      // ciclo per ogni voce
      for (let i = 0; i < list.length; i++) {
        const html = templateHTML.replaceAll('$i', i.toString());
        const wrapper = document.createElement('tbody');
        wrapper.innerHTML = html;
        const newEl = wrapper.firstElementChild;
        if (!newEl) continue;
        parent.appendChild(newEl);
      }
    });
  }

  private Bind(datas: { [key: string]: any }) {
    const keys = Object.keys(datas);
    Object.entries(datas).forEach(([key]) => {
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
          console.warn(`[Bind] errore evaluating ${expr}`, err);
        }
      });
    });
  }

  private GetFocus(data?: { path: number[] | null; selectionStart: number | null; selectionEnd: number | null }) {
    if (!data) {
      const activeEl = document.activeElement as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
      let selectionStart: number | null = null;
      let selectionEnd: number | null = null;
      let path: number[] | null = null;

      if (activeEl) {
        path = [];
        let current: Element | null = activeEl;
        while (current && current !== document.body) {
          const parent: Element | null = current.parentElement;
          if (!parent) break;
          path.unshift(Array.from(parent.children).indexOf(current));
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
          if (!current || !current.children[idx]) { current = null; break; }
          current = current.children[idx];
        }
        const newActiveEl = current as (HTMLInputElement | HTMLTextAreaElement | HTMLElement) | null;
        if (newActiveEl) {
          newActiveEl.focus();
          if ((newActiveEl instanceof HTMLInputElement || newActiveEl instanceof HTMLTextAreaElement) &&
              selectionStart != null && selectionEnd != null) {
            newActiveEl.setSelectionRange(selectionStart, selectionEnd);
          }
        }
      }, 0);
    }
  }

  private ExecuteIf(datas: { [key: string]: any }) {
    const keys = Object.keys(datas);
    document.querySelectorAll('[if]').forEach(ele => {
      const expr = ele.getAttribute('if');
      if (!expr) return;
      const matches = keys.some(key => new RegExp(`(^|[^.\\w])${key}([^\\w]|$)`).test(expr));
      if (!matches) return;
      try {
        const fn = new Function(...keys, `return ${expr}`);
        const result = fn(...keys.map(k => datas[k]));
        (ele as HTMLElement).style.display = result ? '' : 'none';
      } catch (err) {
        console.warn(`Errore evaluating if="${expr}"`, err);
      }
    });
  }

}
