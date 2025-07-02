import Render from "./render";

export default class ErrorPage {
  constructor() {
    document.title = 'Errore';
    (window as any).app = this;
    this.inithtml();
    Render(this)
  }
  title ='Errore'
  setTitle(title: string) { 
    this.title =document.title =title; 
  }

  list =[
    { id:'283', title:'carote', check:false },
    { id:'289', title:'patate', check:false },
    { id:'233', title:'banane', check:true },
    { id:'383', title:'mele', check:false },
    { id:'489', title:'ferri', check:true },
  ]
  deleteElement(index: number) { 
    this.list.splice(index, 1); 
    Render({ list: this.list }) 
  }
  createElement(){ 
    this.list.push({ id: Math.floor(Math.random() * 1000).toString(), title:'', check:false }); 
    Render({ list: this.list }) 
  }
  updateElement(e:Event, index: number){ 
    const { name, value, checked, type } = e.target as HTMLInputElement;
    (this.list[index] as any)[name] =type == 'checkbox'? checked : value;
    Render({ list: this.list })
  }
  inithtml(){ //@ts-ignore
    document.getElementById('app').innerHTML = `
      <article>
        <h1> <input get="title" oninput="app.setTitle(this.value)" type="text" name="title" /></h1>

        <main>
          <div style="display: flex; align-items: center;">
            <button onclick="app.createElement()">Aggiungi</button>
            <h3>Main</h3>
          </div>

          <div for="list" onchange="app.updateElement(event, $i)">
            <div style="display: flex; align-items: center;">
              <button onclick="app.deleteElement($i)">Elimina</button>
              <input get="list[$i].check" type="checkbox" name="check" />
              <input get="list[$i].title" type="text" name="title" />
            </div>
          </div>
        </main>

        <div>
          <h3>Copia</h3>
          <div for="list" style="display: flex; align-items: center;">
            <input get="list[$i].check" type="checkbox" name="check" />
            <span get="list[$i].title"></span>
          </div>
        </div>
        
      </article>
    `;
  }
}