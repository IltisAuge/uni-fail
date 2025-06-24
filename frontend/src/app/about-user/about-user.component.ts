import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {filter} from 'rxjs';
import {TitleService} from '../title.service';

@Component({
  selector: 'app-about-user',
  standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgForOf,
        NgClass,
        NgOptimizedImage,
        NgIf
    ],
  templateUrl: './about-user.component.html',
  styleUrl: './about-user.component.css'
})
export class AboutUserComponent implements OnInit {
    name: string = "";
    email: string = "";
    provider: string = "";
    displayName: string = "";
    userId: string = "";
    displayNameForm: FormGroup;
    avatarURL: string | undefined;
    isModalOpen: boolean = false;
    avatarIds: string[] = [];
    avatarURLs: string[] = [];
    selectedAvatarIndex: number = -1;
    isDisplayNameAvailable: boolean = true;
    @ViewChild('avatarDialog') avatarDialogRef!: ElementRef<HTMLDialogElement>;

    constructor(
                private fb: FormBuilder,
                private http: HttpClient,
                private authService: AuthService,
                private titleService: TitleService) {
        this.displayNameForm = this.fb.group({
            displayName: ['', Validators.required]
        });
        this.titleService.setTitle('Dein Konto');
    }

    ngOnInit() {
        this.authService.getLoggedInUser().pipe(
            filter(state => state.success)
        ).subscribe(state => {
            console.log("authService update in about-user:", state);
            if (!state || !state.success) {
                this.name = "Could not check authentication status! Make sure the API server is running correctly!";
                return;
            }
            const user = state.user;
            if (user) {
                this.userId = user._id;
                this.name = user.name;
                this.email = user.email;
                this.provider = user.provider;
                this.provider = String(this.provider).charAt(0).toUpperCase() + String(this.provider).slice(1);
                this.displayName = user.displayName;
                this.avatarURL = environment.apiBaseUrl + '/avatar/' + user.avatarKey;
            }
        });
        this.http.get(environment.apiBaseUrl + '/avatars', { withCredentials: true }).subscribe(resp => {
            if (!resp) {
                return;
            }
            console.log(resp);
            const array = resp as string[];
            this.avatarIds = array;
            for (const id in array) {
                this.avatarURLs.push(environment.apiBaseUrl + '/avatar/' + array[id]);
            }
        })
    }

    onSubmit() {
        if (this.displayNameForm.valid) {
            const body = this.displayNameForm.value;
            this.http.post<any>(environment.apiBaseUrl + '/user/set-display-name', body, {
                observe: 'response',
                responseType: 'json',
                withCredentials: true
            }).subscribe({
                next: resp => {
                    if (resp.status === 200 && resp.body && resp.body.user) {
                        this.isDisplayNameAvailable = true;
                        console.log("user response:", resp.body.user);
                        this.authService.setUser(true, resp.body.user);
                    }
                },
                error: err => {
                    if (err.status === 400 && err.error?.error === 'Not available') {
                        this.isDisplayNameAvailable = false;
                    }
                }
            });
        } else {
            console.log("Form is invalid!");
        }
    }

    openModal() {
        this.avatarDialogRef.nativeElement.showModal();
        this.isModalOpen = true;
    }

    closeModal() {
        this.avatarDialogRef.nativeElement.close();
        this.isModalOpen = false;
    }

    acceptAvatar() {
        const avatarId = this.avatarIds[this.selectedAvatarIndex];
        console.log("send avatarId=" + avatarId);
        this.http.post<any>(environment.apiBaseUrl + '/user/set-avatar', {
            avatarId: avatarId
        }, { withCredentials: true }).subscribe(resp => {
            console.log(resp);
            this.authService.setUser(true, resp.user);
        });
        this.closeModal();
        this.selectedAvatarIndex = -1;
    }

    selectAvatar(index: number) {
        this.selectedAvatarIndex = index;
    }
}
