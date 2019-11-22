import { NgController } from './controller';
import { IConfig } from '@ledge/types';

export interface NgAppConfig extends IConfig {
	readonly IS_PROD: boolean;
	readonly IS_DEV: boolean;
	readonly IS_STAGING: boolean;
}

export interface NgComponentOptions extends angular.IComponentOptions {
	/**
	 * Use this instead of controller, as ng-app will disregard the controller prop for type safety reasons.
	 */
	ctrl?: new () => NgController;

	/**
	 * @deprecated use `ctrl` instead
	 *
	 * Controller constructor function that should be associated with newly created scope or the name of a registered
	 * controller if passed as a string. Empty function by default.
	 * Use the array form to define dependencies (necessary if strictDi is enabled and you require dependency injection)
	 */
	controller?: undefined;
}
