$(function() {
	var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = lang.split("-")[0];

	i18next.use(i18nextXHRBackend).init({
		lng: lang,
		debug: false,
		fallbackLng: false,
		defaultLng: 'en',
		backend: {
			loadPath: 'locales/{{lng}}.json'
		}
	}, function (err, t) {
		jqueryI18next.init(i18next, $);
		$('[data-i18n]').localize();
	});
})
