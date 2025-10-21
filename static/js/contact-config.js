(function () {
	'use strict';

	var global = window || {};

	if (!global.KNPLAW_FORMS_ENDPOINT) {
		global.KNPLAW_FORMS_ENDPOINT = 'https://formsubmit.co/ajax/main@knp-law.co.kr';
	}

	if (!global.KNPLAW_FORMS_SUBJECT) {
		global.KNPLAW_FORMS_SUBJECT = 'KNP 홈페이지 문의 | Website inquiry';
	}

	if (!global.KNPLAW_FORMS_SUCCESS_MESSAGE) {
		global.KNPLAW_FORMS_SUCCESS_MESSAGE =
			'정상적으로 접수되었습니다. We will get back to you shortly.';
	}

	if (!global.KNPLAW_FORMS_ERROR_MESSAGE) {
		global.KNPLAW_FORMS_ERROR_MESSAGE =
			'메시지 전송에 실패했습니다. 잠시 후 다시 시도하거나 02-552-8381 로 문의해주세요.';
	}
})();
