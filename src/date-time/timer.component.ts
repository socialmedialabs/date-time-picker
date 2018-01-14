/**
 * timer.component
 */

import {
    ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnInit, Optional, Output
} from '@angular/core';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { take } from 'rxjs/operators';

@Component({
    exportAs: 'owlDateTimeTimer',
    selector: 'owl-date-time-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class OwlTimerComponent<T> implements OnInit {

    /** The current picker moment */
    private _pickerMoment: T;
    @Input()
    get pickerMoment() {
        return this._pickerMoment;
    }

    set pickerMoment( value: T ) {
        value = this.dateTimeAdapter.deserialize(value);
        this._pickerMoment = this.getValidDate(value) || this.dateTimeAdapter.now();
    }

    /** The minimum selectable date time. */
    private _minDateTime: T | null;
    @Input()
    get minDateTime(): T | null {
        return this._minDateTime;
    }

    set minDateTime( value: T | null ) {
        value = this.dateTimeAdapter.deserialize(value);
        this._minDateTime = this.getValidDate(value);
    }

    /** The maximum selectable date time. */
    private _maxDateTime: T | null;
    @Input()
    get maxDateTime(): T | null {
        return this._maxDateTime;
    }

    set maxDateTime( value: T | null ) {
        value = this.dateTimeAdapter.deserialize(value);
        this._maxDateTime = this.getValidDate(value);
    }

    /**
     * Whether to show the second's timer
     * @default false
     * @type {Boolean}
     * */
    @Input() showSecondsTimer: boolean;

    /**
     * Hours to change per step
     * @default {1}
     * @type {number}
     * */
    @Input() stepHour = 1;

    /**
     * Minutes to change per step
     * @default {1}
     * @type {number}
     * */
    @Input() stepMinute = 1;

    /**
     * Seconds to change per step
     * @default {1}
     * @type {number}
     * */
    @Input() stepSecond = 1;

    get hourValue(): number {
        return this.dateTimeAdapter.getHours(this.pickerMoment);
    }

    get minuteValue(): number {
        return this.dateTimeAdapter.getMinutes(this.pickerMoment);
    }

    get secondValue(): number {
        return this.dateTimeAdapter.getSeconds(this.pickerMoment);
    }

    get upHourButtonLabel(): string {
        return this.pickerIntl.upHourLabel;
    }

    get downHourButtonLabel(): string {
        return this.pickerIntl.downHourLabel;
    }

    get upMinuteButtonLabel(): string {
        return this.pickerIntl.upMinuteLabel;
    }

    get downMinuteButtonLabel(): string {
        return this.pickerIntl.downMinuteLabel;
    }

    get upSecondButtonLabel(): string {
        return this.pickerIntl.upSecondLabel;
    }

    get downSecondButtonLabel(): string {
        return this.pickerIntl.downSecondLabel;
    }

    @Output() selectedChange = new EventEmitter<T>();

    @HostBinding('class.owl-dt-timer')
    get owlDTTimerClass(): boolean {
        return true;
    }

    @HostBinding('attr.tabindex')
    get owlDTTimeTabIndex(): number {
        return -1;
    }

    constructor( private ngZone: NgZone,
                 private elmRef: ElementRef,
                 private pickerIntl: OwlDateTimeIntl,
                 @Optional() private dateTimeAdapter: DateTimeAdapter<T> ) {
    }

    public ngOnInit() {
    }

    /**
     * Focus to the host element
     * */
    public focus() {
        this.ngZone.runOutsideAngular(() => {
            this.ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
                this.elmRef.nativeElement.focus();
            });
        });
    }

    public setHourValue( hours: number ): void {
        const m = this.dateTimeAdapter.setHours(this.pickerMoment, hours);
        this.selectedChange.emit(m);
    }

    public setMinuteValue( minutes: number ): void {
        const m = this.dateTimeAdapter.setMinutes(this.pickerMoment, minutes);
        this.selectedChange.emit(m);
    }

    public setSecondValue( seconds: number ): void {
        const m = this.dateTimeAdapter.setSeconds(this.pickerMoment, seconds);
        this.selectedChange.emit(m);
    }

    /**
     * Check if the up hour button is enabled
     * @return {boolean}
     * */
    public upHourEnabled(): boolean {
        return !this.maxDateTime || this.compareHours(this.stepHour, this.maxDateTime) < 1;
    }

    /**
     * Check if the down hour button is enabled
     * @return {boolean}
     * */
    public downHourEnabled(): boolean {
        return !this.minDateTime || this.compareHours(-this.stepHour, this.minDateTime) > -1;
    }

    /**
     * Check if the up minute button is enabled
     * @return {boolean}
     * */
    public upMinuteEnabled(): boolean {
        return !this.maxDateTime || this.compareMinutes(this.stepMinute, this.maxDateTime) < 1;
    }

    /**
     * Check if the down minute button is enabled
     * @return {boolean}
     * */
    public downMinuteEnabled(): boolean {
        return !this.minDateTime || this.compareMinutes(-this.stepMinute, this.minDateTime) > -1;
    }

    /**
     * Check if the up second button is enabled
     * @return {boolean}
     * */
    public upSecondEnabled(): boolean {
        return !this.maxDateTime || this.compareSeconds(this.stepSecond, this.maxDateTime) < 1;
    }

    /**
     * Check if the down second button is enabled
     * @return {boolean}
     * */
    public downSecondEnabled(): boolean {
        return !this.minDateTime || this.compareSeconds(-this.stepSecond, this.minDateTime) > -1;
    }

    /**
     * PickerMoment's hour value +/- certain amount and compare it to the give date
     * @param {number} amount
     * @param {Date} comparedDate
     * @return {number}
     * 1 is after the comparedDate
     * -1 is before the comparedDate
     * 0 is equal the comparedDate
     * */
    private compareHours( amount: number, comparedDate: T ): number {
        let hours = this.dateTimeAdapter.getHours(this.pickerMoment) + amount;
        hours = Math.max(0, Math.min(hours, 23));
        const result = this.dateTimeAdapter.setHours(this.pickerMoment, hours);
        return this.dateTimeAdapter.compare(result, comparedDate);
    }

    /**
     * PickerMoment's minute value +/- certain amount and compare it to the give date
     * @param {number} amount
     * @param {Date} comparedDate
     * @return {number}
     * 1 is after the comparedDate
     * -1 is before the comparedDate
     * 0 is equal the comparedDate
     * */
    private compareMinutes( amount: number, comparedDate: T ): number {
        let minutes = this.dateTimeAdapter.getMinutes(this.pickerMoment) + amount;
        minutes = Math.max(0, Math.min(minutes, 59));
        const result = this.dateTimeAdapter.setMinutes(this.pickerMoment, minutes);
        return this.dateTimeAdapter.compare(result, comparedDate);
    }

    /**
     * PickerMoment's second value +/- certain amount and compare it to the give date
     * @param {number} amount
     * @param {Date} comparedDate
     * @return {number}
     * 1 is after the comparedDate
     * -1 is before the comparedDate
     * 0 is equal the comparedDate
     * */
    private compareSeconds( amount: number, comparedDate: T ): number {
        let seconds = this.dateTimeAdapter.getSeconds(this.pickerMoment) + amount;
        seconds = Math.max(0, Math.min(seconds, 59));
        const result = this.dateTimeAdapter.setSeconds(this.pickerMoment, seconds);
        return this.dateTimeAdapter.compare(result, comparedDate);
    }

    /**
     * Get a valid date object
     * @param {any} obj -- The object to check.
     * @return {Date | null} -- The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDate( obj: any ): T | null {
        return (this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj)) ? obj : null;
    }
}
