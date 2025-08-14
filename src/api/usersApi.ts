export interface User {
  username: string
  password: string
  role:number
  id:number
  email:string
  firebaseId?:string
  imageUrl?:string
}

export const UsersApi = {
  url: 'https://users-b9804-default-rtdb.europe-west1.firebasedatabase.app/users',

  // READ: Ottieni tutti gli utenti
  async get() {
    const response = await fetch(`${this.url}.json`, { method: 'GET' });
    const data: { [key: string]: User } = await response.json();

    if (!data) return [];
    
    console.log('get');
    return Object.keys(data).map((key) => ({
      firebaseId: key,
      ...data[key],
    }));
  },

  // CREATE: Aggiungi un nuovo utente
  async create(user: User) {
    const response = await fetch(`${this.url}.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const data = await response.json();
    console.log('create', { ...user, firebaseId: data.name });
    return { ...user, firebaseId: data.name }; // `name` è l'ID generato da Firebase
  },

  // UPDATE: Aggiorna un utente esistente (serve `firebaseId`)
  async update(user: User) {
    console.log('update', user);
    if (!user.firebaseId) throw new Error('firebaseId is required for update');

    const { firebaseId, ...userData } = user;

    await fetch(`${this.url}/${firebaseId}.json`, {
      method: 'PUT', // Sostituisce completamente il nodo
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    return user;
  },

  // DELETE: Rimuove un utente (serve `firebaseId`)
  async delete(firebaseId: string) {
    await fetch(`${this.url}/${firebaseId}.json`, { method: 'DELETE' }).then(r =>{
      console.log('delete', r);
    });
  },
};