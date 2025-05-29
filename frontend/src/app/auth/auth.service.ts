import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private user = new BehaviorSubject<any>(undefined);

	constructor(private http: HttpClient) {
	}

	checkLogin(): Observable<{ success: boolean, user?:any }> {
		return this.http.get<{
			user: any
		}>(environment.apiBaseUrl + '/login/check-login', {withCredentials: true}).pipe(
			map(resp => {
				this.user.next(resp.user);
				return {success: true, user: resp.user};
			}),
			catchError(() => {
				return of({success: false});
			})
		);
	}

	getLoggedInUser(): Observable<any> {
		return this.user.asObservable();
	}

	isLoggedIn(): Observable<boolean> {
		return this.getLoggedInUser().pipe(
			map(user => !!user)
		);
	}
}
