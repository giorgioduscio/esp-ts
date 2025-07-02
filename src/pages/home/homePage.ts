// REATTIVITA' STILE TEMPLATE TS
export default class HomePage {
  constructor() {
    document.title = 'Home';
    (window as any).app = this;
    this.render();
  }

  value =''
  valueElemets ?: NodeListOf<HTMLElement>
  onInput(e: Event, word: string, number: number) {
    this.value =(e.target as HTMLInputElement).value;
    this.render();
  }
  onClick(e: Event, message: string) {
    console.log('Click: ', message);
  }

  render() {
    const appElement = document.getElementById('app');
    if (appElement) appElement.innerHTML = `
      <article>
        <div>
          <h1>valore: ${this.value} </h1>
          <input type="search" placeholder="Cerca" onchange="app.onInput(event, 'parametro', 101)" />
          <button onclick="app.onClick(123, 'parametro')"> Invio ${this.value}</button>
        </div>
      </article>
    `;
  }
}
