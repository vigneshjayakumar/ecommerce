import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaderListerner = new BehaviorSubject<boolean>(false);
  public readonly loaderObs = this.loaderListerner.asObservable();

  showLoader = () => {
    console.log('SHOW LOADER');
    this.loaderListerner.next(true);
  };

  hideLoader = () => this.loaderListerner.next(false);
}
