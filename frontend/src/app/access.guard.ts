import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthService} from './auth/auth.service';
import {filter, map} from 'rxjs';
import {UserAdminViewComponent} from './user-admin-view/user-admin-view.component';

export const accessGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    return authService.reloadUser().pipe(
        filter(state => state.success),
        map(state => {
            console.log("Access guard " + route.url + " state:", state);
            if (route.component === UserAdminViewComponent && (!state.user || !state.user.isAdmin)) {
                return router.createUrlTree(['/login']);
            }
            if (state.user && state.user.isBlocked) {
                return router.createUrlTree(['/access-denied']);
            }
            return true;
        })
    );
};
