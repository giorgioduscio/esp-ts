export interface CVItem{
  titolo: string;
  sezione: string;
  descrizione?: string;
  link?: string;
  anno?: string; // Optional, used for work experiences
  struttura?: string[]; // Optional, used for work experiences with detailed structure
};

export const CV = {
  url: 'http://localhost:3000/main',

  async get() {
    const response = await fetch(this.url, { method: 'GET' });
    if (!response.ok) throw new Error('Errore nella GET');
    return await response.json();
  },

  async post(data: CVItem) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Errore nella POST');
    return await response.json();
  },

  async put(data: CVItem) {
    const response = await fetch(this.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Errore nella PUT');
    return await response.json();
  },

  async delete() {
    const response = await fetch(this.url, { method: 'DELETE', });
    if (!response.ok) throw new Error('Errore nella DELETE');
    return await response.json();
  },
};
