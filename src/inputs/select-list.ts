import Fuse from 'fuse.js';
import cloneDeep from 'lodash/cloneDeep';

import { NgInputController, NgInputOptions } from './shared';
import { NgAttributes } from '../attributes';
import { NgService } from '../service';

class SelectController extends NgInputController {
	public static readonly SinglePlaceholder = '----Select One----';
	public static readonly MultiplePlaceholder = '----Select All That Apply----';

	public static IsMultiple($attrs: NgAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public static GetPlaceholder($attrs: NgAttributes) {
		return $attrs.placeholder ||
			SelectController.IsMultiple($attrs)
			? SelectController.MultiplePlaceholder
			: SelectController.SinglePlaceholder;
	}

	protected isListOpen = false;
	protected list: any[];
	protected searchList: any[];

	// tslint:disable:variable-name
	private _text: string;
	private _value: string;
	// tslint:enable:variable-name

	public get text() {
		if (typeof this._text !== 'string') {
			const { text = 'Text' } = this.$attrs;
			this._text = text;
		}
		return this._text;
	}

	public get value() {
		if (typeof this._value !== 'string') {
			const { value = 'Value' } = this.$attrs;
			this._value = value;
		}
		return this._value;
	}

	private destroyCurrentWatcher: () => void;

	private get isMultiple() {
		return SelectController.IsMultiple(this.$attrs);
	}

	public $onInit() {
		if (this.isMobile) {
			this.searchList = this.list;
			return;
		}

		const container = this.$element.querySelector('.select-container') as HTMLDivElement;
		const dropdown = this.$element.querySelector('.select-dropdown') as HTMLDivElement;
		const dropdownlist = this.$element.querySelector('.select-dropdown-list') as HTMLDivElement;
		const input = this.$element.querySelector('input') as HTMLInputElement;

		const updateSearchList = () => {
			if (input.value) {
				this.searchList = this.getSearchList(fuzzer.search(input.value));
			} else {
				this.searchList = cloneDeep(this.list);
			}
			this.$scope.$applyAsync();
		};

		input.oninput = () => {
			updateSearchList();
		};

		input.onblur = e => {
			if (e.relatedTarget == null) {
				input.hidden = true;
				dropdownlist.hidden = true;
				dropdown.classList.remove('border-top-0');
				dropdown.classList.remove('border-bottom-0');
			}
		};

		container.onclick = e => {
			if (e.target instanceof HTMLSelectElement) {
				return;
			}

			if (e.target instanceof HTMLButtonElement) {
				input.hidden = false;
			}

			input.hidden = !input.hidden;
			dropdown.classList.toggle('border-top-0', input.hidden);
			dropdown.classList.toggle('border-bottom-0', input.hidden);

			if (!input.hidden) {
				input.focus();
			}

			dropdownlist.hidden = input.hidden;
		};

		dropdownlist.onclick = e => {
			let { target } = e as unknown as { target: HTMLElement };
			if (target.nodeName === '#text') {
				target = target.parentElement as HTMLElement;
			}

			const targetIsItem =
				target instanceof HTMLDivElement &&
				target.classList.contains('select-item') &&
				target.parentElement instanceof HTMLDivElement &&
				target.parentElement.classList.contains('select-dropdown-list');

			if (targetIsItem) {
				input.value = '';
				this.select(target.dataset.value);
			}
		};

		let fuzzer: Fuse<any, any>;
		this.$scope.$watchCollection(
			() => this.list,
			_ => {
				fuzzer = new Fuse(_, {
					shouldSort: true,
					threshold: 0.3,
					location: 0,
					distance: 100,
					maxPatternLength: 32,
					minMatchCharLength: 1,
					keys: [this.text],
				});

				updateSearchList();
			},
		);
	}

	public $onDestroy() {
		if (typeof this.destroyCurrentWatcher === 'function') {
			this.destroyCurrentWatcher();
		}
	}

	public getDisplayText(value: any) {
		if (Array.isArray(value)) {
			return;
		}

		if (value == null) {
			return SelectController.GetPlaceholder(this.$attrs);
		}

		// tslint:disable-next-line:triple-equals
		const item = this.list.find(x => x[this.value] == value);
		return item == null ? this.clear() : item[this.text];
	}

	public remove(item: any) {
		// tslint:disable-next-line:triple-equals
		this.ngModel = this.ngModel.filter((x: any) => x != item);
		this.searchList = this.getSearchList(this.list);
	}

	public clear() {
		if (this.isMultiple ? Array.isArray(this.ngModel) && this.ngModel.length > 0 : this.ngModel !== undefined) {
			this.ngModel = this.isMultiple ? [] : undefined;
		}
		this.searchList = this.getSearchList(this.list);
	}

	public select(value: any) {
		if (this.isMultiple) {
			this.ngModel = Array.isArray(this.ngModel)
				? this.ngModel.includes(value)
					? this.ngModel
					: this.ngModel.concat(value)
				: [value];
		} else {
			this.ngModel = value;
		}

		this.searchList = this.getSearchList(this.list);
		this.$scope.$applyAsync();
	}

	private getSearchList(list: any[]) {
		// tslint:disable:triple-equals
		return Array.isArray(this.ngModel)
			? list.filter(x => this.ngModel.every((y: any) => x[this.value] != y))
			: this.ngModel == null
				? cloneDeep(list)
				: list.filter(x => x[this.value] != this.ngModel);
		// tslint:enable:triple-equals
	}
}

export const selectList: NgInputOptions = {
	type: 'input',
	render(h) {
		const select = h.createHtmlElement(
			'select',
			['form-control', 'select-input', 'd-none'],
			[
				['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
				['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
				['ng-model', '$ctrl.ngModel'],
			],
		);

		const isMultiple = SelectController.IsMultiple(this.$attrs);
		if (isMultiple) {
			select.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createHtmlElement('option');

			placeholder.setAttribute('placeholder', 'true');
			placeholder.text = SelectController.GetPlaceholder(this.$attrs);
			placeholder.value = '';

			select.appendChild(placeholder);
		}

		if (NgService.IsMobile()) {
			select.classList.remove('d-none');
			select.setAttribute(
				'ng-options',
				'item[\'{{$ctrl.value}}\'] as item[\'{{$ctrl.text}}\'] for item in $ctrl.searchList track by $index',
			);
			return select;
		}

		const inner = h.createHtmlElement('div', ['select-inner-container']);
		const innerlist = h.createHtmlElement('div', ['select-list', isMultiple ? 'multiple' : 'single']);
		const selected = h.createHtmlElement('div', ['select-item']);

		const btn = h.createHtmlElement('button', ['select-button'],
			[
				['ng-attr-aria-label', 'Remove item: \'{{$ctrl.getDisplayText($ctrl.ngModel)}}\''],
				['ng-click', '$ctrl.clear()'],
			],
		);

		if (isMultiple) {
			const sbtn = btn.cloneNode() as HTMLButtonElement;
			sbtn.setAttribute('ng-attr-aria-label', 'Remove item: \'{{$ctrl.getDisplayText(item)}}\'');
			sbtn.setAttribute('ng-click', '$ctrl.remove(item)');

			selected.setAttribute('ng-repeat', 'item in $ctrl.ngModel track by $index');
			selected.setAttribute('aria-selected', 'true');
			selected.innerHTML = `{{$ctrl.getDisplayText(item)}}${sbtn.outerHTML}`;

			const placeholder = h.createHtmlElement('div', ['select-item', 'placeholder'], [['ng-if', '$ctrl.ngModel == null || $ctrl.ngModel.length === 0']]);
			placeholder.innerText = SelectController.GetPlaceholder(this.$attrs);

			innerlist.appendChild(placeholder);
		} else {
			selected.setAttribute('ng-class', '{ \'placeholder\': $ctrl.ngModel == null }');
			selected.innerText = '{{$ctrl.getDisplayText($ctrl.ngModel)}}';
		}

		const item = h.createHtmlElement('div', ['select-item'],
			[
				['ng-repeat', 'item in $ctrl.searchList track by $index'],
				['ng-attr-data-value', '{{item[$ctrl.value]}}'],
				['role', 'option'],
			],
		);
		item.innerText = '{{item[$ctrl.text]}}';

		const list = h.createHtmlElement('div', ['select-dropdown-list'],
			[
				['dir', 'ltr'],
				['role', 'listbox'],
				['hidden', 'true'],
			],
		);

		const input = h.createHtmlElement('input', ['select-input'],
			[
				['type', 'text'],
				['autocomplete', 'off'],
				['autocapitalize', 'off'],
				['spellcheck', 'false'],
				['role', 'textbox'],
				['aria-autocomplete', 'list'],
				['placeholder', ''],
				['aria-label', 'Select List'],
				['hidden', 'true'],
			],
		);

		const type = `select-${isMultiple ? 'multiple' : 'one'}`;
		const container = h.createHtmlElement('div', ['select-container'],
			[
				['data-type', type],
				['role', 'combobox'],
				['tabindex', '0'],
				['aria-autocomplete', 'list'],
				['aria-haspopup', 'true'],
				['aria-expanded', 'false'],
				['dir', 'ltr'],
				['ng-attr-name', `${type}_{{$ctrl.uniqueId}}`],
				['ng-attr-id', `${type}_{{$ctrl.uniqueId}}`],
			],
		);

		const dropdown = h.createHtmlElement('div', ['select-dropdown', 'border-bottom-0', 'border-top-0'], [['aria-expanded', 'false']]);

		innerlist.appendChild(selected);
		innerlist.appendChild(btn);
		inner.appendChild(select);
		inner.appendChild(innerlist);

		list.appendChild(item);

		dropdown.appendChild(input);
		dropdown.appendChild(list);

		container.appendChild(inner);
		container.appendChild(dropdown);

		return container;
	},
	controller: SelectController,
	bindings: {
		list: '<',
	},
};
