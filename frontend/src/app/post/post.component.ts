import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {filter, firstValueFrom, Subject, takeUntil} from 'rxjs';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faThumbsUp} from '@fortawesome/free-solid-svg-icons';
import {environment} from '../../environments/environment';
import {Post} from '../../interfaces/post.interface';
import {TagComponent} from '../tag/tag.component';
import {NotFoundComponent} from '../not-found/not-found.component';
import {AuthService} from '../../services/auth.service';
import {User} from '../../interfaces/user.interface';
import {NavigationService} from '../../services/navigation.service';

@Component({
    selector: 'app-post',
    standalone: true,
    imports: [CommonModule, TagComponent, NotFoundComponent, FaIconComponent, RouterLink],
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnDestroy {

    protected readonly faArrowLeft = faArrowLeft;
    protected readonly faThumbsUp = faThumbsUp;
    @ViewChild('deleteDialog') avatarDialogRef!: ElementRef<HTMLDialogElement>;
    private destroy$ = new Subject<void>();
    isModalOpen = false;
    user: User | undefined;
    isLoggedIn: boolean = false;
    isAdmin: boolean = false;
    canDeletePost: boolean = false;
    hasVoted: boolean = false;
    post: Post | undefined;
    loading: boolean = true;
    error: string | undefined;

    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService,
        private location: Location,
        private navigationService: NavigationService,
    ) { }

    ngOnInit(): void {
        this.route.paramMap
            .pipe(takeUntil(this.destroy$))
            .subscribe((params) => {
                const postId = params.get('id');
                if (postId) {
                    this.fetchPostDetails(postId);
                } else {
                    this.error = 'Post-ID in der URL fehlt.';
                    this.loading = false;
                }
            });
        this.authService.getLoggedInUser().pipe(
            filter((state) => state.success),
            takeUntil(this.destroy$),
        ).subscribe((state) => {
            this.isLoggedIn = !!state.user;
            this.user = state.user;
            this.isAdmin = (state.user && state.user.isAdmin) || false;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    fetchPostDetails(id: string): void {
        this.loading = true;
        this.error = undefined;

        this.http.get<{post: Post}>(`${environment.apiBaseUrl}/post/${id}`, {
            withCredentials: true,
        }).subscribe({
            next: (resp) => {
                this.post = resp.post;
                this.loading = false;
                this.canDeletePost = !!(
                    this.user &&
                    (
                        this.user.isAdmin ||
                        (this.post && this.post.userId === this.user._id)
                    )
                );
                console.log(this.post?._id);
                this.hasVoted = !!(
                    this.user &&
                    this.post &&
                    this.user.votedPosts.includes(this.post._id)
                );
                //console.log('Post-Details erfolgreich abgerufen:', this.post);
            },
            error: (error) => {
                if (error.status !== 404) {
                    this.error = 'Fehler beim Laden des Posts. Bitte versuche es später erneut.';
                    console.error('An error occurred while loading post:', error);
                    this.loading = false;
                    return;
                }
                //Post not found
                this.loading = false;
                this.post = undefined;
                this.error = undefined;
            },
        });
    }

    getPostImage(post: Post): string {
        return `${environment.apiBaseUrl}/user/${post.userId}/avatar`;
    }

    deletePost(): void {
        // Call the backend to delete the post
        if (!this.post || !this.post._id) {
            console.error('Kein Post oder keine gültige ID zum Löschen verfügbar.');
            return;
        }

        this.http.delete(`${environment.apiBaseUrl}/post/delete/${this.post._id}`, {
            withCredentials: true,
        }).subscribe({
            next: async (response) => {
                console.log('Post erfolgreich gelöscht:', response);
                await this.goBack(); //go to previous page after deleting
            },
            error: (err) => {
                console.error('Fehler beim Löschen des Posts:', err);
                this.error = 'Deleting did not work';
            },
        });
    }

    goBack(): void {
        if (this.navigationService.hasPreviousUrl()) {
            const previousUrl = this.navigationService.getPreviousUrl()!;
            this.router.navigateByUrl(previousUrl);
        } else {
            this.router.navigateByUrl('/'); // Fallback
        }
    }

    toggleUpVote() {
        console.log('toggle');
        if (this.hasVoted) {
            this.removeUpVote();
            return;
        }
        this.addUpVote();
    }

    removeUpVote() {
        if (this.post) {
            this.postVoteChange('remove').then(() => {
                console.log(`set hasVoted from ${this.hasVoted}`);
                this.hasVoted = false;
                console.log(`set hasVoted to ${this.hasVoted}`);
                return false;
            }).catch((error) => {
                console.log('An error occurred while posting vote change:', error);
            });
        }
    }

    addUpVote() {
        if (this.post) {
            this.postVoteChange('add').then(() => {
                console.log(`set hasVoted from ${this.hasVoted}`);
                this.hasVoted = true;
                console.log(`set hasVoted to ${this.hasVoted}`);
                return true;
            }).catch((error) => {
                console.log('An error occurred while posting vote change:', error);
            });
        }
    }

    async postVoteChange(endpoint: string) {
        const resp = await firstValueFrom(
            this.http.post<{ post: Post; user: User }>(
                `${environment.apiBaseUrl}/vote/${endpoint}`,
                { postId: this.post!._id },
                { withCredentials: true },
            ),
        );

        if (this.post) {
            this.post.upVotes = resp.post.upVotes;
            console.log('vote resp user: ', resp.user);
            this.authService.setUser(!!resp.user, resp.user);
        }
    }

    async routeToLogin() {
        await this.router.navigate(['/login']);
    }

    openDeleteModal() {
        this.avatarDialogRef.nativeElement.showModal();
        this.isModalOpen = true;
    }

    closeDeleteModal() {
        this.avatarDialogRef.nativeElement.close();
        this.isModalOpen = false;
    }
}
