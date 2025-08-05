/**
 * Pulisce il contenuto di un elemento DOM e lo riempie con una struttura HTML
 * generata da una stringa, evitando l'uso di innerHTML per l'analisi.
 *
 * @param {HTMLElement} targetElement L'elemento DOM di destinazione dove inserire la struttura HTML.
 * @param {string} htmlString La stringa HTML da analizzare e inserire.
 * @returns {HTMLElement[]|null} Gli elementi aggiornati, o null se targetElement non è valido.
 */
export function ondom(targetElement, htmlString) {
  if (!(targetElement instanceof HTMLElement)) {
    console.error('Il primo argomento deve essere un elemento HTML valido.');
    return null;
  }

  const parser = new DOMParser();
  let newDoc;
  try {
    newDoc = parser.parseFromString(htmlString, 'text/html');
  } catch (e) {
    console.error('Errore nel parsing HTML:', e);
    return null;
  }

  const newContent = newDoc.body;
  const updatedNodes = [];
  updateChildren(targetElement, newContent);
  return updatedNodes;

  // ──────────────── FUNZIONI INTERNE ────────────────

  function updateChildren(currentParent, newParent) {
    const currentChildren = Array.from(currentParent.childNodes);
    const newChildren = Array.from(newParent.childNodes);
    const maxLength = Math.max(currentChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const currentNode = currentChildren[i];
      const newNode = newChildren[i];

      if (!currentNode && newNode) {
        const addedNode = newNode.cloneNode(true);
        currentParent.appendChild(addedNode);
        updatedNodes.push(addedNode);
      } else if (currentNode && !newNode) {
        currentParent.removeChild(currentNode);
        updatedNodes.push(currentNode);
      } else if (currentNode && newNode) {
        diffAndUpdate(currentNode, newNode);
      }
    }
  }

  function diffAndUpdate(currentNode, newNode) {
    if (currentNode.nodeType !== newNode.nodeType) {
      const newClone = newNode.cloneNode(true);
      currentNode.replaceWith(newClone);
      updatedNodes.push(newClone);
      return;
    }

    if (currentNode.nodeType === Node.TEXT_NODE) {
      if (currentNode.textContent !== newNode.textContent) {
        currentNode.textContent = newNode.textContent;
        updatedNodes.push(currentNode);
      }
      return;
    }

    const currentEl = currentNode;
    const newEl = newNode;

    if (currentEl.tagName !== newEl.tagName) {
      const newClone = newEl.cloneNode(true);
      currentEl.replaceWith(newClone);
      updatedNodes.push(newClone);
      return;
    }

    // Gestione specifica per <input>
    if (currentEl.tagName === 'INPUT') {
      const currentInput = currentEl;
      const newInput = newEl;

      let updated = false;

      const newValAttr = newInput.getAttribute('value') ?? '';
      if (currentInput.value !== newValAttr || currentInput.getAttribute('value') !== newValAttr) {
        currentInput.value = newValAttr;
        currentInput.setAttribute('value', newValAttr);
        updated = true;
      }

      // Gestione checkbox/radio
      if (currentInput.type === 'checkbox' || currentInput.type === 'radio') {
        const isChecked = newInput.hasAttribute('checked') || newInput.checked;
        if (currentInput.checked !== isChecked) {
          currentInput.checked = isChecked;
          if (isChecked) {
            currentInput.setAttribute('checked', '');
          } else {
            currentInput.removeAttribute('checked');
          }
          updated = true;
        }
      }

      if (updated) updatedNodes.push(currentInput);
    }

    // Gestione specifica per <select>
    if (currentEl.tagName === 'SELECT') {
      if (currentEl.value !== newEl.value) {
        currentEl.value = newEl.value;
        updatedNodes.push(currentEl);
      }
    }

    // Gestione specifica per <textarea>
    if (currentEl.tagName === 'TEXTAREA') {
      const newText = newEl.textContent ?? '';
      if (currentEl.value !== newText) {
        currentEl.value = newText;
        currentEl.textContent = newText;
        updatedNodes.push(currentEl);
      }
    }

    // Aggiorna attributi generali (skip 'value' e 'checked', già gestiti sopra)
    const attrsChanged = updateAttributes(currentEl, newEl);
    if (attrsChanged) updatedNodes.push(currentEl);

    // Ricorsione sui figli
    updateChildren(currentEl, newEl);
  }

  function updateAttributes(current, updated) {
    if (!(current instanceof Element)) {
      // Se current è un commento (nodeType === 8), non mostrare warn e torna false
      if (current && current.nodeType === Node.COMMENT_NODE) {
        return false;
      }
      console.warn('ondom: Nodo non valido per updateAttributes:', current, updated);
      return false;
    }

    if (!(updated instanceof Element)) {
      console.warn('ondom: Nodo non valido per updateAttributes:', current, updated);
      return false;
    }

    let changed = false;
    const oldAttrs = current.attributes;
    const newAttrs = updated.attributes;
    if (!oldAttrs || !newAttrs) return false;

    // Rimuovi attributi mancanti
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!updated.hasAttribute(name) && name !== 'value' && name !== 'checked') {
        current.removeAttribute(name);
        changed = true;
      }
    }

    // Aggiungi o aggiorna attributi nuovi
    for (let i = 0; i < newAttrs.length; i++) {
      const name = newAttrs[i].name;
      const value = newAttrs[i].value;
      if ((name !== 'value' && name !== 'checked') && current.getAttribute(name) !== value) {
        current.setAttribute(name, value);
        changed = true;
      }
    }

    return changed;
  }
}
