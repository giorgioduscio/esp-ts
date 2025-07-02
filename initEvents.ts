function initEvents() {
  document.querySelectorAll<HTMLElement>('*').forEach(el => {
    for (const attr of el.attributes) {
      if (attr.name.startsWith('on_')) {
        const eventName = attr.name.slice(3); // es: "input", "click"
        const raw = attr.value.trim();        // es: "onInput('ciao')"

        // Estrai nome funzione e parametri
        const match = raw.match(/^(\w+)\s*\((.*)\)$/);
        if (!match) {
          console.warn(`Formato handler non valido: ${raw}`, el);
          continue;
        }

        const [_, methodName, paramStr] = match;

        const method = (this as any)[methodName];
        if (typeof method !== 'function') {
          console.warn(`Metodo "${methodName}" non trovato su this`, el);
          continue;
        }

        // Costruisci i parametri da stringa (usiamo new Function per semplicità)
        el.addEventListener(eventName, (event: Event) => {
          let args: any[] = [];
          if (paramStr.trim()) {
            try {
              const fn = new Function(`return [${paramStr}]`);
              args = fn();
            } catch (err) {
              console.warn(`Errore parsing parametri: "${paramStr}"`, err);
            }
          }
          method.call(this, event, ...args);
        });
      }
    }
  });
}
