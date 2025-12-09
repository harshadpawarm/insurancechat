import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatComponent } from './chat/chat';

@Component({
  selector: 'app-root',
  imports: [ChatComponent],
  template: '<app-chat></app-chat>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
