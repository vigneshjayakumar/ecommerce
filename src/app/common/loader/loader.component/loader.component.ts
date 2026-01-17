import { Component, inject } from '@angular/core';
import { LoaderService } from '../loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [AsyncPipe],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {
  loaderService = inject(LoaderService);
}
