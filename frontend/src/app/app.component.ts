import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {isPlatformBrowser, NgTemplateOutlet} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {NavigationComponent} from './navigation/navigation.component';

@Component({
    selector: 'app-root',
    imports: [NavigationComponent, RouterOutlet, FaIconComponent, RouterLink, NgTemplateOutlet],
    templateUrl: './app.component.html',
    standalone: true,
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

    protected readonly faCircleInfo = faCircleInfo;

    title = 'frontend';
    theme: string = 'light';

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private http: HttpClient) {
        console.log(`ENVIRONMENT: production=${  environment.production  } apiBaseUrl=${  environment.apiBaseUrl}`);
    }

    ngOnInit() {
        this.http.get(`${environment.apiBaseUrl}/csrf-token`, {
            withCredentials: true
        }).subscribe((res) => {
            console.log(res);
        });
        if (isPlatformBrowser(this.platformId)) {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                this.theme = storedTheme;
            }
            document.documentElement.setAttribute('data-theme', this.theme);
        }
    }

    toggleTheme() {
        const nextTheme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);
        this.theme = nextTheme;
        document.documentElement.setAttribute('data-theme', nextTheme);
    }
}
