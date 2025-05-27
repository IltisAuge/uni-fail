import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private user = new BehaviorSubject<any>(null);

	constructor(private http: HttpClient) {
	}

	checkLogin(): Observable<any> {
		return this.http.get<{
			user: any
		}>(environment.apiBaseUrl + '/login/check-login', {withCredentials: true}).pipe(
			tap(resp => {
				this.user.next(resp.user);
				return this.user.asObservable();
			}),
			catchError(() => {
				this.user.next(undefined);
				return of({user: undefined});
			})
		);
	}

	isLoggedIn(): boolean {
		return this.user.value != undefined;
	}
}
