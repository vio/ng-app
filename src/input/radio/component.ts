import { InputComponentOptions } from '../options';
import { NgComponentController } from '../../controller';

class RadioListController extends NgComponentController {
	public $postLink() {
		setTimeout(() => {
			if (this.$attrs.hasOwnProperty('required')) {
				const fieldset = this.$element.closest('fieldset');

				if (fieldset != null) {
					const legend = fieldset.querySelector('legend');

					if (legend != null) {
						const span = document.createElement('span');
						span.classList.add('text-danger');
						span.innerText = ' *';
						legend.appendChild(span);
					}
				}
			}
		});
	}
}

export const radioList: InputComponentOptions = {
	type: 'input',
	templateClass: 'form-check',
	labelClass: 'form-check-label',
	render(h) {
		const radio = h.createInput('radio');
		const value = this.$attrs.value || 'Value';

		radio.setAttribute('ng-value', `item.${value}`);
		radio.setAttribute('ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}_{{$index}}');

		radio.style.cursor = 'pointer';

		if (this.$attrs.hasOwnProperty('inline')) {
			this.$template.classList.remove('form-check');
			this.$template.classList.add('form-check-inline');
		}

		this.$template.setAttribute('ng-repeat', 'item in $ctrl.list');

		return radio;
	},
	renderLabel() {
		const text = this.$attrs.text || 'Text';
		const value = this.$attrs.value || 'Value';

		const labelText = document.createTextNode(`{{item.${text}}}`);

		this.$label.setAttribute('ng-attr-for', '{{id}}_{{$ctrl.uniqueId}}_{{$index}}');
		this.$label.setAttribute('ng-click', `$ctrl.ngModel === item.${value}`);
		this.$label.appendChild(labelText);
		this.$label.style.cursor = 'pointer';
	},
	bindings: {
		list: '<',
		ngChecked: '<',
	},
	ctrl: RadioListController,
};
