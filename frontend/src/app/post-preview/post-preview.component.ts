import { Component, Input } from '@angular/core';
import { CommonModule} from '@angular/common';


@Component({
  selector: 'app-post-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-preview.component.html',
  styleUrl: './post-preview.component.css'
})
export class PostPreviewComponent {


    /**
     * to do
     * add title
     * add profile picture
     */
    // @Input() content!: string;
    // @Input() tags: string[] = [];
    title = "Hier fehlt noch der titel";
    content = "Dies ist ein Beispieltext mit genau zweihundertfünfzig Zeichen, der zeigt, wie man eine bestimmte Zeichenanzahl erreicht. So kannst du Texte exakt an Vorgaben anpassen, etwa für Vorschauen oder Limits in Eingabefeldern";
    // content = "";
    tags: string[] = ["tag1", "tag2", "tag3", "tag4"];


    /** returns a shorted content of the post
     * length of 200 charcaters
     * Length of shortend content can be adjusted
     */
    getPreview(): string {
        const maxLength = 200;

        try {
            if (!this.content) {
                return '[No content available]';
            }

            return this.content.length > maxLength
                ? this.content.slice(0, maxLength) + '...'
                : this.content;
        } catch (error) {
            console.error('Error in getPreview:', error);
            return '[Error displaying content]';
        }
    }

    //to only show the first 3 tags
    get firstThreeTags(): string[] {
        return this.tags ? this.tags.slice(0, 3) : [];
    }


}
