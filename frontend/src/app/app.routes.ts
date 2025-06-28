import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {SearchComponent} from './search/search.component';
import {RankingComponent} from './ranking/ranking.component';
import {PostFormComponent} from './post-form/post-form.component';
import {AboutUsComponent} from './about-us/about-us.component';
import {AboutUserComponent} from './about-user/about-user.component';
import {LoginComponent} from './login/login.component';
import {UserAdminViewComponent} from './user-admin-view/user-admin-view.component';
import {AccessDeniedComponent} from './access-denied/access-denied.component';
import {accessGuard} from './access.guard';
import {NotFoundComponent} from './not-found/not-found.component';
import {UserPostsComponent} from './user-posts/user-posts.component';
import {PostComponent} from './post/post.component';

export const routes: Routes = [
    { path: 'dummy', component: HomeComponent },
	{ path: '', component: HomeComponent, canActivate: [accessGuard] },
	{ path: 'search', component: SearchComponent, canActivate: [accessGuard] },
	{ path: 'ranking', component: RankingComponent, canActivate: [accessGuard] },
	{ path: 'post', component: PostFormComponent, canActivate: [accessGuard] },
	{ path: 'about-us', component: AboutUsComponent, canActivate: [accessGuard] },
	{ path: 'my-account', component: AboutUserComponent, canActivate: [accessGuard] },
    { path: 'my-posts', component: UserPostsComponent, canActivate: [accessGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'user/:id', component: UserAdminViewComponent, canActivate: [accessGuard] },
    { path: 'access-denied', component:  AccessDeniedComponent },
    { path: 'post/:id', component: PostComponent },
    { path: '**', component: NotFoundComponent },
];
