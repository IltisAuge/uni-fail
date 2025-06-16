import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, shareReplay, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

interface UserState {
    success: boolean;
    user?: any;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {
    private userSubject = new BehaviorSubject<UserState>({ success: false, user: undefined });
    private user$ = this.userSubject.asObservable();

	constructor(private http: HttpClient) {
	}

    private loadUser(): Observable<UserState> {
        return this.http.get<{ user: any }>(environment.apiBaseUrl + '/me', { withCredentials: true }).pipe(
            tap(resp => {
                console.log("LOADED USER:", resp.user);
                this.userSubject.next({ success: true, user: resp.user });
            }),
            switchMap(resp => of({ success: true, user: resp.user })),
            catchError(err => {
                const state: UserState = err.status === 401 ? { success: true, user: undefined } : { success: false };
                this.userSubject.next(state);
                return of(state);
            }),
            // to not make multiple requests on multiple subscriptions
            shareReplay(1)
        );
    }

    getLoggedInUser(): Observable<UserState> {
        const currentState = this.userSubject.value;
        if (!currentState.success) {
            this.loadUser().subscribe();
        }
        return this.user$;
    }

    reloadUser(): Observable<UserState> {
        return this.loadUser().pipe(
            tap(state => {
                console.log("Reloaded user:", state);
            })
        );
    }

    setUser(success: boolean, user?: any) {
        this.userSubject.next({success: success, user: user});
    }

    resetUser() {
        this.userSubject.next({success: true, user: undefined});
    }
}
