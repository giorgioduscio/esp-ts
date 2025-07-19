import { ondom } from "../../shareds/ondom"

export default class Registrazione {
  constructor() {
    document.title = 'Registrazione';
    (window as any).app = this;
    this.render();
  }
  
  form =[
    { type: 'text', label: 'Username', name: 'username', value: '', 
      validation: (v: string) => v.length > 3,
      errorMessage: 'Username deve essere oltre 3 caratteri',
    },
    { type: 'password', label: 'Password', name: 'password', value: '',
      validation: (v: string) => v.length > 8 && v.length < 20,
      errorMessage: 'Password deve essere tra 8 e 20 caratteri',
    },
    { type: 'email', label: 'Email', name: 'email', value: '',
      validation: (v: string) => v.includes('@') && v.includes('.'),
      errorMessage: 'Email non valida',
    },
    { type: 'number', label: 'Role', name: 'role', value: '',
      validation: (v: string) => !!v,
      errorMessage: 'Role non valido',
    },
  ]

  submitted = false

  change(e: Event, field: any){
    const input = e.target as HTMLInputElement;
    const { value } = input;
    if (!field) return;
  
    const isValid = !field.validation || field.validation(value);  
    field.value = isValid ? value : '';    
    if (this.submitted) this.render()
  }
  
  isFormValid =()=> this.form.every(f => f.validation(f.value!));
  
  submit(e: Event) {
    e.preventDefault();
    this.submitted = true;

    if (this.isFormValid()) {
      const formData = Object.fromEntries(this.form.map(f => [f.name, f.value!]));
      console.log('Form inviato con successo:', formData);

      const form = e.target as HTMLFormElement;
      const resetBtn = form.querySelector('button[type="button"]') as HTMLButtonElement;
      this.reset(resetBtn);
    }
    this.render();
  }
  
  reset(btn: HTMLButtonElement) {
    const form = btn.closest('form'); if (!form) return;
    this.form.forEach(f =>{ 
      const input :HTMLInputElement|null =form.querySelector(`input[name="${f.name}"]`);
      if (input) input.value =f.value = ''
    });
    this.submitted = false;
    this.render();
  }

  app =document.getElementById('app')
  count =0
  render() {
    ondom(this.app!, `
      <article id="registrazione">
        <form onsubmit="app.submit(event)">
          <h3>Registrazione</h3>
          <p>I campi con * sono obbligatori</p>
          ${this.form.map((field, i) => `
            <div>
              <div><label for="${field.name}">${field.label} ${!!field.validation ? '*' : ''}</label></div>
              <input type="${field.type}"
                     placeholder="${field.label}"
                     name="${field.name}" id="${field.name}"
                     value="${field.value}"
                     oninput="app.change(event, app.form[${i}])" />
              ${ this.submitted && !field.validation(field.value!) ?`
                <div class="error">${field.errorMessage}</div>
              `:''}
            </div>
          `).join('')}
          <button type="submit" ${this.submitted && !this.isFormValid() ? 'disabled' : ''}>Invia</button>
          <button type="button" onclick="app.reset(this)" class="danger">Reset</button>
        </form>
      </article>
    `)

    // evidenziazione elementi
    ?.forEach(el=>{
      if ((el as Element).tagName && this.count) {
        console.log(el);
      }
    })
    this.count++;
    console.log(this.count, '_____________\n\n');
  }
  
}