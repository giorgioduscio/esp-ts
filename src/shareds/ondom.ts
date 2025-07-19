export function ondom(targetElement :HTMLElement, htmlString: string) {
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

  // 🔽 FUNZIONI INTERNE 🔽

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
        updatedNodes.push(addedNode); // 👈 registrato come nuovo
      } else if (currentNode && !newNode) {
        currentParent.removeChild(currentNode);
        updatedNodes.push(currentNode); // 👈 registrato come rimosso
      } else {
        diffAndUpdate(currentNode, newNode);
      }
    }
  }

  function diffAndUpdate(currentNode: ChildNode, newNode: ChildNode) {
    if (!currentNode || !newNode || currentNode.nodeType !== newNode.nodeType) {
      const newClone = newNode.cloneNode(true);
      currentNode.replaceWith(newClone);
      updatedNodes.push(newClone); // 👈 registrato come rimpiazzato
      return;
    }

    if (currentNode.nodeType === Node.TEXT_NODE) {
      if (currentNode.textContent !== newNode.textContent) {
        currentNode.textContent = newNode.textContent;
        updatedNodes.push(currentNode); // 👈 registrato come aggiornato
      }
      return;
    }

    if (
      currentNode.nodeType === Node.ELEMENT_NODE &&
      newNode.nodeType === Node.ELEMENT_NODE &&
      (currentNode as Element).tagName !== (newNode as Element).tagName
    ) {
      const newClone = newNode.cloneNode(true);
      currentNode.replaceWith(newClone);
      updatedNodes.push(newClone); // 👈 registrato come rimpiazzato
      return;
    }

    // Aggiorna attributi se necessario
    if (
      currentNode.nodeType === Node.ELEMENT_NODE &&
      newNode.nodeType === Node.ELEMENT_NODE
    ) {
      const attrsChanged = updateAttributes(currentNode as Element, newNode as Element);
      if (attrsChanged) {
        updatedNodes.push(currentNode); // 👈 registrato per aggiornamento attributi
      }
    }

    // Ricorsione sui figli
    if (
      currentNode.nodeType === Node.ELEMENT_NODE &&
      newNode.nodeType === Node.ELEMENT_NODE
    ) {
      updateChildren(currentNode as HTMLElement, newNode as HTMLElement);
    }
  }

  function updateAttributes(current: Element, updated: Element) {
    const oldAttrs = current.attributes;
    const newAttrs = updated.attributes;
    let changed = false;

    // Rimuovi attributi mancanti
    for (const { name } of Array.from(oldAttrs)) {
      if (!updated.hasAttribute(name)) {
        current.removeAttribute(name);
        changed = true;
      }
    }

    // Aggiungi/aggiorna nuovi attributi
    for (const { name, value } of Array.from(newAttrs)) {
      if (current.getAttribute(name) !== value) {
        current.setAttribute(name, value);
        changed = true;
      }
    }

    return changed;
  }
}