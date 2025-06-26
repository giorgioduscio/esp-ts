import './cv.css'
import { CV, type CVItem } from "../../api/cvApi";

export default class CvPage{
  constructor(){
    (window as any).app = this
    document.title ='Curriculum Vitae';

    CV.get().then(d=>{
      this.cv =d
      this.sezioniUniche =Array.from(new Set(this.cv.map(item => item.sezione)));
      this.render()
    })

  }

  ciao(e:Event){
    console.log('ciao', e.target);
  }


  //! GET
  cv :CVItem[] =[]
  sezioniUniche :string[] =[]
  noClass =(sk:string)=> (sk=='personali' || sk=='disclaimer' || sk=='principale') ?true:false

  render =()=> document.body.innerHTML =`
  <article>
    <div class="container"> 
    ${this.sezioniUniche.map((sectionKey, )=>`

      <div class="${sectionKey} ${this.noClass(sectionKey) ?'':'titolato'}" onClick="app.ciao(event)">
        ${ this.noClass(sectionKey) ?'' :`<h3>${ sectionKey }</h3>` }
          <div>
            ${this.cv.filter(i=> i.sezione==sectionKey) .map(item=>`

              ${sectionKey =='personali' ?`
                <div item>
                  <span>${ item.titolo }:</span>
                  <b>${ item.descrizione }</b>
                </div>

              `:sectionKey=='principale' ?`
                <div item>
                  <h2>${ item.titolo.split('-')[0] }</h2>
                  <p>${ item.titolo.split('-')[1] }</p>
                  <p>${ item.descrizione }</p>
                </div>

              `:sectionKey=='competenze' ?`
                <div item>
                  <div>${ item.titolo.toLocaleUpperCase() }</div>
                  <b>${ item.descrizione }/10</b>
                </div>

              `:sectionKey=='disclaimer' ?`
                <div>${ item.descrizione }</div>

              `:sectionKey=='esperienze_lavorative' ?`
                <div item>
                  <div>
                    <h2>${ item.anno }</h2>
                  </div>

                  <ul>
                    <h2>${ item.titolo }</h2>
                    ${item.struttura?.map(strutturaItem=>
                      strutturaItem.startsWith('-') ?`
                        <li><b>${ strutturaItem.substring(2).split(':')[0] }</b>
                        : <span>${ strutturaItem.substring(2).split(':')[1] }</span>
                        </li>
                      `:`<p>${ strutturaItem }</p>
                    `).join('')}
                  </ul>
                </div>

              `:/*ELSE*/`
                <ul><li item>
                  <b>${ item.titolo }</b>
                  ${item.descrizione ?`: <span>${ item.descrizione }</span>`:''}
                  ${item.link ?`<a href="${ item.link }">${ item.link }</a>`:''}
                </li></ul>
              `}
              
            `).join('')}
          </div>
      </div>

    `).join('')}
    </div>
  </article>
  `;
}