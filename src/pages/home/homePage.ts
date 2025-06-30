export default class HomePage {
  constructor() {
    document.title = 'Home';
    this.render()
  }

  render = () => {
    const appElement = document.getElementById('app');
    if (appElement) 
    appElement.innerHTML = `
      <article>
        <h1>Home</h1>
      </article>
    `;
  };
}