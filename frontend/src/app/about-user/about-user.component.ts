import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {filter, Subject, takeUntil} from 'rxjs';
import {environment} from '../../environments/environment';
import {AuthService} from '../../services/auth.service';
import {TitleService} from '../../services/title.service';
import {User} from '../../interfaces/user.interface';

@Component({
    selector: 'app-about-user',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgForOf,
        NgClass,
        NgOptimizedImage,
        NgIf,
    ],
    templateUrl: './about-user.component.html',
    styleUrl: './about-user.component.css',
})
export class AboutUserComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    name: string = '';
    email: string = '';
    provider: string = '';
    displayName: string = '';
    userId: string = '';
    displayNameForm: FormGroup;
    avatarURL: string | undefined;
    isModalOpen: boolean = false;
    avatarIds: string[] = [];
    avatarURLs: string[] = [];
    selectedAvatarIndex: number = -1;
    isDisplayNameAvailable: boolean = true;
    @ViewChild('avatarDialog') avatarDialogRef!: ElementRef<HTMLDialogElement>;

    constructor(private fb: FormBuilder,
                private http: HttpClient,
                private authService: AuthService,
                private titleService: TitleService) {
        this.displayNameForm = this.fb.group({
            displayName: ['', Validators.required],
        });
        this.titleService.setTitle('Dein Konto');
    }

    ngOnInit() {
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
            takeUntil(this.destroy$),
        ).subscribe((state) => {
            if (!state || !state.success) {
                this.name = 'Could not check authentication status! Make sure the API server is running correctly!';
                return;
            }
            const user = state.user;
            if (user) {
                this.userId = user._id;
                this.name = user.name;
                this.email = user.email;
                this.provider = user.provider;
                this.displayName = user.displayName;
                this.avatarURL = `${environment.apiBaseUrl}/avatar/${user.avatarKey}`;
            }
        });
        this.http.get(`${environment.apiBaseUrl}/avatars`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.avatarIds = resp as string[];
                for (const id in this.avatarIds) {
                    this.avatarURLs.push(`${environment.apiBaseUrl}/avatar/${this.avatarIds[id]}`);
                }
            },
            error: (error)=> {
                console.error('An error occurred while loading avatars:', error);
            },
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setDisplayName() {
        if (this.displayNameForm.invalid) {
            return;
        }
        const body = this.displayNameForm.value;
        this.http.post<{user:User}>(`${environment.apiBaseUrl}/user/set-display-name`, body, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.isDisplayNameAvailable = true;
                this.authService.setUser(true, resp.user);
            },
            error: (err) => {
                if (err.status === 400 && err.error?.error === 'Not available') {
                    this.isDisplayNameAvailable = false;
                    return;
                }
                console.error('An error occurred while setting user display name:', err);
            },
        });
    }

    handleAvatarKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.acceptAvatar();
        }
    }

    openAvatarModal() {
        this.avatarDialogRef.nativeElement.showModal();
        this.isModalOpen = true;
        if (this.avatarURL) {
            const avatarIndex = this.avatarURLs.indexOf(this.avatarURL);
            if (avatarIndex >= 0) {
                this.selectedAvatarIndex = avatarIndex;
            }
        }
    }

    closeAvatarModal() {
        this.avatarDialogRef.nativeElement.close();
        this.isModalOpen = false;
    }

    acceptAvatar() {
        const avatarId = this.avatarIds[this.selectedAvatarIndex];
        const avatarURL = this.avatarURLs[this.selectedAvatarIndex];
        if (this.avatarURL === avatarURL) {
            console.log("Not changing avatar. Already set");
            this.closeAvatarModal();
            return;
        }
        this.http.post<{user: User}>(`${environment.apiBaseUrl}/user/set-avatar`, {
            avatarId,
        },
        {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.authService.setUser(true, resp.user);
            },
            error: (err) => {
                console.error('An error occurred while setting user avatar:', err);
            },
        });
        this.closeAvatarModal();
        this.selectedAvatarIndex = -1;
    }

    selectAvatar(index: number) {
        this.selectedAvatarIndex = index;
    }
}
