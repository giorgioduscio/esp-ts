export default function Render(datas:{[key:string]:any}) {
  // === 1. Ciclo sugli elementi che hanno "for" ===
  document.querySelectorAll('[for]').forEach(templateEl => {
    const forAttr = templateEl.getAttribute('for');
    if (!forAttr) return;

    const list = datas[forAttr];
    if (!Array.isArray(list)) return;

    const parent = templateEl.parentElement;
    if (!parent) return;

    // Salva il template solo una volta nel contenitore (parent)
    if (!parent.dataset.template) {
      const clone = templateEl.cloneNode(true);
      const div = document.createElement('div');
      div.appendChild(clone);
      parent.dataset.template = div.innerHTML;
    }

    const templateHTML = parent.dataset.template;

    // Rimuovi i vecchi nodi (tutti quelli con lo stesso "for")
    parent.querySelectorAll(`[for="${forAttr}"]`).forEach(el => el.remove());

    // Ricrea tutti i nodi da zero
    for (let i = 0; i < list.length; i++) {
      const html = templateHTML.replaceAll('$i', i.toString());
      const wrapper = document.createElement('tbody');
      wrapper.innerHTML = html;
      const newEl = wrapper.firstElementChild; if (!newEl) return;
      parent.appendChild(newEl);
    }
  });

  // === 2. Aggiorna i campi che hanno l'attributo "get" ===
  const flatData : {[key:string]:any} = {};
  const flatten = (data: {[key:string]:any}, prefix = '') => {
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
      } 
      else (el as HTMLElement).innerText = value;      
    });
  });
}


