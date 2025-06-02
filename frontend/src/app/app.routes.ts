import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {SearchComponent} from './search/search.component';
import {RankingComponent} from './ranking/ranking.component';
import {PostFormComponent} from './post-form/post-form.component';
import {AboutUsComponent} from './about-us/about-us.component';
import {AboutUserComponent} from './about-user/about-user.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'search', component: SearchComponent },
	{ path: 'ranking', component: RankingComponent },
	{ path: 'post', component: PostFormComponent },
	{ path: 'about-us', component: AboutUsComponent },
	{ path: 'my-account', component: AboutUserComponent },
    { path: 'login', component: LoginComponent }
];


