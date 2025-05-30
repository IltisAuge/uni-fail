import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';


import {SearchComponent} from './search/search.component';
import {RankingComponent} from './ranking/ranking.component';
import {PostFormComponent} from './post-form/post-form.component';
import {AboutUsComponent} from './about-us/about-us.component';
import {AboutUserComponent} from './about-user/about-user.component';


export const routes: Routes = [
	{ path: '', component: HomeComponent },

	{ path: 'Search', component: SearchComponent },
	{ path: 'Ranking', component: RankingComponent },
	{ path: 'Post', component: PostFormComponent },
	{ path: 'AboutUs', component: AboutUsComponent },
	{ path: 'MyAccount', component: AboutUserComponent },
];


