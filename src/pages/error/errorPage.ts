import { StateTemplate } from "../../shareds/st";
import { Routes } from "../../routes";
const ST = new StateTemplate();

export default class ErrorPage {
  constructor() {
    ST.page(this, this.template);
    document.title = 'Errore 404';
  }

  title = '';
  pages: typeof Routes = Routes;
  result: typeof Routes = [];

  setTitle(title: string) {
    this.title = title;
    this.result = this.pages.filter(route =>
      title.length > 2 && route.path.includes(title.toLowerCase())
    );

    ST.Render({ title, result: this.result });
  }

  template = `
    <article id="errorPage">
      <header style="width: max-content; margin: auto;">
        <h1>Errore 404</h1>
        <h3>La pagina non è stata trovata</h3>
        <input placeholder="Ricerca pagina" type="search" class="primary"
          style="display: block; margin: 5px auto;"
          _value="title" oninput="app.setTitle(this.value)">
      </header>

      <main style="width: max-content; margin: auto;">
        <div if="title.length < 3" class="alert info">
          ATTENZIONE: Scrivi il titolo della pagina
        </div>

        <div if="title.length > 2 && result.length == 0" class="alert warning">
          ATTENZIONE: Nessuna pagina trovata
        </div>

        <div if="result.length > 0">
          <h3 style="margin: 20px auto 5px;">Risultati</h3>
          <div for="result; $i">
            <a _href="result[$i]?.path ?? ''"
               style="width: max-content; margin: auto; display: block;">
              <button _innerHtml="(result[$i]?.path ?? '').substring(1).toUpperCase()" class="primary"></button>
            </a>
          </div>
        </div>
      </main>
    </article>
  `;
}
