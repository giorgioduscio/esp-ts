import { UsersApi, type User } from "../../api/usersApi";
import { StateTemplate } from "../../shareds/st";
const st =new StateTemplate()

export default class DashboardPage {
  constructor() {
    document.title = 'Dashboard';
    st.page(this, this.template, 'app');

    UsersApi.get().then(r => {
      this.users = [...r];
      this.filteredUsers = [...r];
      this.renderPage();
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
    const globalIndex = Number(i) + this.page * this.limit;
    // @ts-ignore
    this.users[globalIndex][userField] = newValue;

    UsersApi.update(this.users[globalIndex]).then(()=>{      
      this.renderPage();
    });
  }
  // DELETE
  deleteUser(i: number) {
    const globalIndex = i + this.page * this.limit;
    UsersApi.delete(this.users[globalIndex].firebaseId!).then(()=>{
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
    const start = this.page * this.limit;
    const end = start + this.limit;

    let visibleUsers = this.filteredUsers.slice(start, end);

    if (this.sortField && this.sortDirection !== 'none') {
      const field = this.sortField;
      const direction = this.sortDirection;

      visibleUsers = [...visibleUsers].sort((a, b) => {
        const aVal = a[field]!;
        const bVal = b[field]!;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        return direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    st.Render({
      users: visibleUsers,
      hasPrev: this.page > 0,
      hasNext: (this.page + 1) * this.limit < this.filteredUsers.length,
      page: this.page + 1,
      totalPages: Math.ceil(this.filteredUsers.length / this.limit),
      limit: this.limit
    });
  }

  navigate(direction: 'next' | 'prev') {
    if (direction === 'next' && (this.page + 1) * this.limit < this.filteredUsers.length) this.page++;
    else if (direction === 'prev' &&this.page >0) this.page--;
    this.renderPage();
  }
  limit = 4;
  setLimit(value: string) {
    this.limit = parseInt(value);
    this.page = 0;
    this.renderPage();
  }

// ORDINAMENTO
  sortField: keyof User | null = null;
  sortDirection: 'asc' | 'desc' | 'none' = 'none';
  sort(e: Event) {
    const button = (e.target as HTMLElement).closest('button');
    const tbody = document.querySelector('tbody');
    if (!button || !tbody) return;

    const field = button.innerText.toLowerCase().trim() as keyof User;
    const validFields: (keyof User)[] = ['username', 'email', 'role'];
    if (!validFields.includes(field)) return;

    const currentAttr = tbody.getAttribute('data-direction') || '';
    const [currentField, currentDirection] = currentAttr.split('-');

    let newDirection: 'asc' | 'desc' | 'none';

    if (currentField !== field) {
      newDirection = 'asc';
    } else {
      switch (currentDirection) {
        case 'asc': newDirection = 'desc'; break;
        case 'desc': newDirection = 'none'; break;
        default: newDirection = 'asc'; break;
      }
    }

    // Aggiorna stato visivo e interno
    tbody.setAttribute('data-direction', `${field}-${newDirection}`);
    this.sortField = newDirection === 'none' ? null : field;
    this.sortDirection = newDirection;

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
            <span>{ page } / { totalPages }</span>
            <button onclick="app.navigate('next')" _disabled="!hasNext">→</button>
          </div>
          <select _value="limit" onchange="app.setLimit(this.value)">
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

        <table>
          <thead><tr onclick="app.sort(event)"><th></th>
            <th><button> Username </button></th>
            <th><button> Email </button></th>
            <th><button> Role </button></th>
          </tr></thead>
          <tbody for="users; $a">
            <tr>
              <td><button class="danger" onclick="app.deleteUser($a)">D</button></td>
              <td><input _value="users[$a]?.username" type="text"     name="$a_username"/></td>
              <td><input _value="users[$a]?.email"    type="email"    name="$a_email"/></td>
              <td><input _value="users[$a]?.role"     type="number"   name="$a_role"/></td>
            </tr>
          </tbody>  
        </table>

      </main>

      <footer style="margin: 20px auto; max-width: max-content">
        <ol for="users; $a">
          <li><input _value="users[$a]?.username" class="w-var"/></li>
        </ol>
      </footer>
    </article>
  `;
}
