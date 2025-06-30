import {Component, HostListener, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {filter, Subject, takeUntil} from 'rxjs';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {
    faBars,
    faFolder,
    faHome,
    faPlus,
    faRankingStar,
    faRightFromBracket,
    faSearch,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import {HttpClient} from '@angular/common/http';
import {animate, style, transition, trigger} from '@angular/animations';
import {environment} from '../../environments/environment';
import {AuthService} from '../../services/auth.service';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        FormsModule,
        FaIconComponent,
    ],
    animations: [
        trigger('dropdownAnimation', [
            transition(':enter', [
                style({ height: '0', opacity: 0 }),
                animate('300ms ease', style({ height: '*', opacity: 1 })),
            ]),
            transition(':leave', [
                animate('300ms ease', style({ height: '0', opacity: 0 })),
            ]),
        ]),
    ],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit {

    protected readonly faHome = faHome;
    protected readonly faSearch = faSearch;
    protected readonly faRankingStar = faRankingStar;
    protected readonly faPlus = faPlus;
    protected readonly faUser = faUser;
    protected readonly faRightFromBracket = faRightFromBracket;
    protected readonly faBars = faBars;
    protected readonly faFolder = faFolder;

    private destroy$ = new Subject<void>();

    isLoggedIn: boolean = false;
    menuOpen = false;
    isMobile = false;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private authService: AuthService,
        private http: HttpClient,
        private router: Router) {
    }

    ngOnInit(): void {
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
            takeUntil(this.destroy$),
        ).subscribe((state) => {
            this.isLoggedIn = !!state.user;
        });
        this.onResize();
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd && this.isMobile) {
                this.menuOpen = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('window:resize', [])
    onResize() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        this.isMobile = window.innerWidth < 768;
        if (!this.isMobile) {
            this.menuOpen = true;
        }
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

    logout() {
        if (this.isMobile) {
            this.menuOpen = false;
        }
        this.http.post(`${environment.apiBaseUrl}/logout`, { },
            {
                observe: 'response', withCredentials: true,
            }).subscribe({
            next: () => {
                this.authService.resetUser();
                const currentUrl = this.router.url;
                // Redirect to dummy url, then redirect to reload the current component and reactivate the AccessGuard
                this.router
                    .navigateByUrl('/dummy', { skipLocationChange: true })
                    .then(async () => {
                        await this.router.navigateByUrl(currentUrl);
                        return;
                    }).catch((error) => {
                        throw error;
                    });
            },
            error: (error) => {
                console.error('An error occurred while logging out:', error);
            },
        });
    }
}
