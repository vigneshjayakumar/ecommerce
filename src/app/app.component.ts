import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { LoaderComponent } from './common/loader/loader.component/loader.component';
import { BmHeaderComponent } from './ui/shared/components/bm-header/bm-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, LoaderComponent, BmHeaderComponent],
})
export class AppComponent {
  private authService = inject(AuthService);

  constructor() {
    this.authService.refreshAccessToken().subscribe();
  }

}
