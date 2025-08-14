import CvPage from "./pages/cv/cvPage";
import DashboardPage from "./pages/dashboard/dashboard";
import ErrorPage from "./pages/error/errorPage";
import HomePage from "./pages/home/homePage";
import Accesso from "./pages/log/accesso";
import Registrazione from "./pages/log/registrazione";

export interface Route{
  label?: string,
  path: string,
  component?: any,
  redirect?: string
  show?: boolean
}

export const Routes :Route[] =[
  { label:'Curriculum', path: '/cv', component: CvPage, show:true },
  { label:'Home', path: '/home', component: HomePage, show:true },
  { label:'Dashboard', path: '/dashboard', component: DashboardPage, show:true },
  { label:'Error', path: '/error', component: ErrorPage },
  { label:'Tic Tac Toe', path: '/ttt.html', show:true },
  { label:'Mini GDR', path: '/mini.html', show:true },
  // login
  { label:'Accesso', path: '/accesso', component: Accesso, show:true }, 
  { label:'Registrazione', path: '/registrazione', component: Registrazione, show:true },

  { path: '/', redirect: '/home' },
  { path: '**', redirect: '/error' },
]
