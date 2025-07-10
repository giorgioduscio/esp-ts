import { UsersApi, type User } from "../../api/usersApi";
import { StateTemplate } from "../../shareds/st";

const st = new StateTemplate();
export default class DashboardPage {
  constructor() {
    document.title = 'Dashboard';
    st.page(this,this.template,'app');

    UsersApi.get().then(r=>{
      this.users = r
      st.Render({ users: this.users });
    })
  }

  users :User[] =[]
  deleteUser(i:number){
    this.users.splice(i,1);
    st.Render({ users: this.users });
  }
  addUser(e:Event){
    e.preventDefault();
    const formDatas :any =Object.fromEntries(new FormData(e.target as HTMLFormElement));
    if(!formDatas.username || !formDatas.password || !formDatas.role) return

    const newUser :User = { ...formDatas,
      role: parseInt(formDatas.role),
      id: Math.floor(Math.random() * 1000),
    }    
    this.users.push(newUser);
    st.Render({ users: this.users });
    (e.target as HTMLFormElement).reset();
  }
  updateUser(e:Event){ 
    const {value, name} = e.target as HTMLInputElement;
    const [i, field] = name.split('_');
    const userField = field as keyof User;
    const newValue =field==='role' ? parseInt(value) : value;
    // @ts-ignore
    this.users[Number(i)][userField] =newValue
    st.Render({ users: this.users });
  }
    
  form =[
    { type: 'text', placeholder: 'Username', name: 'username', value:'' },
    { type: 'text', placeholder: 'Password', name: 'password', value:'' },
    { type: 'number', placeholder: 'Role', name: 'role', value:'' },
  ]
  template = `
    <article id="dashboard">
      <header>
        <h1 style="text-align: center">Dashboard</h1>
      </header>

      <main style="margin: 20px auto; max-width: max-content">
        <form onsubmit="app.addUser(event)">
          <button class="success">A</button>
          <span for="form; $a">
            <input  _tipe="form[$a]?.type" 
                    _placeholder="form[$a]?.placeholder" 
                    _name="form[$a]?.name"
                    _value="form[$a]?.value"
            />
          </span>
        </form>

        <div for="users; $a">
          <div oninput="app.updateUser(event)">
            <button class="danger" onclick="app.deleteUser($a)">D</button>
            <input _value="users[$a]?.username" type="text"     name="$a_username"/>
            <input _value="users[$a]?.password" type="password" name="$a_password"/>
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
  `
}