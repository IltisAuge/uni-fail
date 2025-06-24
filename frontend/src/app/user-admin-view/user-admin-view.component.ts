import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from '../../environments/environment';
import {NgIf} from '@angular/common';
import {AuthService} from '../services/auth.service';
import {filter} from 'rxjs';
import {TitleService} from '../services/title.service';

@Component({
  selector: 'app-user-admin-view',
  standalone: true,
    imports: [
        NgIf
    ],
  templateUrl: './user-admin-view.component.html',
  styleUrl: './user-admin-view.component.css'
})
export class UserAdminViewComponent implements OnInit {

    userId: string | undefined;
    displayName: string = '';
    provider: string = '';
    email: string = '';
    isBlocked: boolean = false;
    isAdmin: boolean = false;

    constructor(private route: ActivatedRoute,
                private http: HttpClient,
                private authService: AuthService,
                private titleService: TitleService) {
    }

    ngOnInit() {
        this.authService.getLoggedInUser().pipe(
            filter(state => state.success)
        ).subscribe(state => {
            const user = state.user;
            console.log("user check", user, typeof user, user?.isAdmin);
            if (!user || !user.isAdmin) {
                return;
            }
            this.route.params.subscribe(params => {
                console.log(params);
                if (!params['id']) {
                    return;
                }
                this.userId = params['id'];
                console.log("userId=",this.userId);
                this.http.get<any>(environment.apiBaseUrl + '/admin/user/' + this.userId, {
                    observe: 'response',
                    withCredentials: true
                }).subscribe({
                    next: resp => {
                        console.log("response:", resp);
                        if (resp.status === 200 && resp.body && resp.body.user) {
                            console.log("Set userdata to: ",resp.body.user);
                            this.setUserData(resp.body.user);
                        }
                    },
                    error: err => {
                        console.error(err);
                    }
                });
            });
        });
    }

    setUserData(userData: any) {
        this.displayName = userData.displayName;
        this.provider = userData.provider;
        this.email = userData.email;
        this.isBlocked = userData.isBlocked;
        this.isAdmin = userData.isAdmin;
        this.titleService.setTitle('Benutzer ' + this.displayName);
    }

    resetDisplayName() {
        this.http.post<{ user: any }>(environment.apiBaseUrl + '/admin/reset-display-name', {
            userId: this.userId
        }, {
            observe: 'response',
            withCredentials: true
        }).subscribe({
            next: resp => {
                if (resp.status === 200 && resp.body && resp.body.user) {
                    this.setUserData(resp.body.user);
                }
            },
            error: err => {
                console.log(err);
            }
        });
    }

    setBlocked(status: boolean) {
        this.http.post<{ user: any }>(environment.apiBaseUrl + '/admin/block-user', {
            userId: this.userId,
            status: status
        }, {
            observe: 'response',
            withCredentials: true
        }).subscribe({
            next: resp => {
                if (resp.status === 200 && resp.body && resp.body.user) {
                    this.setUserData(resp.body.user);
                }
            },
            error: err => {
                console.log(err);
            }
        });
    }

    setAdmin(status: boolean) {
        this.http.post<{ user: any }>(environment.apiBaseUrl + '/admin/set-admin', {
            userId: this.userId,
            status: status
        }, {
            observe: 'response',
            withCredentials: true
        }).subscribe({
            next: resp => {
                if (resp.status === 200 && resp.body && resp.body.user) {
                    this.setUserData(resp.body.user);
                }
            },
            error: err => {
                console.log(err);
            }
        });
    }
}
