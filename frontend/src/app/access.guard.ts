import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {filter, map} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {UserAdminViewComponent} from './user-admin-view/user-admin-view.component';
import {AboutUserComponent} from './about-user/about-user.component';
import {PostFormComponent} from './post-form/post-form.component';
import {UserPostsComponent} from './user-posts/user-posts.component';

export const accessGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.reloadUser().pipe(
        filter((state) => state.success),
        map((state) => {
            // Block admin routes for non-admins
            if (route.component === UserAdminViewComponent && (!state.user || !state.user.isAdmin)) {
                return router.createUrlTree(['/login']);
            }
            // Block routes that require login for non-logged in users
            if ((route.component === AboutUserComponent
                || route.component === PostFormComponent
                || route.component === UserPostsComponent
            ) && !state.user) {
                return router.createUrlTree(['/login']);
            }
            // Block all components for blocked users
            if (state.user && state.user.isBlocked) {
                return router.createUrlTree(['/access-denied']);
            }
            // Allow all other components
            return true;
        }),
    );
};
