import CvPage from "./pages/cv/cvPage";
import DashboardPage from "./pages/dashboard/dashboard";
import ErrorPage from "./pages/error/errorPage";
import HomePage from "./pages/home/homePage";
import Accesso from "./pages/log/accesso";
import Registrazione from "./pages/log/registrazione";

export interface Route{
  path: string,
  component?: any,
  redirect?: string
  show?: boolean
}

export const Routes :Route[] =[
  { path: '/cv', component: CvPage, show:true },
  { path: '/home', component: HomePage, show:true },
  { path: '/dashboard', component: DashboardPage, show:true },
  { path: '/error', component: ErrorPage },
  // login
  { path: '/accesso', component: Accesso, show:true }, 
  { path: '/registrazione', component: Registrazione, show:true },


  { path: '/', redirect: '/home' },
  { path: '**', redirect: '/error' },
]
