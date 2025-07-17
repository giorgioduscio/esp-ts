import './form.sass';

type FormField = {
  type: string;
  placeholder: string;
  name: string;
  value?: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
};

export default class Accesso {
  constructor() {
    document.title = 'Accesso';
    (window as any).app = this;
    this.render();
  }

  form: FormField[] = [
    {
      type: 'text',
      placeholder: 'Username',
      name: 'username',
      value: '',
      validation: (v: string) => v.length > 3,
      errorMessage: 'Username deve essere più lungo di 3 caratteri',
    },
    {
      type: 'password',
      placeholder: 'Password',
      name: 'password',
      value: '',
      validation: (v: string) => v.length > 8 && v.length < 20,
      errorMessage: 'Password deve essere tra 8 e 20 caratteri',
    },
    {
      type: 'email',
      placeholder: 'Email',
      name: 'email',
      value: '',
      validation: (v: string) => v.includes('@') && v.includes('.'),
      errorMessage: 'Email non valida',
    },
  ];

  submitted = false;

  isFormValid(): boolean {
    return this.form.every(f => !f.validation || f.validation(f.value ?? ''));
  }

  change(e: Event, field: FormField) {
    const input = e.target as HTMLInputElement;
    const { value } = input;
    if (!field) return;

    const errorMessageElement = input.nextElementSibling as HTMLDivElement;
    const isValid = !field.validation || field.validation(value);

    field.value = isValid ? value : '';

    if (this.submitted) {
      if (isValid) {
        input.classList.remove('error');
        errorMessageElement.classList.add('hidden');
      } else {
        input.classList.add('error');
        errorMessageElement.classList.remove('hidden');
      }
    }

    const htmlForm = input.closest('form') as HTMLFormElement;
    const submitButton = htmlForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (!submitButton) return;

    if (!this.submitted) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.disabled = !this.isFormValid();
    }
  }

  submit(e: Event) {
    e.preventDefault();
    this.submitted = true;

    this.form.forEach((field) => {
      const input = document.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
      const errorMessageElement = input?.nextElementSibling as HTMLDivElement;
      const isValid = !field.validation || field.validation(input.value);

      if (isValid) {
        input.classList.remove('error');
        errorMessageElement.classList.add('hidden');
        field.value = input.value;
      } else {
        input.classList.add('error');
        errorMessageElement.classList.remove('hidden');
        field.value = '';
      }
    });

    const submitButton = document.querySelector('#accesso button[type="submit"]') as HTMLButtonElement;
    if (submitButton) submitButton.disabled = !this.isFormValid();

    if (this.isFormValid()) {
      const formData = Object.fromEntries(this.form.map(f => [f.name, f.value]));
      console.log('Form inviato con successo:', formData);
      this.reset();
    }
  }

  reset() {
    this.form.forEach(f => f.value = '');
    this.submitted = false;
    this.render();

    const formElement = document.querySelector('#accesso form');
    if (!formElement) return;

    const inputs = formElement.querySelectorAll('input');
    inputs.forEach(input => {
      input.classList.remove('error');
      const errorDiv = input.nextElementSibling as HTMLDivElement;
      if (errorDiv && errorDiv.classList.contains('error')) {
        errorDiv.classList.add('hidden');
      }
    });

    const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) submitButton.disabled = false; // attivo di nuovo
  }

  render() {
    document.getElementById('app')!.innerHTML = `
      <article id="accesso">
        <form onsubmit="app.submit(event)">
          <h3>Accesso</h3>
          <p>I campi con * sono obbligatori</p>
          ${this.form.map((field, i) => `
            <div>
              <div><label for="${field.name}">${field.placeholder} ${field.validation ? '*' : ''}</label></div>
              <input type="${field.type}"
                     placeholder="${field.placeholder}"
                     name="${field.name}"
                     value="${field.value ?? ''}"
                     oninput="app.change(event, app.form[${i}])" />
              <div class="error hidden">${field.errorMessage}</div>
            </div>
          `).join('')}
          <button type="submit" ${this.submitted && !this.isFormValid() ? 'disabled' : ''}>Invia</button>
          <button type="button" onclick="app.reset()">Reset</button>
        </form>
      </article>
    `;
  }
}
