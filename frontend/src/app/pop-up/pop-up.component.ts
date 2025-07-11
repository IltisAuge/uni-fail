import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
    selector: 'app-popup',
    standalone: true,
    template: `
    @if (isOpen()) {
    <div class="popup">
      <div class="popup-content">
        <h2>{{ title() }}</h2>
        <p>{{ message() }}</p>
        <button (click)="close()">x</button>
      </div>
    </div>
    }
  `,
    styles: [
        `
      .popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .popup-content {
        background-color: pink;
        padding: 20px;
        border-radius: 5px;
      }
    `,
    ],
})
export class PopupComponent {
    isOpen = signal(false);
    title = signal('');
    message = signal('');

    @Output() closed = new EventEmitter<void>();

    open(title: string, message: string) {
        this.title.set(title);
        this.message.set(message);
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
        this.closed.emit();
    }
}
