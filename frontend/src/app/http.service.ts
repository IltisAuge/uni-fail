import {Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Observable, of, tap} from 'rxjs';
import {isPlatformServer} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

	constructor(private http: HttpClient,
				private transferState: TransferState,
				@Inject(PLATFORM_ID) private platformId: Object) {
	}

	get(uri: string): Observable<any> {
		const DATA_KEY = makeStateKey<any>('api-data');
		if (isPlatformServer(this.platformId)) {
			const obs = this.http.get(environment.apiBaseUrl + uri, { responseType: 'text' });
			return obs.pipe(
				tap(data => {
					this.transferState.set(DATA_KEY, data);
				})
			);
		} else {
			const data = this.transferState.get(DATA_KEY, null);
			return of(data);
		}
	}

	post(uri: string, body: { }): Observable<any> {
		return this.http.post(environment.apiBaseUrl + uri, body, {
			responseType: 'text'
		});
	}
}
