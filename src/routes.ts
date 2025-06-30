import CvPage from "./pages/cv/cvPage";
import ErrorPage from "./pages/error/errorPage";
import HomePage from "./pages/home/homePage";

export const Routes=[
  { path: '/cv', component: CvPage, show:true },
  { path: '/home', component: HomePage, show:true },
  { path: '/error', component: ErrorPage },
  { path: '/', redirect: '/home' },
  { path: '**', redirect: '/error' },
]
