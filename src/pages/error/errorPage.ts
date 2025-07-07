import { StateTemplate } from "./st";
import { Routes } from "../../routes";
const ST = new StateTemplate();

export default class ErrorPage  {
  constructor() {
    ST.page(this,this.template,);
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
          get="title" oninput="app.setTitle(this.value)">
      </header>

      <main style="width: max-content; margin: auto;">
        <button if="title.length<3" class="info">ATTENZIONE: Scrivi il titolo della pagina</button>
        <button if="title.length>2 && result.length==0" class="warning">ATTENZIONE: Nessuna pagina trovata</button>

        <div if="result.length>0">
          <h3 style="margin: 20px auto 5px;">Risultati</h3>
          <div for="result">
            <a get="result[$i]?.path ?? ''" style="width: max-content; margin: auto; display: block;">
              <button get="(result[$i]?.path ?? '').substring(1).toUpperCase()" class="primary"></button>
            </a>
          </div>
        </div>
      </main>
    </article>
  `;
}
