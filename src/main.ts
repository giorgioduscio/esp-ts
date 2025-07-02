import './style.css'
import Shareds from './shareds/shareds.ts';
import { Routes } from './routes.ts';


function main(url:string) {
  const match =Routes.find((route) => route.path === url)
             ||Routes.find((route) => route.path === '**')
  if (match) {
    if(match.component) new match.component();
    else if(match.redirect) window.location.pathname = match.redirect
  }
  new Shareds();
} 
document.addEventListener("DOMContentLoaded", () => {
  
  window.addEventListener("hashchange", () => {
    console.log("Hash cambiato:", window.location.pathname);
    main(window.location.pathname)
  }); main(window.location.pathname)
  
})