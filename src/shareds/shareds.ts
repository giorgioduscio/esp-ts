import { Routes } from "../routes";
import './shareds.sass'

export default class Shareds {
  constructor() {
    this.navbar();
    this.autoWidth('init');
  }

  navbar(){
    const navbar = document.getElementById('navbar');   
    if (navbar && !navbar.innerHTML) navbar.innerHTML = `
      <article>
        <details class="dropdown">
          <summary>Menu</summary>
          <div> 
            ${Routes.filter((item) => item.show).map((item) => `
              <div>
                <a href="${item.path}">${ item.path.substring(1).toUpperCase() }</a>
              </div>
            `).join('')}
          </div>
        </details>
        
      </article>
    `;
  }

  autoWidth(init='') {
    const classSelector = 'w-var';
    const inputs = document.querySelectorAll(`.${classSelector}`);

    inputs.forEach(input => {
      const inputEl = input as HTMLInputElement;
      const text = inputEl.value || inputEl.placeholder || '';
      
      const span = document.createElement('span');
      span.style.position = 'absolute';
      span.style.visibility = 'hidden';
      span.style.height = 'auto';
      span.style.width = 'auto';
      span.style.whiteSpace = 'pre';
      span.style.textAlign = 'center';
      span.style.font = getComputedStyle(input).font;
      span.textContent = text;

      document.body.appendChild(span);
      (input as HTMLInputElement).style.width = `${span.offsetWidth + 30}px`;
      document.body.removeChild(span);
    });

    if(!init) return;
    // Ricalcola al volo mentre si digita
    document.addEventListener('input', event => {
      if (event.target && (event.target as Element).classList?.contains(classSelector)) this.autoWidth();
    });

    // Osserva il DOM per nuovi elementi aggiunti dinamicamente
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Elemento
            if (node instanceof Element && node.matches(`.${classSelector}`)) this.autoWidth();
            
            // Cerca anche all'interno di sotto-nodi
            const nestedInputs = (node instanceof Element) ? node.querySelectorAll(`.${classSelector}`) : null;
            if (nestedInputs && nestedInputs.length) this.autoWidth();
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
 
}
