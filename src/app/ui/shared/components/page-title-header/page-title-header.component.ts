import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-title-header',
  imports: [],
  templateUrl: './page-title-header.component.html',
  styleUrl: './page-title-header.component.css'
})
export class PageTitleHeaderComponent {
  @Input() title = '';
  @Input() toShowBtns = false;
  @Input() showBackButton = true;

  @Output() backClick = new EventEmitter<void>();
}
