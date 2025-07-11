import { UsersApi, type User } from "../../api/usersApi";
import { StateTemplate } from "../../shareds/st";
const st =new StateTemplate()

export default class DashboardPage {
  constructor() {
    document.title = 'Dashboard';
    st.page(this, this.template, 'app');

    UsersApi.get().then(r => {
      this.users = r;
      this.filteredUsers = r;
      this.renderPage(); // nuovo metodo
    });
  }

//! CRUD
  // CREATE
  form = [
    { type: 'text', placeholder: 'Username', name: 'username', value: '' },
    { type: 'password', placeholder: 'Password', name: 'password', value: '' },
    { type: 'email', placeholder: 'Email', name: 'email', value: '' },
    { type: 'number', placeholder: 'Role', name: 'role', value: '' },
  ];
  createUser(e: Event) {
    e.preventDefault();
    const formDatas: any = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    if (!Object.values(formDatas).every(Boolean)) return; // se almeno un campo non ha valori, esce

    const newUser: User = {
      ...formDatas,
      role: parseInt(formDatas.role),
      id: Math.floor(Math.random() * 1000),
    };

    UsersApi.create(newUser).then(r =>{     
      this.users.push(r);
      this.filter(''); // Rende visibile anche dopo add
      (e.target as HTMLFormElement).reset();
    });
  }
  // READ
  users: User[] = [];
  // UPDATE
  updateUser(e: Event) {
    const { value, name } = e.target as HTMLInputElement;
    if (!value || !name) return;

    const [i, field] = name.split('_');
    const userField = field as keyof User;
    const newValue = field === 'role' ? parseInt(value) : value;
    const globalIndex = Number(i) + this.page * this.limt;
    // @ts-ignore
    this.users[globalIndex][userField] = newValue;

    UsersApi.update(this.users[globalIndex]).then(r =>{      
      this.renderPage();
    });
  }
  // DELETE
  deleteUser(i: number) {
    const globalIndex = i + this.page * this.limt;
    UsersApi.delete(this.users[globalIndex].firebaseId!).then(r =>{
      this.users.splice(globalIndex, 1);
      this.filter(''); // Reapplica il filtro o reset
    });
  }

// FILTER
  filteredUsers: User[] = [];
  filter(value: string) {
    if (value.length >= 3) {
      this.filteredUsers = this.users.filter(user =>
        user.username.toLowerCase().includes(value.toLowerCase())
      );
    } else this.filteredUsers = [...this.users];
    
    this.page = 0;
    this.renderPage();
  }

// PAGINAZIONE
  page = 0;
  renderPage() {
    const start = this.page * this.limt;
    const end = start + this.limt;

    st.Render({
      users: this.filteredUsers.slice(start, end),
      hasPrev: this.page > 0,
      hasNext: (this.page + 1) * this.limt < this.filteredUsers.length,
      page: this.page + 1,
      totalPages: Math.ceil(this.filteredUsers.length / this.limt),
      limt: this.limt
    });
  }
  navigate(direction: 'next' | 'prev') {
    if (direction === 'next' && (this.page + 1) * this.limt < this.filteredUsers.length) this.page++;
    else if (direction === 'prev' &&this.page >0) this.page--;
    this.renderPage();
  }
  limt = 4;
  setLimit(value: string) {
    this.limt = parseInt(value);
    this.page = 0;
    this.renderPage();
  }

  template = `
    <article id="dashboard">
      <header>
        <h1 style="text-align: center">Dashboard</h1>

        <div style="display: flex; flex-wrap: wrap; justify-content: center">
          <input  type="search" 
                  placeholder="Cerca username" 
                  oninput="app.filter(this.value)" 
          />
          <div style="text-align: center;">
            <button onclick="app.navigate('prev')" _disabled="!hasPrev">←</button>
            <span> <b _innerText="page"></b> / <b _innerText="totalPages"></b> </span>
            <button onclick="app.navigate('next')" _disabled="!hasNext">→</button>
          </div>
          <select _value="limt" onchange="app.setLimit(this.value)">
            <option>4</option>
            <option>8</option>
            <option>12</option>
          </select>
        </div>
      </header>

      <main style="margin: 20px auto; max-width: max-content">
        <form onsubmit="app.createUser(event)">
          <button class="success">A</button>
          <span for="form; $a">
            <input  _type="form[$a]?.type" 
                    _placeholder="form[$a]?.placeholder" 
                    _name="form[$a]?.name"
                    _value="form[$a]?.value"
            />
          </span>
        </form>

        <div for="users; $a">
          <div onchange="app.updateUser(event)">
            <button class="danger" onclick="app.deleteUser($a)">D</button>
            <input _value="users[$a]?.username" type="text"     name="$a_username"/>
            <input _value="users[$a]?.email"    type="email"    name="$a_email"/>
            <input _value="users[$a]?.role"     type="number"   name="$a_role"/>
          </div>
        </div>

      </main>

      <footer>
        <ol for="users; $a">
          <li _innerHtml="users[$a]?.username"></li>
        </ol>
      </footer>
    </article>
  `;
}
