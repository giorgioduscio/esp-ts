import './style.css'
import CvPage from './pages/cv/cvPage.ts'


function main() {
  switch(window.location.pathname){
    case '/cv': return new CvPage();
  }
} 

window.addEventListener("hashchange", () => {
  console.log("Hash cambiato:", window.location.hash);
  main()
}); main()
