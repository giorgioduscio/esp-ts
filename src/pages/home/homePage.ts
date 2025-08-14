// REATTIVITA' STILE TEMPLATE TS
export default class HomePage {
  constructor() {
    document.title = 'Home';
    (window as any).app = this;
    this.render();
  }

  value =''
  valueElemets ?: NodeListOf<HTMLElement>
  onInput(e: Event) {
    this.value =(e.target as HTMLInputElement).value;
    this.render();
  }
  onClick(message: string) {
    console.log('Click: ', message);
  }

  render() {
    const appElement = document.getElementById('app');
    if (appElement) appElement.innerHTML = `
      <article>
        <div>
          <h1>valore: ${this.value} </h1>
          <input type="search" placeholder="Cerca" onchange="app.onInput(event)" />
          <button onclick="app.onClick('parametro')"> Invio ${this.value}</button>
        </div>
      </article>
    `;
  }
}
