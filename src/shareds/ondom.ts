export function ondom(targetElement: HTMLElement, htmlString: string) {
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
  const updatedNodes: Node[] = [];

  updateChildren(targetElement, newContent);
  return updatedNodes;

  // ──────────────── FUNZIONI INTERNE ────────────────

  function updateChildren(currentParent: HTMLElement, newParent: HTMLElement) {
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

  function diffAndUpdate(currentNode: ChildNode, newNode: ChildNode) {
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

    // nodeType === ELEMENT_NODE da qui in poi
    const currentEl = currentNode as Element;
    const newEl = newNode as Element;

    if (currentEl.tagName !== newEl.tagName) {
      const newClone = newEl.cloneNode(true);
      currentEl.replaceWith(newClone);
      updatedNodes.push(newClone);
      return;
    }

    if (currentEl.tagName === 'INPUT') {
      const currentInput = currentEl as HTMLInputElement;
      const newInput = newEl as HTMLInputElement;
      if (currentInput.type === newInput.type && currentInput.name === newInput.name) {
        if (currentInput.value !== newInput.value) {
          currentInput.value = newInput.value;
          updatedNodes.push(currentInput);
        }
        return; // stop qui, non ricorsione sugli input
      }
    }

    // Aggiorna attributi, skip 'value' perché gestito sopra
    const attrsChanged = updateAttributes(currentEl, newEl);
    if (attrsChanged) updatedNodes.push(currentEl);

    // Ricorsione sui figli
    updateChildren(currentEl as HTMLElement, newEl as HTMLElement);
  }

  function updateAttributes(current: Element, updated: Element) {
    let changed = false;
    const oldAttrs = current.attributes;
    const newAttrs = updated.attributes;

    // Rimuovi attributi mancanti
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!updated.hasAttribute(name)) {
        current.removeAttribute(name);
        changed = true;
      }
    }

    // Aggiungi o aggiorna, saltando 'value'
    for (let i = 0; i < newAttrs.length; i++) {
      const { name, value } = newAttrs[i];
      if (name === 'value') continue;
      if (current.getAttribute(name) !== value) {
        current.setAttribute(name, value);
        changed = true;
      }
    }

    return changed;
  }
}
