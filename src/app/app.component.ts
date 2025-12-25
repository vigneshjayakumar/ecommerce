import {
  AfterViewInit,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit, AfterViewInit, OnChanges {
  title = 'ecommerce';

  heading = 'Harini';
  obj = {
    name: 'stinrg',
    age: 22,
  };

  // method exc during instance creation.
  constructor() {
    console.log('Constructor');
  }

  // runs once leaving the component.
  ngOnDestroy(): void {}

  // runs after DOM rendering.
  ngAfterViewInit(): void {
    const ele = document.querySelector('.form-container');
    console.log(ele);
  }

  // Runs once Input is changed.
  ngOnChanges(changes: SimpleChanges): void {}

  onSubmit() {
    console.log('Harini', this.heading);
  }

  
  // runs once Input is fetched
  ngOnInit(): void {
    console.log('INIT', this.obj);
  }

}
