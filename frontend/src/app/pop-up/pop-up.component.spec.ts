import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopUpComponent } from './pop-up.component';

describe('PopUpComponent', () => {
    let component: PopUpComponent;
    let fixture: ComponentFixture<PopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PopUpComponent],
        })
            .compileComponents();

        fixture = TestBed.createComponent(PopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
