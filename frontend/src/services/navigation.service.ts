import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router'; // RouterEvent importieren, um Namenskonflikte zu vermeiden
import { filter, tap } from 'rxjs/operators'; // tap hinzufügen

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    private history: string[] = [];

    constructor(private router: Router) {
        this.router.events.pipe(
            //make sure type is navigationEnd
            filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),

        ).subscribe((event: NavigationEnd) => {
            this.history.push(event.urlAfterRedirects);
        });
    }

    getPreviousUrl(): string | null {
        if (this.history.length > 1) {
            return this.history[this.history.length - 2];
        }
        return null;
    }

    hasPreviousUrl(): boolean {
        return this.history.length > 1;
    }
}
