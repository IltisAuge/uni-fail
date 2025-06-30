import {HttpClient} from '@angular/common/http';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {filter, Subject, Subscription, takeUntil} from 'rxjs';
import {environment} from '../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {TitleService} from '../../services/title.service';
import {User} from '../../interfaces/user.interface';

@Component({
    selector: 'app-user-admin-view',
    standalone: true,
    imports: [
        NgIf,
    ],
    templateUrl: './user-admin-view.component.html',
    styleUrl: './user-admin-view.component.css',
})
export class UserAdminViewComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
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
            filter((state) => state.success),
            takeUntil(this.destroy$),
        ).subscribe((state) => {
            const user = state.user;
            if (!user || !user.isAdmin) {
                return;
            }
            this.route.params
                .pipe(takeUntil(this.destroy$))
                .subscribe((params) => {
                    if (!params['id']) {
                        return;
                    }
                    this.userId = params['id'];
                    this.http.get<{ user: User }>(`${environment.apiBaseUrl}/admin/user/${this.userId}`, {
                        withCredentials: true,
                    }).pipe(takeUntil(this.destroy$)).subscribe({
                        next: (resp) => {
                            this.setUserData(resp.user);
                        },
                        error: (error) => {
                            console.error('An error occurred while fetching user information:', error);
                        },
                    });
                });
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setUserData(userData: any) {
        this.displayName = userData.displayName;
        this.provider = userData.provider;
        this.email = userData.email;
        this.isBlocked = userData.isBlocked;
        this.isAdmin = userData.isAdmin;
        this.titleService.setTitle(`Benutzer ${this.displayName}`);
    }

    resetDisplayName() {
        this.http.post<{ user: User }>(`${environment.apiBaseUrl}/admin/reset-display-name`, {
            userId: this.userId,
        }, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.setUserData(resp.user);
            },
            error: (error) => {
                console.log('An error occurred while resetting display name:', error);
            },
        });
    }

    setBlocked(status: boolean) {
        this.http.post<{ user: User }>(`${environment.apiBaseUrl}/admin/block-user`, {
            userId: this.userId,
            status,
        }, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.setUserData(resp.user);
            },
            error: (error) => {
                console.log('An error occurred while setting blocked status of user:', error);
            },
        });
    }

    setAdmin(status: boolean) {
        this.http.post<{ user: User }>(`${environment.apiBaseUrl}/admin/set-admin`, {
            userId: this.userId,
            status,
        }, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.setUserData(resp.user);
            },
            error: (error) => {
                console.log('An error occurred while setting admin:', error);
            },
        });
    }
}
