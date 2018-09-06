import test from 'ava';
import { dateInput } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../_util';

const definedDateInput = InputService.defineInputComponent(dateInput, document);

test('date bindings', async t => {
	t.deepEqual(definedDateInput.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		minDate: '<',
		maxDate: '<',
	});
});

test('date transclude', async t => {
	t.deepEqual(definedDateInput.transclude, { contain: '?contain' });
});

test('date require', async t => {
	t.deepEqual(definedDateInput.require, { ngModelCtrl: 'ngModel' });
});

test('date controller', async t => {
	t.true(util.mockCtrl(definedDateInput.controller) instanceof NgComponentController);
});

test('date controllerAs', async t => {
	t.is(definedDateInput.controllerAs, undefined);
});

test('date template', async t => {
	const tpl = util.makeTpl(definedDateInput.template, t);
	t.true(tpl.classList.contains('form-group'));

	const inputGroup = tpl.querySelector('.input-group') as HTMLDivElement;
	t.true(inputGroup.classList.contains('input-group'));
	t.is(inputGroup.tagName, 'DIV');

	const inputGroupPrepend = inputGroup.firstElementChild as HTMLDivElement;
	t.true(inputGroupPrepend.classList.contains('input-group-prepend'));
	t.is(inputGroupPrepend.tagName, 'DIV');
	t.is(inputGroupPrepend.getAttribute('ng-click'), '$ctrl.toggleDatepicker($event)');
	t.is(inputGroupPrepend.style.cursor, 'pointer');

	const inputGroupText = inputGroupPrepend.firstElementChild as HTMLSpanElement;
	t.true(inputGroupText.classList.contains('input-group-text'));
	t.is(inputGroupText.tagName, 'SPAN');

	const icon = inputGroupText.firstElementChild as HTMLSpanElement;
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-calendar'));
	t.is(icon.getAttribute('aria-hidden'), 'true');

	const input = util.testInput(tpl, t);
	t.is(input.getAttribute('uib-datepicker-popup'), 'MM/dd/yyyy');
	t.is(input.getAttribute('datepicker-append-to-body'), 'false');
	t.is(input.getAttribute('is-open'), '$ctrl.hasFocus');
	t.is(input.getAttribute('ng-click'), '$ctrl.hasFocus = true');

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
