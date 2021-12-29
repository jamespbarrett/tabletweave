$(function() {
	var lang = "en";

	if (navigator.languages) {
		for (const full_lang of navigator.languages) {
			lang = full_lang.split("-")[0];
			if (lang == "en" || lang == "ja") {
				break;
			}
		}
	} else {
		lang = (navigator.language || navigator.userLanguage).split("-")[0];
	}

	i18next.use(i18nextXHRBackend).init({
		lng: lang,
		debug: false,
		fallbackLng: 'en',
		supportedLngs: ['en', 'ja'],
		nonExplicitSupportedLngs: true,
		backend: {
			loadPath: 'locales/{{lng}}.json',
			customHeaders: {
				"Cache-Control": "no-cache"
			}
		}
	}, function (err, t) {
		jqueryI18next.init(i18next, $);
		$('[data-i18n]').localize();
	});
})
