/**
 * Pulisce il contenuto di un elemento DOM e lo riempie con una struttura HTML
 * generata da una stringa, evitando l'uso di innerHTML per l'analisi.
 *
 * @param {HTMLElement} targetElement L'elemento DOM di destinazione dove inserire la struttura HTML.
 * @param {string} htmlString La stringa HTML da analizzare e inserire.
 * @returns {HTMLElement[]|null} Gli elementi aggiornati, o null se targetElement non è valido.
 */
export function ondom(targetElement: HTMLElement, htmlString: string): HTMLElement[] | null {
  if (!(targetElement instanceof HTMLElement)) {
    console.error('Il primo argomento deve essere un elemento HTML valido.');
    return null;
  }

  const parser: DOMParser = new DOMParser();
  let newDoc: Document;
  try {
    newDoc = parser.parseFromString(htmlString, 'text/html');
  } catch (e) {
    console.error('Errore nel parsing HTML:', e);
    return null;
  }

  const newContent: HTMLElement = newDoc.body;
  const updatedNodes: Node[] = [];
  updateChildren(targetElement, newContent);
  return updatedNodes.filter((n): n is HTMLElement => n instanceof HTMLElement);

  // ──────────────── FUNZIONI INTERNE ────────────────

  function updateChildren(currentParent: HTMLElement, newParent: HTMLElement): void {
    const currentChildren: ChildNode[] = Array.from(currentParent.childNodes);
    const newChildren: ChildNode[] = Array.from(newParent.childNodes);
    const maxLength: number = Math.max(currentChildren.length, newChildren.length);

    for (let i = 0; i < maxLength; i++) {
      const currentNode: ChildNode | undefined = currentChildren[i];
      const newNode: ChildNode | undefined = newChildren[i];

      if (!currentNode && newNode) {
        const addedNode: Node = newNode.cloneNode(true);
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

  function diffAndUpdate(currentNode: Node, newNode: Node): void {
    if (currentNode.nodeType !== newNode.nodeType) {
      const newClone: Node = newNode.cloneNode(true);
      if (currentNode.parentNode) {
        currentNode.parentNode.replaceChild(newClone, currentNode);
        updatedNodes.push(newClone);
      }
      return;
    }

    if (currentNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
      if (currentNode.textContent !== newNode.textContent) {
        currentNode.textContent = newNode.textContent;
        updatedNodes.push(currentNode);
      }
      return;
    }

    if (!(currentNode instanceof HTMLElement) || !(newNode instanceof HTMLElement)) {
      return;
    }

    const currentEl: HTMLElement = currentNode;
    const newEl: HTMLElement = newNode;

    if (currentEl.tagName !== newEl.tagName) {
      const newClone: Node = newEl.cloneNode(true);
      if (currentEl.parentNode) {
        currentEl.parentNode.replaceChild(newClone, currentEl);
        updatedNodes.push(newClone);
      }
      return;
    }

    // Gestione specifica per <input>
    if (currentEl instanceof HTMLInputElement && newEl instanceof HTMLInputElement) {
      let updated = false;

      const newValAttr: string = newEl.getAttribute('value') ?? '';
      if (currentEl.value !== newValAttr || currentEl.getAttribute('value') !== newValAttr) {
        currentEl.value = newValAttr;
        currentEl.setAttribute('value', newValAttr);
        updated = true;
      }

      if (currentEl.type === 'checkbox' || currentEl.type === 'radio') {
        const isChecked: boolean = newEl.hasAttribute('checked') || newEl.checked;
        if (currentEl.checked !== isChecked) {
          currentEl.checked = isChecked;
          if (isChecked) {
            currentEl.setAttribute('checked', '');
          } else {
            currentEl.removeAttribute('checked');
          }
          updated = true;
        }
      }

      if (updated) updatedNodes.push(currentEl);
    }

    // Gestione specifica per <select>
    if (currentEl instanceof HTMLSelectElement && newEl instanceof HTMLSelectElement) {
      if (currentEl.value !== newEl.value) {
        currentEl.value = newEl.value;
        updatedNodes.push(currentEl);
      }
    }

    // Gestione specifica per <textarea>
    if (currentEl instanceof HTMLTextAreaElement && newEl instanceof HTMLTextAreaElement) {
      const newText: string = newEl.textContent ?? '';
      if (currentEl.value !== newText) {
        currentEl.value = newText;
        currentEl.textContent = newText;
        updatedNodes.push(currentEl);
      }
    }

    const attrsChanged: boolean = updateAttributes(currentEl, newEl);
    if (attrsChanged) updatedNodes.push(currentEl);

    updateChildren(currentEl, newEl);
  }

  function updateAttributes(current: Node, updated: Node): boolean {
    if (!(current instanceof Element)) {
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

    let changed: boolean = false;
    const oldAttrs: NamedNodeMap = current.attributes;
    const newAttrs: NamedNodeMap = updated.attributes;

    if (!oldAttrs || !newAttrs) return false;

    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name: string = oldAttrs[i].name;
      if (!updated.hasAttribute(name) && name !== 'value' && name !== 'checked') {
        current.removeAttribute(name);
        changed = true;
      }
    }

    for (let i = 0; i < newAttrs.length; i++) {
      const name: string = newAttrs[i].name;
      const value: string = newAttrs[i].value;
      if ((name !== 'value' && name !== 'checked') && current.getAttribute(name) !== value) {
        current.setAttribute(name, value);
        changed = true;
      }
    }

    return changed;
  }
}
