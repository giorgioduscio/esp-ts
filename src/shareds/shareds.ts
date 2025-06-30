import { Routes } from "../routes";
import './shareds.css'

export default class Shareds {
  constructor() {
    this.navbar();
  }

  navbar(){
    const navbar = document.getElementById('navbar');   
    if (navbar && !navbar.innerHTML) navbar.innerHTML = `
      <main>
        <details>
          <summary>Menu</summary>
          <div> ${Routes.filter((item) => item.show).map((item) => `
            <div><a href="${item.path}">${ item.path.substring(1).toUpperCase() }</a></div>
          `).join('')}
          </div>
        </details>
        
      </main>
    `;
  }
}