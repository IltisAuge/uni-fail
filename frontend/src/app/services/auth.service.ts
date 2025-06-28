import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, shareReplay, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IUser} from '../user.interface';

interface IUserState {
    success: boolean;
    user: IUser | undefined;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private userSubject = new BehaviorSubject<IUserState>({success: false, user: undefined});
    private userObservable = this.userSubject.asObservable();

    constructor(private http: HttpClient) {
    }

    getLoggedInUser(): Observable<IUserState> {
        const currentState = this.userSubject.value;
        if (!currentState.success) {
            this.loadUser().subscribe();
        }
        return this.userObservable;
    }

    reloadUser(): Observable<IUserState> {
        return this.loadUser().pipe(
            tap((state) => {
                console.log('Reloaded user:', state);
            }),
        );
    }

    setUser(success: boolean, user?: any) {
        this.userSubject.next({success, user});
    }

    resetUser() {
        this.userSubject.next({success: true, user: undefined});
    }

    private loadUser(): Observable<IUserState> {
        return this.http.get<{user:IUser}>(`${environment.apiBaseUrl}/me`, {
            withCredentials: true,
        }).pipe(
            tap((resp) => {
                this.userSubject.next({success: true, user: resp.user});
            }),
            switchMap((resp) => of({success: true, user: resp.user})),
            catchError((err) => {
                const state: IUserState = err.status === 401 ?
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
