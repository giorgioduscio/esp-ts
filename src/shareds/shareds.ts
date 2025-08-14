import { Routes } from "../routes";
import './shareds.sass'

export default class Shareds {
  constructor() {
    this.navbar();
    this.autoWidth();
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
                <a href="${item.path}">${ item.label }</a>
              </div>
            `).join('')}
          </div>
        </details>
        
      </article>
    `;
  }

  // imposta la larghezza dell'input al proprio contenuto
  autoWidth(targets?: HTMLInputElement[] | HTMLInputElement | undefined) {
    const classSelector = 'w-var';
    const self = this; // Capture 'this' context for use in nested functions
  
    // Se sono stati passati dei target, applica solo a quelli validi
    if (targets) {
      // Se targets non è un array, lo converte in array per uniformità
      const inputs = Array.isArray(targets) ? targets : [targets];
      // Applica resize solo agli input specificati
      inputs.forEach(resizeInput);
  
    // se non viene passato alcun parametro, applica a tutti gli input.w-var
    } else init();
  
    /**
     * Calcola e aggiorna la larghezza di un singolo input.w-var
     * @param {HTMLInputElement} input 
     */
    function resizeInput(input: HTMLInputElement) {
      // Verifica che l'elemento sia un input HTML
      if (!(input instanceof HTMLInputElement)) return;
      // Verifica che l'input abbia la classe w-var
      if (!input.classList.contains(classSelector)) return;
  
      // Prendi il testo da misurare: valore o placeholder
      const text = input.value || input.placeholder || '';
  
      // Crea uno span invisibile per misurare la larghezza del testo
      const span = document.createElement('span');
      span.style.position = 'absolute';    // fuori dal flusso
      span.style.visibility = 'hidden';    // non visibile ma misurabile
      span.style.height = 'auto';
      span.style.width = 'auto';
      span.style.whiteSpace = 'pre';       // mantieni spazi e formattazione
      span.style.textAlign = 'center';
      // Copia font e stile per una misura accurata
      span.style.font = getComputedStyle(input).font;
      span.textContent = text;
  
      // Aggiungi lo span temporaneamente al body per calcolare larghezza
      document.body.appendChild(span);
      // Imposta larghezza input pari a larghezza testo + 20px di margine
      input.style.width = `${span.offsetWidth + 20}px`;
      // Rimuovi lo span temporaneo
      document.body.removeChild(span);
    }
  
    /**
     * Funzione che inizializza il sistema completo:
     * - ridimensiona input esistenti
     * - ascolta input per aggiornare larghezza in tempo reale
     * - osserva modifiche inline all'attributo style
     * - osserva aggiunta di nuovi input.w-var nel DOM
     */
    function init() {
      // Ridimensiona tutti gli input.w-var già presenti nella pagina
      document.querySelectorAll(`.${classSelector}`).forEach(el => resizeInput(el as HTMLInputElement));
  
      // Aggiunge un listener globale per gestire digitazioni su input.w-var
      document.addEventListener('input', event => {
        // Verifica che il target sia input.w-var
        if (event.target instanceof HTMLInputElement && event.target.classList.contains(classSelector)) {
          // Ridimensiona solo l'input interessato
          self.autoWidth([event.target]);
        }
      });
  
      /**
       * Funzione per osservare modifiche inline allo stile di un singolo input.w-var
       * @param {HTMLInputElement} el 
       */
      const observeStyleAttr = (el: HTMLInputElement) => {
        // Solo per input.w-var validi
        if (!(el instanceof HTMLInputElement)) return;
        if (!el.classList.contains(classSelector)) return;
  
        // MutationObserver per ascoltare modifiche all'attributo 'style' inline
        const attrObserver = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            // Se lo stile cambia, ridimensiona l'input interessato
            if (mutation.type =='attributes' && mutation.attributeName =='style') self.autoWidth([el]);
          }
        });
  
        // Osserva solo l'attributo style
        attrObserver.observe(el, {
          attributes: true,
          attributeFilter: ['style'],
        });
      };
  
      // Applica l'observer a tutti gli input.w-var già esistenti
      document.querySelectorAll(`.${classSelector}`).forEach(el => observeStyleAttr(el as HTMLInputElement));
  
      // Observer globale per rilevare nuovi nodi aggiunti al DOM
      const globalObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach(node => {
            // Assicurati che il nodo sia un elemento HTML
            if (!(node instanceof Element)) return;
  
            // Se il nodo stesso è un input.w-var, processalo
            if (node.matches(`.${classSelector}`)) {
              resizeInput(node as HTMLInputElement);
              observeStyleAttr(node as HTMLInputElement);
            }
  
            // Cerca input.w-var anche nei discendenti del nodo aggiunto
            node.querySelectorAll?.(`.${classSelector}`).forEach(el => {
              resizeInput(el as HTMLInputElement);
              observeStyleAttr(el as HTMLInputElement);
            });
          });
        }
      });
  
      // Inizia ad osservare il DOM sotto il body per aggiunte di nodi
      globalObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  } 
  
}
