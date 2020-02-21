import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import * as prettyBytes from 'pretty-bytes';

@Component({
  selector: 'app-output-component',
  templateUrl: './output.component.html'
})
export class OutputComponent implements OnChanges, OnDestroy {
  @Input() outputObservable: Observable<string>;
  @Input() name: string;
  @Input() size: number;
  @Input() autoScrollDown = true;
  @Output() loadFull: EventEmitter<any> = new EventEmitter<any>();
  @Output() reload: EventEmitter<any> = new EventEmitter<any>();
  isWaitingForFullOutput = false;
  outputSubscription: Subscription;

  get canLoadFull(): boolean {
    return this.loadFull.observers.length > 0;
  }

  get canReload(): boolean {
    return this.reload.observers.length > 0;
  }

  get formattedSize(): string {
    return prettyBytes(this.size);
  }

  requestFullLoad(): void {
    this.isWaitingForFullOutput = true;
    this.loadFull.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.outputObservable?.currentValue) {
      this.outputSubscription?.unsubscribe();
      this.outputObservable = changes.outputObservable.currentValue;
      this.outputSubscription = this.outputObservable.subscribe(() => this.isWaitingForFullOutput = false);
    }
  }

  ngOnDestroy(): void {
    this.outputSubscription?.unsubscribe();
  }
}
