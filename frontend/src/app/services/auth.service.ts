import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, shareReplay, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {User} from '../user.interface';

interface UserState {
    success: boolean;
    user: User | undefined;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private userSubject = new BehaviorSubject<UserState>({success: false, user: undefined});
    private userObservable = this.userSubject.asObservable();

    constructor(private http: HttpClient) {
    }

    getLoggedInUser(): Observable<UserState> {
        const currentState = this.userSubject.value;
        if (!currentState.success) {
            this.loadUser().subscribe();
        }
        return this.userObservable;
    }

    reloadUser(): Observable<UserState> {
        return this.loadUser().pipe(
            tap((state) => {
                console.log('Reloaded user:', state);
            }),
        );
    }

    setUser(success: boolean, user?: User | undefined) {
        this.userSubject.next({success, user});
    }

    resetUser() {
        this.userSubject.next({success: true, user: undefined});
    }

    private loadUser(): Observable<UserState> {
        return this.http.get<{user:User}>(`${environment.apiBaseUrl}/me`, {
            withCredentials: true,
        }).pipe(
            tap((resp) => {
                this.userSubject.next({success: true, user: resp.user});
            }),
            switchMap((resp) => of({success: true, user: resp.user})),
            catchError((err) => {
                const state: UserState = err.status === 401 ?
                    {success: true, user: undefined}:
                    {success: false, user: undefined};
                this.userSubject.next(state);
                return of(state);
            }),
            // to not make multiple requests on multiple subscriptions
            shareReplay(1),
        );
    }
}
