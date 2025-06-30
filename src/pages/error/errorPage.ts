export default class ErrorPage {
  constructor() {
    document.title = 'Errore';
    this.render()
  }

  render(){
    const appElement = document.getElementById('app');
    if (!appElement) return;
    appElement.innerHTML = `
      <article>
        <h1>Errore</h1>
      </article>  
    `;
  };
}