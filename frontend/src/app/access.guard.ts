import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth/auth.service';
import {filter, map} from 'rxjs';
import {UserAdminViewComponent} from './user-admin-view/user-admin-view.component';
import {AboutUserComponent} from './about-user/about-user.component';
import {PostFormComponent} from './post-form/post-form.component';

export const accessGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.reloadUser().pipe(
        filter(state => state.success),
        map(state => {
            console.log("Access guard " + route.url + " state:", state);
            // Block admin routes for non-admins
            if (route.component === UserAdminViewComponent && (!state.user || !state.user.isAdmin)) {
                return router.createUrlTree(['/login']);
            }
            // Block routes that require login for non-logged in users
            if ((route.component === AboutUserComponent || route.component === PostFormComponent) && !state.user) {
                return router.createUrlTree(['/login']);
            }
            // Block all components for blocked users
            if (state.user && state.user.isBlocked) {
                return router.createUrlTree(['/access-denied']);
            }
            // Allow all other components
            return true;
        })
    );
};
