import isIE11 from '@ledge/is-ie-11';
import { PatchPayload } from '@ledge/types/patch';
import { NgLogger } from './logger';

export class NgDataService {
	private isIE11 = isIE11();

	constructor(
		private $http: angular.IHttpService,
		private $log: NgLogger,
		private prefix: string,
		private baseOptions: angular.IRequestShortcutConfig = { withCredentials: true },
	) { }

	public async Get<T = any>(url: string, defaultReturn?: T) {
		const baseGetOptions = { params: { timestamp: (this.isIE11 ? Date.now() : null) } };

		const options = Object.assign(baseGetOptions, this.baseOptions);
		const promise = this.$http.get<T>(this.prefix + url, options);
		return this.safeAwait(promise, defaultReturn) as Promise<T>;
	}

	public async Post<T = any>(url: string, data: any = null) {
		const promise = this.$http.post<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		const promise = this.$http.patch<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	public async Put<T = any>(url: string, data: T) {
		const promise = this.$http.put<T>(this.prefix + url, data, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	public async Delete<T = any>(url: string) {
		const promise = this.$http.delete<T>(this.prefix + url, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	public async Jsonp<T = any>(url: string) {
		const promise = this.$http.jsonp<T>(this.prefix + url, this.baseOptions);
		return this.safeAwait(promise) as Promise<T>;
	}

	private async safeAwait<T>(promise: angular.IHttpPromise<T>, defaultReturn?: T) {
		try {
			const rsp = await promise;
			return rsp == null ? defaultReturn : rsp.data;
		} catch (err) {
			this.onError(err);
			throw err;
		}
	}

	// tslint:disable-next-line:cyclomatic-complexity
	private onError(err: angular.IHttpPromiseCallbackArg<any>) {
		switch (err.status) {
			case 404:
				// tslint:disable-next-line:no-non-null-assertion
				this.$log.devWarning(`Route '${err.config!.url}' not found`);
				break;
			case 500:
				const { data, statusText } = err;
				this.$log.error(typeof data === 'string' && data.length > 0 ? data : statusText as string);
				break;
			case 400:
				const msg = err.data;
				if (typeof msg === 'string') {
					this.$log.error(msg);
				} else if (msg != null && !Array.isArray(msg)) {
					let message = '';
					Object.keys(msg).forEach(x => {
						message += `${x}: ${msg[x]}\n`;
					});
					this.$log.error(message);
				}
				break;
			case 401:
				this.$log.warning(err.statusText as string);
				break;
			case -1:
				this.$log.warning('Server timed out.');
				break;
			default:
				// tslint:disable-next-line:no-non-null-assertion
				this.$log.devWarning(`An unregistered error occurred for '${err.config!.url}' (code: ${err.status})`);
				break;
		}
	}
}
