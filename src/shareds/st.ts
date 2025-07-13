export class StateTemplate {
  private app: { [key: string]: any } = {};
  private parent?: HTMLElement | null;

  async page(data: { [key: string]: any }, html: string, containerId = 'app') {
    (window as any).app = data;
    this.app = data;

    // prende il template
    let htmlResult = html;
    if (!html.includes('</')){
      const res = await fetch(html);
      htmlResult = await res.text();
    }
    htmlResult = htmlResult.replaceAll('{', '<span _innertext="').replaceAll('}', '"></span>');

    // prende il contenitore
    this.parent = document.getElementById(containerId);
    if (!this.parent) return;

    // Parsing HTML 
    const template = document.createElement('template');
    template.innerHTML = htmlResult.trim();
    const elements = Array.from(template.content.childNodes).filter(
      n => n.nodeType === 1
    ) as HTMLElement[];

    this.parent.replaceChildren(...elements);
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

      const [variable, indexRaw] = forAttr.replaceAll(' ', '').split(';');
      const indexToken = indexRaw || '$i';
      const list = allData[variable];
      if (!Array.isArray(list)) return;

      const container = templateEl as HTMLElement;

      // Salva un template <template> reale solo una volta
      let template = container.querySelector('template');
      if (!template) {
        template = document.createElement('template');
        // Sposta i figli esistenti nel template
        while (container.firstChild) {
          template.content.appendChild(container.firstChild);
        }
        container.appendChild(template);
      }

      // Rimuove tutti i nodi tranne il <template>
      Array.from(container.childNodes).forEach(n => {
        if (n !== template) container.removeChild(n);
      });

      // Clona e inserisce gli elementi, con token sostituito
      for (let i = 0; i < list.length; i++) {
        const clone = template.content.cloneNode(true) as DocumentFragment;

        const walk = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = node.textContent?.replaceAll(indexToken, i.toString()) ?? '';
          } else if (node instanceof HTMLElement) {
            Array.from(node.attributes).forEach(attr => {
              if (attr.value.includes(indexToken)) {
                node.setAttribute(attr.name, attr.value.replaceAll(indexToken, i.toString()));
              }
            });
            node.childNodes.forEach(walk);
          }
        };

        clone.childNodes.forEach(walk);
        container.appendChild(clone);
      }
    });
  }

  

  private Bind(datas: { [key: string]: any }) {
    const keys = Object.keys(datas);
    const values = Object.values(datas);

    document.querySelectorAll('*').forEach((el) => {
      const dynamicAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('_'));
      if (dynamicAttrs.length === 0) return;

      dynamicAttrs.forEach(attr => {
        const attrName = attr.name.slice(1); // "_value" → "value"
        const expr = attr.value;

        const matches = keys.some(key => new RegExp(`(^|[^.\\w])${key}([^\\w]|$)`).test(expr));
        if (!matches) return;

        try {
          const fn = new Function(...keys, `return ${expr};`);
          const result = fn(...values);

          switch (attrName.toLowerCase()) {
            case 'value':
              if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)
                el.value = result ?? '';
              break;
            case 'checked':
              (el as HTMLInputElement).checked = !!result;
              break;
            case 'innertext':
              (el as HTMLElement).innerText = result ?? '';
              break;
            case 'disabled':
              if (result) el.setAttribute('disabled', 'disabled');
              else el.removeAttribute('disabled');
              break;
            default:
              (el as HTMLElement).setAttribute(attrName, result);
          }
        } catch (err) {
          console.warn(`[Bind:_${attrName}] errore evaluating "${expr}"`, err);
        }
      });
    });
  }

  private GetFocus(data?: { path: number[] | null; selectionStart: number | null; selectionEnd: number | null }) {
    if (!data) {
      const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement | HTMLElement | null;
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
          if (!current || !current.children[idx]) {
            current = null;
            break;
          }
          current = current.children[idx];
        }

        const newActiveEl = current as HTMLInputElement | HTMLTextAreaElement | HTMLElement | null;
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
