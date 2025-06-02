import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private user = new BehaviorSubject<{ success: boolean, user?: any }>({success: true});

	constructor(private http: HttpClient) {
	}

    checkLogin(): Observable<{ success: boolean, user?: any }> {
        return this.http.get<{ user: any }>(environment.apiBaseUrl + '/login/check-login', { withCredentials: true }).pipe(
            map(resp => {
                const userObj = { success: true, user: resp.user };
                this.user.next(userObj);
                return userObj;
            }),
            catchError(() => {
                const errorObj = { success: false };
                this.user.next(errorObj);
                return of(errorObj);
            })
        );
    }

	getLoggedInUser(): Observable<any> {
        if (this.user.value.user === undefined) {
            this.checkLogin().subscribe();
        }
        return this.user.asObservable();
	}

	isLoggedIn(): Observable<boolean> {
		return this.getLoggedInUser().pipe(
			map(state => !!state && !!state.user)
		);
	}

    resetUser() {
        this.user.next({success: true, user: undefined});
    }
}
