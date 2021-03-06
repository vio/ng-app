// tslint:disable: no-redundant-jsdoc
import { Indexed } from '@ledge/types';
import { NgInputController } from './controller';
import { NgAttributes } from '../../attributes';
import { NgComponentOptions } from '../../options';
import { NgRenderer } from '../../renderer';

export interface NgInputOptions extends NgComponentOptions<typeof NgInputController> {
	/**
	 * Set this so the app knows how to register your definition
	 */
	type: 'input';

	/**
	 * Allow input group icons to be defined by users on the input
	 */
	canHaveIcon?: true;

	/**
	 * Special attributes to set on the input
	 */
	attrs?: Indexed;

	/**
	 * CSS class to apply to the input container
	 * @default 'form-group'
	 */
	templateClass?: string;

	/**
	 * CSS class to apply to the input label
	 * @default 'form-control-label'
	 */
	labelClass?: string;

	/**
	 * Custom validator messages
	 */
	validators?: Indexed<string>;

	ctrl?: new () => NgInputController;

	/**
	 * Run after container & label creation, before label manipulation
	 */
	render(
		this: {
			/**
			 * Input container
			 */
			$template: HTMLDivElement;
			$attrs: NgAttributes;
		},
		h: NgRenderer,
	): HTMLElement;

	/**
	 * Special hook to override how label text is generated
	 */
	renderLabel?(
		this: {
			/**
			 * Input label
			 */
			$label: HTMLLabelElement;
			$attrs: NgAttributes;
		},
		h: NgRenderer,
	): void;

	/**
	 * Run after label is added to template
	 */
	postRender?(
		this: {
			/**
			 * Input container
			 */
			$template: HTMLDivElement;
			$attrs: NgAttributes;
		},
		h: NgRenderer,
	): Element;
}
